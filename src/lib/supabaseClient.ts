import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Reads from NEXT_PUBLIC_* env vars so this is safe to use from client
// components. See .env.local.example for what needs to be set, and PLAN.md
// (Task 6) for how to get these values from your Supabase project.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// `null` until real credentials are set in `.env.local` — callers must check
// `isSupabaseConfigured` (or handle a null client) rather than assuming this
// is always ready to use. This lets the rest of the app render fine before
// you've done the manual Supabase setup.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
