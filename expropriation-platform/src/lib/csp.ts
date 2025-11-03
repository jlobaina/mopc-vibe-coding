// Generate a secure nonce for CSP using Web Crypto API (compatible with Edge Runtime)
export function generateNonce(): string {
  // Generate 16 random bytes and encode as base64
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);

  // Convert to base64
  return btoa(String.fromCharCode(...randomValues));
}

// Generate CSP header with nonce
export function generateCSPHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

// Security headers configuration
export const SECURITY_HEADERS = {
  'Content-Security-Policy': '', // Will be set dynamically with nonce
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Only add HSTS in production
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};