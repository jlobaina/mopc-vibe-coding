import { User, AuthState } from '../types';

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (refreshToken: string): void => {
  localStorage.setItem('refreshToken', refreshToken);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem('refreshToken');
};

// User data management
export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem('user');
};

// Authentication state helpers
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user || !user.role) return false;
  return user.role.permissions.some(p => p.name === permission);
};

export const hasRole = (user: User | null, roleName: string): boolean => {
  if (!user || !user.role) return false;
  return user.role.name === roleName;
};

export const canAccessResource = (
  user: User | null,
  resource: string,
  action: string
): boolean => {
  if (!user || !user.role) return false;
  return user.role.permissions.some(
    p => p.resource === resource && p.action === action
  );
};

// Password validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Session management
export const clearAuthData = (): void => {
  removeToken();
  removeRefreshToken();
  removeUser();
};

export const storeAuthData = (user: User, token: string, refreshToken?: string): void => {
  setUser(user);
  setToken(token);
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
};

// Token refresh logic
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};

export const shouldRefreshToken = (token: string): boolean => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return true;

  const currentTime = Date.now();
  const timeUntilExpiration = expirationTime - currentTime;

  // Refresh if token expires within 5 minutes
  return timeUntilExpiration < 5 * 60 * 1000;
};

// Authentication guards
export const createAuthGuard = (requiredPermissions?: string[]) => {
  return (user: User | null): boolean => {
    if (!user || !isAuthenticated()) {
      return false;
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.every(permission => hasPermission(user, permission));
  };
};

export const createRoleGuard = (requiredRoles: string[]) => {
  return (user: User | null): boolean => {
    if (!user || !isAuthenticated()) {
      return false;
    }

    return requiredRoles.includes(user.role.name);
  };
};

// User display helpers
export const getUserDisplayName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
};

export const getUserInitials = (user: User): string => {
  const names = (user.firstName + ' ' + user.lastName).trim().split(' ');
  return names
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Activity tracking
export const trackUserActivity = (action: string, metadata?: Record<string, any>): void => {
  const activity = {
    action,
    timestamp: new Date().toISOString(),
    metadata,
    userId: getUser()?.id,
  };

  // Store in localStorage for now - in production, send to analytics service
  const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
  activities.push(activity);

  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.shift();
  }

  localStorage.setItem('userActivities', JSON.stringify(activities));
};

export const getUserActivities = (): Array<{
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
  userId?: string;
}> => {
  return JSON.parse(localStorage.getItem('userActivities') || '[]');
};