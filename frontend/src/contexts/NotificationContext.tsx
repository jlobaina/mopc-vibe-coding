import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AlertColor } from '@mui/material';
import { Notification } from '../types';

interface NotificationContextType {
  showNotification: (message: string, type?: AlertColor, duration?: number) => void;
  hideNotification: (id: string) => void;
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const notificationReducer = (
  state: Notification[],
  action: NotificationAction
): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, action.payload];
    case 'REMOVE_NOTIFICATION':
      return state.filter(notification => notification.id !== action.payload);
    default:
      return state;
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const showNotification = useCallback(
    (message: string, type: AlertColor = 'info', duration: number = 5000) => {
      const id = Date.now().toString();
      const notification: Notification = {
        id,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      // Auto-remove notification after duration
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, duration);
    },
    []
  );

  const hideNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const value: NotificationContextType = {
    showNotification,
    hideNotification,
    notifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};