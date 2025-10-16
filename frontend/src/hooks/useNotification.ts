import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return {
    showNotification: context.showNotification,
    hideNotification: context.hideNotification,
    notifications: context.notifications,
  };
};