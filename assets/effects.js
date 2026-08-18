// 모시다 공용 애니메이션 효과 엔진 — INVITE.effects = { type: "petals-white" } 이면 활성화
// 종류: snow | sparkle | fireflies | petals-red | petals-gold | petals-lavender | petals-white | petals-pink
// 가벼운 캔버스 파티클 하나로 전부 처리. reduced-motion이면 자동 비활성.
(function () {
  "use strict";
  const cfg = window.INVITE && window.INVITE.effects;
  if (!cfg || !cfg.type) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const PRESETS = {
    "snow":            { n: 34, colors: ["#ffffff"], shape: "dot", rMin: 1.2, rMax: 3.2, vy: [0.35, 0.9], sway: 0.6, alpha: 0.85 },
    "sparkle":         { n: 26, colors: ["#ffe9a8", "#fff6d8", "#e8d8f0"], shape: "star", rMin: 0.8, rMax: 2.2, vy: [0.05, 0.18], sway: 0.15, alpha: 0.9, twinkle: true },
    "fireflies":       { n: 16, colors: ["#f4e8a0", "#d9e8a0"], shape: "glow", rMin: 1.4, rMax: 2.6, vy: [-0.12, 0.12], sway: 0.5, alpha: 0.8, twinkle: true },
    "petals-red":      { n: 18, colors: ["#c25a5a", "#a94444", "#d98a8a"], shape: "petal", rMin: 4, rMax: 8, vy: [0.5, 1.1], sway: 1.1, alpha: 0.8 },
    "petals-gold":     { n: 18, colors: ["#d9b36a", "#c9a154", "#e8cfa0"], shape: "petal", rMin: 3.5, rMax: 7, vy: [0.45, 1.0], sway: 1.0, alpha: 0.8 },
    "petals-lavender": { n: 18, colors: ["#b8a5d8", "#a08cc8", "#d0c4e8"], shape: "petal", rMin: 4, rMax: 8, vy: [0.5, 1.1], sway: 1.1, alpha: 0.8 },
    "petals-white":    { n: 16, colors: ["#ffffff", "#f5efe6"], shape: "petal", rMin: 4, rMax: 8, vy: [0.45, 1.0], sway: 1.0, alpha: 0.75 },
    "petals-pink":     { n: 20, colors: ["#f2c4cf", "#e8a8b8", "#fadde4"], shape: "petal", rMin: 4, rMax: 8, vy: [0.5, 1.1], sway: 1.1, alpha: 0.85 }
  };
  const P = PRESETS[cfg.type];
  if (!P) return;
  // 오타 방어: 색상 문자열 검증
  P.colors = P.colors.filter((c) => /^#[0-9a-f]{3,8}$/i.test(c));
  if (!P.colors.length) P.colors = ["#ffffff"];

  const cv = document.createElement("canvas");
  cv.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:40";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W, H, dpr;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px";
    cv.style.height = innerHeight + "px";
  };
  size();
  addEventListener("resize", size);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const parts = Array.from({ length: P.n }, () => spawn(true));
  function spawn(anywhere) {
    return {
      x: rnd(0, W),
      y: anywhere ? rnd(0, H) : (P.vy[0] < 0 ? rnd(0, H) : -20 * dpr),
      r: rnd(P.rMin, P.rMax) * dpr,
      vy: rnd(P.vy[0], P.vy[1]) * dpr,
      ph: rnd(0, Math.PI * 2),
      sp: rnd(0.004, 0.012),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-0.01, 0.01),
      c: P.colors[(Math.random() * P.colors.length) | 0],
      tw: rnd(0.5, 1)
    };
  }

  function draw(p, t) {
    const a = P.twinkle ? P.alpha * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.001 + p.ph * 3))) : P.alpha;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.c;
    if (P.shape === "dot") {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    } else if (P.shape === "glow" || P.shape === "star") {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      g.addColorStop(0, p.c); g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 7); ctx.fill();
    } else { // petal: 회전하는 타원
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 7);
      ctx.fill();
      ctx.restore();
    }
  }

  let last = 0;
  function tick(t) {
    // 백그라운드 탭 복귀 시 점프 방지
    const dt = Math.min(t - last, 50) / 16.7 || 1;
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.ph += p.sp * dt * 16.7;
      p.x += Math.sin(p.ph) * P.sway * dpr * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > H + 30 * dpr) parts[i] = spawn(false);
      if (p.y < -40 * dpr) parts[i] = spawn(false), (parts[i].y = H + 10 * dpr);
      if (p.x < -30 * dpr) p.x = W + 20 * dpr;
      if (p.x > W + 30 * dpr) p.x = -20 * dpr;
      draw(p, t);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
