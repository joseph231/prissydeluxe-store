// /js/auth/session.js
// Session helpers with Supabase-first logic + safe local fallback

// Ensures Supabase client is ready before checking session
async function waitForSupabase() {
  let tries = 0;
  while (tries < 25) {   // ~3.5 seconds max wait
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

  // Local fallback (LOCAL MODE)
  const userData = localStorage.getItem("pd_user");
  return userData ? JSON.parse(userData) : null;
}

// Redirects if not authenticated
export async function requireAuthOrRedirect() {
  const user = await getSessionUser();

  if (!user) {
    const isSub = location.pathname.split("/").includes("html");
    const target = isSub ? "./login.html" : "./html/login.html";
    window.location.href = target;
    return false;
  }

  return true;
}
