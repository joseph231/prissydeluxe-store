// /supabase.js
// Pure ES-module Supabase client (NO globals, NO side effects)

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ---------- CONFIG ----------
export const SUPABASE_URL = "https://knjojfphqdpbrqbfrspx.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuam9qZnBocWRwYnJxYmZyc3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTkwNzIsImV4cCI6MjA4MDkzNTA3Mn0.LSPj_k_LedhbSbIAaPVrVgJsHiTtoFik-L60XWzwq1o";

// ---------- CLIENT ----------
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ---------- AUTH HELPERS ----------
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("getSession error:", error);
    return null;
  }
  return data.session;
};

console.info("Supabase client initialized (ES module).");
