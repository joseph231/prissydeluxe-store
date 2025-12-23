// /js/ui/components.js
// Inject navbar & footer, initialize UI behaviours, expose small helpers
// Robust supabase readiness checks to avoid premature redirects.

(async () => {
  const isSub = window.location.pathname.split('/').includes('html');
  const root = isSub ? '..' : '.';
  const navPath = `${root}/components/navbar.html`;
  const footerPath = `${root}/components/footer.html`;

  function safeFetchText(url) {
    return fetch(url, { cache: 'no-store' }).then(res => {
      if (!res.ok) throw new Error(`${url} ${res.status}`);
      return res.text();
    });
  }

  async function insertHtml(id, path, initFn) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      el.innerHTML = await safeFetchText(path);
      if (initFn) initFn(el);
    } catch (err) {
      console.warn('components load error', err);
      el.innerHTML = id === 'navbar'
        ? '<nav style="padding:16px;text-align:center">PRISSYDELUXE</nav>'
        : '<footer style="padding:16px;text-align:center">© PRISSYDELUXE</footer>';
    }
  }

  function safeQuery(container, sel) {
    try { return container.querySelector(sel); } catch { return null; }
  }

  // Wait for window.supabase to appear (it may initialize asynchronously).
  // Resolves to { ready: true, supabase } when available, or { ready:false } if not after timeout.
  async function waitForSupabase(timeout = 3000) {
    const interval = 120;
    const maxTries = Math.ceil(timeout / interval);
    for (let i = 0; i < maxTries; i++) {
      if (window.supabase && typeof window.supabase.auth !== 'undefined') {
        return { ready: true, supabase: window.supabase };
      }
      // also accept explicit global flag: window.SUPABASE_ENABLED === false => local mode
      if (window.SUPABASE_ENABLED === false) return { ready: false };
      await new Promise(r => setTimeout(r, interval));
    }
    // final fallback: treat as local mode
    return { ready: false };
  }

  function initNavbar(container) {
    const nav = container.querySelector('nav') || container.firstElementChild;
    if (!nav) return;

    // NAV show/hide on scroll
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.08) nav.classList.add('nav-visible');
      else nav.classList.remove('nav-visible');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // mobile menu handlers (inert fallback)
    const openBtn = safeQuery(nav, '#mobileMenuToggle');
    const closeBtn = safeQuery(nav, '#mobileMenuClose');
    const mobileMenu = safeQuery(nav, '#mobileMenu');
    function setInert(node, inert) {
      if (!node) return;
      if ('inert' in node) {
        inert ? node.setAttribute('inert','') : node.removeAttribute('inert');
      } else {
        node.setAttribute('aria-hidden', inert ? 'true' : 'false');
      }
    }
    if (mobileMenu) { setInert(mobileMenu, true); }
    openBtn?.addEventListener('click', () => { mobileMenu?.classList.add('open'); setInert(mobileMenu,false); mobileMenu?.querySelector('a,button,input,textarea')?.focus(); });
    closeBtn?.addEventListener('click', () => { mobileMenu?.classList.remove('open'); setInert(mobileMenu,true); });

    // CART: always go to cart.html — do not force immediate auth redirect here
    const cartBtn = safeQuery(nav, '#navCart');
    cartBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const target = isSub ? './cart.html' : './html/cart.html';
      window.location.href = target;
    });

    // SEARCH quick handler
    const searchBtn = safeQuery(nav, '#navSearchBtn');
    searchBtn?.addEventListener('click', () => {
      const q = prompt('Search products:');
      if (q && q.trim()) {
        const url = isSub ? `./shop.html?q=${encodeURIComponent(q.trim())}` : `./html/shop.html?q=${encodeURIComponent(q.trim())}`;
        window.location.href = url;
      }
    });

    // USER area placeholders: update when session known
    // Expect markup in navbar.html like: <div id="navUser"></div>
  }

  function initFooter(container) {
    const footer = container.querySelector('footer') || container.firstElementChild;
    if (!footer) return;
    const yearNode = footer.querySelector('#year');
    if (yearNode) yearNode.textContent = new Date().getFullYear();
  }

  // Insert components
  await insertHtml('navbar', navPath, initNavbar);
  await insertHtml('footer', footerPath, initFooter);

  // Expose pdUI and helper methods
  window.pdUI = window.pdUI || {};

  // Show logged-in username in nav if possible
  window.pdUI.updateNavUser = async function () {
    const navContainer = document.getElementById('navbar');
    if (!navContainer) return;
    const userNode = navContainer.querySelector('#navUser');
    if (!userNode) return;

    // Wait for supabase readiness
    const { ready } = await waitForSupabase(2500);
    if (!ready) {
      // local fallback: check localStorage
      const local = localStorage.getItem('pd_user') || localStorage.getItem('pd_logged');
      if (local) {
        userNode.innerHTML = `<span class="nav-username">You</span> <button id="navLogout" class="nav-logout">Logout</button>`;
        navContainer.querySelector('#navLogout')?.addEventListener('click', () => {
          localStorage.removeItem('pd_logged'); localStorage.removeItem('pd_user'); location.reload();
        });
      }
      return;
    }

    try {
      const { data } = await window.supabase.auth.getSession();
      const session = data?.session ?? null;
      if (session?.user) {
        const email = session.user.email || 'User';
        userNode.innerHTML = `<span class="nav-username">${email}</span> <button id="navLogout" class="nav-logout">Logout</button>`;
        navContainer.querySelector('#navLogout')?.addEventListener('click', async () => {
          await window.supabase.auth.signOut();
          location.reload();
        });
      } else {
        // not logged in
        userNode.innerHTML = `<a href="${isSub ? './login.html' : './html/login.html'}" class="nav-login">Login</a>`;
      }
    } catch (e) {
      console.error('updateNavUser error', e);
    }
  };

  // requireAuthRedirect: wait for supabase initialization then redirect only if no session
  window.pdUI.requireAuthRedirect = async function (opts = { timeout: 5000 }) {
    try {
      // wait up to opts.timeout for supabase to be ready
      const { ready } = await waitForSupabase(opts.timeout || 5000);
      // if supabase is not ready we treat as local-mode and check localStorage
      if (!ready) {
        if (!localStorage.getItem('pd_logged')) {
          window.location.href = isSub ? './login.html' : './html/login.html';
        }
        return;
      }
      // supabase available: check session
      const { data } = await window.supabase.auth.getSession();
      if (!data?.session) {
        window.location.href = isSub ? './login.html' : './html/login.html';
      }
    } catch (e) {
      console.error('requireAuthRedirect error', e);
      // fallback: localStorage
      if (!localStorage.getItem('pd_logged')) {
        window.location.href = isSub ? './login.html' : './html/login.html';
      }
    }
  };

  // Run nav user update after insertion
  window.pdUI.updateNavUser().catch(() => {});
})();
