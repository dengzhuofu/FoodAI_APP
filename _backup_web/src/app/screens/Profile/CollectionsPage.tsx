import { useState } from 'react';
import { ArrowLeft, Heart, Utensils, Store, Filter } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface CollectionsPageProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export default function CollectionsPage({ onBack, onNavigate }: CollectionsPageProps) {
  const [activeTab, setActiveTab] = useState<'recipes' | 'restaurants'>('recipes');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 space-y-6">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl">我的收藏</h1>
          <p className="text-sm text-gray-600">共 {activeTab === 'recipes' ? recipeCollections.length : restaurantCollections.length} 个收藏</p>
        </div>
        <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
            activeTab === 'recipes'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-orange-200'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span>菜谱</span>
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
            activeTab === 'restaurants'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-orange-200'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>餐厅</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'recipes' && (
          <>
            {recipeCollections.map((recipe, index) => (
              <div
                key={index}
                onClick={() => onNavigate('recipe-detail', recipe)}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base">{recipe.title}</h3>
                      <button className="p-1">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span>⏱️ {recipe.time}</span>
                      <span>•</span>
                      <span>🔥 {recipe.difficulty}</span>
                      <span>•</span>
                      <span>⚡ {recipe.calories}卡</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{recipe.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'restaurants' && (
          <>
            {restaurantCollections.map((restaurant, index) => (
              <div
                key={index}
                onClick={() => onNavigate('restaurant-detail', restaurant)}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base">{restaurant.name}</h3>
                      <button className="p-1">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>⭐ {restaurant.rating}</span>
                      <span>•</span>
                      <span>📍 {restaurant.distance}</span>
                      <span>•</span>
                      <span>{restaurant.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Empty State */}
      {((activeTab === 'recipes' && recipeCollections.length === 0) ||
        (activeTab === 'restaurants' && restaurantCollections.length === 0)) && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">💝</div>
          <h2 className="text-xl mb-2">还没有收藏</h2>
          <p className="text-sm text-gray-600 mb-6">
            快去探索你喜欢的{activeTab === 'recipes' ? '菜谱' : '餐厅'}吧
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="px-8 py-3 bg-orange-500 text-white rounded-2xl hover:shadow-lg transition-shadow"
          >
            去探索
          </button>
        </div>
      )}
    </div>
  );
}

const recipeCollections = [
  {
    title: '番茄炒蛋',
    time: '15分钟',
    difficulty: '简单',
    calories: '280',
    image: 'https://images.unsplash.com/photo-1591951314140-7b6eef23edf0?w=400',
    description: '经典家常菜，营养美味又简单',
    ingredients: ['番茄 2个', '鸡蛋 3个', '葱花 适量', '盐 适量', '糖 1勺', '食用油 适量'],
    steps: ['鸡蛋打散', '番茄切块', '炒蛋', '炒番茄', '混合翻炒']
  },
  {
    title: '宫保鸡丁',
    time: '25分钟',
    difficulty: '中等',
    calories: '380',
    image: 'https://images.unsplash.com/photo-1649611437898-d0bc2390aa88?w=400',
    description: '经典川菜，麻辣鲜香',
    ingredients: ['鸡胸肉 300g', '花生米 50g', '干辣椒 10个'],
    steps: ['腌制鸡肉', '炸花生', '炒制', '调味', '出锅']
  },
  {
    title: '红烧肉',
    time: '60分钟',
    difficulty: '中等',
    calories: '520',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    description: '色泽红亮，肥而不腻',
    ingredients: ['五花肉 500g', '冰糖 适量', '酱油 适量'],
    steps: ['焯水', '炒糖色', '炖煮', '收汁']
  }
];

const restaurantCollections = [
  {
    name: '川渝小馆',
    cuisine: '川菜 · 火锅',
    rating: '4.8',
    distance: '300m',
    price: '¥60/人',
    image: 'https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?w=300',
    tags: ['麻辣火锅', '毛血旺', '推荐'],
    description: '地道川味，麻辣鲜香',
    address: '朝阳区三里屯路88号',
    phone: '010-12345678',
    hours: '11:00-23:00'
  },
  {
    name: '寿司之家',
    cuisine: '日本料理 · 寿司',
    rating: '4.7',
    distance: '650m',
    price: '¥150/人',
    image: 'https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?w=300',
    tags: ['寿司', '刺身', '精致'],
    description: '新鲜食材，匠心制作',
    address: '海淀区中关村大街100号',
    phone: '010-87654321',
    hours: '11:30-22:00'
  }
];
