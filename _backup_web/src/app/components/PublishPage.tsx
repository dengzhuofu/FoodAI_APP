import { useState } from 'react';
import { X, Camera, MapPin, Tag, Image as ImageIcon } from 'lucide-react';
import { PageType } from '@/app/App';

interface PublishPageProps {
  navigate: (page: PageType, data?: any) => void;
  onClose: () => void;
}

export default function PublishPage({ navigate, onClose }: PublishPageProps) {
  const [publishType, setPublishType] = useState<'recipe' | 'visit' | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handlePublish = () => {
    // 模拟发布
    alert('发布成功！');
    navigate('profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-6">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-2xl">发布内容</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Type Selection */}
      {!publishType && (
        <div className="space-y-4">
          <h2 className="text-lg mb-4">选择发布类型</h2>
          
          <button
            onClick={() => setPublishType('recipe')}
            className="w-full p-6 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center text-3xl">
                📖
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl mb-1">美食笔记</h3>
                <p className="text-sm text-gray-600">分享你的拿手菜谱</p>
              </div>
              <div className="text-orange-500 text-2xl">→</div>
            </div>
          </button>

          <button
            onClick={() => setPublishType('visit')}
            className="w-full p-6 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center text-3xl">
                📍
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl mb-1">探店足迹</h3>
                <p className="text-sm text-gray-600">记录你的探店体验</p>
              </div>
              <div className="text-blue-500 text-2xl">→</div>
            </div>
          </button>
        </div>
      )}

      {/* Recipe Form */}
      {publishType === 'recipe' && (
        <div className="space-y-4">
          {/* Images Upload */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">上传图片</h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="aspect-square border-2 border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-xs">拍照</span>
              </button>
              <button className="aspect-square border-2 border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-xs">相册</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">菜谱名称</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：家常番茄炒蛋"
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none"
            />
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">食材清单</h3>
            <textarea
              placeholder="每行一个食材，例如：&#10;番茄 2个&#10;鸡蛋 3个&#10;葱花 适量"
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">烹饪步骤</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="详细描述烹饪步骤..."
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none"
              rows={6}
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">添加标签</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="添加标签..."
                className="flex-1 px-4 py-2 border-2 border-orange-200 rounded-full focus:border-orange-400 focus:outline-none"
              />
              <button
                onClick={handleAddTag}
                className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                添加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            发布菜谱
          </button>
        </div>
      )}

      {/* Visit Form */}
      {publishType === 'visit' && (
        <div className="space-y-4">
          {/* Images Upload */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">上传图片</h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="aspect-square border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-xs">拍照</span>
              </button>
              <button className="aspect-square border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-xs">相册</span>
              </button>
            </div>
          </div>

          {/* Restaurant Name */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">餐厅名称</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：川渝小馆"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">餐厅位置</h3>
            <button className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl flex items-center gap-2 text-gray-600 hover:border-blue-400 transition-colors">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span>选择位置</span>
            </button>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">评分</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="text-3xl hover:scale-110 transition-transform"
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">探店体验</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的探店体验..."
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
              rows={6}
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-base mb-3">添加标签</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="添加标签..."
                className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-full focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={handleAddTag}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                添加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl text-lg shadow-lg hover:shadow-xl transition-shadow mb-4"
          >
            发布探店记录
          </button>
        </div>
      )}
    </div>
  );
}
