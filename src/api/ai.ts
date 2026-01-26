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
  image_url?: string; // Optional final image
  step_images?: Array<{step_index: number, image_url: string, text: string}>; // Optional step images
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

export const getHistory = async (limit: number = 20, offset: number = 0, feature?: string): Promise<AILog[]> => {
  const response = await client.get('/ai/history', {
    params: { limit, offset, feature }
  });
  return response.data.history;
};

export const generateRecipeImage = async (recipeData: RecipeResult, imageType: 'final' | 'steps' = 'final', sourceLogId?: number): Promise<any> => {
  const response = await client.post('/ai/generate-recipe-image', {
    recipe_data: recipeData,
    image_type: imageType,
    source_log_id: sourceLogId
  });
  return response.data;
};

// Text to Recipe
export const textToRecipe = async (description: string, preferences: string = ''): Promise<{result: RecipeResult, log_id: number}> => {
  const response = await client.post('/ai/text-to-recipe', {
    description,
    preferences
  });
  
  try {
    const result = typeof response.data.result === 'string' 
      ? JSON.parse(response.data.result) 
      : response.data.result;
    return { result, log_id: response.data.log_id };
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
export const imageToRecipe = async (imageUrl: string): Promise<{result: RecipeResult, log_id: number}> => {
  const response = await client.post('/ai/image-to-recipe', {
    image_url: imageUrl
  });

  try {
    const result = typeof response.data.result === 'string' 
      ? JSON.parse(response.data.result) 
      : response.data.result;
    return { result, log_id: response.data.log_id };
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
export const fridgeToRecipe = async (items: string[]): Promise<{result: RecipeResult, log_id: number}> => {
  const response = await client.post('/ai/fridge-to-recipe', {
    items
  });

  try {
    const result = typeof response.data.result === 'string' 
      ? JSON.parse(response.data.result) 
      : response.data.result;
    return { result, log_id: response.data.log_id };
  } catch (e) {
    console.error("Failed to parse AI result", e);
    throw e;
  }
};

// Recognize Fridge
export interface RecognizedItem {
  name: string;
  quantity: string;
  expiry_days: number;
  icon: string;
}

export const recognizeFridge = async (imageUrl: string): Promise<RecognizedItem[]> => {
  const response = await client.post('/ai/recognize-fridge', {
    image_url: imageUrl
  });
  return response.data.items;
};
