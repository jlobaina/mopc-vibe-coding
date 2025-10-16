import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, LoginCredentials, AuthState } from '../types';
import { login as loginService, verifyToken, logout as logoutService } from '../services/auth';
import { storeAuthData, clearAuthData, isAuthenticated } from '../utils/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'VERIFY_START' }
  | { type: 'VERIFY_SUCCESS'; payload: User }
  | { type: 'VERIFY_FAILURE' };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'VERIFY_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'VERIFY_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'VERIFY_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token && isAuthenticated()) {
        dispatch({ type: 'VERIFY_START' });
        try {
          const user = await verifyToken();
          dispatch({ type: 'VERIFY_SUCCESS', payload: user });
        } catch (error) {
          dispatch({ type: 'VERIFY_FAILURE' });
          clearAuthData();
        }
      } else {
        dispatch({ type: 'VERIFY_FAILURE' });
        clearAuthData();
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await loginService(credentials);
      storeAuthData(response.user, response.token, response.refreshToken);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutService();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const register = async (userData: any): Promise<void> => {
    // Implement registration logic
    // For now, just login after registration
    await login({ email: userData.email, password: userData.password });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};