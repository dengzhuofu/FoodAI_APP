import client from './client';

export interface FridgeItem {
  id: number;
  user_id: number;
  name: string;
  category?: string;
  quantity?: string;
  icon?: string;
  expiry_date?: string;
  daysLeft?: number; // Calculated on frontend or backend? Backend model has expiry_date. We might need to calculate daysLeft.
  created_at: string;
}

export interface ShoppingItem {
  id: number;
  user_id: number;
  name: string;
  category?: string;
  is_bought: boolean;
}

// Fridge
export const getFridgeItems = async (): Promise<FridgeItem[]> => {
  const response = await client.get('/fridge');
  return response.data;
};

export const addFridgeItem = async (item: { name: string; category?: string; quantity?: string; expiry_date?: string; icon?: string }) => {
  const response = await client.post('/fridge', item);
  return response.data;
};

export const updateFridgeItem = async (id: number, item: { name?: string; category?: string; quantity?: string; expiry_date?: string; icon?: string }) => {
  const response = await client.put(`/fridge/${id}`, item);
  return response.data;
};

export const deleteFridgeItem = async (id: number) => {
  const response = await client.delete(`/fridge/${id}`);
  return response.data;
};

// Shopping List
export const getShoppingList = async (): Promise<ShoppingItem[]> => {
  const response = await client.get('/shopping-list');
  return response.data;
};

export const addShoppingItem = async (item: { name: string; category?: string }) => {
  const response = await client.post('/shopping-list', item);
  return response.data;
};

export const addShoppingItemsBatch = async (items: { name: string; category?: string }[]) => {
  const response = await client.post('/shopping-list/batch', items);
  return response.data;
};

export const updateShoppingItem = async (id: number, item: { name?: string; category?: string; is_bought?: boolean }) => {
  const response = await client.put(`/shopping-list/${id}`, item);
  return response.data;
};

export const deleteShoppingItem = async (id: number) => {
  const response = await client.delete(`/shopping-list/${id}`);
  return response.data;
};
