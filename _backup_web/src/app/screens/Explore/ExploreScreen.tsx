import { useState } from 'react';
import { Search, MapPin, Tag, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface ExploreScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export default function ExploreScreen({ onNavigate }: ExploreScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl mb-4">探索美食</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索餐厅、菜品、风味、食材..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* What to Eat Today - Featured Section */}
      <section>
        <button
          onClick={() => onNavigate('what-to-eat')}
          className="w-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-bounce">🎲</div>
              <div className="text-left">
                <h2 className="text-2xl text-white mb-1">今天吃什么？</h2>
                <p className="text-white/90 text-sm">转动幸运轮盘，让美食来找你</p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </button>
      </section>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-orange-200 hover:border-orange-300'
            }`}
          >
            <span>{filter.icon}</span>
            <span className="text-sm">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Trending Tags */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl">热门标签</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag, index) => (
            <button
              key={index}
              className="px-4 py-2 bg-white rounded-full text-sm border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl">菜系分类</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="aspect-square bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="text-sm text-center">{category.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Restaurants */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-green-500" />
          <h2 className="text-xl">附近餐厅</h2>
        </div>
        
        <div className="space-y-3">
          {nearbyRestaurants.map((restaurant, index) => (
            <div
              key={index}
              onClick={() => onNavigate('restaurant-detail', restaurant)}
              className="flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <ImageWithFallback
                src={restaurant.image}
                alt={restaurant.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-base mb-1">{restaurant.name}</h3>
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
          ))}
        </div>
      </section>
    </div>
  );
}

const quickFilters = [
  { id: 'all', icon: '🔥', label: '全部' },
  { id: 'nearby', icon: '📍', label: '附近' },
  { id: 'trending', icon: '⭐', label: '热门' },
  { id: 'new', icon: '✨', label: '新店' },
  { id: 'discount', icon: '💰', label: '优惠' }
];

const trendingTags = [
  '麻辣火锅', '日式料理', '西式简餐', '健康轻食', 
  '甜品饮品', '烧烤串串', '川菜', '粤菜'
];

const categories = [
  { icon: '🥢', name: '中餐' },
  { icon: '🍣', name: '日韩料理' },
  { icon: '🍝', name: '西餐' },
  { icon: '🍲', name: '火锅' },
  { icon: '🍢', name: '烧烤' },
  { icon: '🥗', name: '轻食' },
  { icon: '🍰', name: '甜品' },
  { icon: '☕', name: '咖啡' },
  { icon: '🍜', name: '面食' }
];

const nearbyRestaurants = [
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
  },
  {
    name: '意式餐厅',
    cuisine: '意大利菜 · 披萨',
    rating: '4.6',
    distance: '900m',
    price: '¥120/人',
    image: 'https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?w=300',
    tags: ['披萨', '意面', '浪漫'],
    description: '正宗意式风味',
    address: '朝阳区建国门外大街50号',
    phone: '010-56781234',
    hours: '10:00-22:00'
  }
];
