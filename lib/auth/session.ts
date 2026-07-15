import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

const AUTH_LOOKUP_TIMEOUT_MS = 1500;

export type DocsUser = Pick<User, 'email' | 'user_metadata'>;

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { supabaseUrl, supabaseAnonKey };
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: isProduction,
    domain: isProduction ? '.norexus.app' : undefined,
  };
}

function withTimeout<T>(label: string, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = windowlessTimeout(() => {
      reject(new Error(`${label}_timeout`));
    }, AUTH_LOOKUP_TIMEOUT_MS);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function windowlessTimeout(callback: () => void, ms: number) {
  return setTimeout(callback, ms);
}

export async function getCurrentDocsUser(): Promise<DocsUser | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  const hasSupabaseCookie = cookieStore
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'));

  if (!hasSupabaseCookie) return null;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: getCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Docs are public and do not own session refresh writes.
      },
    },
  });

  try {
    const {
      data: { user },
      error,
    } = await withTimeout('docs_user_lookup', supabase.auth.getUser());

    if (error || !user) return null;
    return { email: user.email, user_metadata: user.user_metadata };
  } catch (error) {
    console.warn('[docs-account-nav] optional session lookup failed', {
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return null;
  }
}

export function getDocsUserLabel(user: DocsUser): string {
  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : '';
  const displayName =
    typeof metadata.name === 'string'
      ? metadata.name.trim()
      : typeof metadata.display_name === 'string'
        ? metadata.display_name.trim()
        : '';

  return fullName || displayName || user.email || 'Account';
}
