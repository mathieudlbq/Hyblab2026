(() => {
  const COLORS = [
    '#FF3D3D', '#FFD600', '#00E5FF', '#76FF03',
    '#FF6D00', '#D500F9', '#FFFFFF', '#FF4081'
  ];

  const PARTICLE_COUNT = 120;
  const GRAVITY = 0.38;
  const DRAG = 0.97;
  const SPIN = 0.08;

  let canvas, ctx, particles = [], animId = null;

  function createCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle(x, y) {
    const angle = randomBetween(-Math.PI * 0.9, -Math.PI * 0.1);
    const speed = randomBetween(4, 14);
    const size = randomBetween(6, 14);
    const isRibbon = Math.random() > 0.5;

    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-SPIN, SPIN),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: isRibbon ? randomBetween(3, 6) : size,
      height: isRibbon ? randomBetween(12, 22) : size,
      isRibbon,
      alpha: 1,
      life: 1,
      decay: randomBetween(0.012, 0.022),
    };
  }

  function burst(x, y, count = PARTICLE_COUNT) {
    createCanvas();
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(x, y));
    }
    if (!animId) loop();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.vy += GRAVITY;
      p.vx *= DRAG;
      p.vy *= DRAG;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.isRibbon) {
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    particles = particles.filter(p => p.life > 0);

    if (particles.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  function bindStepImages() {
    const observer = new MutationObserver(() => {
      const imgs = document.querySelectorAll('.step-img:not([data-confetti-bound])');
      imgs.forEach(img => {
        img.setAttribute('data-confetti-bound', '1');
        img.style.cursor = 'pointer';

        img.addEventListener('click', (e) => {
          e.stopPropagation();
          const pos = getElementCenter(img);
          burst(pos.x, pos.y);

          gsap.to(img, {
            scale: 1.15,
            duration: 0.15,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          });
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const existingImgs = document.querySelectorAll('.step-img:not([data-confetti-bound])');
    existingImgs.forEach(img => {
      img.setAttribute('data-confetti-bound', '1');
      img.style.cursor = 'pointer';

      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const pos = getElementCenter(img);
        burst(pos.x, pos.y);

        gsap.to(img, {
          scale: 1.15,
          duration: 0.15,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', bindStepImages);
  if (document.readyState !== 'loading') bindStepImages();

  window.ConfettiEffect = { burst };
})();