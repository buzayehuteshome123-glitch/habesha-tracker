import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key').trim();

// Sanitize URL to prevent common copy-paste errors (like adding /rest/v1 or trailing slashes)
const supabaseUrl = rawSupabaseUrl
  .trim()
  .replace(/\/rest\/v1\/?$/, '') // Remove trailing /rest/v1 or /rest/v1/
  .replace(/\/$/, ''); // Remove trailing slash

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

