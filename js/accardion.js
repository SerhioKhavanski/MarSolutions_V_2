(function initAccordions(){
    const roots = document.querySelectorAll('.acc');
    if(!roots.length) return;
  
    const ANIM = 220; // длительность анимации в мс
  
    function setOpen(item, open){
      const btn   = item.querySelector('.acc-header');
      const panel = item.querySelector('.acc-panel');
      const body  = item.querySelector('.acc-body');
      if(!btn || !panel || !body) return;
  
      btn.setAttribute('aria-expanded', String(open));
      item.dataset.open = String(open);
  
      if(open){
        panel.hidden = false;
        const h = body.offsetHeight;
        panel.style.height = '0px';
        panel.getBoundingClientRect();
        panel.style.transition = `height ${ANIM}ms ease`;
        panel.style.height = h + 'px';
        setTimeout(()=>{ panel.style.height = ''; panel.style.transition = ''; }, ANIM);
      }else{
        const h = body.offsetHeight;
        panel.style.height = h + 'px';
        panel.getBoundingClientRect();
        panel.style.transition = `height ${ANIM}ms ease`;
        panel.style.height = '0px';
        setTimeout(()=>{ panel.hidden = true; panel.style.height = ''; panel.style.transition = ''; }, ANIM);
      }
    }
  
    roots.forEach(root=>{
      const items = Array.from(root.querySelectorAll('.acc-item'));
  
      root.addEventListener('click', (e)=>{
        const btn = e.target.closest('.acc-header');
        if(!btn) return;
        const item = btn.closest('.acc-item');
        const isOpen = item?.dataset.open === 'true';
  
        items.forEach(it => { if(it !== item) setOpen(it, false); });
        setOpen(item, !isOpen);
      });
    });
  })();
  