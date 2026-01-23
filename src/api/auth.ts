import client from './client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const login = async (username: string, password: string) => {
  const response = await client.post('/auth/login', { username, password });
  const { access_token } = response.data;
  if (Platform.OS === 'web') {
    localStorage.setItem('user_token', access_token);
  } else {
    await SecureStore.setItemAsync('user_token', access_token);
  }
  return response.data;
};

export const register = async (username: string, password: string, nickname: string, email?: string) => {
  const response = await client.post('/auth/register', {
    username,
    password,
    nickname,
    email,
  });
  return response.data;
};

export const logout = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('user_token');
  } else {
    await SecureStore.deleteItemAsync('user_token');
  }
};

export const getMe = async () => {
  const response = await client.get('/users/me');
  return response.data;
};
