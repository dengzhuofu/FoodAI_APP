import client from './client';

export type DirectMessageType = 'text' | 'image' | 'voice' | 'emoji' | 'sticker';

export interface ChatUser {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
}

export interface DirectMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  message_type: DirectMessageType;
  text?: string | null;
  media_url?: string | null;
  extra?: Record<string, any>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface ConversationLastMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_type: DirectMessageType;
  text?: string | null;
  media_url?: string | null;
  extra?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface DirectConversation {
  id: number;
  peer: ChatUser;
  unread_count: number;
  last_message?: ConversationLastMessage | null;
  updated_at: string;
}

export const listConversations = async (): Promise<DirectConversation[]> => {
  const res = await client.get('/chats/conversations');
  return res.data;
};

export const ensureConversation = async (peer_user_id: number): Promise<DirectConversation> => {
  const res = await client.post('/chats/conversations/ensure', { peer_user_id });
  return res.data;
};

export const listMessages = async (
  conversation_id: number,
  options?: { limit?: number; before_id?: number }
): Promise<{ items: DirectMessage[]; has_more: boolean }> => {
  const res = await client.get(`/chats/conversations/${conversation_id}/messages`, { params: options });
  return res.data;
};

export const sendDirectMessage = async (payload: {
  peer_user_id: number;
  message_type: DirectMessageType;
  text?: string;
  media_url?: string;
  extra?: Record<string, any>;
}): Promise<DirectMessage> => {
  const res = await client.post('/chats/messages', payload);
  return res.data;
};

export const markConversationRead = async (conversation_id: number): Promise<{ updated: number }> => {
  const res = await client.post(`/chats/conversations/${conversation_id}/read`);
  return res.data;
};

