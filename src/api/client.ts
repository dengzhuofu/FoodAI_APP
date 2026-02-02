import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For real device, replace with your machine's IP address
const ENV_API_URL = (process.env as any)?.EXPO_PUBLIC_API_URL as string | undefined;

export const DEV_API_URL =
  ENV_API_URL ||
  Platform.select({
    ios: 'http://159.75.135.120/api/v1',
    android: 'http://159.75.135.120/api/v1',
    default: 'http://159.75.135.120/api/v1',
  });

export const BASE_URL = DEV_API_URL.replace('/api/v1', '');

const client = axios.create({
  baseURL: DEV_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
client.interceptors.request.use(
  async (config) => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('user_token');
      } else {
        token = await SecureStore.getItemAsync('user_token');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { authEvents } from '../utils/authEvents';

// ... (existing imports)

// ... (existing code)

// Response interceptor to handle 401 and standard response unwrapping
client.interceptors.response.use(
  (response) => {
    // Check if response follows standard format { status_code, message, data, timestamp }
    if (response.data && typeof response.data === 'object') {
      const { status_code, data } = response.data;
      // If it looks like a standard response
      if (typeof status_code === 'number' && data !== undefined) {
        // Replace response.data with the actual data payload
        response.data = data;
      }
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (Platform.OS === 'web') {
        localStorage.removeItem('user_token');
      } else {
        await SecureStore.deleteItemAsync('user_token');
      }
      // Notify AuthContext to update state
      authEvents.emit('UNAUTHORIZED');
    }
    return Promise.reject(error);
  }
);

export default client;
