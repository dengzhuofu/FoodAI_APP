import { useState } from 'react';
import { Camera, Refrigerator, Wand2, Flame, Mic, Sparkles, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import ImageToRecipeFeature from './features/ImageToRecipeFeature';
import ImageToCalorieFeature from './features/ImageToCalorieFeature';
import TextToImageFeature from './features/TextToImageFeature';
import TextToRecipeFeature from './features/TextToRecipeFeature';
import FridgeToRecipeFeature from './features/FridgeToRecipeFeature';
import VoiceAssistantFeature from './features/VoiceAssistantFeature';

type AIFeature = 'image-to-recipe' | 'image-to-calorie' | 'text-to-image' | 'text-to-recipe' | 'fridge-to-recipe' | 'voice-assistant' | null;

interface AIKitchenScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export default function AIKitchenScreen({ onNavigate }: AIKitchenScreenProps) {
  const [activeFeature, setActiveFeature] = useState<AIFeature>(null);

  if (activeFeature) {
    const handleBack = () => setActiveFeature(null);

    switch (activeFeature) {
      case 'image-to-recipe':
        return <ImageToRecipeFeature onBack={handleBack} onNavigate={onNavigate} />;
      case 'image-to-calorie':
        return <ImageToCalorieFeature onBack={handleBack} />;
      case 'text-to-image':
        return <TextToImageFeature onBack={handleBack} />;
      case 'text-to-recipe':
        return <TextToRecipeFeature onBack={handleBack} onNavigate={onNavigate} />;
      case 'fridge-to-recipe':
        return <FridgeToRecipeFeature onBack={handleBack} onNavigate={onNavigate} />;
      case 'voice-assistant':
        return <VoiceAssistantFeature onBack={handleBack} />;
      default:
        return null;
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-7 h-7 text-orange-500" />
          <h1 className="text-2xl">AI 厨房</h1>
        </div>
        <p className="text-sm text-gray-600">用 AI 让烹饪变得简单又有趣</p>
      </div>

      {/* My Kitchen - Entrance Card */}
      <button
        onClick={() => onNavigate('my-kitchen')}
        className="w-full bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur">
              🧊
            </div>
            <div className="text-left">
              <h2 className="text-xl text-white mb-1">我的冰箱</h2>
              <p className="text-white/90 text-sm">管理食材，智能推荐菜谱</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
        </div>
      </button>

      {/* AI Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        {aiFeatures.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveFeature(feature.id as AIFeature)}
            className="relative p-6 rounded-3xl cursor-pointer transition-all bg-white text-gray-800 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
            {feature.badge && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs">
                {feature.badge}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Recent AI Results */}
      <section>
        <h2 className="text-xl mb-4">最近生成</h2>
        <div className="space-y-3">
          {recentResults.map((result, index) => (
            <div
              key={index}
              className="flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <ImageWithFallback
                src={result.image}
                alt={result.title}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{result.icon}</span>
                  <h3 className="text-base">{result.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                <span className="text-xs text-gray-400">{result.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const aiFeatures = [
  {
    id: 'image-to-recipe',
    icon: <Camera className="w-8 h-8 text-orange-600" />,
    title: '图 → 菜谱',
    description: '拍照识别食物，生成菜谱',
    badge: '热门'
  },
  {
    id: 'image-to-calorie',
    icon: <Flame className="w-8 h-8 text-red-600" />,
    title: '图 → 卡路里',
    description: '识别营养成分',
    badge: null
  },
  {
    id: 'text-to-image',
    icon: <Wand2 className="w-8 h-8 text-purple-600" />,
    title: '文 → 图',
    description: '描述美食，AI生成图片',
    badge: 'AI'
  },
  {
    id: 'text-to-recipe',
    icon: <Sparkles className="w-8 h-8 text-blue-600" />,
    title: '文 → 菜谱',
    description: '输入食材，生成菜谱',
    badge: null
  },
  {
    id: 'fridge-to-recipe',
    icon: <Refrigerator className="w-8 h-8 text-teal-600" />,
    title: '冰箱 → 菜谱',
    description: '基于库存推荐',
    badge: '智能'
  },
  {
    id: 'voice-assistant',
    icon: <Mic className="w-8 h-8 text-pink-600" />,
    title: '语音助手',
    description: '边做边问，实时指导',
    badge: null
  }
];

const recentResults = [
  {
    icon: '📸',
    title: '宫保鸡丁',
    description: 'AI 识别并生成了详细菜谱',
    time: '2小时前',
    image: 'https://images.unsplash.com/photo-1649611437898-d0bc2390aa88?w=300'
  },
  {
    icon: '✨',
    title: '番茄炒蛋',
    description: '基于你的食材生成推荐',
    time: '昨天',
    image: 'https://images.unsplash.com/photo-1591951314140-7b6eef23edf0?w=300'
  }
];
