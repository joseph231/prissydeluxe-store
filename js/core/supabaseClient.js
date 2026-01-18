// /js/core/supabaseClient.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://knjojfphqdpbrqbfrspx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuam9qZnBocWRwYnJxYmZyc3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTkwNzIsImV4cCI6MjA4MDkzNTA3Mn0.LSPj_k_LedhbSbIAaPVrVgJsHiTtoFik-L60XWzwq1o";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
console.info("Supabase client initialized in core/supabaseClient.js");