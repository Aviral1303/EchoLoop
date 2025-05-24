'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks';

interface GoogleLoginButtonProps {
  className?: string;
}

export function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
  const { handleGoogleAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      // Use mock authentication for development
      console.log("Using mock authentication for development");
      
      // Simulate a delay for the mock login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send mock token to auth handler
      await handleGoogleAuth({ token: 'mock-token-xyz-123' });
      setLoading(false);
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGoogleLogin} 
      disabled={loading}
      className={className}
      variant="outline"
    >
      {loading ? 'Connecting...' : 'Sign in with Google'}
    </Button>
  );
}

// Add type definition for the Google API
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
} 