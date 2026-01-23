import { useState } from 'react';
import { ArrowLeft, Sparkles, Plus, X } from 'lucide-react';

interface WhatToEatScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export default function WhatToEatScreen({ onNavigate, onBack }: WhatToEatScreenProps) {
  const [customInput, setCustomInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleAddCustomItem = () => {
    if (customInput.trim()) {
      setCustomItems([...customItems, customInput.trim()]);
      setCustomInput('');
    }
  };

  const handleRemoveCustomItem = (item: string) => {
    setCustomItems(customItems.filter(i => i !== item));
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const getAllItems = () => {
    let items = [...customItems];
    selectedCategories.forEach(category => {
      const categoryItems = foodCategories.find(c => c.name === category)?.items || [];
      items = [...items, ...categoryItems];
    });
    return items;
  };

  const spinWheel = () => {
    const items = getAllItems();
    if (items.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    const spinDuration = 3000 + Math.random() * 2000;
    const extraRotations = 5 + Math.floor(Math.random() * 3);
    const randomIndex = Math.floor(Math.random() * items.length);
    const degreesPerItem = 360 / items.length;
    const finalRotation = rotation + (extraRotations * 360) + (randomIndex * degreesPerItem);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(items[randomIndex]);
    }, spinDuration);
  };

  const allItems = getAllItems();

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
        <div>
          <h1 className="text-2xl">今天吃什么？</h1>
          <p className="text-sm text-gray-600">转动幸运轮盘，让美食来找你</p>
        </div>
      </div>

      {/* Custom Input */}
      <div className="bg-white rounded-3xl p-5 shadow-lg">
        <h2 className="text-lg mb-3 flex items-center gap-2">
          <span>✍️</span>
          <span>自定义选项</span>
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomItem()}
            placeholder="输入你想吃的美食..."
            className="flex-1 px-4 py-2 border-2 border-orange-200 rounded-full focus:border-orange-400 focus:outline-none"
          />
          <button
            onClick={handleAddCustomItem}
            className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {customItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleRemoveCustomItem(item)}
                  className="hover:bg-orange-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-3xl p-5 shadow-lg">
        <h2 className="text-lg mb-3 flex items-center gap-2">
          <span>🍽️</span>
          <span>选择食物类别</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {foodCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => toggleCategory(category.name)}
              className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                selectedCategories.includes(category.name)
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                  : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
              }`}
            >
              <span className="text-2xl">{category.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-sm">{category.name}</div>
                <div className={`text-xs ${selectedCategories.includes(category.name) ? 'text-white/80' : 'text-gray-500'}`}>
                  {category.items.length} 种
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Wheel */}
      {allItems.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="relative w-full max-w-sm mx-auto">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500" />
            </div>

            {/* Wheel */}
            <div
              className="relative w-full aspect-square rounded-full border-8 border-orange-300 shadow-2xl overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
              }}
            >
              {allItems.map((item, index) => {
                const angle = (360 / allItems.length) * index;
                const colors = ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF4500', '#FF8C00'];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={index}
                    className="absolute top-0 left-1/2 origin-bottom"
                    style={{
                      height: '50%',
                      width: '2px',
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full flex items-start justify-center pt-4"
                      style={{
                        backgroundColor: color,
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        transform: `rotate(${180 / allItems.length}deg)`
                      }}
                    >
                      <span className="text-white text-xs font-bold transform -rotate-90 whitespace-nowrap">
                        {item}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-orange-300 flex items-center justify-center shadow-xl">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="mt-6 w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSpinning ? '转动中...' : '开始转动 🎲'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !isSpinning && (
        <div className="bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl p-8 shadow-2xl text-center animate-bounce">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl text-white mb-2">今天就吃</h2>
          <div className="text-4xl text-white mb-4">{result}</div>
          <button
            onClick={() => onNavigate('explore')}
            className="px-8 py-3 bg-white text-orange-600 rounded-full hover:shadow-lg transition-shadow"
          >
            去探索餐厅
          </button>
        </div>
      )}

      {allItems.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
          <div className="text-6xl mb-4">🤔</div>
          <p className="text-gray-600">请添加自定义选项或选择食物类别</p>
        </div>
      )}
    </div>
  );
}

const foodCategories = [
  {
    name: '中餐',
    icon: '🥢',
    items: ['宫保鸡丁', '麻婆豆腐', '红烧肉', '糖醋排骨', '鱼香肉丝', '水煮鱼']
  },
  {
    name: '西餐',
    icon: '🍝',
    items: ['意大利面', '披萨', '牛排', '汉堡', '沙拉', '浓汤']
  },
  {
    name: '日韩料理',
    icon: '🍣',
    items: ['寿司', '拉面', '天妇罗', '石锅拌饭', '部队锅', '炸鸡']
  },
  {
    name: '火锅烧烤',
    icon: '🍲',
    items: ['麻辣火锅', '清汤火锅', '烤肉', '串串', '烤鱼', '麻辣烫']
  },
  {
    name: '快餐小吃',
    icon: '🍔',
    items: ['炸鸡', '汉堡', '热狗', '炒饭', '炒面', '盖浇饭']
  },
  {
    name: '甜品饮品',
    icon: '🍰',
    items: ['蛋糕', '冰淇淋', '奶茶', '咖啡', '布丁', '泡芙']
  }
];
