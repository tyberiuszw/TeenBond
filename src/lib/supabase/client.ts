import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function getSupabaseAnonOrPublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseAnonOrPublishableKey();
  return Boolean(
    url &&
      key &&
      url.startsWith('http') &&
      !url.includes('your-project') &&
      !url.includes('placeholder') &&
      !key.includes('your-anon-key') &&
      !key.includes('placeholder')
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = getSupabaseAnonOrPublishableKey() || 'placeholder-anon-key';

  return createBrowserClient<Database>(url, anonKey);
}
