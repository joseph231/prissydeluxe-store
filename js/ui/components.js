// /js/ui/components.js
// Inject navbar & footer, initialize UI behaviours, expose small helpers
// Designed to NEVER interfere with ES-module scripts like shop.js

(function () {
  'use strict';

  /* --------------------------------------------------
     PATH RESOLUTION (ROBUST FOR NETLIFY + LIVE SERVER)
  -------------------------------------------------- */

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const isHtmlDir = pathParts[0] === 'html';
  const ROOT = isHtmlDir ? '..' : '.';

  const navPath = `${ROOT}/components/navbar.html`;
  const footerPath = `${ROOT}/components/footer.html`;

  /* --------------------------------------------------
     SAFE FETCH
  -------------------------------------------------- */

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
      if (typeof initFn === 'function') initFn(el);
    } catch (err) {
      console.warn('components load error:', err);
      el.innerHTML =
        id === 'navbar'
          ? '<nav style="padding:16px;text-align:center">PRISSYDELUXE</nav>'
          : '<footer style="padding:16px;text-align:center">© PRISSYDELUXE</footer>';
    }
  }

  function safeQuery(container, selector) {
    try {
      return container.querySelector(selector);
    } catch {
      return null;
    }
  }

  /* --------------------------------------------------
     SUPABASE READINESS (NON-BLOCKING)
  -------------------------------------------------- */

  async function waitForSupabase(timeout = 3000) {
    const step = 120;
    const max = Math.ceil(timeout / step);

    for (let i = 0; i < max; i++) {
      if (window.supabase && window.supabase.auth) {
        return { ready: true };
      }
      if (window.SUPABASE_ENABLED === false) {
        return { ready: false };
      }
      await new Promise(r => setTimeout(r, step));
    }
    return { ready: false };
  }

  /* --------------------------------------------------
     NAVBAR INIT
  -------------------------------------------------- */

  function initNavbar(container) {
    const nav = container.querySelector('nav') || container.firstElementChild;
    if (!nav) return;

    /* Scroll visibility */
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.08) {
        nav.classList.add('nav-visible');
      } else {
        nav.classList.remove('nav-visible');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Mobile menu */
    const openBtn = safeQuery(nav, '#mobileMenuToggle');
    const closeBtn = safeQuery(nav, '#mobileMenuClose');
    const mobileMenu = safeQuery(nav, '#mobileMenu');

    function setInert(el, state) {
      if (!el) return;
      if ('inert' in el) {
        state ? el.setAttribute('inert', '') : el.removeAttribute('inert');
      } else {
        el.setAttribute('aria-hidden', state ? 'true' : 'false');
      }
    }

    if (mobileMenu) setInert(mobileMenu, true);

    openBtn?.addEventListener('click', () => {
      mobileMenu?.classList.add('open');
      setInert(mobileMenu, false);
      mobileMenu?.querySelector('a,button,input')?.focus();
    });

    closeBtn?.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      setInert(mobileMenu, true);
    });

    /* Cart */
    const cartBtn = safeQuery(nav, '#navCart');
    cartBtn?.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = isHtmlDir ? './cart.html' : './html/cart.html';
    });

    /* Search */
    const searchBtn = safeQuery(nav, '#navSearchBtn');
    searchBtn?.addEventListener('click', () => {
      const q = prompt('Search products:');
      if (q && q.trim()) {
        const dest = isHtmlDir
          ? `./shop.html?q=${encodeURIComponent(q.trim())}`
          : `./html/shop.html?q=${encodeURIComponent(q.trim())}`;
        window.location.href = dest;
      }
    });
  }

  /* --------------------------------------------------
     FOOTER INIT
  -------------------------------------------------- */

  function initFooter(container) {
    const footer = container.querySelector('footer') || container.firstElementChild;
    if (!footer) return;
    const year = footer.querySelector('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------
     PUBLIC API
  -------------------------------------------------- */

  window.pdUI = window.pdUI || {};

  window.pdUI.updateNavUser = async function () {
    const navContainer = document.getElementById('navbar');
    if (!navContainer) return;

    const userNode = navContainer.querySelector('#navUser');
    if (!userNode) return;

    const { ready } = await waitForSupabase(2500);

    if (!ready) {
      const local = localStorage.getItem('pd_logged');
      if (local) {
        userNode.innerHTML =
          `<span class="nav-username">You</span>
           <button id="navLogout" class="nav-logout">Logout</button>`;

        navContainer.querySelector('#navLogout')?.addEventListener('click', () => {
          localStorage.removeItem('pd_logged');
          location.reload();
        });
      }
      return;
    }

    try {
      const { data } = await window.supabase.auth.getSession();
      const session = data?.session;

      if (session?.user) {
        userNode.innerHTML =
          `<span class="nav-username">${session.user.email}</span>
           <button id="navLogout" class="nav-logout">Logout</button>`;

        navContainer.querySelector('#navLogout')?.addEventListener('click', async () => {
          await window.supabase.auth.signOut();
          location.reload();
        });
      } else {
        userNode.innerHTML =
          `<a href="${isHtmlDir ? './login.html' : './html/login.html'}" class="nav-login">Login</a>`;
      }
    } catch (err) {
      console.error('updateNavUser error:', err);
    }
  };

  window.pdUI.requireAuthRedirect = async function (opts = {}) {
    const timeout = opts.timeout || 5000;
    const { ready } = await waitForSupabase(timeout);

    if (!ready) {
      if (!localStorage.getItem('pd_logged')) {
        window.location.href = isHtmlDir ? './login.html' : './html/login.html';
      }
      return;
    }

    const { data } = await window.supabase.auth.getSession();
    if (!data?.session) {
      window.location.href = isHtmlDir ? './login.html' : './html/login.html';
    }
  };

  /* --------------------------------------------------
     INIT COMPONENTS (NON-BLOCKING)
  -------------------------------------------------- */

  Promise.resolve()
    .then(() => insertHtml('navbar', navPath, initNavbar))
    .then(() => insertHtml('footer', footerPath, initFooter))
    .then(() => window.pdUI.updateNavUser())
    .catch(() => { });

})();
