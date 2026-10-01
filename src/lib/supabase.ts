import { createClient } from '@supabase/supabase-js';

// Get environment variables or fallback to localStorage / empty strings
const getSupabaseConfig = () => {
  // Check Vite env first
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Check localStorage if env vars are not present
  const storedUrl = localStorage.getItem('bubbleframe_supabase_url') || '';
  const storedAnonKey = localStorage.getItem('bubbleframe_supabase_anon_key') || '';

  const url = envUrl || storedUrl;
  const anonKey = envAnonKey || storedAnonKey;

  return { url, anonKey };
};

const { url, anonKey } = getSupabaseConfig();

// Create dummy client if credentials are missing so the app doesn't crash on startup
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url && 
    anonKey && 
    url !== 'https://placeholder.supabase.co' && 
    anonKey !== 'placeholder-key' &&
    url.startsWith('http')
  );
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('bubbleframe_supabase_url', url.trim());
  localStorage.setItem('bubbleframe_supabase_anon_key', anonKey.trim());
  // Force reload or re-initialize
  window.location.reload();
};
