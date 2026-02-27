(() => {
  const canvas = document.getElementById("fire-bg");
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) return;

  const MAX_DPR = 2;
  const MAX_PARTICLES = 500;

  const logoImg = new Image();
  logoImg.src = "/static/interac_logo.png";

  let w = 0, h = 0, dpr = 1;

  const logos = [];
  const particles = [];
  const rand = (a, b) => Math.random() * (b - a) + a;

  const particleSprite = document.createElement("canvas");
  particleSprite.width = 64;
  particleSprite.height = 64;
  const sctx = particleSprite.getContext("2d");
  if (!sctx) return;


  const EFFECT_CONFIG = {
    lengthMultiplier: 1.75,   // Increase for longer trails (multiplies life)
    speedMultiplier: 1,    // Increase for faster/further fire (multiplies velocity)
    spread: 60,              // Width of the trail cone
    backSpeedMin: 70,        // Minimum base pushback speed
    backSpeedMax: 130,        // Maximum base pushback speed

    trailCount: 7,
    trailDecay: 0.4
  };


  (function buildParticleSprite() {
    const cx = 32, cy = 32, r = 28;
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

  // OPTIMIZATION 1: Pre-render Logo Sprite
  const logoSprite = document.createElement("canvas");
  logoSprite.width = 128;
  logoSprite.height = 128;
  const lctx = logoSprite.getContext("2d");
  logoImg.onload = () => {
    lctx.filter = "saturate(0.88) brightness(1.02)";
    lctx.shadowColor = "rgba(240,181,28,0.18)";
    lctx.shadowBlur = 7;
    lctx.drawImage(logoImg, 32, 32, 64, 64);
    lctx.filter = "none";
    lctx.shadowBlur = 0;
  };

  // OPTIMIZATION 2: Pre-render Glow Sprite
  const glowSprite = document.createElement("canvas");
  glowSprite.width = 128;
  glowSprite.height = 128;
  const gctx = glowSprite.getContext("2d");
  (function buildGlowSprite() {
    const cx = 64, cy = 64, gr = 64;
    const grad = gctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
    grad.addColorStop(0, "rgba(240,181,28,0.08)");
    grad.addColorStop(0.55, "rgba(240,181,28,0.04)");
    grad.addColorStop(1, "rgba(240,181,28,0)");
    gctx.fillStyle = grad;
    gctx.beginPath();
    gctx.arc(cx, cy, gr, 0, Math.PI * 2);
    gctx.fill();
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
  }

  resize();
  window.addEventListener("resize", resize);

  function spawnLogoMeteor() {
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? rand(-60, w * 0.32) : rand(w * 0.68, w + 60);
    const y = rand(-100, h * 0.18);

    // added this variable to slow down each meteor
    const METEOR_SPEED = 0.85;

    logos.push({
      x, y, 
      vx: fromLeft ? rand(55, 110) : rand(-110, -55) * METEOR_SPEED, 
      vy: rand(230, 310) * METEOR_SPEED,
      size: rand(30, 46),
      rot: rand(-0.35, 0.35),
      rotSpeed: rand(-0.18, 0.18),
      alpha: rand(0.55, 0.80),
      // OPTIMIZATION: Store previous coordinates for the blur trail
      trail: [] 
    });
  }

  function emitFire(logo) {
    if (particles.length >= MAX_PARTICLES) return;

    const speed = Math.hypot(logo.vx, logo.vy) || 1;
    const ux = logo.vx / speed;
    const uy = logo.vy / speed;

    const tailX = logo.x - ux * (logo.size * 0.34);
    const tailY = logo.y - uy * (logo.size * 0.34);

    const count = (rand(2, 10) | 0);
    for (let i = 0; i < count; i++) {
        const spread = rand(-0.65, 0.65);
        // Apply speed multiplier here
        const backSpeed = rand(EFFECT_CONFIG.backSpeedMin, EFFECT_CONFIG.backSpeedMax) * EFFECT_CONFIG.speedMultiplier;
        
        const px = -uy;
        const py = ux;

        // Apply length multiplier to life
        const particleLife = rand(0.20, 0.34) * EFFECT_CONFIG.lengthMultiplier;

        particles.push({
            x: tailX + px * rand(-3, 3),
            y: tailY + py * rand(-3, 3),
            vx: -ux * backSpeed + px * spread * EFFECT_CONFIG.spread + rand(-10, 10),
            vy: -uy * backSpeed + py * spread * EFFECT_CONFIG.spread + rand(-10, 10),
            life: particleLife,
            maxLife: particleLife, // Match maxLife to new life
            r: rand(4, 9),
            heat: rand(0.65, 0.95)
        });
    }

    // Secondary "spark" particles
    if (Math.random() < 0.45 && particles.length < MAX_PARTICLES) {
        const sparkLife = rand(0.14, 0.22) * EFFECT_CONFIG.lengthMultiplier;
        particles.push({
            x: tailX,
            y: tailY,
            vx: (-ux * rand(120, 190) + rand(-22, 22)) * EFFECT_CONFIG.speedMultiplier,
            vy: (-uy * rand(120, 190) + rand(-22, 22)) * EFFECT_CONFIG.speedMultiplier,
            life: sparkLife,
            maxLife: sparkLife,
            r: rand(1.5, 3.2),
            heat: 1.0
        });
    }
  }

  function update(dt) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnLogoMeteor();
      spawnTimer = rand(0.55, 1.00);
    }

    for (let i = logos.length - 1; i >= 0; i--) {
      const L = logos[i];
      
      // Store current pos in trail
      L.trail.push({ x: L.x, y: L.y, rot: L.rot });
      if (L.trail.length > EFFECT_CONFIG.trailCount) L.trail.shift(); // Keep only last 6 steps

      L.x += L.vx * dt;
      L.y += L.vy * dt;
      L.rot += L.rotSpeed * dt;
      
      emitFire(L);

      if (L.y > h + 120 || L.x < -140 || L.x > w + 140) {
        logos.splice(i, 1);
      }
    }
  }

  function drawLogo(L) {
    if (!logoImg.complete) return;

    // Draw the Motion Blur Trail (Ghosts)
    for (let i = 0; i < L.trail.length; i++) {
      const pos = L.trail[i];
      const trailAlpha = (i / L.trail.length) * L.alpha * EFFECT_CONFIG.trailDecay; // Fades out the further back it is
      
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(pos.rot);
      ctx.globalAlpha = trailAlpha;
      // Use the pre-rendered logoSprite for speed
      ctx.drawImage(logoSprite, -L.size, -L.size, L.size * 2, L.size * 2);
      ctx.restore();
    }

    // Draw the Main Logo (The "Head")
    ctx.save();
    ctx.translate(L.x, L.y);
    ctx.rotate(L.rot);
    ctx.globalAlpha = L.alpha;
    ctx.drawImage(logoSprite, -L.size, -L.size, L.size * 2, L.size * 2);
    ctx.restore();
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

    // OPTIMIZATION 4: Single hardware clear
    ctx.clearRect(0, 0, w, h);

    update(dt);

    ctx.save();
    // OPTIMIZATION 5: Lock pipeline state once globally
    ctx.globalCompositeOperation = "source-over"; 
    ctx.globalAlpha = 0.15; 
    
    // OPTIMIZATION 6: O(1) Memory Management & Inlined draw logic
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      
      if (p.life <= 0) {
        // Constant-time array deletion
        particles[i] = particles[particles.length - 1];
        particles.pop();
        continue;
      }

      p.vx *= 0.987;
      p.vy *= 0.987;
      p.vy -= 13 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      const currentRadius = p.r * (p.life / p.maxLife);

      if (currentRadius > 0.5) {
        // OPTIMIZATION 7: Sub-pixel rasterization bypass (| 0)
        ctx.drawImage(
          particleSprite, 
          (p.x - currentRadius) | 0, 
          (p.y - currentRadius) | 0, 
          (currentRadius * 2) | 0, 
          (currentRadius * 2) | 0
        );
      }
    }
    ctx.restore();

    for (let i = 0; i < logos.length; i++) drawLogo(logos[i]);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();