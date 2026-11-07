import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function isValidSupabaseKey(key: string | undefined): key is string {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return Boolean(
    trimmed.length > 0 &&
      !trimmed.includes('your-publishable-key') &&
      !trimmed.includes('your-anon-key') &&
      !trimmed.includes('placeholder')
  );
}

export function getSupabaseAnonOrPublishableKey(): string | undefined {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (isValidSupabaseKey(publishableKey)) {
    return publishableKey;
  }
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (isValidSupabaseKey(anonKey)) {
    return anonKey;
  }
  return undefined;
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
      isValidSupabaseKey(key)
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = getSupabaseAnonOrPublishableKey() || 'placeholder-anon-key';

  return createBrowserClient<Database>(url, anonKey);
}
