import axios from 'axios';
import { EmailSummary } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const fetchEmailSummaries = async (): Promise<EmailSummary[]> => {
  const response = await api.get('/summaries');
  return response.data;
};

export const refreshEmails = async (): Promise<{ message: string; summaries: EmailSummary[] }> => {
  const response = await api.post('/refresh');
  return response.data;
};

export const markSummaryAsSeen = async (summaryId: number): Promise<{ success: boolean }> => {
  const response = await api.put(`/summaries/${summaryId}/seen`);
  return response.data;
};

// WebSocket connection setup
let ws: WebSocket | null = null;
const listeners: ((data: any) => void)[] = [];

export const connectWebSocket = (onMessage?: (data: any) => void): WebSocket => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (onMessage) {
      listeners.push(onMessage);
    }
    return ws;
  }

  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/api/v1/ws';
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connection established');
    
    // Send ping every 30 seconds to keep connection alive
    setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Notify all listeners
      listeners.forEach((listener) => {
        listener(data);
      });
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    
    // Try to reconnect after 5 seconds
    setTimeout(() => {
      ws = null;
      connectWebSocket();
    }, 5000);
  };

  if (onMessage) {
    listeners.push(onMessage);
  }

  return ws;
};

export const disconnectWebSocket = (listener?: (data: any) => void): void => {
  if (listener) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  } else {
    listeners.length = 0;
  }

  if (ws && listeners.length === 0) {
    ws.close();
    ws = null;
  }
}; 