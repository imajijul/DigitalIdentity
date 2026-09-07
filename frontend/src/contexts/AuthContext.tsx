import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';
import { authApi } from '../api/index.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshMe = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        localStorage.setItem('access_token', res.data.accessToken);
        setUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.full_name}!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error', 'Authentication Failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(data);
      if (res.success && res.data) {
        localStorage.setItem('access_token', res.data.accessToken);
        setUser(res.data.user);
        showToast('Registration successful! Welcome to the portal.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error', 'Signup Error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      showToast('You have been logged out.', 'info');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loading: isLoading, login, signup, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
