// theme
(() => {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  const setIcon = (mode) => { if (icon) icon.textContent = mode === "dark" ? "🌙" : "☀️"; };

  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const initial = saved || (prefersDark ? "dark" : "light");

  root.dataset.theme = initial;
  setIcon(initial);

  btn?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIcon(next);
  });
})();

// mobile menu
(() => {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("mobileMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => menu.classList.toggle("show"));

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof Node && !menu.contains(t) && t !== btn) menu.classList.remove("show");
  });
})();

// footer year
(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
