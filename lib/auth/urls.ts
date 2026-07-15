import { headers } from 'next/headers';

const DEFAULT_AUTH_URL = 'https://auth.norexus.app';
const DEFAULT_DOCS_URL = 'https://docs.norexus.app';
const DEFAULT_PLATFORM_URL = 'https://platform.norexus.app';

const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3003',
  'http://localhost:3009',
  'http://localhost:4177',
  'http://localhost:4178',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3009',
  'http://127.0.0.1:4177',
  'http://127.0.0.1:4178',
]);

export function getAuthAppUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_AUTH_APP_URL, DEFAULT_AUTH_URL);
}

export function getDocsAppUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_DOCS_APP_URL, DEFAULT_DOCS_URL);
}

export function getPlatformAppUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_PLATFORM_APP_URL, DEFAULT_PLATFORM_URL);
}

export function getStartedUrl() {
  return `${getAuthAppUrl()}/onboarding`;
}

export function getSignOutUrl() {
  return `${getAuthAppUrl()}/api/auth/signout`;
}

export async function getFallbackReturnUrl() {
  const headerStore = await headers();
  const headerUrl = headerStore.get('x-norexus-current-url');
  const fallback = `${getDocsAppUrl()}/docs`;

  if (!headerUrl) return fallback;

  return sanitizeReturnUrl(headerUrl, fallback);
}

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  try {
    const url = new URL(value?.trim() || fallback);
    url.pathname = url.pathname.replace(/\/+$/, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

function sanitizeReturnUrl(value: string, fallback: string) {
  if (value.length > 2048 || hasSuspiciousSignals(value)) return fallback;

  if (value.startsWith('/') && !value.startsWith('//')) {
    return new URL(value, getDocsAppUrl()).toString();
  }

  try {
    const url = new URL(value);
    if (!isAllowedReturnOrigin(url)) return fallback;
    url.hash = '';
    return url.toString();
  } catch {
    return fallback;
  }
}

function hasSuspiciousSignals(value: string) {
  const lower = value.toLowerCase();

  return (
    value.startsWith('//') ||
    lower.includes('%0d') ||
    lower.includes('%0a') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('data:')
  );
}

function isAllowedReturnOrigin(url: URL) {
  if (url.protocol !== 'https:' && !isLocalDevOrigin(url)) return false;
  if (url.hostname === 'norexus.app' || url.hostname.endsWith('.norexus.app')) return true;
  return isLocalDevOrigin(url);
}

function isLocalDevOrigin(url: URL) {
  return process.env.NODE_ENV !== 'production' && LOCAL_ORIGINS.has(url.origin);
}
