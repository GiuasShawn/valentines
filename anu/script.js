// Wrap initialization in DOMContentLoaded to ensure elements exist
function initBouquetAndModals(){
  try {
    // lightweight on-page debug banner (temporary)
    function debug(msg){
      try{
        let el = document.getElementById('anu-debug');
        if (!el){ el = document.createElement('div'); el.id = 'anu-debug'; el.style.cssText = 'position:fixed;left:14px;bottom:14px;background:rgba(0,0,0,0.6);color:#fff;padding:8px 12px;border-radius:10px;font-size:13px;z-index:99999;backdrop-filter:blur(6px)'; document.body.appendChild(el); }
        el.textContent = msg;
        el.style.opacity = '1';
        clearTimeout(el._t);
        el._t = setTimeout(()=>{ try{ el.style.transition='opacity .6s'; el.style.opacity='0'; }catch(e){} }, 2200);
      }catch(e){ /* ignore */ }
    }

    const flowers = Array.from(document.querySelectorAll('.flower'));
    console.log('[anu] initBouquet: found', flowers.length, 'flowers');
    debug('[anu] initBouquet: found ' + flowers.length + ' flowers');
    flowers.forEach(btn => {
      btn.addEventListener('click', () => { debug('clicked flower'); handleFlowerClick(btn); });
    });

    // delegation fallback: if direct listeners somehow fail, handle clicks on the garden
    const garden = document.getElementById('garden');
    if (garden) {
      garden.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('.flower');
        if (btn) {
          console.log('[anu] garden delegated click for', btn, 'dataset:', btn.dataset);
          debug('delegated click');
          handleFlowerClick(btn);
        }
      });
    }

    // Flower modal handlers (close, save, overlay)
    const flowerModal = document.getElementById('flower-modal');
    if (flowerModal) {
      const closeBtn = document.getElementById('flower-close');
      const saveBtn = document.getElementById('flower-save');
      const bodyEl = document.getElementById('flower-body');
      closeBtn && closeBtn.addEventListener('click', () => { flowerModal.hidden = true; });
      saveBtn && saveBtn.addEventListener('click', () => { flowerModal.hidden = true; });
      flowerModal.addEventListener('click', (e) => { if (e.target === flowerModal) flowerModal.hidden = true; });
    }
  } catch (err) {
    console.error('initBouquet error', err);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBouquetAndModals);
else initBouquetAndModals();

function burstConfetti(){
  const colors = ['#f94144','#f3722c','#f8961e','#f9844a','#f9c74f','#90be6d','#43aa8b','#577590'];
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const particles = [];
  const count = 36;
  for(let i=0;i<count;i++){
    particles.push({
      x: window.innerWidth/2 + (Math.random()-0.5)*200,
      y: window.innerHeight/2 + (Math.random()-0.5)*60,
      vx: (Math.random()-0.5)*6,
      vy: (Math.random()*-6)-2,
      size: Math.random()*7+4,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*Math.PI
    });
  }
  const ttl = 2000; let start = null;
  function frame(ts){ if(!start) start=ts; const elapsed = ts-start; ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += 0.15;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
      ctx.restore();
    });
    if (elapsed < ttl) requestAnimationFrame(frame); else { window.removeEventListener('resize', resize); canvas.remove(); }
  }
  requestAnimationFrame(frame);
}

function handleFlowerClick(btn){
  try{
    const msg = btn.dataset.msg || 'You are wonderful.';
    const title = document.getElementById('flower-title');
    const body = document.getElementById('flower-body');
    const modal = document.getElementById('flower-modal');
    const note = document.getElementById('note');
    console.log('[anu] handleFlowerClick msg=', msg);
    if (note) { note.textContent = msg; note.classList.add('pulse'); setTimeout(()=>note.classList.remove('pulse'),1000); }
    if (!modal) { console.warn('[anu] no flower modal found'); debug && debug('no flower modal'); return; }
    if (title) title.textContent = 'For you';
    if (body) body.textContent = msg + '\n\n' + 'May this little note carry my thoughts to you.';
    // explicitly remove hidden attribute and animate modal card
    modal.removeAttribute('hidden');
    const card = modal.querySelector('.modal-card');
    if (card) { card.classList.remove('open'); requestAnimationFrame(()=> card.classList.add('open')); }
    // focus the close button for accessibility
    const closeBtn = modal.querySelector('#flower-close');
    if (closeBtn) closeBtn.focus();
    burstConfetti();
  } catch(e){ console.error('flower click handler failed', e); }
}

// Flower modal handlers (close, save, overlay)
const flowerModal = document.getElementById('flower-modal');
if (flowerModal) {
  const closeBtn = document.getElementById('flower-close');
  const saveBtn = document.getElementById('flower-save');
  const bodyEl = document.getElementById('flower-body');
  closeBtn && closeBtn.addEventListener('click', () => { flowerModal.hidden = true; });
  saveBtn && saveBtn.addEventListener('click', () => { flowerModal.hidden = true; });
  flowerModal.addEventListener('click', (e) => { if (e.target === flowerModal) flowerModal.hidden = true; });
}

// Letters modal
const modal = document.getElementById('modal');
if (modal) {
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const close = document.getElementById('close');
  const copy = document.getElementById('copy');
  document.querySelectorAll('.letter').forEach(btn => btn.addEventListener('click', () => {
    title.textContent = btn.dataset.title || '';
    body.textContent = btn.dataset.body || '';
    modal.hidden = false;
    // animate modal card in
    const card = modal.querySelector('.modal-card');
    if (card) { card.classList.remove('open'); requestAnimationFrame(()=> card.classList.add('open')); }
  }));

  function closeModalAnimated(){
    const card = modal.querySelector('.modal-card');
    if (card) { card.classList.remove('open'); setTimeout(()=> modal.hidden = true, 420); }
    else modal.hidden = true;
  }

  close.addEventListener('click', ()=> closeModalAnimated());
  copy.addEventListener('click', ()=>{ closeModalAnimated(); });
  modal.addEventListener('click', e => { if (e.target === modal) closeModalAnimated(); });
}

// small nav helper to add active state based on location
document.querySelectorAll('.nav .links a').forEach(a=>{
  if (location.pathname.endsWith(a.getAttribute('href'))) a.setAttribute('aria-current','page');
});

// Gallery: flip card handler
function flipCard(card){
  card.classList.toggle('flipped');
}
