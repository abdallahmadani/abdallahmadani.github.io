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

(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

(() => {
  const items = document.querySelectorAll("[data-accordion]");
  items.forEach((wrap) => {
    const buttons = wrap.querySelectorAll("[data-acc-btn]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".item");
        if (!item) return;
        const isOpen = item.classList.contains("open");
        wrap.querySelectorAll(".item.open").forEach(x => x.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });
  });
})();
