import { ArrowLeft, Refrigerator, Sparkles } from 'lucide-react';

interface FridgeToRecipeFeatureProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export default function FridgeToRecipeFeature({ onBack, onNavigate }: FridgeToRecipeFeatureProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 space-y-6">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl">冰箱 → 菜谱</h1>
          <p className="text-sm text-gray-600">基于库存智能推荐</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <Refrigerator className="w-8 h-8" />
          <h2 className="text-xl">智能冰箱推荐</h2>
        </div>
        <p className="text-white/90 mb-4">
          此功能将根据你冰箱中的食材，结合口味偏好，智能推荐最合适的菜谱。
        </p>
        <button
          onClick={() => onNavigate('my-kitchen')}
          className="w-full py-3 bg-white text-teal-600 rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>前往我的冰箱</span>
        </button>
      </div>
    </div>
  );
}
