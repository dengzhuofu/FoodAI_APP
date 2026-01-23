import client from './client';
import { Recipe, Restaurant } from './content';

export interface HealthNews {
  id: number;
  title: string;
  summary: string;
  image: string;
  date: string;
}

export const getHealthNews = async (): Promise<HealthNews[]> => {
  const response = await client.get('/explore/health-news');
  return response.data;
};

export const getPopularTags = async (): Promise<string[]> => {
  const response = await client.get('/explore/tags');
  return response.data;
};

export const search = async (q: string, type?: 'recipe' | 'restaurant'): Promise<{ recipes?: Recipe[], restaurants?: Restaurant[] }> => {
  const response = await client.get('/explore/search', { params: { q, type } });
  return response.data;
};

export interface FeedItem {
  id: number;
  type: 'recipe' | 'restaurant';
  title: string;
  image: string;
  author: string;
  likes: number;
  views?: number;
  category?: string;
  created_at: string;
  rating?: number;
  recommendation_reason?: string;
}

export const getRecommendations = async (
  page: number = 1, 
  limit: number = 10, 
  type?: 'recipe' | 'restaurant',
  sort_by?: 'default' | 'time' | 'likes' | 'views',
  category?: string
): Promise<FeedItem[]> => {
  const response = await client.get('/explore/recommendations', { 
    params: { page, limit, type, sort_by, category } 
  });
  return response.data;
};
