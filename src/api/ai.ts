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

export interface KitchenAgentRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
  session_id?: number;
  agent_id?: string;
}

export interface ChatSession {
  id: number;
  title: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thoughts?: Array<any>;
  created_at: string;
}

export const chatWithKitchenAgent = async (message: string, history: Array<{ role: string; content: string }> = [], sessionId?: number, agentId: string = 'kitchen_agent') => {
  try {
    const response = await client.post('/ai/agent/chat', { 
      message, 
      history,
      session_id: sessionId,
      agent_id: agentId
    });
    // Response format: { response: { answer: string, thoughts: [] }, session_id: number }
    return response.data; 
  } catch (error) {
    console.error('Kitchen Agent Error:', error);
    throw error;
  }
};

export const getChatSessions = async (): Promise<ChatSession[]> => {
  const response = await client.get('/ai/sessions');
  return response.data;
};

export const getSessionMessages = async (sessionId: number): Promise<ChatMessage[]> => {
  const response = await client.get(`/ai/sessions/${sessionId}/messages`);
  return response.data;
};

export interface AgentPreset {
  id: number;
  name: string;
  description?: string;
  system_prompt: string;
  allowed_tools: string[];
  is_system: boolean;
}

export interface AgentPresetCreate {
  name: string;
  description?: string;
  system_prompt: string;
  allowed_tools: string[];
}

export interface AgentPresetUpdate {
  name?: string;
  description?: string;
  system_prompt?: string;
  allowed_tools?: string[];
}

export interface MealPlanRequest {
  dietary_restrictions?: string;
  preferences?: string;
  headcount?: number;
  duration_days?: number;
  goal?: string;
}

export interface MealPlanResult {
  title: string;
  overview: string;
  daily_plans: Array<{
    day: number;
    meals: Array<{
      type: string;
      name: string;
      description: string;
      calories: number;
    }>;
    total_calories: number;
  }>;
}

export const getAgentPresets = async (): Promise<AgentPreset[]> => {
  const response = await client.get('/ai/presets');
  return response.data;
};

export const createAgentPreset = async (data: AgentPresetCreate): Promise<AgentPreset> => {
  const response = await client.post('/ai/presets', data);
  return response.data;
};

export const updateAgentPreset = async (presetId: number, data: AgentPresetUpdate): Promise<AgentPreset> => {
  const response = await client.put(`/ai/presets/${presetId}`, data);
  return response.data;
};

export const deleteAgentPreset = async (presetId: number): Promise<void> => {
  await client.delete(`/ai/presets/${presetId}`);
};

export const createChatSession = async (title: string = "新对话", agentId: string = "kitchen_agent"): Promise<ChatSession> => {
  const response = await client.post('/ai/sessions', { title, agent_id: agentId });
  return response.data;
};

export const deleteChatSession = async (sessionId: number): Promise<void> => {
  await client.delete(`/ai/sessions/${sessionId}`);
};

export interface AgentTool {
  id: string;
  name: string;
  description: string;
}

export const getAvailableAgentTools = async (): Promise<AgentTool[]> => {
  const response = await client.get('/ai/agent/tools');
  return response.data;
};

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

// What To Eat Generation
export const generateWhatToEat = async (categories: string[], quantity: number): Promise<string[]> => {
  const response = await client.post('/ai/generate-what-to-eat', {
    categories,
    quantity
  });
  return response.data.options;
};

export const generateMealPlan = async (data: MealPlanRequest): Promise<MealPlanResult> => {
  const response = await client.post('/ai/meal-plan', data);
  try {
    return typeof response.data === 'string' 
      ? JSON.parse(response.data) 
      : response.data;
  } catch (e) {
    console.error("Failed to parse AI result", e);
    throw e;
  }
};

export const transcribeAudio = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: uri,
    type: 'audio/m4a', // Expo Audio recording usually outputs m4a/mp4 on iOS/Android
    name: 'recording.m4a',
  } as any);

  const response = await client.post('/ai/audio/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.text;
};
