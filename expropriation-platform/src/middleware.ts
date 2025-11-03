import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { edgeLogger } from '@/lib/edge-logger';

// Helper function to get client IP
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  if (real) {
    return real.trim() || 'unknown';
  }
  return 'unknown';
}

// Helper function to add security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export default async function middleware(req: NextRequest) {
  // Validate that NEXTAUTH_SECRET is set in production
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
    edgeLogger.security.configurationIssue('NEXTAUTH_SECRET not set in production', {
      environment: process.env.NODE_ENV,
      url: req.url,
      ip: getClientIP(req),
    });
    return new Response('Server configuration error', { status: 500 });
  }

  if (!process.env.NEXTAUTH_SECRET) {
    edgeLogger.security.configurationIssue('NEXTAUTH_SECRET not configured', {
      environment: process.env.NODE_ENV,
      url: req.url,
      ip: getClientIP(req),
    });
    return new Response('Server configuration error', { status: 500 });
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });
  const { pathname } = req.nextUrl;

  // Allow access to home page, auth pages and API routes without authentication
  if (pathname === '/' ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/public')) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Check if user is authenticated and active
  if (!token || !token.isActive) {
    // Redirect to login for protected routes
    const loginUrl = new URL('/login', req.url);
    // Only set callbackUrl for non-root paths and validate it's safe
    if (pathname !== '/') {
      // Validate that callbackUrl is a relative path to prevent open redirects
      const safeCallbackUrl = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/';
      loginUrl.searchParams.set('callbackUrl', safeCallbackUrl);
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

  // Validate user role to prevent privilege escalation
  const validRoles = ['super_admin', 'department_admin', 'analyst', 'supervisor', 'observer', 'technical_meeting_coordinator'];
  if (!validRoles.includes(userRole)) {
    const ip = getClientIP(req);
    edgeLogger.security.suspiciousActivity('invalid_role_detected', {
      detectedRole: userRole,
      userEmail: token.email || 'unknown',
      userId: token.sub || 'unknown',
      ip,
      userAgent: req.headers.get('user-agent') || 'unknown',
      attemptedPath: pathname,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Super admin routes
  if (pathname.startsWith('/admin') && userRole !== 'super_admin') {
    edgeLogger.security.suspiciousActivity('unauthorized_admin_access', {
      userId: token.sub || 'unknown',
      userEmail: token.email || 'unknown',
      userRole,
      attemptedPath: pathname,
      ip: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    });
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Department management routes
  if (pathname.startsWith('/departments') &&
      !['super_admin', 'department_admin'].includes(userRole)) {
    edgeLogger.security.suspiciousActivity('unauthorized_department_access', {
      userId: token.sub || 'unknown',
      userEmail: token.email || 'unknown',
      userRole,
      attemptedPath: pathname,
      ip: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    });
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // User management routes
  if (pathname.startsWith('/users') &&
      !['super_admin', 'department_admin'].includes(userRole)) {
    edgeLogger.security.suspiciousActivity('unauthorized_user_management_access', {
      userId: token.sub || 'unknown',
      userEmail: token.email || 'unknown',
      userRole,
      attemptedPath: pathname,
      ip: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    });
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Meeting coordination routes
  if (pathname.startsWith('/meetings') &&
      !['super_admin', 'department_admin', 'technical_meeting_coordinator'].includes(userRole)) {
    edgeLogger.security.suspiciousActivity('unauthorized_meeting_access', {
      userId: token.sub || 'unknown',
      userEmail: token.email || 'unknown',
      userRole,
      attemptedPath: pathname,
      ip: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    });
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

  return addSecurityHeaders(NextResponse.next());
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