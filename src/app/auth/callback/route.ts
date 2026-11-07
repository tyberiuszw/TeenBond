import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isAuthRoute, sanitizeRedirectPath } from '@/lib/supabase/middleware';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') || searchParams.get('redirectTo');
  const sanitizedNext = sanitizeRedirectPath(rawNext, '/path');
  const parsedNext = new URL(sanitizedNext, origin);
  const next = isAuthRoute(parsedNext.pathname)
    ? '/path'
    : `${parsedNext.pathname}${parsedNext.search}${parsedNext.hash}`;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const rawForwardedHost = request.headers.get('x-forwarded-host');
        const forwardedHost = rawForwardedHost?.split(',')[0]?.trim();
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
