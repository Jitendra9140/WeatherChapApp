/**
 * Utility functions for making API requests
 */

// Function to get the auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token');
  }
  return null;
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Function to make authenticated API requests
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// Function to handle user logout
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-name');
    localStorage.removeItem('user-id');
    
    // Redirect to home page
    window.location.href = '/';
  }
};

// Function to get current user data
export const getCurrentUser = async () => {
  try {
    const response = await fetchWithAuth('/api/auth/me');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};