import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  signup: (username: string) => boolean;
  updatePassword: (newPassword: string) => void;
  updateNotifications: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('cbit-sportshub-auth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuthState(parsedAuth);
      } catch (error) {
        console.error('Error parsing saved auth state:', error);
        localStorage.removeItem('cbit-sportshub-auth');
      }
    }
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cbit-sportshub-auth', JSON.stringify(authState));
  }, [authState]);

  const validateUsername = (username: string): boolean => {
    // Username must start with 1601 and be exactly 12 digits
    const usernameRegex = /^1601\d{8}$/;
    return usernameRegex.test(username);
  };

  const signup = (username: string): boolean => {
    if (!validateUsername(username)) {
      return false;
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('cbit-sportshub-users') || '[]');
    if (existingUsers.find((user: User) => user.username === username)) {
      return false;
    }

    // Create new user with username as default password
    const newUser: User = {
      username,
      password: username, // Default password is same as username
      notifications: true
    };

    // Save user to localStorage
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem('cbit-sportshub-users', JSON.stringify(updatedUsers));

    // Auto-login the new user
    setAuthState({
      isAuthenticated: true,
      user: newUser
    });

    return true;
  };

  const login = (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('cbit-sportshub-users') || '[]');
    const user = users.find((u: User) => u.username === username && u.password === password);

    if (user) {
      setAuthState({
        isAuthenticated: true,
        user
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
  };

  const updatePassword = (newPassword: string) => {
    if (!authState.user) return;

    const users = JSON.parse(localStorage.getItem('cbit-sportshub-users') || '[]');
    const updatedUsers = users.map((user: User) =>
      user.username === authState.user!.username
        ? { ...user, password: newPassword }
        : user
    );

    localStorage.setItem('cbit-sportshub-users', JSON.stringify(updatedUsers));

    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, password: newPassword } : null
    }));
  };

  const updateNotifications = (enabled: boolean) => {
    if (!authState.user) return;

    const users = JSON.parse(localStorage.getItem('cbit-sportshub-users') || '[]');
    const updatedUsers = users.map((user: User) =>
      user.username === authState.user!.username
        ? { ...user, notifications: enabled }
        : user
    );

    localStorage.setItem('cbit-sportshub-users', JSON.stringify(updatedUsers));

    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, notifications: enabled } : null
    }));
  };

  return (
    <AuthContext.Provider value={{
      authState,
      login,
      logout,
      signup,
      updatePassword,
      updateNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};