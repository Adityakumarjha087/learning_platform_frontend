'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Ensure the API_URL in AuthContext uses the updated environment variable, defaulting to port 5000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Add axios interceptor for token handling
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'learner';
  profile?: {
    bio?: string;
    avatar?: string;
    preferences?: {
      theme?: 'light' | 'dark';
      notifications?: boolean;
    };
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, adminToken?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get<ApiResponse<User>>(`${API_URL}/api/auth/me`);
          setUser(response.data.data);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post<ApiResponse<{ user: User; token: string }>>(
        `${API_URL}/api/auth/login`,
        { email, password }
      );
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, adminToken?: string): Promise<User> => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (adminToken) {
        response = await axios.post<ApiResponse<{ user: User; token: string }>>(
          `${API_URL}/api/auth/create-admin`,
          { name, email, password, adminToken }
        );
      } else {
        response = await axios.post<ApiResponse<{ user: User; token: string }>>(
          `${API_URL}/api/auth/register`,
          { name, email, password }
        );
      }
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};