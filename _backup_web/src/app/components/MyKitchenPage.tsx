import { useState } from 'react';
import { Refrigerator, Apple, Heart, Target, TrendingUp, Plus, Edit2, ArrowLeft, Sparkles, ChefHat } from 'lucide-react';
import { PageType } from '@/app/App';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface MyKitchenPageProps {
  navigate: (page: PageType, data?: any) => void;
}

export default function MyKitchenPage({ navigate }: MyKitchenPageProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleGetRecommendations = () => {
    if (selectedIngredients.length > 0 && selectedFlavor) {
      setShowRecommendations(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 space-y-6">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate('ai-kitchen')}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Refrigerator className="w-7 h-7 text-orange-500" />
            <h1 className="text-2xl">我的冰箱</h1>
          </div>
          <p className="text-sm text-gray-600">管理你的食材、偏好和健康目标</p>
        </div>
      </div>

      {/* AI Recipe Recommendation */}
      <section>
        <div className="bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl">AI 智能推荐</h2>
          </div>
          <p className="text-white/90 text-sm mb-4">
            根据你的冰箱食材和口味偏好，为你推荐最合适的菜谱
          </p>

          {/* Flavor Selection */}
          <div className="mb-4">
            <h3 className="text-sm text-white/80 mb-2">选择口味类型</h3>
            <div className="grid grid-cols-3 gap-2">
              {flavorTypes.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`py-2 px-3 rounded-xl text-sm transition-all ${
                    selectedFlavor === flavor
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredient Selection Count */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/80">
              已选择 {selectedIngredients.length} 种食材
            </span>
            {selectedIngredients.length > 0 && selectedFlavor && (
              <button
                onClick={handleGetRecommendations}
                className="px-4 py-2 bg-white text-orange-600 rounded-full text-sm hover:shadow-lg transition-all flex items-center gap-1"
              >
                <ChefHat className="w-4 h-4" />
                生成推荐
              </button>
            )}
          </div>
        </div>
      </section>

      {/* AI Recommendations Result */}
      {showRecommendations && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">推荐菜谱</h2>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-sm text-orange-600"
            >
              关闭
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {aiRecommendedRecipes
              .filter(recipe => recipe.flavor === selectedFlavor)
              .map((recipe, index) => (
                <div
                  key={index}
                  onClick={() => navigate('recipe-detail', recipe)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="aspect-square relative">
                    <ImageWithFallback
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500/90 rounded-full text-xs text-white">
                      匹配度 {recipe.match}%
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-base mb-1">{recipe.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span>⏱️ {recipe.time}</span>
                      <span>•</span>
                      <span>🔥 {recipe.difficulty}</span>
                    </div>
                    <div className="text-xs text-green-600">
                      ✓ 使用你的 {recipe.usedIngredients} 种食材
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Fridge Inventory */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧊</span>
            <h2 className="text-xl">冰箱库存</h2>
          </div>
          <button className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors">
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fridgeInventory.map((item, index) => (
            <div
              key={index}
              onClick={() => toggleIngredient(item.name)}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedIngredients.includes(item.name)
                  ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                  : item.status === 'fresh'
                  ? 'border-green-200 bg-green-50'
                  : item.status === 'expiring'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {selectedIngredients.includes(item.name) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{item.icon}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <h3 className="text-base mb-1">{item.name}</h3>
              <div className="text-xs text-gray-600 mb-1">{item.quantity}</div>
              <div className={`text-xs ${
                item.status === 'fresh'
                  ? 'text-green-600'
                  : item.status === 'expiring'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {item.expiry}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredient Tracking */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-500" />
            <h2 className="text-xl">食材记录</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="space-y-3">
            {ingredientStats.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{stat.category}</span>
                  <span className="text-sm">{stat.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stat.color}`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flavor Profile */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎨</span>
          <h2 className="text-xl">风味画像</h2>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-3xl p-6 border-2 border-orange-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {flavorProfile.map((flavor, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{flavor.icon}</div>
                <div className="text-sm text-gray-700 mb-1">{flavor.name}</div>
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < flavor.level ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-center text-gray-600">
            基于你的饮食记录生成的口味偏好
          </p>
        </div>
      </section>

      {/* Preferences & Restrictions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl">偏好与禁忌</h2>
          </div>
          <button className="text-sm text-orange-600">编辑</button>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <h3 className="text-base mb-3 text-green-700">✓ 喜欢的</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.likes.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md">
            <h3 className="text-base mb-3 text-red-700">✗ 禁忌/过敏</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.restrictions.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Health Goals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl">健康目标</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md">
          {healthGoals.map((goal, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{goal.icon}</span>
                  <span className="text-base">{goal.name}</span>
                </div>
                <span className="text-sm">
                  <span className="text-orange-600">{goal.current}</span>
                  <span className="text-gray-400"> / {goal.target}</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${goal.color}`}
                  style={{ width: `${(goal.current / goal.target) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Summary */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl">本周数据</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {weeklyStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-md text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const fridgeInventory = [
  { name: '鸡蛋', icon: '🥚', quantity: '6个', expiry: '还剩5天', status: 'fresh' },
  { name: '牛奶', icon: '🥛', quantity: '1瓶', expiry: '还剩2天', status: 'expiring' },
  { name: '番茄', icon: '🍅', quantity: '3个', expiry: '还剩7天', status: 'fresh' },
  { name: '生菜', icon: '🥬', quantity: '1颗', expiry: '今天过期', status: 'expired' },
  { name: '鸡胸肉', icon: '🍗', quantity: '500g', expiry: '还剩3天', status: 'expiring' },
  { name: '胡萝卜', icon: '🥕', quantity: '4根', expiry: '还剩10天', status: 'fresh' }
];

const ingredientStats = [
  { category: '蔬菜', count: '12种', percentage: 75, color: 'bg-green-500' },
  { category: '肉类', count: '5种', percentage: 50, color: 'bg-red-500' },
  { category: '水果', count: '8种', percentage: 60, color: 'bg-yellow-500' },
  { category: '调味料', count: '15种', percentage: 90, color: 'bg-orange-500' }
];

const flavorProfile = [
  { name: '辣度', icon: '🌶️', level: 4 },
  { name: '甜度', icon: '🍯', level: 3 },
  { name: '酸度', icon: '🍋', level: 2 },
  { name: '咸度', icon: '🧂', level: 3 }
];

const preferences = {
  likes: ['鸡蛋', '番茄', '豆腐', '青菜', '牛肉', '三文鱼'],
  restrictions: ['花生', '芒果', '海鲜过敏', '不吃香菜']
};

const healthGoals = [
  {
    name: '每日卡路里',
    icon: '🔥',
    current: 1650,
    target: 2000,
    color: 'bg-orange-500',
    description: '今天还可以摄入350卡'
  },
  {
    name: '饮水量',
    icon: '💧',
    current: 1500,
    target: 2000,
    color: 'bg-blue-500',
    description: '目标：每天8杯水'
  },
  {
    name: '蛋白质',
    icon: '💪',
    current: 45,
    target: 60,
    color: 'bg-green-500',
    description: '还需要15g达标'
  }
];

const weeklyStats = [
  { icon: '🍽️', value: '18', label: '餐次' },
  { icon: '🥗', value: '12', label: '健康餐' },
  { icon: '🏃', value: '5', label: '运动天' }
];

const flavorTypes = ['甜', '酸', '辣', '咸'];

const aiRecommendedRecipes = [
  {
    title: '番茄炒蛋',
    image: 'https://example.com/tomato-egg.jpg',
    time: '20分钟',
    difficulty: '简单',
    flavor: '甜',
    match: 85,
    usedIngredients: 2
  },
  {
    title: '胡萝卜炒鸡胸肉',
    image: 'https://example.com/carrot-chicken.jpg',
    time: '30分钟',
    difficulty: '中等',
    flavor: '辣',
    match: 90,
    usedIngredients: 2
  },
  {
    title: '生菜沙拉',
    image: 'https://example.com/lettuce-salad.jpg',
    time: '10分钟',
    difficulty: '简单',
    flavor: '酸',
    match: 75,
    usedIngredients: 1
  },
  {
    title: '番茄酱炒牛肉',
    image: 'https://example.com/tomato-beef.jpg',
    time: '40分钟',
    difficulty: '中等',
    flavor: '咸',
    match: 80,
    usedIngredients: 2
  }
];