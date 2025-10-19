import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Security constants
export const SECURITY_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  SALT_ROUNDS: 12,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  CSRF_TOKEN_LENGTH: 32,
  API_KEY_LENGTH: 64,
} as const;

// Password validation schema
export const passwordSchema = z.object({
  password: z
    .string()
    .min(SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH, 'La contraseña debe tener al menos 8 caracteres')
    .max(SECURITY_CONSTANTS.PASSWORD_MAX_LENGTH, 'La contraseña no puede exceder los 128 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/\d/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe contener al menos un carácter especial'),
});

// Email validation schema
export const emailSchema = z.object({
  email: z
    .string()
    .email('El formato del correo electrónico no es válido')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El formato del correo electrónico no es válido'),
});

// Phone validation schema (Dominican Republic)
export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^(?:\+1|1)? ?(?:809|829|849) ?[0-9]{3} ?[0-9]{4}$/, 'El formato del teléfono no es válido para República Dominicana'),
});

// ID validation schema (Cédula Dominicana)
export const idSchema = z.object({
  id: z
    .string()
    .regex(/^\d{3}[- ]?\d{7}[- ]?\d{1}$/, 'El formato de la cédula no es válido')
    .refine((val) => {
      // Remove dashes and spaces for validation
      const cleanId = val.replace(/[- ]/g, '');
      if (cleanId.length !== 11) return false;

      // Check if all characters are digits
      if (!/^\d+$/.test(cleanId)) return false;

      // Calculate check digit
      const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
      const digits = cleanId.split('').map(Number);
      const checkDigit = digits[10];

      let sum = 0;
      for (let i = 0; i < 10; i++) {
        let product = digits[i] * weights[i];
        if (product > 9) product = product - 9;
        sum += product;
      }

      const calculatedCheckDigit = (10 - (sum % 10)) % 10;
      return checkDigit === calculatedCheckDigit;
    }, 'La cédula no es válida'),
});

// Password utilities
export const passwordUtils = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SECURITY_CONSTANTS.SALT_ROUNDS);
  },

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateSecurePassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';

    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 26)];

    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },

  checkStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('La contraseña debe tener al menos 8 caracteres');

    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Debe contener mayúsculas');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Debe contener minúsculas');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Debe contener números');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Debe contener caracteres especiales');

    // Common patterns penalty
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Evita caracteres repetidos');
    }

    if (/(012|123|234|345|456|567|678|789|890|qwe|wer|ert|rty|tyu|yui|uio|asd|sdf|dfg|fgh|jkl|zxc|xcv|cvb|vbn)/i.test(password)) {
      score -= 1;
      feedback.push('Evita secuencias comunes');
    }

    const isStrong = score >= 5;
    return { score, feedback, isStrong };
  },
};

// Token utilities
export const tokenUtils = {
  generateSecureToken(length: number = SECURITY_CONSTANTS.CSRF_TOKEN_LENGTH): string {
    return crypto.randomBytes(length).toString('hex');
  },

  generateApiKey(): string {
    return crypto.randomBytes(SECURITY_CONSTANTS.API_KEY_LENGTH).toString('hex');
  },

  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  verifyToken(token: string, maxAge: number): boolean {
    try {
      // This would verify JWT tokens or similar
      // For now, return true if token exists
      return !!token;
    } catch {
      return false;
    }
  },
};

// Input sanitization
export const sanitizeInput = {
  email: (email: string): string => {
    return email.toLowerCase().trim();
  },

  phone: (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  },

  id: (id: string): string => {
    return id.replace(/[^\d]/g, '');
  },

  string: (str: string, maxLength: number = 1000): string => {
    return str.trim().slice(0, maxLength);
  },

  html: (html: string): string => {
    // Basic HTML sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },
};

// Rate limiting utilities
export const rateLimiting = {
  generateKey(identifier: string, action: string): string {
    return `rate_limit:${identifier}:${action}`;
  },

  shouldBlock(key: string, requests: number, window: number): boolean {
    // This would typically use Redis or similar for distributed rate limiting
    // For now, return false (no blocking)
    return false;
  },
};

// Security headers
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Audit logging
export const auditLogger = {
  log: async (
    userId: string,
    action: string,
    resource: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> => {
    const auditEntry = {
      id: crypto.randomUUID(),
      userId,
      action,
      resource,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    // In a real implementation, this would be stored in a secure audit log
    console.log('AUDIT:', auditEntry);
  },

  logSecurityEvent: async (
    event: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCKED',
    userId?: string,
    details?: any
  ): Promise<void> => {
    const securityEvent = {
      id: crypto.randomUUID(),
      type: event,
      userId,
      details,
      timestamp: new Date().toISOString(),
      severity: event === 'ACCOUNT_LOCKED' ? 'HIGH' : 'MEDIUM',
    };

    console.log('SECURITY:', securityEvent);
  },
};

// Data encryption utilities
export const encryption = {
  encrypt: (text: string, key: string): string => {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  },

  decrypt: (encryptedText: string, key: string): string => {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },
};

// Validation helpers
export const validation = {
  isValidEmail: (email: string): boolean => {
    try {
      emailSchema.parse({ email });
      return true;
    } catch {
      return false;
    }
  },

  isValidPassword: (password: string): boolean => {
    try {
      passwordSchema.parse({ password });
      return true;
    } catch {
      return false;
    }
  },

  isValidPhone: (phone: string): boolean => {
    try {
      phoneSchema.parse({ phone });
      return true;
    } catch {
      return false;
    }
  },

  isValidId: (id: string): boolean => {
    try {
      idSchema.parse({ id });
      return true;
    } catch {
      return false;
    }
  },
};

// Secure random utilities
export const secureRandom = {
  uuid: (): string => {
    return crypto.randomUUID();
  },

  number: (min: number, max: number): number => {
    const range = max - min + 1;
    const bytes = crypto.randomBytes(4);
    const randomInt = bytes.readUInt32BE(0);
    return min + (randomInt % range);
  },

  string: (length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
    return result;
  },
};

// Security middleware helpers
export const middleware = {
  async rateLimit(req: Request, limit: number = 100, window: number = 15 * 60 * 1000) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const key = rateLimiting.generateKey(ip, 'api');

    if (rateLimiting.shouldBlock(key, limit, window)) {
      throw new Error('Rate limit exceeded');
    }

    return true;
  },

  async validateCSRF(req: Request) {
    const token = req.headers.get('x-csrf-token');
    if (!token) {
      throw new Error('CSRF token missing');
    }

    // Validate token against session
    return true;
  },

  async checkPermissions(userId: string, resource: string, action: string): Promise<boolean> {
    // This would check user permissions against resource
    // For now, return true
    return true;
  },
};

// Export all security utilities
export const security = {
  constants: SECURITY_CONSTANTS,
  password: passwordUtils,
  token: tokenUtils,
  sanitize: sanitizeInput,
  rateLimit: rateLimiting,
  headers: securityHeaders,
  audit: auditLogger,
  encrypt: encryption,
  validate: validation,
  random: secureRandom,
  middleware,
};