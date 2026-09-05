// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  JUDGE: 'JUDGE',
  USER: 'USER',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.JUDGE]: 'Judge',
  [ROLES.USER]: 'User',
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-red-100 text-red-800',
  [ROLES.JUDGE]: 'bg-yellow-100 text-yellow-800',
  [ROLES.USER]: 'bg-blue-100 text-blue-800',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
  [USER_STATUS.SUSPENDED]: 'Suspended',
};

export const USER_STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [USER_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800',
  [USER_STATUS.SUSPENDED]: 'bg-red-100 text-red-800',
};

// Draw Status
export const DRAW_STATUS = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const DRAW_STATUS_LABELS = {
  [DRAW_STATUS.DRAFT]: 'Draft',
  [DRAW_STATUS.READY]: 'Ready',
  [DRAW_STATUS.IN_PROGRESS]: 'In Progress',
  [DRAW_STATUS.COMPLETED]: 'Completed',
  [DRAW_STATUS.CANCELLED]: 'Cancelled',
};

export const DRAW_STATUS_COLORS = {
  [DRAW_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [DRAW_STATUS.READY]: 'bg-blue-100 text-blue-800',
  [DRAW_STATUS.IN_PROGRESS]: 'bg-green-100 text-green-800',
  [DRAW_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [DRAW_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
};

export const DRAW_STATUS_ICONS = {
  [DRAW_STATUS.DRAFT]: '📝',
  [DRAW_STATUS.READY]: '✅',
  [DRAW_STATUS.IN_PROGRESS]: '🔄',
  [DRAW_STATUS.COMPLETED]: '🎉',
  [DRAW_STATUS.CANCELLED]: '❌',
};

// Number Status
export const NUMBER_STATUS = {
  ELIGIBLE: 'ELIGIBLE',
  LUCKY: 'LUCKY',
  WON: 'WON',
  EXCLUDED: 'EXCLUDED',
};

export const SELECTION_TYPE = {
  LUCKY: 'LUCKY',
  RANDOM: 'RANDOM',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    STATUS: '/users/:id/status',
    EKUB_MEMBERS: '/users/ekub/:ekubId/members',
    STATS: '/users/:id/stats',
  },
  DRAWS: {
    BASE: '/draws',
    STATUS: '/draws/:drawId/status',
    LUCKY_NUMBERS: '/draws/:drawId/lucky-numbers',
    START: '/draws/:drawId/start',
    SPIN: '/draws/:drawId/spin',
    CANCEL: '/draws/:drawId/cancel',
    RESET: '/draws/:drawId/reset',
    RESULTS: '/draws/:drawId/results',
    AVAILABLE_USERS: '/draws/:drawId/available-users',
    STATS: '/draws/stats',
    EKUB: '/draws/ekub/:ekubId',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  LOGOUT: 'Logged out successfully.',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATE: 'Profile updated successfully.',
  PASSWORD_CHANGE: 'Password changed successfully.',
  DRAW_CREATED: 'Draw created successfully.',
  DRAW_STARTED: 'Draw started! Good luck!',
  DRAW_COMPLETED: 'Draw completed! 🎉',
  LUCKY_NUMBERS_SET: 'Lucky numbers set successfully.',
  USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
  USER_DELETED: 'User deleted successfully.',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 150,
  EMAIL_MAX_LENGTH: 150,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 30,
  MAX_LUCKY_NUMBERS: 7,
  MIN_NUMBER: 1,
  MAX_NUMBER: 80,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME: 'HH:mm',
  SHORT: 'MM/DD/YYYY',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Language
export const LANGUAGES = {
  EN: 'en',
  AM: 'am',
};

// App Config
export const APP_CONFIG = {
  APP_NAME: 'Digital Ekub',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'Digital Ekub Inc.',
  COMPANY_EMAIL: 'support@digitalekub.com',
  SUPPORT_PHONE: '+251-900-000-000',
};