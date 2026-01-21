// /js/ui/components.js
// ES Module version — no globals, Netlify safe

export async function loadLayout() {
  const isSub = window.location.pathname.includes("/html/");
  const root = isSub ? ".." : ".";
  const navPath = `${root}/components/navbar.html`;
  const footerPath = `${root}/components/footer.html`;

  async function fetchText(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(path);
    return res.text();
  }

  async function insert(id, path, init) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      el.innerHTML = await fetchText(path);
      if (init) init(el);
    } catch {
      el.innerHTML = id === "navbar"
        ? "<nav>PRISSYDELUXE</nav>"
        : "<footer>© PRISSYDELUXE</footer>";
    }
  }

  function initNavbar(container) {
    const cartBtn = container.querySelector("#navCart");
    cartBtn?.addEventListener("click", e => {
      e.preventDefault();
      window.location.href = isSub ? "./cart.html" : "./html/cart.html";
    });
  }

  function initFooter(container) {
    const year = container.querySelector("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  await insert("navbar", navPath, initNavbar);
  await insert("footer", footerPath, initFooter);
}
