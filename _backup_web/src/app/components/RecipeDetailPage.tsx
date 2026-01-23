import { ArrowLeft, Clock, Flame, Heart, Share2, BookmarkPlus, ChefHat } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { PageType } from '@/app/App';
import { useState } from 'react';

interface RecipeDetailPageProps {
  navigate: (page: PageType, data?: any) => void;
  recipe: any;
}

export default function RecipeDetailPage({ navigate, recipe }: RecipeDetailPageProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');

  if (!recipe) {
    return (
      <div className="p-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-orange-600">
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <p className="mt-4">未找到菜谱信息</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header Image */}
      <div className="relative h-80">
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate('home')}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isFavorited ? 'bg-rose-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl mb-2">{recipe.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.time}
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              {recipe.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {recipe.calories} 卡
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <ChefHat className="w-5 h-5" />
            开始烹饪
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <BookmarkPlus className="w-5 h-5 text-orange-500" />
          </button>
        </div>

        {/* Nutrition Info */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg mb-3">营养成分</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="text-2xl mb-1">{recipe.calories}</div>
              <div className="text-xs text-gray-600">热量(卡)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl mb-1">25g</div>
              <div className="text-xs text-gray-600">蛋白质</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-2xl mb-1">15g</div>
              <div className="text-xs text-gray-600">脂肪</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <div className="text-2xl mb-1">40g</div>
              <div className="text-xs text-gray-600">碳水</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white rounded-full p-1 shadow-lg">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-3 rounded-full transition-all ${
              activeTab === 'ingredients'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-600'
            }`}
          >
            食材清单
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-3 rounded-full transition-all ${
              activeTab === 'steps'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-600'
            }`}
          >
            烹饪步骤
          </button>
        </div>

        {/* Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg mb-4">所需食材</h2>
            <div className="space-y-3">
              {recipe.ingredients?.map((ingredient: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl border-2 border-orange-100"
                >
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <span className="flex-1">{ingredient}</span>
                  <input type="checkbox" className="w-5 h-5 text-orange-500" />
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 rounded-xl hover:shadow-md transition-shadow">
              + 添加到购物清单
            </button>
          </div>
        )}

        {/* Steps */}
        {activeTab === 'steps' && (
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg mb-4">烹饪步骤</h2>
            <div className="space-y-4">
              {recipe.steps?.map((step: string, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl p-4 border-2 border-orange-100">
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-5 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="text-lg mb-2">烹饪小贴士</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 食材提前准备好，烹饪过程更流畅</li>
                <li>• 注意火候控制，避免糊锅</li>
                <li>• 可根据个人口味调整调料用量</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl p-5 shadow-lg mb-4">
          <h2 className="text-lg mb-4">用户评价 (128)</h2>
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{comment.name}</span>
                      <span className="text-xs text-gray-400">{comment.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < comment.rating ? 'text-orange-500' : 'text-gray-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const comments = [
  {
    avatar: '👨',
    name: '美食爱好者',
    date: '2天前',
    rating: 5,
    text: '按照步骤做出来很成功！家人都说好吃，谢谢分享！'
  },
  {
    avatar: '👩',
    name: '小厨娘',
    date: '5天前',
    rating: 4,
    text: '味道不错，就是火候需要多练习几次才能掌握好。'
  },
  {
    avatar: '👨',
    name: '厨房新手',
    date: '1周前',
    rating: 5,
    text: '步骤很详细，新手也能轻松上手！'
  }
];
