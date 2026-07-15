'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

type DocsSignInLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  authBaseUrl: string;
  fallbackReturnUrl: string;
};

export function DocsSignInLink({
  authBaseUrl,
  fallbackReturnUrl,
  onClick,
  ...props
}: DocsSignInLinkProps) {
  const fallbackHref = getAuthLoginUrl(authBaseUrl, fallbackReturnUrl);

  return (
    <Link
      {...props}
      href={fallbackHref}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const returnUrl = getClientReturnUrl(fallbackReturnUrl);
        window.location.assign(getAuthLoginUrl(authBaseUrl, returnUrl));
        event.preventDefault();
      }}
    />
  );
}

function getAuthLoginUrl(authBaseUrl: string, returnUrl: string) {
  const url = new URL('/login', authBaseUrl);
  url.searchParams.set('redirect', returnUrl);
  return url.toString();
}

function getClientReturnUrl(fallbackReturnUrl: string) {
  return sanitizeReturnUrl(window.location.href, fallbackReturnUrl);
}

function sanitizeReturnUrl(value: string, fallback: string) {
  if (value.length > 2048 || hasSuspiciousSignals(value)) return fallback;

  try {
    const url = new URL(value);
    if (url.origin !== window.location.origin && !isAllowedNorexusOrigin(url)) {
      return fallback;
    }

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

function isAllowedNorexusOrigin(url: URL) {
  return (
    url.protocol === 'https:' &&
    (url.hostname === 'norexus.app' || url.hostname.endsWith('.norexus.app'))
  );
}
