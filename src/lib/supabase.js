import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: log if env vars are missing (visible in browser console)
if (typeof window !== 'undefined') {
  if (!SUPABASE_URL) console.error('❌ VITE_SUPABASE_URL is not set!');
  if (!SUPABASE_ANON_KEY) console.error('❌ VITE_SUPABASE_ANON_KEY is not set!');
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log('✅ Supabase configured:', SUPABASE_URL);
  }
}

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const isSupabaseConfigured = !!supabase;
