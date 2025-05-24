import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmailSummary, NotificationMessage } from '../types';
import { connectWebSocket, disconnectWebSocket } from '../services/api';

interface NotificationContextType {
  unreadCount: number;
  notifications: EmailSummary[];
  addNotification: (notification: EmailSummary) => void;
  markNotificationSeen: (summaryId: number) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<EmailSummary[]>([]);

  // Handle WebSocket notifications
  useEffect(() => {
    const handleNotification = (message: NotificationMessage) => {
      if (message.type === 'new_summary') {
        addNotification(message.data);
      }
    };

    // Connect to WebSocket
    connectWebSocket(handleNotification);

    // Cleanup on unmount
    return () => {
      disconnectWebSocket(handleNotification);
    };
  }, []);

  const addNotification = (notification: EmailSummary) => {
    setNotifications((prev) => {
      // Check if notification already exists
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) {
        return prev;
      }
      return [notification, ...prev];
    });
  };

  const markNotificationSeen = (summaryId: number) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.summary_id === summaryId) {
          return { ...notification, seen: true };
        }
        return notification;
      })
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.seen).length;

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        addNotification,
        markNotificationSeen,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 