import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return !!(
    url &&
    key &&
    !url.includes('sua-url-aqui') &&
    !key.includes('sua-anon-key')
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // Retorna cliente seguro com dummy URL durante pré-renderização/build
    return createBrowserClient<Database>(
      'https://dummy-mesaconnect.supabase.co',
      'dummy-anon-key'
    );
  }

  return createBrowserClient<Database>(url, key);
}
