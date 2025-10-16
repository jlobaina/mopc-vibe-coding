// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    PROFILE: '/auth/profile',
    PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
    PASSWORD_RESET: '/auth/password-reset',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  EXPEDIENTES: {
    BASE: '/expedientes',
    STATS: '/expedientes/stats',
    SEARCH: '/expedientes/search',
  },
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
    CATEGORIES: '/documents/categories',
    STATS: '/documents/stats',
    SEARCH: '/documents/search',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    ROLES: '/users/roles',
  },
  DEPARTMENTS: {
    BASE: '/departments',
  },
} as const;

// Status Constants
export const EXPEDIENTE_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  UNDER_REVIEW: 'under_review',
  WAITING_FOR_APPROVAL: 'waiting_for_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
  CRITICAL: 5,
} as const;

export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  CLERK: 'clerk',
  VIEWER: 'viewer',
} as const;

// Permissions
export const PERMISSIONS = {
  // Expediente permissions
  EXPEDIENTE_CREATE: 'expediente:create',
  EXPEDIENTE_READ: 'expediente:read',
  EXPEDIENTE_UPDATE: 'expediente:update',
  EXPEDIENTE_DELETE: 'expediente:delete',
  EXPEDIENTE_ASSIGN: 'expediente:assign',
  EXPEDIENTE_APPROVE: 'expediente:approve',

  // Document permissions
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_DOWNLOAD: 'document:download',
  DOCUMENT_UPLOAD: 'document:upload',

  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ASSIGN_ROLES: 'user:assign_roles',

  // Department permissions
  DEPARTMENT_CREATE: 'department:create',
  DEPARTMENT_READ: 'department:read',
  DEPARTMENT_UPDATE: 'department:update',
  DEPARTMENT_DELETE: 'department:delete',

  // System permissions
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_EXPORT: 'system:export',
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
} as const;

// Date and Time Constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  SHORT: 'MM/dd/yyyy',
  ISO: 'yyyy-MM-dd',
  DATABASE: 'yyyy-MM-dd HH:mm:ss',
} as const;

export const TIMEZONES = {
  DEFAULT: 'America/New_York',
  UTC: 'UTC',
} as const;

// UI Constants
export const UI = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 72,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  CONTAINER_MAX_WIDTH: 1200,
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920,
  },
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: {
    MAIN: '#1976d2',
    LIGHT: '#42a5f5',
    DARK: '#1565c0',
  },
  SECONDARY: {
    MAIN: '#dc004e',
    LIGHT: '#ff5983',
    DARK: '#9a0036',
  },
  SUCCESS: {
    MAIN: '#2e7d32',
    LIGHT: '#4caf50',
    DARK: '#1b5e20',
  },
  WARNING: {
    MAIN: '#ed6c02',
    LIGHT: '#ff9800',
    DARK: '#e65100',
  },
  ERROR: {
    MAIN: '#d32f2f',
    LIGHT: '#f44336',
    DARK: '#c62828',
  },
  INFO: {
    MAIN: '#0288d1',
    LIGHT: '#03a9f4',
    DARK: '#01579b',
  },
} as const;

// Status Colors
export const STATUS_COLORS = {
  EXPEDIENTE: {
    [EXPEDIENTE_STATUS.NEW]: THEME_COLORS.INFO.MAIN,
    [EXPEDIENTE_STATUS.IN_PROGRESS]: THEME_COLORS.PRIMARY.MAIN,
    [EXPEDIENTE_STATUS.UNDER_REVIEW]: THEME_COLORS.WARNING.MAIN,
    [EXPEDIENTE_STATUS.WAITING_FOR_APPROVAL]: THEME_COLORS.SECONDARY.MAIN,
    [EXPEDIENTE_STATUS.APPROVED]: THEME_COLORS.SUCCESS.MAIN,
    [EXPEDIENTE_STATUS.REJECTED]: THEME_COLORS.ERROR.MAIN,
    [EXPEDIENTE_STATUS.COMPLETED]: THEME_COLORS.SUCCESS.DARK,
    [EXPEDIENTE_STATUS.CANCELLED]: '#9e9e9e',
  },
  PRIORITY: {
    [PRIORITY_LEVELS.LOW]: THEME_COLORS.SUCCESS.MAIN,
    [PRIORITY_LEVELS.MEDIUM]: THEME_COLORS.WARNING.MAIN,
    [PRIORITY_LEVELS.HIGH]: THEME_COLORS.ERROR.MAIN,
    [PRIORITY_LEVELS.URGENT]: '#d32f2f',
    [PRIORITY_LEVELS.CRITICAL]: '#b71c1c',
  },
  DOCUMENT: {
    [DOCUMENT_STATUS.DRAFT]: '#9e9e9e',
    [DOCUMENT_STATUS.PENDING_REVIEW]: THEME_COLORS.WARNING.MAIN,
    [DOCUMENT_STATUS.APPROVED]: THEME_COLORS.SUCCESS.MAIN,
    [DOCUMENT_STATUS.REJECTED]: THEME_COLORS.ERROR.MAIN,
    [DOCUMENT_STATUS.ARCHIVED]: '#616161',
  },
} as const;

// Form Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  COMMENT_MAX_LENGTH: 1000,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS: 10,
} as const;

// Notification Constants
export const NOTIFICATIONS = {
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
  },
  AUTO_HIDE_DURATION: 5000,
  MAX_NOTIFICATIONS: 5,
} as const;

// Storage Constants
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarState',
  PREFERENCES: 'userPreferences',
  ACTIVITIES: 'userActivities',
} as const;

// Local Storage Limits
export const STORAGE_LIMITS = {
  MAX_ACTIVITIES: 100,
  MAX_NOTIFICATIONS: 50,
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT_ERROR: 'The request timed out. Please try again.',
  FILE_TOO_LARGE: `File size exceeds the maximum limit of ${FILE_UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  EXPEDIENTE_CREATED: 'Expediente created successfully.',
  EXPEDIENTE_UPDATED: 'Expediente updated successfully.',
  EXPEDIENTE_DELETED: 'Expediente deleted successfully.',
  DOCUMENT_UPLOADED: 'Document uploaded successfully.',
  DOCUMENT_UPDATED: 'Document updated successfully.',
  DOCUMENT_DELETED: 'Document deleted successfully.',
  USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const;