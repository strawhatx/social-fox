import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',

  // Public assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  
  // Webhook endpoints (no auth required)
  '/api/lemonsqueezy/webhook',

  // Scheduler endpoints (authenticated via header secret)
  '/api/scheduler(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const isPublic = isPublicRoute(req);

  // Add X-Robots-Tag noindex for private app areas and auth pages
  const url = new URL(req.url);
  const path = url.pathname;
  const shouldNoIndex = (
    path.startsWith('/calendar') ||
    path.startsWith('/library') ||
    path.startsWith('/scheduler') ||
    path.startsWith('/auth') ||
    path.startsWith('/sign-in') ||
    path.startsWith('/sign-up')
  );

  let res: NextResponse | undefined;
  if (isPublic) {
    res = NextResponse.next();
  } else {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    res = NextResponse.next();
  }

  if (shouldNoIndex && res) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return res;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};


