import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Falling back to mock data mode. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
}

// Provide a dummy URL/key if missing to prevent createClient from throwing a fatal error and crashing the entire React app.
// apiService will catch the network failures and use mock data gracefully.
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co', 
  supabaseAnonKey || 'dummy_key'
);
