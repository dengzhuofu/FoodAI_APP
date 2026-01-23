import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, logout as apiLogout } from '../api/auth';
import { authEvents } from '../utils/authEvents';

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        if (Platform.OS === 'web') {
          token = localStorage.getItem('user_token');
        } else {
          token = await SecureStore.getItemAsync('user_token');
        }
      } catch (e) {
        console.error('Restoring token failed', e);
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUserToken(null);
    };

    authEvents.on('UNAUTHORIZED', handleUnauthorized);
    return () => {
      authEvents.off('UNAUTHORIZED', handleUnauthorized);
    };
  }, []);

  const authContext = useMemo(
    () => ({
      isLoading,
      userToken,
      signIn: async (username: string, password: string) => {
        // We call the API here to get the token, then update state
        // The apiLogin function in api/auth.ts already saves to storage, 
        // but we need to update the state here to trigger re-render in Navigator
        const response = await apiLogin(username, password);
        const { access_token } = response;
        setUserToken(access_token);
      },
      signOut: async () => {
        await apiLogout();
        setUserToken(null);
      },
    }),
    [isLoading, userToken]
  );

  return (
    <AuthContext.Provider value={authContext}>
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
