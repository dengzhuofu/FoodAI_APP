import { Sparkles, Store, Utensils, Heart, ChefHat } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface RecommendScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export default function RecommendScreen({ onNavigate }: RecommendScreenProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-4xl">👋</div>
          <div>
            <h1 className="text-2xl">FoodAI</h1>
            <p className="text-sm text-gray-600">发现你的下一顿美味</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl">AI 为你推荐</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {aiRecommendations.map((item, index) => (
            <div
              key={index}
              onClick={() => onNavigate('recipe-detail', item)}
              className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white cursor-pointer"
            >
              <div className="aspect-[4/5] relative">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="inline-block px-3 py-1 bg-orange-500/90 rounded-full text-xs mb-2">
                    {item.tag}
                  </div>
                  <h3 className="text-lg mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-200">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store Explorations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl">探店精选</h2>
          </div>
          <button 
            onClick={() => onNavigate('explore')}
            className="text-sm text-orange-600"
          >
            查看更多
          </button>
        </div>
        
        <div className="space-y-4">
          {storeRecommendations.map((store, index) => (
            <div
              key={index}
              onClick={() => onNavigate('restaurant-detail', store)}
              className="flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <ImageWithFallback
                src={store.image}
                alt={store.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg mb-1">{store.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{store.cuisine}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>⭐ {store.rating}</span>
                  <span>•</span>
                  <span>📍 {store.distance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recipe Content */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl">热门菜谱</h2>
          </div>
          <button 
            onClick={() => onNavigate('ai-kitchen')}
            className="flex items-center gap-1 text-sm text-orange-600"
          >
            <ChefHat className="w-4 h-4" />
            AI生成
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {recipeRecommendations.map((recipe, index) => (
            <div
              key={index}
              onClick={() => onNavigate('recipe-detail', recipe)}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-square relative">
                <ImageWithFallback
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="text-base mb-1">{recipe.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>⏱️ {recipe.time}</span>
                  <span>•</span>
                  <span>🔥 {recipe.difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Health Content */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl">健康资讯</h2>
          </div>
          <button className="text-sm text-orange-600">查看更多</button>
        </div>
        
        <div className="space-y-3">
          {healthContent.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-4 border-2 border-pink-200"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const aiRecommendations = [
  {
    image: 'https://images.unsplash.com/photo-1646299501330-c46c84c0c936?w=400',
    title: '麻辣香锅',
    description: '根据你的口味偏好',
    tag: 'AI推荐',
    time: '30分钟',
    difficulty: '中等',
    calories: '580',
    ingredients: ['猪肉 200g', '土豆 1个', '莲藕 150g', '青菜 适量', '豆皮 适量', '麻辣香锅底料 1包'],
    steps: ['将所有食材洗净切块', '锅中烧油，下入香锅底料炒香', '加入肉类翻炒至变色', '依次加入蔬菜类食材翻炒', '调味后即可出锅']
  },
  {
    image: 'https://images.unsplash.com/photo-1649611437898-d0bc2390aa88?w=400',
    title: '日式拉面',
    description: '附近新开店铺',
    tag: 'AI推荐',
    time: '45分钟',
    difficulty: '中等',
    calories: '520',
    ingredients: ['拉面 1份', '猪骨高汤 500ml', '叉烧肉 3片', '溏心蛋 1个', '笋干 适量', '海苔 2片'],
    steps: ['准备猪骨高汤煮沸', '煮面条至8分熟', '将面条捞出放入碗中', '倒入热汤', '摆上叉烧、溏心蛋等配料']
  },
  {
    image: 'https://images.unsplash.com/photo-1662197480393-2a82030b7b83?w=400',
    title: '意式千层面',
    description: '营养均衡搭配',
    tag: 'AI推荐',
    time: '60分钟',
    difficulty: '较难',
    calories: '650',
    ingredients: ['千层面皮 250g', '牛肉馅 300g', '番茄酱 200g', '马苏里拉奶酪 150g', '洋葱 1个', '大蒜 3瓣'],
    steps: ['制作肉酱：炒香洋葱大蒜，加入牛肉馅炒熟，加番茄酱煮20分钟', '准备白酱', '在烤盘中交替铺上面皮、肉酱、白酱和奶酪', '重复3-4层', '烤箱180度烤30分钟']
  },
  {
    image: 'https://images.unsplash.com/photo-1737700087841-f2bc25eb0b10?w=400',
    title: '法式甜点',
    description: '今日特别推荐',
    tag: 'AI推荐',
    time: '90分钟',
    difficulty: '较难',
    calories: '420',
    ingredients: ['鸡蛋 3个', '低筋面粉 120g', '黄油 80g', '细砂糖 100g', '牛奶 50ml', '香草精 少许'],
    steps: ['黄油室温软化，加糖打发', '分次加入鸡蛋液搅拌均匀', '筛入低筋面粉', '加入牛奶和香草精', '烤箱预热180度，烤25分钟']
  }
];

const storeRecommendations = [
  {
    name: '小龙虾大排档',
    cuisine: '川菜 · 海鲜',
    rating: '4.8',
    distance: '500m',
    price: '¥80/人',
    image: 'https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?w=300',
    tags: ['麻辣小龙虾', '蒜蓉虾', '推荐'],
    description: '地道的川式小龙虾，麻辣鲜香，食材新鲜。特别推荐他们家的麻辣小龙虾和蒜蓉虾，分量足，性价比高。',
    address: '朝阳区三里屯路88号',
    phone: '010-12345678',
    hours: '11:00-23:00'
  },
  {
    name: '意大利小厨',
    cuisine: '意大利菜 · 西餐',
    rating: '4.6',
    distance: '1.2km',
    price: '¥120/人',
    image: 'https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?w=300',
    tags: ['披萨', '意面', '环境好'],
    description: '正宗意式风味,主厨是意大利人。披萨饼底薄脆，意面酱汁浓郁，提拉米苏必点！环境优雅，适合约会。',
    address: '海淀区中关村大街100号',
    phone: '010-87654321',
    hours: '10:00-22:00'
  }
];

const recipeRecommendations = [
  {
    title: '番茄炒蛋',
    time: '15分钟',
    difficulty: '简单',
    calories: '280',
    image: 'https://images.unsplash.com/photo-1591951314140-7b6eef23edf0?w=400',
    ingredients: ['番茄 2个', '鸡蛋 3个', '葱花 适量', '盐 适量', '糖 1勺', '食用油 适量'],
    steps: ['鸡蛋打散，加少许盐', '锅中热油，倒入蛋液炒至凝固后盛出', '番茄切块', '锅中少许油，炒番茄至出汁', '加入炒好的鸡蛋，加盐和糖调味', '撒上葱花即可出锅']
  },
  {
    title: '宫保鸡丁',
    time: '25分钟',
    difficulty: '中等',
    calories: '380',
    image: 'https://images.unsplash.com/photo-1649611437898-d0bc2390aa88?w=400',
    ingredients: ['鸡胸肉 300g', '花生米 50g', '干辣椒 10个', '花椒 1勺', '葱姜蒜 适量', '宫保汁'],
    steps: ['鸡肉切丁，腌制15分钟', '热油炸花生米至金黄', '锅中油烧热，炒干辣椒和花椒', '下鸡丁炒至变色', '加入宫保汁翻炒', '最后加入花生米即可']
  },
  {
    title: '健康沙拉',
    time: '10分钟',
    difficulty: '简单',
    calories: '180',
    image: 'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?w=400',
    ingredients: ['生菜 1颗', '紫甘蓝 50g', '圣女果 10个', '鸡胸肉 100g', '沙拉酱 适量'],
    steps: ['蔬菜洗净切块', '鸡胸肉煮熟切片', '所有食材混合', '淋上沙拉酱即可']
  },
  {
    title: '意面料理',
    time: '20分钟',
    difficulty: '简单',
    calories: '450',
    image: 'https://images.unsplash.com/photo-1662197480393-2a82030b7b83?w=400',
    ingredients: ['意大利面 200g', '番茄酱 100g', '培根 50g', '洋葱 半个', '大蒜 2瓣', '帕尔玛干酪'],
    steps: ['煮意面至8分熟', '培根切小块煎香', '加入洋葱和大蒜炒香', '加番茄酱煮3分钟', '放入意面翻炒均匀', '撒上帕尔玛干酪']
  }
];

const healthContent = [
  {
    icon: '🥗',
    title: '如何平衡膳食营养',
    description: '每日摄入5种不同颜色的蔬果，保证营养均衡'
  },
  {
    icon: '💪',
    title: '健康饮食小贴士',
    description: '少油少盐，多吃粗粮，保持健康体重'
  }
];
