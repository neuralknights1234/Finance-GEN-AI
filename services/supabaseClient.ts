import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string | undefined = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY: string | undefined = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_SUPABASE_URL is not set. Add it to .env.local');
}
if (!SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('VITE_SUPABASE_ANON_KEY is not set. Add it to .env.local');
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || ''
);


