(() => {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let w, h, dpr;
  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }
  window.addEventListener("resize", resize, {passive:true});
  resize();

  const N = Math.floor(Math.min(120, Math.max(60, window.innerWidth / 14)));
  const pts = Array.from({length:N}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: (Math.random()*1.4 + 0.6) * dpr,
    vx: (Math.random()*0.30 + 0.05) * dpr,
    vy: (Math.random()*0.22 + 0.03) * dpr,
    a: Math.random()*0.30 + 0.10,
    c: Math.random() < 0.5 ? "46,212,200" : "100,181,255"
  }));

  function frame(){
    ctx.clearRect(0,0,w,h);

    for(let i=0;i<pts.length;i++){
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;

      if(p.x > w + 40*dpr) p.x = -40*dpr;
      if(p.y > h + 40*dpr) p.y = -40*dpr;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.c}, ${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();

      for(let j=i+1;j<pts.length;j++){
        const q = pts[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const max = 130 * dpr;
        if(dist < max){
          const t = 1 - dist/max;
          ctx.strokeStyle = `rgba(255,255,255,${0.07*t})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(p.x,p.y);
          ctx.lineTo(q.x,q.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }
  frame();
})();
