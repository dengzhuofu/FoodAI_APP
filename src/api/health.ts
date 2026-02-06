import client from './client';

export interface HealthProfile {
  id: number;
  height: number;
  weight: number;
  daily_calorie_target: number;
  dietary_advice: string;
  exercise_advice: string;
}

export interface CheckIn {
  id: number;
  date: string;
  breakfast_content?: string;
  lunch_content?: string;
  dinner_content?: string;
  exercise_content?: string;
  total_calories_in: number;
  total_calories_burned: number;
  status: 'white' | 'orange' | 'red';
}

export const getHealthProfile = async (): Promise<HealthProfile | null> => {
  try {
    const response = await client.get('/health/profile');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createOrUpdateHealthProfile = async (height: number, weight: number): Promise<HealthProfile> => {
  const response = await client.post('/health/profile', { height, weight });
  return response.data;
};

export const getCheckIns = async (startDate?: string, endDate?: string): Promise<CheckIn[]> => {
  const response = await client.get('/health/checkins', { params: { start_date: startDate, end_date: endDate } });
  return response.data;
};

export const createCheckIn = async (data: any): Promise<CheckIn> => {
  const response = await client.post('/health/checkins', data);
  return response.data;
};

export const calculateCalories = async (data: any): Promise<{ total_calories_in: number; total_calories_burned: number; breakdown: string }> => {
  const response = await client.post('/health/calculate', data);
  return response.data;
};
