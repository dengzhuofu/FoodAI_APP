import { useState } from 'react';
import { ArrowLeft, Sparkles, Save, Plus, X } from 'lucide-react';

interface FlavorProfilePageProps {
  onBack: () => void;
}

export default function FlavorProfilePage({ onBack }: FlavorProfilePageProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(['香辣', '家常']);
  const [allergies, setAllergies] = useState<string[]>(['花生', '海鲜']);
  const [newAllergy, setNewAllergy] = useState('');
  const [healthGoal, setHealthGoal] = useState('均衡饮食');

  const toggleFlavor = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
    } else {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

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
          <h1 className="text-2xl">风味画像</h1>
          <p className="text-sm text-gray-600">个性化你的美食体验</p>
        </div>
      </div>

      {/* Flavor Profile Summary */}
      <div className="bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl">你的风味画像</h2>
        </div>
        <div className="bg-white/20 rounded-2xl p-4 backdrop-blur">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl mb-1">{selectedFlavors.length}</div>
              <div className="text-xs text-white/80">偏好口味</div>
            </div>
            <div>
              <div className="text-2xl mb-1">{allergies.length}</div>
              <div className="text-xs text-white/80">过敏原</div>
            </div>
            <div>
              <div className="text-2xl mb-1">1</div>
              <div className="text-xs text-white/80">健康目标</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flavor Preferences */}
      <section>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg mb-4">口味偏好</h2>
          <p className="text-sm text-gray-600 mb-4">选择你喜欢的口味类型（可多选）</p>
          
          <div className="grid grid-cols-3 gap-3">
            {flavorOptions.map((flavor) => (
              <button
                key={flavor}
                onClick={() => toggleFlavor(flavor)}
                className={`py-3 px-4 rounded-xl text-sm transition-all ${
                  selectedFlavors.includes(flavor)
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-orange-50 text-gray-700 border-2 border-orange-200 hover:border-orange-300'
                }`}
              >
                {flavor}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Allergies & Restrictions */}
      <section>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg mb-4">过敏与禁忌</h2>
          <p className="text-sm text-gray-600 mb-4">添加你过敏或不能食用的食材</p>
          
          {/* Current Allergies */}
          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {allergies.map((allergy) => (
                <div
                  key={allergy}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-full"
                >
                  <span>{allergy}</span>
                  <button
                    onClick={() => removeAllergy(allergy)}
                    className="hover:bg-red-200 rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Allergy */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
              placeholder="输入过敏食材..."
              className="flex-1 px-4 py-2 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none"
            />
            <button
              onClick={addAllergy}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Common Allergies */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">常见过敏原：</p>
            <div className="flex flex-wrap gap-2">
              {commonAllergies.map((allergy) => (
                <button
                  key={allergy}
                  onClick={() => {
                    if (!allergies.includes(allergy)) {
                      setAllergies([...allergies, allergy]);
                    }
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  + {allergy}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Health Goals */}
      <section>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg mb-4">健康目标</h2>
          <p className="text-sm text-gray-600 mb-4">选择你的饮食健康目标</p>
          
          <div className="space-y-3">
            {healthGoals.map((goal) => (
              <button
                key={goal.value}
                onClick={() => setHealthGoal(goal.value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  healthGoal === goal.value
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{goal.icon}</div>
                  <div className="flex-1">
                    <div className="text-base mb-1">{goal.label}</div>
                    <div className={`text-sm ${healthGoal === goal.value ? 'text-white/90' : 'text-gray-500'}`}>
                      {goal.description}
                    </div>
                  </div>
                  {healthGoal === goal.value && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisine Preferences */}
      <section>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg mb-4">菜系偏好</h2>
          <p className="text-sm text-gray-600 mb-4">你最喜欢的菜系</p>
          
          <div className="grid grid-cols-3 gap-3">
            {cuisineOptions.map((cuisine) => (
              <div
                key={cuisine.name}
                className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all"
              >
                <div className="text-3xl">{cuisine.icon}</div>
                <span className="text-sm">{cuisine.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mb-8">
        <Save className="w-5 h-5" />
        <span>保存设置</span>
      </button>
    </div>
  );
}

const flavorOptions = [
  '清淡', '香辣', '麻辣', '酸甜', '咸鲜',
  '家常', '重口', '微辣', '甜', '鲜',
  '酸', '咸', '苦', '辛', '鲜香'
];

const commonAllergies = [
  '花生', '海鲜', '牛奶', '鸡蛋', '小麦', '大豆', '坚果', '芝麻'
];

const healthGoals = [
  {
    value: '均衡饮食',
    label: '均衡饮食',
    icon: '⚖️',
    description: '营养全面，保持健康'
  },
  {
    value: '低脂减重',
    label: '低脂减重',
    icon: '🏃',
    description: '控制热量，健康减肥'
  },
  {
    value: '增肌塑形',
    label: '增肌塑形',
    icon: '💪',
    description: '高蛋白，增强体质'
  },
  {
    value: '控糖健康',
    label: '控糖健康',
    icon: '🩺',
    description: '低糖低GI，血糖平稳'
  },
  {
    value: '素食主义',
    label: '素食主义',
    icon: '🥬',
    description: '植物性饮食，环保健康'
  }
];

const cuisineOptions = [
  { icon: '🥢', name: '中餐' },
  { icon: '🍣', name: '日料' },
  { icon: '🍝', name: '西餐' },
  { icon: '🌮', name: '墨西哥' },
  { icon: '🍛', name: '印度' },
  { icon: '🍜', name: '东南亚' },
  { icon: '🥘', name: '中东' },
  { icon: '🍕', name: '意大利' },
  { icon: '🥗', name: '地中海' }
];
