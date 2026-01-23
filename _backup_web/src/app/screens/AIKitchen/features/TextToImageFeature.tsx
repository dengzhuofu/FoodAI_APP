import { ArrowLeft, Wand2, Loader } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface TextToImageFeatureProps {
  onBack: () => void;
}

export default function TextToImageFeature({ onBack }: TextToImageFeatureProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 space-y-6">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl">文 → 图</h1>
          <p className="text-sm text-gray-600">描述美食，AI 生成图片</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg mb-3">描述你想看到的美食</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例如：一盘热气腾腾的红烧肉，色泽红亮，摆盘精致"
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none"
          rows={4}
        />
        <button
          onClick={handleGenerate}
          disabled={!description.trim() || isGenerating}
          className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Wand2 className="w-5 h-5" />
          <span>{isGenerating ? '生成中...' : 'AI 生成图片'}</span>
        </button>
      </div>

      {isGenerating && (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl">AI 正在创作中...</h2>
          <p className="text-sm text-gray-600 mt-2">根据你的描述生成精美的美食图片</p>
        </div>
      )}

      {generatedImage && !isGenerating && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <ImageWithFallback src={generatedImage} alt="Generated" className="w-full h-96 object-cover rounded-xl mb-4" />
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:shadow-lg transition-shadow">下载图片</button>
            <button onClick={() => { setGeneratedImage(null); setDescription(''); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">重新生成</button>
          </div>
        </div>
      )}
    </div>
  );
}
