import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User, LoginCredentials } from '../types';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    user: context.user,
    token: context.token,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    error: context.error,
    login: context.login,
    logout: context.logout,
    register: context.register,
  };
};