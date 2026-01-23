import client from './client';

export interface UserProfile {
  user_id: number;
  preferences: string[];
  allergies: string[];
  health_goals: string[];
  settings: Record<string, any>;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await client.get('/users/me/profile');
  return response.data;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await client.put('/users/me/profile', data);
  return response.data;
};
