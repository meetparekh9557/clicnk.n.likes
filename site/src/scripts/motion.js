// Reveal-on-scroll + subtle magnetic hovers. Companion to the motion
// utilities in global.css. Re-runs on astro:page-load so it keeps working
// once View Transitions land in Phase 3.

function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Odometer stat digits roll into place once the value scrolls into view.
  // The strip's resting position in CSS is already its final offset, so this
  // only ever enhances: it snaps the strip to zero, forces a reflow, then
  // lets the CSS transition carry it home. With no JS, or under reduced
  // motion, the correct number is what renders and nothing here runs.
  if (!reduce && 'IntersectionObserver' in window) {
    const roll = (el) => {
      el.classList.add('is-start');
      // Read a layout property to flush the start position before the
      // transition class lands, or the browser coalesces both into one paint
      // and the digits jump straight to their final value.
      void el.offsetHeight;
      el.classList.add('is-rolling');
      el.classList.remove('is-start');
      // will-change is a promise about an animation that is about to run, and
      // holding it afterwards leaves a permanent stacking context behind.
      const strips = el.querySelectorAll('.odo-strip');
      let settled = 0;
      const done = () => {
        settled += 1;
        if (settled >= strips.length) el.classList.remove('is-rolling');
      };
      strips.forEach((strip) => strip.addEventListener('transitionend', done, { once: true }));
      // Belt and braces: the longest digit delay plus the duration, in case a
      // transitionend is missed because the element scrolled out mid-roll.
      setTimeout(() => el.classList.remove('is-rolling'), 1250 + strips.length * 90 + 400);
    };
    const odoIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          odoIo.unobserve(el);
          // initMotion() runs on astro:page-load, which fires on the first
          // load too, so a still-visible value would otherwise roll twice.
          if (el.dataset.odoBound) continue;
          el.dataset.odoBound = '1';
          const delay = parseInt(el.dataset.odoDelay || '0', 10);
          if (delay > 0) setTimeout(() => roll(el), delay);
          else roll(el);
        }
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll('.odo-value').forEach((el) => odoIo.observe(el));
  }

  // `will-change` is a hint for an animation that is ABOUT to run, and it has
  // to be withdrawn once that animation is done. Left in place it creates a
  // permanent stacking context on every revealed element, which silently traps
  // any z-index inside it: a dropdown inside a .reveal wrapper could not paint
  // above a later section no matter how high its own z-index went. It also
  // keeps a compositing layer alive per element for no benefit.
  const settle = (el) => {
    el.style.willChange = 'auto';
  };
  const revealNow = (el) => {
    el.classList.add('in');
    // Clear the hint when the reveal transition finishes; the timeout is the
    // fallback for elements whose transition never fires (already in view,
    // reduced motion, interrupted).
    let done = false;
    const finish = () => { if (!done) { done = true; settle(el); } };
    el.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 1600);
  };

  const targets = document.querySelectorAll('.reveal:not(.in), .reveal-mask:not(.in)');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(revealNow);
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            revealNow(entry.target);
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
