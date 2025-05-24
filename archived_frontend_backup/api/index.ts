// Re-export all API functions for easy importing
export * from './auth';
export * from './emails';
export * from './notifications';

// Export a default API object for convenience
import * as authAPI from './auth';
import * as emailsAPI from './emails';
import * as notificationsAPI from './notifications';

const api = {
  auth: authAPI,
  emails: emailsAPI,
  notifications: notificationsAPI,
};

export default api; 