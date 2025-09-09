/* ============== Sticky Header: hide on down, show on up ============== */
(function(){
  const h = document.getElementById('siteHeader');
  if(!h) return;
  let lastY = window.scrollY, ticking = false;
  function onScroll(){
    const y = window.scrollY;
    const goingDown = y > lastY;
    const past = y > 120;
    if(goingDown && past){ h.classList.add('nav-hidden'); }
    else { h.classList.remove('nav-hidden'); }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(onScroll); ticking=true; } }, {passive:true});
})();

/* =================== Mobile Nav =================== */
(function(){
  const btn   = document.getElementById('navToggle');
  const panel = document.getElementById('mobileNav');
  const hdr   = document.getElementById('siteHeader');
  if(!btn || !panel || !hdr) return;
  const mqLG = matchMedia('(min-width: 1024px)'); // Tailwind lg
  function isOpen(){ return !panel.hasAttribute('hidden'); }
  function open(){ panel.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); hdr.classList.remove('nav-hidden'); }
  function close(){ panel.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); }
  function toggle(){ isOpen() ? close() : open(); }
  btn.addEventListener('click', toggle);
  panel.addEventListener('click', e=>{ const a = e.target.closest('a'); if(a) close(); });
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && isOpen()) close(); });
  mqLG.addEventListener?.('change', e=>{ if(e.matches) close(); });
})();

/* ============== Slider util (dots + arrows) ============== */
function makeSlider(rootSelector, options={ perView:{mobile:1,tablet:1,desktop:1}, dots:true }){
  const root = document.querySelector(rootSelector); if(!root) return;
  const track = root.querySelector('.slider-track');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dotsWrap = root.querySelector('.slider-dots') || document.createElement('div');
  if(!dotsWrap.classList.contains('slider-dots')){ dotsWrap.className='slider-dots'; root.appendChild(dotsWrap); }
  let index = 0, dots = [], pages = 1;

  function perView(){ const w=innerWidth; if(w>=1024) return options.perView.desktop||1; if(w>=768) return options.perView.tablet||1; return options.perView.mobile||1; }

  function buildDots(){
    pages = Math.max(1, Math.ceil(slides.length / perView()));
    dotsWrap.innerHTML = '';
    if(options.dots){
      for(let i=0;i<pages;i++){
        const b = document.createElement('button');
        b.type='button'; b.className='dot'; b.setAttribute('aria-label', `Группа слайдов ${i+1}`);
        b.addEventListener('click', ()=> goTo(i));
        dotsWrap.appendChild(b);
      }
      dots = Array.from(dotsWrap.children);
    }
    updateDots();
  }
  function layout(){
    const p = perView();
    slides.forEach(s=> s.style.flex = `0 0 ${100/p}%`);
    buildDots(); goTo(index);
  }
  function updateDots(){ dots.forEach((d,i)=> d.classList.toggle('active', i===index)); }
  function goTo(i){
    const p = perView();
    const max = Math.max(0, Math.ceil(slides.length / p) - 1);
    index = Math.max(0, Math.min(i, max));
    track.style.transform = `translate3d(-${index*100}%,0,0)`;
    updateDots();
  }
  function next(){ goTo(index+1); }
  function prev(){ goTo(index-1); }
  document.querySelectorAll(`[data-target="${rootSelector}"][data-next]`).forEach(b=>b.addEventListener('click', next));
  document.querySelectorAll(`[data-target="${rootSelector}"][data-prev]`).forEach(b=>b.addEventListener('click', prev));
  root.addEventListener('keydown', e=>{ if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); });
  addEventListener('resize', layout, {passive:true});
  layout();
  return {next,prev,goTo,layout};
}
makeSlider('#works',   { perView:{ mobile:1, tablet:1, desktop:1 }, dots:true });
makeSlider('#reviews', { perView:{ mobile:1, tablet:2, desktop:3 }, dots:true });

/* ============== Marquee reduced-motion handling ============== */
(function(){
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const tracks = document.querySelectorAll('.marquee-track');
  const apply = () => tracks.forEach(t => t.style.animationPlayState = mq.matches ? 'paused' : 'running');
  mq.addEventListener?.('change', apply); apply();
})();

/* ============== Reveal on scroll ============== */
(function(){
  const targets = document.querySelectorAll('.reveal, .glass, .slider, .marquee');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  targets.forEach(t=> obs.observe(t));
})();

/* ============== Background particles (lighter) ============== */
(function(){
  const c = document.getElementById('bg-particles');
  if(!c) return;
  const ctx = c.getContext('2d');
  let w, h, dpr, particles = [];
  const mq = matchMedia('(prefers-reduced-motion: reduce)');

  function resize(){
    dpr = Math.min(1.25, devicePixelRatio || 1); // ограничение DPR
    w = c.width = innerWidth * dpr;
    h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
  }

  function init(){
    const count = Math.round(Math.min(80, (innerWidth*innerHeight) / (dpr > 1 ? 24000 : 18000)));
    particles = Array.from({length: count}).map(()=>({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      vx: (Math.random()-.5)*0.06,
      vy: (Math.random()-.5)*0.06,
      a: 0.15 + Math.random()*0.35,
      s: Math.random()<0.5 ? 1 : 2
    }));
  }

  function step(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<-10) p.x=innerWidth+10; if(p.x>innerWidth+10) p.x=-10;
      if(p.y<-10) p.y=innerHeight+10; if(p.y>innerHeight+10) p.y=-10;
      ctx.globalAlpha = p.a;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(step);
  }

  let raf = null;
  function start(){ if(mq.matches) return; cancelAnimationFrame(raf); step(); }
  function stop(){ cancelAnimationFrame(raf); ctx.clearRect(0,0,innerWidth,innerHeight); }

  resize(); init(); start();
  addEventListener('resize', ()=>{ resize(); init(); }, {passive:true});
  mq.addEventListener?.('change', ()=> mq.matches ? stop() : start());
})();

/* ============== Clients block overlap masthead (½ height) ============== */
(function(){
  const sec = document.querySelector('.clients-overlap');
  const band = sec?.querySelector('.marquee');
  if(!sec || !band) return;
  const apply = () => sec.style.setProperty('--marquee-h', band.getBoundingClientRect().height + 'px');
  apply(); addEventListener('resize', apply, {passive:true}); requestAnimationFrame(apply);
})();

/* ============== Prevent hiding header when mobile nav is open ============== */
(function(){
  const hdr = document.getElementById('siteHeader');
  const panel = document.getElementById('mobileNav');
  if(!hdr || !panel) return;
  const prev = { y: window.scrollY };
  function onScroll(){
    if(!panel.hasAttribute('hidden')){ hdr.classList.remove('nav-hidden'); return; }
    const y = window.scrollY, goingDown = y > prev.y, past = y > 120;
    if(goingDown && past){ hdr.classList.add('nav-hidden'); }
    else { hdr.classList.remove('nav-hidden'); }
    prev.y = y;
  }
  window.removeEventListener('scroll', window.__hdrScrollHandler || (()=>{}));
  window.__hdrScrollHandler = onScroll;
  window.addEventListener('scroll', onScroll, {passive:true});
})();

/* ============== BG mesh "lights" drift — 30fps ============== */
(function(){
  const mesh = document.querySelector('.bg-mesh');
  if(!mesh) return;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) return;

  const orbs = [
    { x: 12, y: 22, vx:  0.0045, vy:  0.0032, min: 8,  max: 92 },
    { x: 80, y: 18, vx: -0.0032, vy:  0.0036, min: 8,  max: 92 },
    { x: 70, y: 78, vx:  0.0028, vy: -0.0030, min: 8,  max: 92 }
  ];

  let last = performance.now(), raf, acc = 0;
  const TICK = 1000/30; // 30 FPS

  function step(dt){
    orbs.forEach((o, i) => {
      o.x += o.vx * dt * 0.22; o.y += o.vy * dt * 0.22;
      if (o.x < o.min || o.x > o.max) o.vx *= -1;
      if (o.y < o.min || o.y > o.max) o.vy *= -1;
      mesh.style.setProperty(`--x${i+1}`, o.x.toFixed(2));
      mesh.style.setProperty(`--y${i+1}`, o.y.toFixed(2));
    });
  }
  function frame(now){
    const dt = Math.min(50, now - last); last = now; acc += dt;
    while (acc >= TICK){ step(TICK); acc -= TICK; }
    raf = requestAnimationFrame(frame);
  }

  window.__meshControl = { stop(){ cancelAnimationFrame(raf); }, start(){ last = performance.now(); raf = requestAnimationFrame(frame); } };
  window.__meshControl.start();
})();

/* ============== Blur only for visible .glass blocks ============== */
(function(){
  const els = document.querySelectorAll('.glass');
  if(!els.length) return;
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e => e.target.classList.toggle('use-blur', e.isIntersecting));
  }, { rootMargin: '25% 0px', threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ============== Auto performance mode ============== */
(function(){
  const root = document.documentElement;
  let frames = 0, last = performance.now();
  function meter(now){
    frames++;
    const dt = now - last;
    if(dt >= 1200){
      const fps = frames * 1000 / dt;
      frames = 0; last = now;
      if (fps < 45 || (navigator.deviceMemory && navigator.deviceMemory <= 4)) {
        root.setAttribute('data-perf','low');
        if(window.__meshControl) window.__meshControl.stop();
      }
    }
    requestAnimationFrame(meter);
  }
  requestAnimationFrame(meter);
})();
/* ====== CANVAS-рамка для .glass.angled без враперов ====== */
(function(){
  const SEL = '.glass.angled';
  const items = Array.from(document.querySelectorAll(SEL));
  if(!items.length) return;

  // Создаём/обновляем канвас на элементе
  function ensureCanvas(el){
    let c = el.querySelector(':scope > canvas.angled-border-canvas');
    if(!c){
      c = document.createElement('canvas');
      c.className = 'angled-border-canvas';
      // если у элемента position: static, делаем relative (в CSS уже учли)
      const cs = getComputedStyle(el);
      if(cs.position === 'static') el.style.position = 'relative';
      el.appendChild(c);
    }
    return c;
  }

  // Чертим линию по форме: (0,0) → (w-bevel,0) → (w,bevel) → (w,h) → (0,h) → замкнуть
  function draw(el){
    const c = ensureCanvas(el);
    const cs = getComputedStyle(el);
    const dpr = Math.min(2, window.devicePixelRatio || 1); // crisp, но без перегруза
    const w = Math.max(1, el.clientWidth);
    const h = Math.max(1, el.clientHeight);

    // Настраиваем канвас под DPR
    c.width = Math.round(w * dpr);
    c.height= Math.round(h * dpr);
    c.style.width = w + 'px';
    c.style.height= h + 'px';

    const ctx = c.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);

    // Параметры
    const color = (cs.getPropertyValue('--line') || '#1e2734').trim();
    const bevel = parseFloat(cs.getPropertyValue('--bevel')) || 22;
    const lineW = 1;                 // толщина обводки (px)
    const inset = Math.max(0.5, lineW/2); // чтобы линия была ВНУТРИ клипа и не «резалась»

    // Безопасность: если карточка слишком узкая
    const b = Math.min(bevel, Math.max(0, w - 2*inset) );

    // Рисуем путь
    ctx.beginPath();
    ctx.moveTo(inset, inset);
    ctx.lineTo(w - b - inset, inset);
    ctx.lineTo(w - inset, b + inset);
    ctx.lineTo(w - inset, h - inset);
    ctx.lineTo(inset, h - inset);
    ctx.closePath();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 10;
    ctx.stroke();
  }

  // Рисуем при появлении и при изменении размеров
  const ro = new ResizeObserver(entries => {
    for(const {target} of entries){ draw(target); }
  });
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e => { if(e.isIntersecting) draw(e.target); });
  }, {threshold: 0.05});

  // Инициализация
  items.forEach(el => { ensureCanvas(el); io.observe(el); ro.observe(el); });

  // Перерисовать при смене темы (меняется --line)
  const mqLight = matchMedia('(prefers-color-scheme: light)');
  mqLight.addEventListener?.('change', () => items.forEach(draw));

  // На всякий случай — и при ресайзе окна
  addEventListener('resize', () => items.forEach(draw), {passive:true});
})();

