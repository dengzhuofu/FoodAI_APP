import { useState } from 'react';
import { ArrowLeft, Camera, Upload, Sparkles, Loader } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface ImageToRecipeFeatureProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export default function ImageToRecipeFeature({ onBack, onNavigate }: ImageToRecipeFeatureProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = () => {
    // 模拟上传和AI处理
    setUploadedImage('https://images.unsplash.com/photo-1649611437898-d0bc2390aa88?w=600');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        name: '宫保鸡丁',
        confidence: 95,
        title: '宫保鸡丁',
        time: '25分钟',
        difficulty: '中等',
        calories: '380',
        image: 'https://images.unsplash.com/photo-1649611437898-d0bc2390aa88?w=400',
        ingredients: [
          '鸡胸肉 300g',
          '花生米 50g',
          '干辣椒 10个',
          '花椒 1勺',
          '葱姜蒜 适量',
          '宫保汁（酱油、醋、糖、淀粉）'
        ],
        steps: [
          '鸡肉切丁，用料酒、盐、淀粉腌制15分钟',
          '热油炸花生米至金黄色，捞出备用',
          '锅中油烧热，炒干辣椒和花椒至香',
          '下鸡丁大火快炒至变色',
          '加入宫保汁翻炒均匀',
          '最后加入花生米，翻炒几下即可出锅'
        ]
      });
    }, 2500);
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
          <h1 className="text-2xl">图 → 菜谱</h1>
          <p className="text-sm text-gray-600">拍照识别食物，AI 生成菜谱</p>
        </div>
      </div>

      {/* Upload Area */}
      {!uploadedImage && (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-xl">上传食物照片</h2>
            <p className="text-sm text-gray-600">
              AI 将识别食物并为你生成详细的烹饪菜谱
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleImageUpload}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-orange-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <Camera className="w-10 h-10 text-orange-500" />
                <span className="text-sm">拍照</span>
              </button>
              
              <button
                onClick={handleImageUpload}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-orange-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <Upload className="w-10 h-10 text-orange-500" />
                <span className="text-sm">相册</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center space-y-6">
            <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto" />
            <h2 className="text-xl">AI 正在分析中...</h2>
            <p className="text-sm text-gray-600">
              正在识别食物并生成菜谱，请稍候
            </p>
            {uploadedImage && (
              <ImageWithFallback
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-64 object-cover rounded-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && !isProcessing && (
        <div className="space-y-4">
          {/* Confidence Badge */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-4 shadow-lg text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg">识别成功！</span>
            </div>
            <p className="text-sm text-white/90">
              AI 识别为：<strong>{result.name}</strong>（置信度 {result.confidence}%）
            </p>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <ImageWithFallback
              src={result.image}
              alt={result.title}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Recipe Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
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
                  setUploadedImage(null);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                重新识别
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
