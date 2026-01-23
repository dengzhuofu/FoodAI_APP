import client from './client';
import { User, Comment } from './content';

// Re-export User type
export type { User };

export interface UserStats {
  recipes_count: number;
  followers_count: number;
  following_count: number;
}

export const followUser = async (userId: number): Promise<{ message: string }> => {
  const response = await client.post(`/users/${userId}/follow`);
  return response.data;
};

export const unfollowUser = async (userId: number): Promise<{ message: string }> => {
  const response = await client.delete(`/users/${userId}/follow`);
  return response.data;
};

export const getFollowers = async (userId: number, page: number = 1): Promise<User[]> => {
  const response = await client.get(`/users/${userId}/followers`, { params: { page } });
  return response.data;
};

export const getFollowing = async (userId: number, page: number = 1): Promise<User[]> => {
  const response = await client.get(`/users/${userId}/following`, { params: { page } });
  return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await client.get('/users/me/stats');
  return response.data;
};

export const getUserComments = async (userId: number, page: number = 1): Promise<Comment[]> => {
  const response = await client.get(`/users/${userId}/comments`, { params: { page } });
  return response.data;
};
