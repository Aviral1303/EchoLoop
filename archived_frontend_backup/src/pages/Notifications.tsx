import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import EmailSummaryCard from '../components/EmailSummaryCard';
import { EnvelopeOpenIcon as MailOpenIcon } from '@heroicons/react/24/outline';

const Notifications: React.FC = () => {
  const { notifications, clearNotifications } = useNotifications();
  
  // Sort notifications: unread first, then by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First sort by read/unread status
    if (a.seen !== b.seen) {
      return a.seen ? 1 : -1;
    }
    
    // Then sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.length > 0 && (
          <button
            className="btn-secondary flex items-center space-x-2"
            onClick={clearNotifications}
          >
            <MailOpenIcon className="h-5 w-5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-medium text-gray-700">No notifications</h2>
          <p className="text-gray-500 mt-2">
            Notifications will appear here when new email summaries are available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedNotifications.map((notification) => (
            <EmailSummaryCard key={notification.id} summary={notification} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications; 