/* ==========================================================
   Smooth parallax
   - Elements with [data-speed] move inside their nearest
     [data-parallax] section.
   - speed > 0 : drifts slower than the page (feels far away)
   - speed < 0 : drifts faster than the page (feels close)
   - data-parallax="start" measures from the top of the page
     (used by the hero); otherwise from the viewport centre.
   - data-fade fades the element out as it scrolls away.
   - The scroll position is eased, so everything glides.
   ========================================================== */

   (() => {
    'use strict';
  
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const EASE = 0.085; // lower = floatier, higher = snappier
  
    const groups = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
      el,
      fromTop: el.dataset.parallax === 'start',
      top: 0,
      height: 0,
      layers: [...el.querySelectorAll('[data-speed]')].map((layer) => ({
        el: layer,
        speed: parseFloat(layer.dataset.speed) || 0,
        fade: layer.hasAttribute('data-fade'),
      })),
    }));
  
    let viewport = window.innerHeight;
    let current = window.scrollY; // eased position
    let target = current;         // real position
    let running = false;
  
    function measure() {
      viewport = window.innerHeight;
      groups.forEach((g) => {
        const rect = g.el.getBoundingClientRect();
        g.top = rect.top + window.scrollY;
        g.height = rect.height;
      });
    }
  
    function render(force) {
      groups.forEach((g) => {
        // Skip sections that are far from the screen
        if (!force && (current + viewport < g.top - viewport * 0.5 ||
                       current > g.top + g.height + viewport * 0.5)) return;
  
        const offset = g.fromTop
          ? current - g.top
          : current + viewport / 2 - (g.top + g.height / 2);
  
        g.layers.forEach((l) => {
          l.el.style.transform = `translate3d(0, ${(offset * l.speed).toFixed(2)}px, 0)`;
          if (l.fade) {
            const progress = Math.min(Math.max(offset / (viewport * 0.7), 0), 1);
            l.el.style.opacity = (1 - progress).toFixed(3);
          }
        });
      });
    }
  
    function clear() {
      groups.forEach((g) =>
        g.layers.forEach((l) => {
          l.el.style.transform = '';
          l.el.style.opacity = '';
        })
      );
    }
  
    function tick() {
      target = window.scrollY;
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.1) current = target;
  
      render(false);
  
      if (current !== target) {
        requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }
  
    function onScroll() {
      if (reduceMotion.matches || running) return;
      running = true;
      requestAnimationFrame(tick);
    }
  
    function start() {
      if (reduceMotion.matches) {
        clear();
        return;
      }
      measure();
      current = target = window.scrollY;
      render(true);
    }
  
    let resizeFrame = 0;
    function onResize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(start);
    }
  
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', start);
    reduceMotion.addEventListener('change', start);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  
    start();
  })();