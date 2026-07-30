import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.error(
    "Supabase isn't configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY at build time) — the Idea Bed and its editor will be unavailable."
  );
}

// Falls back to a placeholder so client construction never throws and takes
// down every route — callers should check supabaseConfigured before relying
// on real data.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
