import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  summarizeEmail, 
  SummarizeEmailParams, 
  EmailSummary 
} from '@/api/emails';

export function useSummarizeEmail() {
  const [summary, setSummary] = useState<EmailSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async (params: SummarizeEmailParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await summarizeEmail(params);
      setSummary(data);
      toast.success('Email summarized successfully');
      return data;
    } catch (err) {
      console.error('Error summarizing email:', err);
      setError('Failed to summarize email. Please try again.');
      toast.error('Failed to summarize email');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return {
    summary,
    loading,
    error,
    generateSummary,
    clearSummary
  };
} 