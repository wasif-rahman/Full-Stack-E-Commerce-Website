import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken, getAuthToken, type User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'customer' | 'vendor') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await api.getProfile();
          if (response.success) {
            setUser(response.data);
          } else {
            // Invalid token, clear it
            setAuthToken(null);
          }
        } catch (error) {
          // Token might be expired or invalid
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password });
      
      if (response.success) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${response.data.user.name}`,
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'customer' | 'vendor' = 'customer') => {
    try {
      setIsLoading(true);
      const response = await api.register({ name, email, password, role });
      
      if (response.success) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        toast({
          title: "Account Created!",
          description: `Welcome to our store, ${response.data.user.name}!`,
        });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Even if logout fails on the server, we should clear local state
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};