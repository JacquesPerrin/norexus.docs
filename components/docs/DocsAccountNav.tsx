import Link from 'next/link';
import { DocsSignInLink } from '@/components/docs/DocsSignInLink';
import { getCurrentDocsUser, getDocsUserLabel } from '@/lib/auth/session';
import {
  getAuthAppUrl,
  getFallbackReturnUrl,
  getPlatformAppUrl,
  getSignOutUrl,
  getStartedUrl,
} from '@/lib/auth/urls';

export async function DocsAccountNav() {
  const user = await getCurrentDocsUser();

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <DocsSignInLink
          authBaseUrl={getAuthAppUrl()}
          fallbackReturnUrl={await getFallbackReturnUrl()}
          className="rounded-md px-2.5 py-1.5 text-fd-muted-foreground transition-colors hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          Sign in
        </DocsSignInLink>
        <Link
          href={getStartedUrl()}
          className="rounded-md border border-fd-border bg-fd-primary px-2.5 py-1.5 font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-[min(48vw,24rem)] items-center gap-1.5 text-sm">
      <Link
        href={getPlatformAppUrl()}
        className="truncate rounded-md px-2.5 py-1.5 text-fd-muted-foreground transition-colors hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        {getDocsUserLabel(user)}
      </Link>
      <form action={getSignOutUrl()} method="post">
        <button
          type="submit"
          className="rounded-md border border-fd-border px-2.5 py-1.5 text-fd-muted-foreground transition-colors hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
