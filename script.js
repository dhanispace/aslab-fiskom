document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------
     Mobile hamburger menu
  ------------------------------------------ */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  /* ------------------------------------------
     Scroll-reveal for sections/cards
  ------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('in-view'), i * 60);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ------------------------------------------
     Signature visual: hero oscilloscope trace
     A continuously-drawn Lissajous curve rendered
     in "phosphor" green, nodding to the lab's
     computational-physics/numerical-simulation work.
  ------------------------------------------ */
  const oscCanvas = document.getElementById('oscilloscope');
  const isSmallScreen = window.innerWidth < 768;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const lightweightMode = isSmallScreen || isCoarsePointer;

  if (oscCanvas && !prefersReducedMotion) {
    const ctx = oscCanvas.getContext('2d');
    let w, h, dpr;
    let t = 0;
    let running = true;
    let rafId = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, lightweightMode ? 1 : 1.5);
      w = oscCanvas.clientWidth;
      h = oscCanvas.clientHeight;
      oscCanvas.width = Math.round(w * dpr);
      oscCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    function drawGrid() {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    function drawLissajous(offset) {
      const cx = w / 2;
      const cy = h * 0.42;
      const ampX = Math.min(w, 900) * 0.36;
      const ampY = h * 0.3;
      const a = 3, b = 2;
      const points = lightweightMode ? 120 : 260;

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const x = cx + ampX * Math.sin(a * theta + offset);
        const y = cy + ampY * Math.sin(b * theta);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(cx - ampX, 0, cx + ampX, 0);
      grad.addColorStop(0, 'rgba(94, 234, 212, 0.05)');
      grad.addColorStop(0.5, 'rgba(94, 234, 212, 0.65)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      if (!lightweightMode) {
        ctx.shadowColor = 'rgba(94, 234, 212, 0.45)';
        ctx.shadowBlur = 6;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      drawGrid();
      drawLissajous(t);
      t += lightweightMode ? 0.005 : 0.0035;
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (rafId === null) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    }
    function stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Only animate while the hero is actually visible.
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0.05 }
      );
      heroObserver.observe(oscCanvas);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  }

  /* ------------------------------------------
     Ambient particle field for the CTA section
     — small drifting "data points" for atmosphere.
  ------------------------------------------ */
  const ctaCanvas = document.getElementById('cta-canvas');

  // Skip the purely-ambient CTA particles on phones/tablets to keep things light.
  if (ctaCanvas && !prefersReducedMotion && !lightweightMode) {
    const ctx = ctaCanvas.getContext('2d');
    let w, h, dpr;
    let running = true;
    let rafId = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = ctaCanvas.clientWidth;
      h = ctaCanvas.clientHeight;
      ctaCanvas.width = Math.round(w * dpr);
      ctaCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    const COUNT = 28;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
    }));

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(94, 234, 212, 0.5)';
        ctx.fill();
      });
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (rafId === null) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    }
    function stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    if ('IntersectionObserver' in window) {
      const ctaObserver = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0.05 }
      );
      ctaObserver.observe(ctaCanvas);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  }
});
