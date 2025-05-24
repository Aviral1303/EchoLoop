'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks';
import { Notification } from '@/api/notifications';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();
  const [open, setOpen] = useState(false);

  // Format notification time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'email_summary':
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case 'action_item':
        return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
      case 'reminder':
        return <div className="h-2 w-2 rounded-full bg-purple-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  // Handle opening the dropdown - mark new notifications as read
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // When opening, wait a bit and then mark all as read
    if (newOpen && unreadCount > 0) {
      setTimeout(() => {
        markAllAsRead();
      }, 2000);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)] max-h-[320px]">
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent cursor-default">
                  <div className={`w-full p-3 ${!notification.isRead ? 'bg-muted/50' : ''}`}>
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                            {notification.title}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          {notification.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2 gap-2">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark as read
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 