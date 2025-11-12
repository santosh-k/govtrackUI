import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout as logoutAction } from '../store/authSlice';
import { User } from '../types/auth.types';
import { router } from 'expo-router';

type AuthContextType = {
  userToken: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Load token on app start
  const loadToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await SecureStore.getItemAsync('user');
      if (token && refreshToken && userStr) {
        const user: User = JSON.parse(userStr);
        setUserToken(token);
        dispatch(loginSuccess({ token, refreshToken, user }));
      }
    } catch (e) {
      console.error('Failed to load token from SecureStore', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  // Handle login
  const login = async (token: string, refreshToken: string, user: User) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      setUserToken(token);
      dispatch(loginSuccess({ token, refreshToken, user }));
      router.replace('/(drawer)/(tabs)/dashboard');
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      setUserToken(null);
      dispatch(logoutAction());

      // 👇 navigate back to login screen
      router.replace('/');
    } catch (e) {
      console.error('Failed to delete token', e);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
