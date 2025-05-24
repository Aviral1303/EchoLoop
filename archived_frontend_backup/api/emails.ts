import apiClient from '@/lib/api-client';

// Types
export interface Email {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  receivedAt: string;
  snippet: string;
  body: string;
  isRead: boolean;
  summary?: EmailSummary;
  labels?: string[];
}

export interface EmailSummary {
  id: string;
  emailId: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  generatedAt: string;
}

export interface SummarizeEmailParams {
  emailId?: string;
  emailBody: string;
  emailSubject?: string;
}

/**
 * Fetch user's emails
 * @param params Optional query parameters like page, limit, etc.
 */
export const fetchEmails = async (params?: { 
  page?: number; 
  limit?: number;
  unreadOnly?: boolean;
}): Promise<Email[]> => {
  const response = await apiClient.get<Email[]>('/emails', { params });
  return response.data;
};

/**
 * Fetch a single email by ID
 */
export const fetchEmailById = async (emailId: string): Promise<Email> => {
  const response = await apiClient.get<Email>(`/emails/${emailId}`);
  return response.data;
};

/**
 * Summarize an email
 */
export const summarizeEmail = async (params: SummarizeEmailParams): Promise<EmailSummary> => {
  const response = await apiClient.post<EmailSummary>('/summarize', params);
  return response.data;
};

/**
 * Mark an email as read
 */
export const markEmailAsRead = async (emailId: string): Promise<void> => {
  await apiClient.put(`/emails/${emailId}/read`);
};

/**
 * Mark an email as unread
 */
export const markEmailAsUnread = async (emailId: string): Promise<void> => {
  await apiClient.put(`/emails/${emailId}/unread`);
}; 