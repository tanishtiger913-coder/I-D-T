import { createClient } from '@supabase/supabase-js';

// Safely access environment variables whether in Vite, CRA, or other environments
const getEnv = (key: string) => {
  try {
    // Check import.meta.env (Vite standard)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || '';
    }
  } catch (e) {
    // Ignore errors in environments where import.meta is not supported
  }
  
  try {
    // Check process.env (Node/CRA/Webpack)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env[key] || '';
    }
  } catch (e) {
    // Ignore reference errors
  }
  
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Log warning if keys are missing (but don't crash)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Key is missing. The app will not function correctly until you set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or environment.");
}

// Fallback to avoid immediate crash on initialization.
// API calls will fail gracefully with network errors instead of the app crashing on load.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);