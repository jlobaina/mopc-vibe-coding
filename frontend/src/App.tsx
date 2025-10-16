import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useQuery } from 'react-query';

import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpedientesPage from './pages/ExpedientesPage';
import ExpedienteDetailPage from './pages/ExpedienteDetailPage';
import DocumentsPage from './pages/DocumentsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import { verifyToken } from './services/auth';
import { User } from './types';

// App component that handles routing and authentication
const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading, login } = useAuth();

  // Verify token on app load
  const { isLoading: isVerifying } = useQuery(
    'verifyToken',
    verifyToken,
    {
      enabled: !!localStorage.getItem('token'),
      retry: false,
      onSuccess: (data: User) => {
        login(data, localStorage.getItem('token') || '');
      },
      onError: () => {
        localStorage.removeItem('token');
      }
    }
  );

  if (isLoading || isVerifying) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="expedientes" element={<ExpedientesPage />} />
        <Route path="expedientes/:id" element={<ExpedienteDetailPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <div className="app-container">
          <AppRoutes />
        </div>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;