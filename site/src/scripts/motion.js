// Reveal-on-scroll + subtle magnetic hovers. Companion to the motion
// utilities in global.css. Re-runs on astro:page-load so it keeps working
// once View Transitions land in Phase 3.

function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
