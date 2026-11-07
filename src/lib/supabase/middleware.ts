import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isSupabaseConfigured, getSupabaseAnonOrPublishableKey } from './client';

export const PROTECTED_ROUTE_PREFIXES = ['/path', '/team', '/relations', '/onboarding'] as const;
export const AUTH_ROUTE_PREFIXES = ['/login', '/register'] as const;
export const DEMO_COOKIE_NAMES = ['tb_demo_mode', 'teenbond_demo'] as const;

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isDemoModeRequest(request: NextRequest): boolean {
  return DEMO_COOKIE_NAMES.some((cookieName) => {
    const val = request.cookies.get(cookieName)?.value;
    return val === 'true' || val === '1';
  });
}

export function sanitizeRedirectPath(
  nextPath: string | null | undefined,
  fallback = '/path'
): string {
  if (!nextPath || typeof nextPath !== 'string') {
    return fallback;
  }
  const trimmed = nextPath.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    /[\x00-\x1f\x7f\\]/.test(trimmed)
  ) {
    return fallback;
  }
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function copyResponseCookiesAndHeaders(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = source.headers.get(header);
    if (value) {
      target.headers.set(header, value);
    }
  }
  return target;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const isDemo = isDemoModeRequest(request);
  const pathname = request.nextUrl.pathname;

  // If in demo mode or if Supabase is unconfigured, bypass auth redirects for app routes
  if (isDemo || !isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = getSupabaseAnonOrPublishableKey() || 'placeholder-anon-key';

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: any }[],
        headers?: Record<string, string>
      ) {
        cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        }
      },
    },
  });

  // IMPORTANT: Always use getUser() (never getSession()) in server middleware to verify JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authRoute = isAuthRoute(pathname);
  const protectedRoute = isProtectedRoute(pathname);

  if (!user && protectedRoute && !isDemo) {
    const nextTarget = `${pathname}${request.nextUrl.search}`;
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', nextTarget);
    redirectUrl.searchParams.set('redirectTo', nextTarget);
    return copyResponseCookiesAndHeaders(supabaseResponse, NextResponse.redirect(redirectUrl));
  }

  if (user && authRoute) {
    const requestedNext =
      request.nextUrl.searchParams.get('next') || request.nextUrl.searchParams.get('redirectTo');
    const safeDestination = sanitizeRedirectPath(requestedNext, '/path');
    const parsedDestination = new URL(safeDestination, request.url);
    const redirectUrl = isAuthRoute(parsedDestination.pathname)
      ? new URL('/path', request.url)
      : parsedDestination;
    return copyResponseCookiesAndHeaders(supabaseResponse, NextResponse.redirect(redirectUrl));
  }

  return supabaseResponse;
}
