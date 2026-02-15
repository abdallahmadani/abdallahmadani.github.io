(() => {
  const c = document.getElementById("particles");
  if (!(c instanceof HTMLCanvasElement)) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let w = 0, h = 0;

  const resize = () => {
    w = c.clientWidth; h = c.clientHeight;
    c.width = Math.floor(w * DPR);
    c.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };

  const rand = (a, b) => a + Math.random() * (b - a);

  const dots = Array.from({ length: 96 }, () => ({
    x: rand(0, 1),
    y: rand(0, 1),
    r: rand(0.8, 2.2),
    vx: rand(-0.020, 0.020),
    vy: rand(-0.012, 0.012),
    a: rand(0.25, 0.85)
  }));

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < -0.05) d.x = 1.05;
      if (d.x > 1.05) d.x = -0.05;
      if (d.y < -0.05) d.y = 1.05;
      if (d.y > 1.05) d.y = -0.05;
    }

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dx = (a.x - b.x) * w;
        const dy = (a.y - b.y) * h;
        const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          const t = 1 - dist / 150;
          ctx.strokeStyle = `rgba(34,211,238,${0.08 * t})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
      }
    }

    for (const d of dots) {
      const x = d.x * w, y = d.y * h;
      ctx.fillStyle = `rgba(255,255,255,${d.a})`;
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, Math.PI * 2);
      ctx.fill();

      if (Math.random() < 0.02) {
        ctx.fillStyle = `rgba(34,211,238,0.45)`;
        ctx.beginPath();
        ctx.arc(x, y, d.r + 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  resize();
  draw();
})();
