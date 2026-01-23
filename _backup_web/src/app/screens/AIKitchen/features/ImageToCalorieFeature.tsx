import { ArrowLeft, Camera, Upload, Loader } from 'lucide-react';
import { useState } from 'react';

interface ImageToCalorieFeatureProps {
  onBack: () => void;
}

export default function ImageToCalorieFeature({ onBack }: ImageToCalorieFeatureProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        food: '番茄炒蛋',
        totalCalories: 280,
        nutrients: [
          { name: '蛋白质', value: '12g', percentage: 15 },
          { name: '碳水化合物', value: '24g', percentage: 30 },
          { name: '脂肪', value: '18g', percentage: 25 },
          { name: '纤维', value: '3g', percentage: 12 }
        ]
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 space-y-6">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl">图 → 卡路里</h1>
          <p className="text-sm text-gray-600">识别食物营养成分</p>
        </div>
      </div>

      {!isProcessing && !result && (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🔥</div>
            <h2 className="text-xl">上传食物照片</h2>
            <p className="text-sm text-gray-600">AI 将识别食物并计算卡路里和营养成分</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={handleAnalyze} className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-orange-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all">
                <Camera className="w-10 h-10 text-orange-500" />
                <span className="text-sm">拍照</span>
              </button>
              
              <button onClick={handleAnalyze} className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-orange-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all">
                <Upload className="w-10 h-10 text-orange-500" />
                <span className="text-sm">相册</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl">AI 正在分析营养成分...</h2>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl mb-4">{result.food}</h2>
            <div className="text-center py-6 bg-gradient-to-r from-orange-100 to-rose-100 rounded-2xl mb-6">
              <div className="text-5xl text-orange-600 mb-2">{result.totalCalories}</div>
              <div className="text-sm text-gray-600">总卡路里 (kcal)</div>
            </div>

            <h3 className="text-lg mb-4">营养成分</h3>
            {result.nutrients.map((nutrient: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>{nutrient.name}</span>
                  <span className="text-orange-600">{nutrient.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${nutrient.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
