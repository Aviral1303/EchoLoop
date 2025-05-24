import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  fetchEmails, 
  fetchEmailById, 
  markEmailAsRead, 
  markEmailAsUnread,
  Email
} from '@/api/emails';

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all emails
  const getEmails = useCallback(async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchEmails(params);
      setEmails(data);
      return data;
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to fetch emails. Please try again.');
      toast.error('Failed to fetch emails');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single email by ID
  const getEmailById = useCallback(async (emailId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchEmailById(emailId);
      setCurrentEmail(data);
      return data;
    } catch (err) {
      console.error('Error fetching email:', err);
      setError('Failed to fetch email. Please try again.');
      toast.error('Failed to fetch email details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark email as read
  const markAsRead = useCallback(async (emailId: string) => {
    try {
      await markEmailAsRead(emailId);
      
      // Update local state
      setEmails(prevEmails => 
        prevEmails.map(email => 
          email.id === emailId ? { ...email, isRead: true } : email
        )
      );
      
      if (currentEmail?.id === emailId) {
        setCurrentEmail(prev => prev ? { ...prev, isRead: true } : null);
      }
      
      return true;
    } catch (err) {
      console.error('Error marking email as read:', err);
      toast.error('Failed to mark email as read');
      return false;
    }
  }, [currentEmail]);

  // Mark email as unread
  const markAsUnread = useCallback(async (emailId: string) => {
    try {
      await markEmailAsUnread(emailId);
      
      // Update local state
      setEmails(prevEmails => 
        prevEmails.map(email => 
          email.id === emailId ? { ...email, isRead: false } : email
        )
      );
      
      if (currentEmail?.id === emailId) {
        setCurrentEmail(prev => prev ? { ...prev, isRead: false } : null);
      }
      
      return true;
    } catch (err) {
      console.error('Error marking email as unread:', err);
      toast.error('Failed to mark email as unread');
      return false;
    }
  }, [currentEmail]);

  return {
    emails,
    currentEmail,
    loading,
    error,
    getEmails,
    getEmailById,
    markAsRead,
    markAsUnread
  };
} 