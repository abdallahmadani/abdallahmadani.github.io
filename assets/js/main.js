(function(){
  const root = document.documentElement;

  // theme init
  const stored = localStorage.getItem("theme");
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  const theme = stored || (prefersLight ? "light" : "dark");
  root.setAttribute("data-theme", theme);

  // theme toggle
  const tbtn = document.querySelector("[data-theme-toggle]");
  if(tbtn){
    tbtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  // active nav highlight
  const path = location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll(".nav a").forEach(a=>{
    const href = a.getAttribute("href");
    if(!href) return;
    const norm = href.replace(/\/+$/, "") || "/";
    if(norm === path) a.classList.add("active");
  });

  // smooth “press” microinteraction
  document.querySelectorAll(".btn, .iconbtn, .nav a").forEach(el=>{
    el.addEventListener("mousedown", ()=> el.style.transform = "translateY(1px)");
    el.addEventListener("mouseup", ()=> el.style.transform = "");
    el.addEventListener("mouseleave", ()=> el.style.transform = "");
  });
})();
