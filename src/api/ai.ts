import client from './client';

export interface RecipeResult {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  nutrition: {
    calories: number | string;
    protein: string;
    fat: string;
    carbs: string;
  };
  cooking_time: string;
  difficulty: string;
}

export interface CalorieResult {
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
}

export interface AILog {
  id: number;
  feature: string;
  input_summary: string;
  output_result: any;
  created_at: string;
}

export const getHistory = async (limit: number = 20, offset: number = 0): Promise<AILog[]> => {
  const response = await client.get('/ai/history', {
    params: { limit, offset }
  });
  return response.data.history;
};

export const generateRecipeImage = async (recipeData: RecipeResult, imageType: 'final' | 'steps' = 'final'): Promise<any> => {
  const response = await client.post('/ai/generate-recipe-image', {
    recipe_data: recipeData,
    image_type: imageType
  });
  return response.data;
};

// Text to Recipe
export const textToRecipe = async (description: string, preferences: string = ''): Promise<RecipeResult> => {
  const response = await client.post('/ai/text-to-recipe', {
    description,
    preferences
  });
  
  try {
    return typeof response.data.result === 'string' 
      ? JSON.parse(response.data.result) 
      : response.data.result;
  } catch (e) {
    console.error("Failed to parse AI result", e);
    throw e;
  }
};

// Text to Image (Generate Image)
export const textToImage = async (prompt: string): Promise<string> => {
  const response = await client.post('/ai/text-to-image', {
    prompt
  });
  return response.data.url;
};

// Image to Recipe
export const imageToRecipe = async (imageUrl: string): Promise<RecipeResult> => {
  const response = await client.post('/ai/image-to-recipe', {
    image_url: imageUrl
  });

  try {
    return typeof response.data.result === 'string' 
      ? JSON.parse(response.data.result) 
      : response.data.result;
  } catch (e) {
    console.error("Failed to parse AI result", e);
    throw e;
  }
};

// Image to Calorie
export const imageToCalorie = async (imageUrl: string): Promise<CalorieResult> => {
  const response = await client.post('/ai/image-to-calorie', {
    image_url: imageUrl
  });

  try {
    return typeof response.data.result === 'string' 
      ? JSON.parse(response.data.result) 
      : response.data.result;
  } catch (e) {
    console.error("Failed to parse AI result", e);
    throw e;
  }
};

// Fridge to Recipe
export const fridgeToRecipe = async (items: string[]): Promise<RecipeResult> => {
  const response = await client.post('/ai/fridge-to-recipe', {
    items
  });

  try {
    return typeof response.data.result === 'string' 
      ? JSON.parse(response.data.result) 
      : response.data.result;
  } catch (e) {
    console.error("Failed to parse AI result", e);
    throw e;
  }
};
