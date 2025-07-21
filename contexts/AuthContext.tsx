'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, isAuthenticated, logout } from '@/lib/apiUtils';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true);
        try {
          // Try to get user data from API
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // If API call fails, try to get basic user data from localStorage
            const userId = localStorage.getItem('user-id');
            const userName = localStorage.getItem('user-name');
            const userEmail = localStorage.getItem('user-email');
            
            if (userId && userName && userEmail) {
              setUser({
                id: userId,
                name: userName,
                email: userEmail
              });
            } else {
              // If no user data is available, log out
              handleLogout();
            }
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = (token: string, userData: User) => {
    localStorage.setItem('auth-token', token);
    localStorage.setItem('user-id', userData.id);
    localStorage.setItem('user-name', userData.name);
    localStorage.setItem('user-email', userData.email);
    
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    loading,
    isLoggedIn,
    login: handleLogin,
    logout: handleLogout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}