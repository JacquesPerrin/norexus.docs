import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsRoute } from '@/lib/shared';

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

export default function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const currentUrl =
    forwardedHost != null
      ? `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}${request.nextUrl.search}`
      : request.nextUrl.toString();

  requestHeaders.set('x-norexus-current-url', currentUrl);

  const result = rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl), {
      request: { headers: requestHeaders },
    });
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        request: { headers: requestHeaders },
      });
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
