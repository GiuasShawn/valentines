const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_NAME = process.env.DB_NAME || 'anu_promises';

if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
  throw new Error('DB_NAME can only contain letters, numbers, and underscores.');
}

app.use(cors());
app.use(express.json());

let pool;

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await connection.end();
}

async function initDatabase() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS promises (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text VARCHAR(255) NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Anu promises API is running',
    endpoints: ['/api/health', '/api/promises']
  });
});

app.get('/api/promises', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, text, date FROM promises ORDER BY date DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching promises:', error.message);
    res.status(500).json({ error: 'Failed to fetch promises' });
  }
});

app.post('/api/promises', async (req, res) => {
  const text = (req.body?.text || '').trim();

  if (!text) {
    return res.status(400).json({ error: 'Promise text is required' });
  }

  if (text.length > 200) {
    return res.status(400).json({ error: 'Promise text must be 200 characters or less' });
  }

  try {
    const [result] = await pool.execute('INSERT INTO promises (text) VALUES (?)', [text]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error adding promise:', error.message);
    res.status(500).json({ error: 'Failed to add promise' });
  }
});

app.delete('/api/promises/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid promise id' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM promises WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Promise not found' });
    }

    res.json({ success: true, message: 'Promise deleted' });
  } catch (error) {
    console.error('Error deleting promise:', error.message);
    res.status(500).json({ error: 'Failed to delete promise' });
  }
});

async function start() {
  try {
    await ensureDatabase();

    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Using MySQL database: ${DB_NAME}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

start();
