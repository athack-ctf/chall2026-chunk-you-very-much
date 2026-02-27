(() => {
  const canvas = document.getElementById("fire-bg");
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) return;


  const MAX_DPR = 2;
  const MAX_PARTICLES = 1200;

  const SPAWN_MIN = 0.55;
  const SPAWN_MAX = 1.00;

  const LOGO_SIZE_MIN = 30;
  const LOGO_SIZE_MAX = 46;

  const LOGO_ALPHA_MIN = 0.55;
  const LOGO_ALPHA_MAX = 0.80;

  const LOGO_VY_MIN = 230;
  const LOGO_VY_MAX = 310;

  const LOGO_VX_MIN = 55;
  const LOGO_VX_MAX = 110;


  const logoImg = new Image();
  logoImg.src = "/styles/interac_logo.png";

  let w = 0;
  let h = 0;
  let dpr = 1;

  let washGradient = null;
  let vignetteGradient = null;

  const logos = [];
  const particles = [];

  const rand = (a, b) => Math.random() * (b - a) + a;

  const particleSprite = document.createElement("canvas");
  particleSprite.width = 64;
  particleSprite.height = 64;
  const sctx = particleSprite.getContext("2d");
  if (!sctx) return;

  (function buildParticleSprite(){
    const cx = 32, cy = 32;
    const r = 28;
    const g = sctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0.00, "rgba(255,250,225,1)");
    g.addColorStop(0.18, "rgba(255,225,135,0.85)");
    g.addColorStop(0.42, "rgba(240,181,28,0.70)");
    g.addColorStop(0.70, "rgba(210,75,24,0.35)");
    g.addColorStop(0.86, "rgba(122,60,255,0.22)");
    g.addColorStop(0.95, "rgba(95,124,255,0.12)");
    g.addColorStop(1.00, "rgba(0,0,0,0)");
    sctx.fillStyle = g;
    sctx.beginPath();
    sctx.arc(cx, cy, r, 0, Math.PI * 2);
    sctx.fill();
  })();

  function resize() {
    dpr = Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio || 1));
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    washGradient = ctx.createLinearGradient(0, 0, 0, h);
    washGradient.addColorStop(0.00, "rgba(122,60,255,0.07)");
    washGradient.addColorStop(0.45, "rgba(95,124,255,0.05)");
    washGradient.addColorStop(1.00, "rgba(57,255,20,0.025)");

    vignetteGradient = ctx.createRadialGradient(
      w * 0.5, h * 0.45, h * 0.14,
      w * 0.5, h * 0.45, h * 0.95
    );
    vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGradient.addColorStop(1, "rgba(5,8,18,0.09)");
  }

  resize();
  window.addEventListener("resize", resize);

  function spawnLogoMeteor() {
    const fromLeft = Math.random() < 0.5;

    const x = fromLeft ? rand(-60, w * 0.32) : rand(w * 0.68, w + 60);
    const y = rand(-100, h * 0.18);

    const vx = fromLeft ? rand(LOGO_VX_MIN, LOGO_VX_MAX) : rand(-LOGO_VX_MAX, -LOGO_VX_MIN);
    const vy = rand(LOGO_VY_MIN, LOGO_VY_MAX);

    logos.push({
      x, y, vx, vy,
      size: rand(LOGO_SIZE_MIN, LOGO_SIZE_MAX),
      rot: rand(-0.35, 0.35),
      rotSpeed: rand(-0.18, 0.18),
      alpha: rand(LOGO_ALPHA_MIN, LOGO_ALPHA_MAX)
    });
  }

  function emitFire(logo) {
    const speed = Math.hypot(logo.vx, logo.vy) || 1;
    const ux = logo.vx / speed;
    const uy = logo.vy / speed;

    const tailX = logo.x - ux * (logo.size * 0.34);
    const tailY = logo.y - uy * (logo.size * 0.34);

    const count = (rand(2, 4) | 0);

    for (let i = 0; i < count; i++) {
      const spread = rand(-0.65, 0.65);
      const backSpeed = rand(70, 145);

      const px = -uy;
      const py = ux;

      const p = {
        x: tailX + px * rand(-3, 3),
        y: tailY + py * rand(-3, 3),
        vx: -ux * backSpeed + px * spread * 42 + rand(-10, 10),
        vy: -uy * backSpeed + py * spread * 42 + rand(-10, 10),
        life: rand(0.20, 0.34),
        maxLife: 0,
        r: rand(4, 9),
        heat: rand(0.65, 0.95)
      };
      p.maxLife = p.life;
      particles.push(p);
    }

    if (Math.random() < 0.45) {
      const s = {
        x: tailX,
        y: tailY,
        vx: -ux * rand(120, 190) + rand(-22, 22),
        vy: -uy * rand(120, 190) + rand(-22, 22),
        life: rand(0.14, 0.22),
        maxLife: 0,
        r: rand(1.5, 3.2),
        heat: 1.0
      };
      s.maxLife = s.life;
      particles.push(s);
    }
  }

  function update(dt) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnLogoMeteor();
      spawnTimer = rand(SPAWN_MIN, SPAWN_MAX);
    }

    
    for (let i = logos.length - 1; i >= 0; i--) {
      const L = logos[i];
      L.x += L.vx * dt;
      L.y += L.vy * dt;
      L.rot += L.rotSpeed * dt;

      emitFire(L);

      if (L.y > h + 120 || L.x < -140 || L.x > w + 140) {
        logos.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      p.vx *= 0.987;
      p.vy *= 0.987;
      p.vy -= 13 * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.r += 8 * dt;
    }


    if (particles.length > MAX_PARTICLES) {
      particles.splice(0, particles.length - MAX_PARTICLES);
    }
  }

  function drawParticle(p) {
    const t = p.life / p.maxLife;
    const a = 0.30 * t * p.heat;

    ctx.globalAlpha = a;
    const r = p.r;
    ctx.drawImage(particleSprite, p.x - r, p.y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  }

  function drawLogo(L) {

    const glow = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.size * 1.05);
    glow.addColorStop(0, "rgba(240,181,28,0.08)");
    glow.addColorStop(0.55, "rgba(240,181,28,0.04)");
    glow.addColorStop(1, "rgba(240,181,28,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(L.x, L.y, L.size * 0.75, 0, Math.PI * 2);
    ctx.fill();

 
    const speed = Math.hypot(L.vx, L.vy) || 1;
    const ux = L.vx / speed;
    const uy = L.vy / speed;

    ctx.strokeStyle = "rgba(240,181,28,0.10)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(L.x - ux * (L.size * 1.35), L.y - uy * (L.size * 1.35));
    ctx.lineTo(L.x - ux * (L.size * 0.18), L.y - uy * (L.size * 0.18));
    ctx.stroke();


    if (logoImg.complete && logoImg.naturalWidth) {
      ctx.save();
      ctx.translate(L.x, L.y);
      ctx.rotate(L.rot);

      ctx.globalAlpha = L.alpha * 0.78;
      ctx.filter = "saturate(0.88) brightness(1.02)";
      ctx.shadowColor = "rgba(240,181,28,0.18)";
      ctx.shadowBlur = 7;

      ctx.drawImage(logoImg, -L.size / 2, -L.size / 2, L.size, L.size);
      ctx.restore();

      ctx.globalAlpha = 1;
      ctx.filter = "none";
      ctx.shadowBlur = 0;
    }
  }

  let last = performance.now();
  let spawnTimer = 0.25;

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
  });

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    if (!running) {
      requestAnimationFrame(frame);
      return;
    }


    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    update(dt);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < particles.length; i++) drawParticle(particles[i]);
    ctx.restore();

 
    for (let i = 0; i < logos.length; i++) drawLogo(logos[i]);


    if (washGradient) {
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = washGradient;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }


    if (vignetteGradient) {
      ctx.save();
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();