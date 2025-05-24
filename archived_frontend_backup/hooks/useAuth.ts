import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authenticateWithGoogle, getCurrentUser, isAuthenticated, logout, GoogleAuthParams } from '@/api/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Load user on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = getCurrentUser();
        setUser(userData);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Handle Google authentication
  const handleGoogleAuth = useCallback(async (params: GoogleAuthParams) => {
    setLoading(true);
    
    try {
      const response = await authenticateWithGoogle(params);
      setUser(response.user);
      setAuthenticated(true);
      toast.success('Successfully authenticated!');
      router.push('/dashboard');
      return response;
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Handle logout
  const handleLogout = useCallback(() => {
    setLoading(true);
    
    try {
      logout();
      setUser(null);
      setAuthenticated(false);
      toast.success('Successfully logged out');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    user,
    loading,
    authenticated,
    handleGoogleAuth,
    handleLogout
  };
} 