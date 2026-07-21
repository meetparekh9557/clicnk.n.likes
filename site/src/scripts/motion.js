// Reveal-on-scroll + subtle magnetic hovers. Companion to the motion
// utilities in global.css. Re-runs on astro:page-load so it keeps working
// once View Transitions land in Phase 3.

function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // StatTile numbers count up from zero once they scroll into view. The
  // final value is already in the DOM (server-rendered), so this only ever
  // enhances; under reduced motion we leave it exactly as rendered.
  if (!reduce && 'IntersectionObserver' in window) {
    const fmt = (n, decimals, sep) => {
      const fixed = n.toFixed(decimals);
      if (!sep) return fixed;
      const [int, frac] = fixed.split('.');
      const grouped = Number(int).toLocaleString('en-IN');
      return frac ? `${grouped}.${frac}` : grouped;
    };
    const countIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          countIo.unobserve(el);
          const numEl = el.querySelector('.stat-count-num');
          const target = parseFloat(el.dataset.count);
          if (!numEl || !isFinite(target)) continue;
          const decimals = parseInt(el.dataset.decimals || '0', 10);
          const sep = el.dataset.sep === '1';
          const start = performance.now();
          const DUR = 1100;
          const tick = (now) => {
            const t = Math.min(1, (now - start) / DUR);
            const eased = 1 - Math.pow(1 - t, 3);
            numEl.textContent = fmt(target * eased, decimals, sep);
            if (t < 1) requestAnimationFrame(tick);
            else numEl.textContent = fmt(target, decimals, sep);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll('.stat-count').forEach((el) => countIo.observe(el));
  }

  const targets = document.querySelectorAll('.reveal:not(.in), .reveal-mask:not(.in)');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => io.observe(el));
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (ev) => {
        const r = el.getBoundingClientRect();
        const x = (ev.clientX - r.left - r.width / 2) / (r.width / 2);
        const y = (ev.clientY - r.top - r.height / 2) / (r.height / 2);
        el.style.transform = `translate(${(x * 5).toFixed(1)}px, ${(y * 4).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });

    // Hero backdrop cursor parallax: the aurora field drifts opposite the
    // pointer for depth. Tracked at the window level so it responds across
    // the whole hero; values are normalized to -1..1 and eased via CSS.
    const fields = document.querySelectorAll('[data-parallax]');
    if (fields.length) {
      let ticking = false;
      window.addEventListener(
        'pointermove',
        (ev) => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const px = (ev.clientX / window.innerWidth - 0.5) * 2;
            const py = (ev.clientY / window.innerHeight - 0.5) * 2;
            fields.forEach((f) => {
              f.style.setProperty('--px', px.toFixed(3));
              f.style.setProperty('--py', py.toFixed(3));
            });
            ticking = false;
          });
        },
        { passive: true }
      );
    }
  }
}

initMotion();
document.addEventListener('astro:page-load', initMotion);
