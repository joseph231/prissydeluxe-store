// /supabase.js
// Universal Supabase client: will attach `supabase` to window when ready.
// If you use local/demo mode, set SUPABASE_ENABLED = false manually or
// leave the placeholder keys — the file will fall back to local mode.

let supabase = null;
let SUPABASE_ENABLED = true;

// ---------- EDIT THESE (your project) ----------
const SUPABASE_URL = "https://knjojfphqdpbrqbfrspx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuam9qZnBocWRwYnJxYmZyc3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTkwNzIsImV4cCI6MjA4MDkzNTA3Mn0.LSPj_k_LedhbSbIAaPVrVgJsHiTtoFik-L60XWzwq1o";
// ----------------------------------------------

if (!SUPABASE_URL || SUPABASE_URL.includes("your-project-id") ||
    !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("your-anon-public-key")) {
  console.warn("Supabase disabled — using LOCAL MODE.");
  SUPABASE_ENABLED = false;
}

async function initSupabase() {
  if (!SUPABASE_ENABLED) return null;
  try {
    const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
    supabase = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // attach globally for other scripts (this is the line you approved)
    window.supabase = supabase;
    window.SUPABASE_ENABLED = true;
    console.info("Supabase client initialized.");
    return supabase;
  } catch (e) {
    console.error("Supabase failed to load — falling back to LOCAL MODE", e);
    SUPABASE_ENABLED = false;
    window.SUPABASE_ENABLED = false;
    window.supabase = null;
    return null;
  }
}

// Immediately start init (non-blocking)
initSupabase();

// ---------- Export helpers (ES module friendly) ----------
export { supabase, initSupabase, SUPABASE_ENABLED };

// Convenience wrappers for auth/session (useful for components & pages)
export async function getSession() {
  if (!SUPABASE_ENABLED || !window.supabase) {
    // local fallback: return a pseudo-session if localStorage pd_logged exist
    return localStorage.getItem("pd_logged") ? { user: { email: "local-user@demo" } } : null;
  }
  try {
    const { data } = await window.supabase.auth.getSession();
    return data?.session ?? null;
  } catch (e) {
    console.warn("getSession error", e);
    return null;
  }
}
