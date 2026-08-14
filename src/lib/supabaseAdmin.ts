import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key — bypasses row level
// security entirely. Never import this from a "use client" component or
// expose SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix; it must only
// ever run inside Route Handlers / server code. See env.local.example.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

export const supabaseAdmin: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl as string, serviceRoleKey as string, {
      auth: { persistSession: false },
    })
  : null;
