import React from 'react';
import { format } from 'date-fns';
import { EmailSummary } from '../types';
import { markSummaryAsSeen } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

interface EmailSummaryCardProps {
  summary: EmailSummary;
}

const EmailSummaryCard: React.FC<EmailSummaryCardProps> = ({ summary }) => {
  const { markNotificationSeen } = useNotifications();
  
  const handleClick = async () => {
    if (!summary.seen) {
      try {
        await markSummaryAsSeen(summary.summary_id);
        markNotificationSeen(summary.summary_id);
      } catch (error) {
        console.error('Error marking summary as seen:', error);
      }
    }
  };
  
  // Format date
  const formattedDate = format(new Date(summary.received_at), 'MMM d, yyyy h:mm a');
  
  // Format the summary text with bullet points
  const formattedSummary = summary.summary_text
    .split('\n')
    .filter(line => line.trim() !== '')
    .map((line, index) => (
      <li key={index} className="mb-1">
        {line.replace(/^[•\-\*]\s*/, '')}
      </li>
    ));

  return (
    <div 
      className={`card mb-4 cursor-pointer transition-all duration-200 ${
        !summary.seen ? 'border-l-4 border-primary-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">{summary.subject}</h3>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
        <p className="text-sm text-gray-600 mb-2">From: {summary.sender}</p>
        
        <div className="mt-3 border-t pt-3">
          <h4 className="font-medium text-gray-700 mb-2">Summary:</h4>
          <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
            {formattedSummary}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailSummaryCard; 