import { post, get } from './api';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await post<LoginResponse>('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await post<void>('/auth/logout');
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await post<{ token: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Verify current token
  verifyToken: async (): Promise<User> => {
    const response = await get<User>('/auth/verify');
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await post<void>('/auth/password-reset-request', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await post<void>('/auth/password-reset', {
      token,
      newPassword,
    });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await post<void>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await get<User>('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await post<User>('/auth/profile', userData);
    return response.data;
  },
};

// Export individual functions for convenience
export const login = authService.login;
export const register = authService.register;
export const logout = authService.logout;
export const refreshToken = authService.refreshToken;
export const verifyToken = authService.verifyToken;
export const requestPasswordReset = authService.requestPasswordReset;
export const resetPassword = authService.resetPassword;
export const changePassword = authService.changePassword;
export const getProfile = authService.getProfile;
export const updateProfile = authService.updateProfile;