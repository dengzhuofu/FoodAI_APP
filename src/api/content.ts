import client, { DEV_API_URL } from './client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  id: number;
  content: string;
  rating?: number;
  images?: string[]; // Added images
  user: User;
  parent_id?: number;
  level?: number;
  root_parent_id?: number;
  replies?: Comment[];
  created_at: string;
}

export interface CommentCreate {
  content: string;
  rating?: number;
  target_id: number;
  target_type: 'recipe' | 'restaurant';
  parent_id?: number;
}

export interface Recipe {
  id: number;
  title: string;
  cover_image: string;
  description?: string;
  cooking_time?: string;
  difficulty?: string;
  cuisine?: string;
  category?: string;
  calories?: number;
  nutrition?: any;
  ingredients: string[];
  steps: string[];
  author: User;
  likes_count: number;
  is_liked: boolean;
  is_collected: boolean;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  title: string;
  content?: string;
  images: string[];
  address?: string;
  rating?: number;
  cuisine?: string;
  latitude?: number;
  longitude?: number;
  hours?: string;
  phone?: string;
  author: User;
  likes_count: number;
  is_liked: boolean;
  is_collected: boolean;
  created_at: string;
}

export interface RecipeQueryParams {
  page?: number;
  page_size?: number;
  q?: string;
  cuisine?: string;
  category?: string;
  difficulty?: string;
  cooking_time?: string;
  sort_by?: string;
  desc?: boolean;
}

export interface RestaurantQueryParams {
  page?: number;
  page_size?: number;
  q?: string;
  cuisine?: string;
  rating_min?: number;
  sort_by?: string;
  desc?: boolean;
}

// Recipes
export const getRecipe = async (id: number): Promise<Recipe> => {
  const response = await client.get(`/recipes/${id}`);
  return response.data;
};

export const getRecipes = async (params: RecipeQueryParams = {}): Promise<Recipe[]> => {
  const response = await client.get('/recipes', { params });
  return response.data;
};

export const createRecipe = async (data: Partial<Recipe>): Promise<Recipe> => {
  const response = await client.post('/recipes', data);
  return response.data;
};

// Restaurants
export const getRestaurant = async (id: number): Promise<Restaurant> => {
  const response = await client.get(`/restaurants/${id}`);
  return response.data;
};

export const getRestaurants = async (params: RestaurantQueryParams = {}): Promise<Restaurant[]> => {
  const response = await client.get('/restaurants', { params });
  return response.data;
};

export const createRestaurant = async (data: Partial<Restaurant>): Promise<Restaurant> => {
  const response = await client.post('/restaurants', data);
  return response.data;
};

// Comments
export const getComments = async (targetId: number, targetType: 'recipe' | 'restaurant', page: number = 1): Promise<Comment[]> => {
  const response = await client.get('/comments', {
    params: { target_id: targetId, target_type: targetType, page },
  });
  return response.data;
};

export const createComment = async (data: CommentCreate & { images?: any[] }): Promise<Comment> => {
  let token;
  if (Platform.OS === 'web') {
    token = localStorage.getItem('user_token');
  } else {
    token = await SecureStore.getItemAsync('user_token');
  }

  const formData = new FormData();
  formData.append('content', data.content);
  formData.append('target_id', data.target_id.toString());
  formData.append('target_type', data.target_type);
  
  if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
  if (data.rating) formData.append('rating', data.rating.toString());
  
  if (data.images && data.images.length > 0) {
    for (const img of data.images) {
      if (Platform.OS === 'web') {
        const response = await fetch(img.uri);
        const blob = await response.blob();
        formData.append('images', blob, img.fileName || `image_${Date.now()}.jpg`);
      } else {
        formData.append('images', {
          uri: img.uri,
          name: img.fileName || `image_${Date.now()}.jpg`,
          type: img.mimeType || 'image/jpeg'
        } as any);
      }
    }
  }

  const response = await fetch(`${DEV_API_URL}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.detail ? JSON.stringify(responseData.detail) : 'Upload failed');
  }
  
  // Standard response unwrapping (backend returns standard format wrapper)
  if (responseData.data && typeof responseData.status_code === 'number') {
      return responseData.data;
  }

  return responseData;
};

// Collections
export const toggleCollection = async (targetId: number, targetType: 'recipe' | 'restaurant'): Promise<{ message: string }> => {
  const response = await client.post('/collections', null, {
    params: { target_id: targetId, target_type: targetType },
  });
  return response.data;
};

export const getCollections = async (targetType: 'recipe' | 'restaurant', page: number = 1): Promise<Recipe[] | Restaurant[]> => {
  const response = await client.get('/collections', {
    params: { target_type: targetType, page },
  });
  return response.data;
};

// Likes
export const toggleLike = async (targetId: number, targetType: 'recipe' | 'restaurant'): Promise<{ message: string }> => {
  const response = await client.post('/likes', null, {
    params: { target_id: targetId, target_type: targetType },
  });
  return response.data;
};

// Views
export const recordView = async (targetId: number, targetType: 'recipe' | 'restaurant'): Promise<{ message: string }> => {
  const response = await client.post('/views', null, {
    params: { target_id: targetId, target_type: targetType },
  });
  return response.data;
};
