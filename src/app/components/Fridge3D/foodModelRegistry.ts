import { Asset } from 'expo-asset';

export type FoodModelKey = 'apple' | 'fish' | 'milk' | 'egg';

export type FoodModelConfig = {
  key: FoodModelKey;
  url?: string;
  scale?: number;
  rotation?: [number, number, number];
  offset?: [number, number, number];
};

export const FOOD_MODEL_REGISTRY: Record<FoodModelKey, FoodModelConfig> = {
  apple: { key: 'apple', url: undefined, scale: 1, rotation: [0, 0, 0], offset: [0, 0, 0] },
  fish: { key: 'fish', url: undefined, scale: 1, rotation: [0, 0, 0], offset: [0, 0, 0] },
  milk: { key: 'milk', url: undefined, scale: 1, rotation: [0, 0, 0], offset: [0, 0, 0] },
  egg: { key: 'egg', url: undefined, scale: 1, rotation: [0, 0, 0], offset: [0, 0, 0] },
};

const FOOD_MODEL_ASSETS: Partial<Record<FoodModelKey, number>> = {
  apple: require('../../../assets/models/foods/apple.glb'),
  fish: require('../../../assets/models/foods/fish.glb'),
  milk: require('../../../assets/models/foods/milk.glb'),
};

export function getFoodModelUrl(key: FoodModelKey): string | undefined {
  const moduleId = FOOD_MODEL_ASSETS[key];
  if (moduleId == null) return FOOD_MODEL_REGISTRY[key]?.url;
  return Asset.fromModule(moduleId).uri;
}

export function resolveFoodModelKey(input: { name?: string; category?: string }): FoodModelKey | null {
  const text = `${input.category ?? ''} ${input.name ?? ''}`.toLowerCase();

  if (/(apple|苹果|红富士|青苹果)/.test(text)) return 'apple';
  if (/(fish|鱼|三文鱼|鳕鱼|金枪鱼|鲈鱼|虾|蟹|海鲜)/.test(text)) return 'fish';
  if (/(milk|牛奶|酸奶|乳)/.test(text)) return 'milk';
  if (/(egg|鸡蛋|鸭蛋|鹌鹑蛋|蛋)/.test(text)) return 'egg';

  return null;
}
