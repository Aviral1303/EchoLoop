import apiClient from '@/lib/api-client';

// Types
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

export interface GoogleAuthParams {
  token: string; // The OAuth token from Google
}

/**
 * Authenticate with Google
 * Sends the Google OAuth token to backend and returns JWT token
 */
export const authenticateWithGoogle = async (params: GoogleAuthParams): Promise<AuthResponse> => {
  // For development, check if it's a mock token
  if (params.token === 'mock-token-xyz-123') {
    // Mock authentication response
    const mockResponse: AuthResponse = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItMTIzIiwibmFtZSI6Ik1vY2sgVXNlciIsImVtYWlsIjoibW9ja3VzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2MjA1NzYwMDAsImV4cCI6MTY1MjExMjAwMH0.mock-signature',
      user: {
        id: 'mock-user-123',
        email: 'mockuser@example.com',
        name: 'Mock User',
        picture: 'https://ui-avatars.com/api/?name=Mock+User&background=random'
      }
    };
    
    // Store the token in localStorage
    localStorage.setItem('authToken', mockResponse.token);
    localStorage.setItem('userData', JSON.stringify(mockResponse.user));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockResponse;
  }
  
  // Real authentication
  const response = await apiClient.post<AuthResponse>('/auth/google', params);
  
  // Store the token in localStorage
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): { id: string; email: string; name: string; picture?: string } | null => {
  if (typeof window === 'undefined') return null;
  
  const userDataString = localStorage.getItem('userData');
  if (!userDataString) return null;
  
  try {
    return JSON.parse(userDataString);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = '/';
}; 