// /js/auth/session.js
// Session helpers with Supabase-first logic + safe local fallback

async function waitForSupabase() {
  let tries = 0;
  while (tries < 25) {
    if (window.supabase && window.supabase.auth) return true;
    await new Promise(r => setTimeout(r, 150));
    tries++;
  }
  return false;
}

// Returns current user (Supabase or fallback)
export async function getSessionUser() {
  const supaReady = await waitForSupabase();

  if (supaReady) {
    try {
      const { data } = await window.supabase.auth.getSession();
      const user = data?.session?.user || null;
      if (user) return user;
    } catch (e) {
      console.warn("Supabase session error", e);
    }
  }

  const userData = localStorage.getItem("pd_user");
  return userData ? JSON.parse(userData) : null;
}

/**
 * Auth guard — ONLY redirects on protected pages
 */
export async function requireAuthOrRedirect() {
  const protectedPages = [
    "cart.html",
    "checkout.html",
    "orders.html",
    "profile.html",
    "dashboard.html",
    "shop.html"
  ];

  const currentPage = location.pathname.split("/").pop();

  // 🚨 EXIT IMMEDIATELY if page is public
  if (!protectedPages.includes(currentPage)) {
    return true;
  }

  const user = await getSessionUser();

  if (!user) {
    const isSub = location.pathname.split("/").includes("html");
    const target = isSub ? "./login.html" : "./html/login.html";
    window.location.href = target;
    return false;
  }

  return true;
}
