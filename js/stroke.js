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
