const $ = (q, el=document) => el.querySelector(q);

function setTheme(next){
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  const icon = $("#themeIcon");
  if(icon){
    icon.innerHTML = next === "light"
      ? `<path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>`
      : `<path d="M21 12.8A8.4 8.4 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8Z"/>`;
  }
}

function initTheme(){
  const saved = localStorage.getItem("theme");
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(saved || (prefersLight ? "light" : "dark"));
  const btn = $("#themeToggle");
  if(btn){
    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(cur === "dark" ? "light" : "dark");
    });
  }
}

function markActiveNav(){
  const path = location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll(".nav-links a").forEach(a=>{
    const href = a.getAttribute("href");
    if(!href) return;
    const target = new URL(href, location.origin).pathname.replace(/\/+$/, "") || "/";
    if(target === path) a.setAttribute("aria-current","page");
  });
}

function particles(){
  const canvas = $("#particles");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w=0,h=0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const pts = [];
  const N = 90;

  function resize(){
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function rand(a,b){ return a + Math.random()*(b-a); }

  function seed(){
    pts.length = 0;
    for(let i=0;i<N;i++){
      pts.push({
        x: rand(0,w), y: rand(0,h),
        vx: rand(-.25,.25), vy: rand(-.25,.25),
        r: rand(1.2,2.6),
        a: rand(.25,.65)
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    const stroke = theme === "light" ? "rgba(10,14,20,.18)" : "rgba(255,255,255,.12)";
    const fill = theme === "light" ? "rgba(10,14,20,.35)" : "rgba(255,255,255,.45)";

    for(const p of pts){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -30) p.x = w+30;
      if(p.x > w+30) p.x = -30;
      if(p.y < -30) p.y = h+30;
      if(p.y > h+30) p.y = -30;

      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = fill;
      ctx.globalAlpha = p.a;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const a=pts[i], b=pts[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const dist = Math.hypot(dx,dy);
        if(dist < 130){
          ctx.strokeStyle = stroke;
          ctx.globalAlpha = (1 - dist/130) * .9;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize(); seed(); draw();
  window.addEventListener("resize", ()=>{ resize(); seed(); }, {passive:true});
}

initTheme();
markActiveNav();
particles();
