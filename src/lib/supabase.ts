import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://dummy.supabase.co' &&
  supabaseAnonKey !== 'dummy_key'
);

if (!isSupabaseConfigured) {
  console.info("Uzhavan Connect: Running in secure local credential vault mode (Supabase environment variables not configured).");
}

// Provide a dummy URL/key if missing to prevent createClient from throwing a fatal error and crashing the entire React app.
// apiService will catch the network failures and use mock data gracefully.
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co', 
  supabaseAnonKey || 'dummy_key'
);
