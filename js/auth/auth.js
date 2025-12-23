// /js/auth/auth.js
// Authentication helpers (Supabase-first, local fallback)

// Wait until Supabase is loaded
async function waitForSupabase() {
  let tries = 0;
  while (tries < 20) {
    if (window.supabase && window.supabase.auth) return true;
    await new Promise(r => setTimeout(r, 150));
    tries++;
  }
  return false;
}

export async function signInWithEmail(email, password) {

  // If Supabase is available → use it
  const ready = await waitForSupabase();
  if (ready) {
    const { data, error } = await window.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  // LOCAL MODE (fallback)
  if (!email || !password) throw new Error("Invalid credentials (local fallback)");

  const user = { email, id: "local-" + btoa(email).slice(0, 8) };
  localStorage.setItem("pd_logged", "1");
  localStorage.setItem("pd_user", JSON.stringify(user));
  return { user };
}

export async function signUpWithEmail(email, password, metadata = {}) {

  const ready = await waitForSupabase();
  if (ready) {
    const { data, error } = await window.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  }

  // LOCAL MODE fallback
  const user = { email, id: "local-" + btoa(email).slice(0, 8), metadata };
  localStorage.setItem("pd_logged", "1");
  localStorage.setItem("pd_user", JSON.stringify(user));
  return { user };
}

export async function signOut() {

  const ready = await waitForSupabase();
  if (ready) {
    await window.supabase.auth.signOut();
  }

  // local cleanup
  localStorage.removeItem("pd_logged");
  localStorage.removeItem("pd_user");

  // Send user back home
  const isSub = location.pathname.split("/").includes("html");
  window.location.href = isSub ? "../index.html" : "./index.html";
}
