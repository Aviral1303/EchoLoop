import React, { useState, useEffect } from 'react';
import { ArrowPathIcon as RefreshIcon } from '@heroicons/react/24/outline';
import { fetchEmailSummaries, refreshEmails } from '../services/api';
import { EmailSummary } from '../types';
import EmailSummaryCard from '../components/EmailSummaryCard';
import { useNotifications } from '../contexts/NotificationContext';

const Dashboard: React.FC = () => {
  const [summaries, setSummaries] = useState<EmailSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { addNotification } = useNotifications();

  // Fetch summaries on component mount
  useEffect(() => {
    const loadSummaries = async () => {
      setLoading(true);
      try {
        const data = await fetchEmailSummaries();
        setSummaries(data);
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSummaries();
  }, []);

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await refreshEmails();
      const newSummaries = response.summaries;
      
      // Add new summaries to the list
      if (newSummaries && newSummaries.length > 0) {
        setSummaries(prev => {
          // Filter out duplicates
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNewSummaries = newSummaries.filter(s => !existingIds.has(s.id));
          
          // Add to notifications
          uniqueNewSummaries.forEach(s => addNotification(s));
          
          return [...uniqueNewSummaries, ...prev];
        });
      }
    } catch (error) {
      console.error('Error refreshing emails:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Summaries</h1>
        <button
          className="btn-primary flex items-center space-x-2"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Summaries</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshIcon className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      ) : summaries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-medium text-gray-700">No email summaries available</h2>
          <p className="text-gray-500 mt-2">
            Click the "Refresh Summaries" button to fetch new emails.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {summaries.map((summary) => (
            <EmailSummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 