import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });
  const { pathname } = req.nextUrl;

  // Allow access to auth pages and API routes without authentication
  if (pathname.startsWith('/login') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  // Check if user is authenticated and active
  if (!token || !token.isActive) {
    // Redirect to login for protected routes
    const loginUrl = new URL('/login', req.url);
    // Only set callbackUrl for non-root paths to avoid encoding issues
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/login') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Role-based access control for specific routes
  const userRole = token.role as string;

  // Super admin routes
  if (pathname.startsWith('/admin') && userRole !== 'super_admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Department management routes
  if (pathname.startsWith('/departments') &&
      !['super_admin', 'department_admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // User management routes
  if (pathname.startsWith('/users') &&
      !['super_admin', 'department_admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Meeting coordination routes
  if (pathname.startsWith('/meetings') &&
      !['super_admin', 'department_admin', 'technical_meeting_coordinator'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Observer routes (read-only)
  if (userRole === 'observer') {
    // Observers can only view certain pages
    const allowedPatterns = [
      '/dashboard',
      '/cases',
      '/reports',
      '/profile'
    ];

    const isAllowed = allowedPatterns.some(pattern => pathname.startsWith(pattern)) ||
                     pathname === '/';

    if (!isAllowed && !pathname.startsWith('/api/auth')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};