const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_NAME = process.env.DB_NAME || 'anu_promises';

if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
  throw new Error('DB_NAME can only contain letters, numbers, and underscores.');
}

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await connection.end();

    console.log(`[ok] Database ${DB_NAME} created/verified`);
  } catch (error) {
    console.error('[error] Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
