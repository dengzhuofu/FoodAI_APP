import { useState } from 'react';
import { ArrowLeft, Sparkles, Loader, ChefHat } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface TextToRecipeFeatureProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export default function TextToRecipeFeature({ onBack, onNavigate }: TextToRecipeFeatureProps) {
  const [inputText, setInputText] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = () => {
    if (!inputText.trim() || !selectedFlavor) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        title: inputText.trim(),
        time: '25分钟',
        difficulty: '中等',
        calories: '420',
        image: 'https://images.unsplash.com/photo-1591951314140-7b6eef23edf0?w=400',
        flavor: selectedFlavor,
        ingredients: [
          '主要食材 300g',
          '配菜 适量',
          '调味料 适量',
          '食用油 2勺',
          '盐 适量'
        ],
        steps: [
          '准备好所有食材，清洗干净',
          '根据' + selectedFlavor + '口味调配酱汁',
          '热锅凉油，下入主要食材翻炒',
          '加入配菜继续翻炒',
          '倒入调好的酱汁，翻炒均匀',
          '出锅装盘，即可享用'
        ],
        tips: [
          '根据' + selectedFlavor + '口味可适当调整调料用量',
          '食材提前准备好，烹饪过程更流畅',
          '注意火候控制，避免糊锅'
        ]
      });
    }, 2000);
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
        <div>
          <h1 className="text-2xl">文 → 菜谱</h1>
          <p className="text-sm text-gray-600">输入食材或菜名，AI 生成菜谱</p>
        </div>
      </div>

      {/* Input Form */}
      {!isProcessing && !result && (
        <div className="space-y-4">
          {/* Text Input */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              <span>想要做什么菜？</span>
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如：番茄炒蛋、宫保鸡丁、红烧肉&#10;或者输入你有的食材：鸡胸肉、土豆、胡萝卜"
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          {/* Flavor Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg mb-3">选择口味偏好</h2>
            <div className="grid grid-cols-3 gap-3">
              {flavorOptions.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`py-3 px-4 rounded-xl text-sm transition-all ${
                    selectedFlavor === flavor
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-orange-50 text-gray-700 border-2 border-orange-200 hover:border-orange-300'
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!inputText.trim() || !selectedFlavor}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>AI 生成菜谱</span>
          </button>

          {/* Examples */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border-2 border-purple-200">
            <h3 className="text-base mb-3">💡 试试这些</h3>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(example)}
                  className="w-full text-left px-4 py-2 bg-white/60 rounded-lg text-sm hover:bg-white transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center space-y-6">
            <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto" />
            <h2 className="text-xl">AI 正在创作菜谱...</h2>
            <p className="text-sm text-gray-600">
              根据你的需求和口味偏好，为你定制专属菜谱
            </p>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>菜名：</strong>{inputText}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>口味：</strong>{selectedFlavor}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !isProcessing && (
        <div className="space-y-4">
          {/* Success Badge */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-4 shadow-lg text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg">菜谱生成成功！</span>
            </div>
            <p className="text-sm text-white/90">
              已为你定制 <strong>{result.flavor}</strong> 口味的 <strong>{result.title}</strong>
            </p>
          </div>

          {/* Recipe Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-4">
              <ImageWithFallback
                src={result.image}
                alt={result.title}
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>

            <h2 className="text-2xl mb-4">{result.title}</h2>
            
            <div className="flex items-center gap-4 mb-6 pb-4 border-b">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">时间</div>
                <div className="text-base">⏱️ {result.time}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">难度</div>
                <div className="text-base">🔥 {result.difficulty}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">热量</div>
                <div className="text-base">⚡ {result.calories}卡</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">口味</div>
                <div className="text-base">👅 {result.flavor}</div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <h3 className="text-lg mb-3">所需食材</h3>
              <div className="space-y-2">
                {result.ingredients.map((ingredient: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl"
                  >
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="mb-6">
              <h3 className="text-lg mb-3">烹饪步骤</h3>
              <div className="space-y-4">
                {result.steps.map((step: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200 mb-6">
              <h3 className="text-base mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>烹饪小贴士</span>
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {result.tips.map((tip: string, index: number) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('recipe-detail', result)}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-shadow"
              >
                查看完整菜谱
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setInputText('');
                  setSelectedFlavor('');
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                重新生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const flavorOptions = ['清淡', '香辣', '酸甜', '咸鲜', '麻辣', '家常', '健康', '重口', '甜'];

const examples = [
  '番茄炒蛋',
  '用鸡胸肉、胡萝卜、土豆做一道菜',
  '红烧肉',
  '健康低脂的晚餐'
];
