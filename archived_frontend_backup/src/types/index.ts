export interface EmailSummary {
  id: number;
  email_id: string;
  sender: string;
  subject: string;
  received_at: string;
  summary_text: string;
  created_at: string;
  seen: boolean;
  summary_id: number;
}

export interface NotificationMessage {
  type: string;
  data: EmailSummary;
}

export interface User {
  id: number;
  name: string;
  email: string;
} 