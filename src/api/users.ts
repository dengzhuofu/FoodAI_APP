import client from './client';
import { User, Comment } from './content';

// Re-export User type
export type { User };

export interface UserStats {
  recipes_count: number;
  restaurants_count: number;
  followers_count: number;
  following_count: number;
}

export interface UserPublicProfile {
  id: number;
  uid: number;
  username: string;
  nickname: string;
  avatar?: string | null;
  bio?: string | null;
  gender?: string | null;
  followers_count: number;
  following_count: number;
  recipes_count: number;
  restaurants_count: number;
  is_following: boolean;
}

export const getUserStats = async (): Promise<UserStats> => {
  const response = await client.get('/users/me/stats');
  return response.data;
};

export const getUserPublicProfile = async (userId: number): Promise<UserPublicProfile> => {
  const response = await client.get(`/users/${userId}/profile`);
  return response.data;
};

export const getUserPosts = async (userId: number, type: 'recipe' | 'restaurant', page = 1) => {
  const response = await client.get(`/users/${userId}/posts`, { params: { type, page } });
  return response.data;
};

export const updateProfile = async (data: { nickname?: string; bio?: string; avatar?: string }) => {
  const response = await client.patch('/users/me', data);
  return response.data;
};

// Follow System
export const followUser = async (userId: number) => {
  const response = await client.post(`/users/${userId}/follow`);
  return response.data;
};

export const unfollowUser = async (userId: number) => {
  const response = await client.delete(`/users/${userId}/follow`);
  return response.data;
};

export const getFollowers = async (userId: number, page = 1) => {
  const response = await client.get(`/users/${userId}/followers`, { params: { page } });
  return response.data;
};

export const getFollowing = async (userId: number, page = 1) => {
  const response = await client.get(`/users/${userId}/following`, { params: { page } });
  return response.data;
};

// Shopping List
export interface ShoppingItem {
  id: number;
  name: string;
  amount?: string;
  is_checked: boolean;
}

export const getShoppingList = async () => {
  const response = await client.get('/shopping-list');
  return response.data;
};

export const addToShoppingList = async (items: { name: string; amount?: string }[]) => {
  const response = await client.post('/shopping-list', items);
  return response.data;
};

export const getUserComments = async (userId: number, page: number = 1): Promise<Comment[]> => {
  const response = await client.get(`/users/${userId}/comments`, { params: { page } });
  return response.data;
};

export interface WhatToEatPreset {
  id: number;
  name: string;
  options: string[];
}

export const getWhatToEatPresets = async (): Promise<WhatToEatPreset[]> => {
  const response = await client.get('/users/me/what-to-eat-presets');
  return response.data;
};

export const createWhatToEatPreset = async (name: string, options: string[]): Promise<WhatToEatPreset> => {
  const response = await client.post('/users/me/what-to-eat-presets', {
    name,
    options
  });
  return response.data;
};

export const deleteWhatToEatPreset = async (id: number): Promise<void> => {
  await client.delete(`/users/me/what-to-eat-presets/${id}`);
};
