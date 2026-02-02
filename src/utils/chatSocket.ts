import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { BASE_URL } from '../api/client';

type ChatSocketEvent = { type: string; data: any };

const toWsBase = (httpBase: string) => {
  if (httpBase.startsWith('https://')) return `wss://${httpBase.slice('https://'.length)}`;
  if (httpBase.startsWith('http://')) return `ws://${httpBase.slice('http://'.length)}`;
  return httpBase;
};

const getToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('user_token');
  return SecureStore.getItemAsync('user_token');
};

export const connectChatSocket = async (handlers: {
  onEvent: (event: ChatSocketEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (e: any) => void;
}) => {
  const token = await getToken();
  if (!token) return null;

  const wsBase = toWsBase(BASE_URL);
  const ws = new WebSocket(`${wsBase}/api/v1/chats/ws?token=${encodeURIComponent(token)}`);

  ws.onopen = () => handlers.onOpen?.();
  ws.onclose = () => handlers.onClose?.();
  ws.onerror = (e) => handlers.onError?.(e);
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(String(msg.data));
      handlers.onEvent(data);
    } catch {
      return;
    }
  };

  return ws;
};

