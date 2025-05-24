"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { createContext, useContext } from 'react'

// Create a NotificationContext
interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: () => {},
  markAllAsRead: () => {},
  removeNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

// Create a NotificationProvider
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock notification data
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        title: 'New Email Summary',
        content: 'Your weekly report has been summarized',
        createdAt: new Date().toISOString(),
        isRead: false,
        type: 'email_summary'
      },
      {
        id: '2',
        title: 'Action Required',
        content: 'Please respond to the meeting invitation',
        createdAt: new Date().toISOString(),
        isRead: true,
        type: 'action_item'
      }
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead, 
        removeNotification 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
