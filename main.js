

/* Moved from about.html: BG mesh orbs drift */
/* Sticky Header: hide on scroll down, show on scroll up */
    (function(){
      const h = document.getElementById('siteHeader');
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

    /* Slider util — оставляем для совместимости */
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
            b.type='button'; b.className='dot'; b.addEventListener('click', ()=> goTo(i));
            dotsWrap.appendChild(b);
          }
          dots = Array.from(dotsWrap.children);
        }
        updateDots();
      }
      function layout(){ const p = perView(); slides.forEach(s=> s.style.flex = `0 0 ${100/p}%`); buildDots(); goTo(index); }
      function updateDots(){ dots.forEach((d,i)=> d.classList.toggle('active', i===index)); }
      function goTo(i){ const p = perView(); const max = Math.max(0, Math.ceil(slides.length / p) - 1); index = Math.max(0, Math.min(i, max)); track.style.transform = `translate3d(-${index*100}%,0,0)`; updateDots(); }
      function next(){ goTo(index+1); } function prev(){ goTo(index-1); }
      document.querySelectorAll(`[data-target="${rootSelector}"][data-next]`).forEach(b=>b.addEventListener('click', next));
      document.querySelectorAll(`[data-target="${rootSelector}"][data-prev]`).forEach(b=>b.addEventListener('click', prev));
      root.addEventListener('keydown', e=>{ if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); });
      addEventListener('resize', layout, {passive:true}); layout();
      return {next,prev,goTo,layout};
    }

    /* Fade-in on scroll */
    (function(){
      const targets = document.querySelectorAll('.reveal, .glass, .slider, .marquee');
      const obs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.12 });
      targets.forEach(t=> obs.observe(t));
    })();

    /* Background particles */
    (function(){
      const c = document.getElementById('bg-particles');
      const ctx = c.getContext('2d');
      const mq = matchMedia('(prefers-reduced-motion: reduce)');
      let dpr, raf;

      function resize(){
        dpr = devicePixelRatio || 1;
        c.width = innerWidth * dpr; c.height = innerHeight * dpr;
        c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
        ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr);
      }
      const count = () => Math.round(Math.min(120, (innerWidth*innerHeight)/15000));
      let particles=[];
      function init(){
        particles = Array.from({length: count()}).map(()=>({
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
          ctx.globalAlpha = p.a; ctx.fillRect(p.x, p.y, p.s, p.s);
        });
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(step);
      }
      function start(){ if(mq.matches) return; cancelAnimationFrame(raf); step(); }
      function stop(){ cancelAnimationFrame(raf); ctx.clearRect(0,0,innerWidth,innerHeight); }

      resize(); init(); start();
      addEventListener('resize', ()=>{ resize(); init(); }, {passive:true});
      mq.addEventListener?.('change', ()=> mq.matches ? stop() : start());
    })();

    /* BG mesh "lights" drift — ускоренный */
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

      let last = performance.now(), raf;
      function frame(now){
        const dt = Math.min(33, now - last);
        last = now;
        const speed = dt * 0.22; /* ускорение дрейфа */

        orbs.forEach((o, i) => {
          o.x += o.vx * speed; o.y += o.vy * speed;
          if (o.x < o.min || o.x > o.max) o.vx *= -1;
          if (o.y < o.min || o.y > o.max) o.vy *= -1;
          mesh.style.setProperty(`--x${i+1}`, o.x.toFixed(2));
          mesh.style.setProperty(`--y${i+1}`, o.y.toFixed(2));
        });

        raf = requestAnimationFrame(frame);
      }
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else { last = performance.now(); raf = requestAnimationFrame(frame); }
      });
      raf = requestAnimationFrame(frame);
    })();
