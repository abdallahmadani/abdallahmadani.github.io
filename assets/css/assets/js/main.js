// Highlight current page link in the nav
(() => {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".links a[data-page]").forEach(a => {
    if (a.dataset.page === path) a.classList.add("active");
  });

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
