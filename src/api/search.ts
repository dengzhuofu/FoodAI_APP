import client from './client';
import { Recipe, Restaurant } from './content';

export const getSearchHistory = async (): Promise<string[]> => {
  const response = await client.get('/search/history');
  return response.data;
};

export const addSearchHistory = async (keyword: string): Promise<void> => {
  await client.post('/search/history', null, { params: { keyword } });
};

export const clearSearchHistory = async (): Promise<void> => {
  await client.delete('/search/history');
};

export const getHotSearch = async (): Promise<string[]> => {
  const response = await client.get('/search/hot');
  return response.data;
};

export const getSearchSuggestions = async (q: string): Promise<string[]> => {
  const response = await client.get('/search/suggest', { params: { q } });
  return response.data;
};

// Re-export search from explore or implement a specific result search here
// We can use the existing /explore/search
export const searchContent = async (q: string, type?: 'recipe' | 'restaurant'): Promise<{ recipes?: Recipe[], restaurants?: Restaurant[] }> => {
  const response = await client.get('/explore/search', { params: { q, type } });
  return response.data;
};
