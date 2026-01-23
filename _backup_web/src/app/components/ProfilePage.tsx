import { useState } from 'react';
import { Heart, ShoppingCart, Crown, Settings, ChevronRight, Star, TrendingUp, Award, Bell, Shield, HelpCircle, LogOut, BookOpen, MapPin, MessageCircle, Share2 } from 'lucide-react';
import { PageType } from '@/app/App';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface ProfilePageProps {
  navigate: (page: PageType, data?: any) => void;
}

export default function ProfilePage({ navigate }: ProfilePageProps) {
  const [showContent, setShowContent] = useState(false);
  const [contentTab, setContentTab] = useState<'recipes' | 'visits'>('recipes');

  if (showContent) {
    return <ContentCenterView navigate={navigate} contentTab={contentTab} setContentTab={setContentTab} onBack={() => setShowContent(false)} />;
  }

  return (
    <div className="p-4 space-y-6">
      {/* User Profile Header */}
      <div className="pt-4">
        <div className="bg-gradient-to-br from-orange-400 to-rose-400 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl border-4 border-white/30">
              👨‍🍳
            </div>
            <div className="flex-1">
              <h2 className="text-2xl mb-1">美食达人</h2>
              <p className="text-white/80 text-sm">ID: foodlover2024</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur">
            <div className="text-center">
              <div className="text-2xl mb-1">128</div>
              <div className="text-xs text-white/70">发布</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">1.2K</div>
              <div className="text-xs text-white/70">粉丝</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">856</div>
              <div className="text-xs text-white/70">关注</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className={`p-3 rounded-xl ${action.bgColor}`}>
              {action.icon}
            </div>
            <span className="text-xs text-gray-700">{action.label}</span>
            {action.badge && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* PRO Membership */}
      <section>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-6 h-6 text-white" />
              <h3 className="text-xl text-white">升级 PRO 会员</h3>
            </div>
            <p className="text-white/90 text-sm mb-4">
              解锁更多 AI 功能，享受无限次食谱生成
            </p>
            <div className="flex items-center gap-2">
              <button className="px-6 py-2 bg-white text-orange-600 rounded-full hover:shadow-lg transition-shadow">
                立即升级
              </button>
              <span className="text-white text-sm">¥29.9/月</span>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl">我的成就</h2>
          </div>
          <button className="text-sm text-orange-600">查看全部</button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-orange-100 to-rose-100 border-2 border-orange-300'
                  : 'bg-gray-100 border-2 border-gray-200 opacity-50'
              }`}
            >
              <div className="text-3xl">{achievement.icon}</div>
              <span className="text-xs text-center text-gray-700">{achievement.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Menu List */}
      <section>
        <div className="space-y-2">
          <h2 className="text-xl mb-4">更多功能</h2>
          
          <button
            onClick={() => setShowContent(true)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-base">我的内容</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {otherMenuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${item.bgColor}`}>
                  {item.icon}
                </div>
                <span className="text-base">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl">数据统计</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md">
          <div className="space-y-4">
            {statistics.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{stat.label}</span>
                  <span className="text-base">{stat.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stat.color}`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logout Button */}
      <button className="w-full flex items-center justify-center gap-2 py-4 bg-white text-red-600 rounded-2xl shadow-md hover:shadow-lg transition-shadow mb-8">
        <LogOut className="w-5 h-5" />
        <span>退出登录</span>
      </button>
    </div>
  );
}

const quickActions = [
  {
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    label: '收藏',
    bgColor: 'bg-rose-100',
    badge: false
  },
  {
    icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
    label: '购物清单',
    bgColor: 'bg-blue-100',
    badge: true
  },
  {
    icon: <Star className="w-5 h-5 text-yellow-500" />,
    label: '评价',
    bgColor: 'bg-yellow-100',
    badge: false
  },
  {
    icon: <Bell className="w-5 h-5 text-purple-500" />,
    label: '消息',
    bgColor: 'bg-purple-100',
    badge: true
  }
];

const achievements = [
  { icon: '🍳', name: '厨艺新手', unlocked: true },
  { icon: '👨‍🍳', name: '美食达人', unlocked: true },
  { icon: '🌟', name: '料理大师', unlocked: true },
  { icon: '🏆', name: '顶级厨神', unlocked: false },
  { icon: '📸', name: '摄影高手', unlocked: true },
  { icon: '✍️', name: '笔记达人', unlocked: true },
  { icon: '🗺️', name: '探店专家', unlocked: false },
  { icon: '💎', name: 'PRO会员', unlocked: false }
];

const otherMenuItems = [
  {
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    label: '我的收藏',
    bgColor: 'bg-rose-100'
  },
  {
    icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
    label: '购物清单',
    bgColor: 'bg-blue-100'
  },
  {
    icon: <Crown className="w-5 h-5 text-yellow-500" />,
    label: 'PRO 订阅管理',
    bgColor: 'bg-yellow-100'
  },
  {
    icon: <Bell className="w-5 h-5 text-purple-500" />,
    label: '通知设置',
    bgColor: 'bg-purple-100'
  },
  {
    icon: <Shield className="w-5 h-5 text-green-500" />,
    label: '隐私与安全',
    bgColor: 'bg-green-100'
  },
  {
    icon: <HelpCircle className="w-5 h-5 text-gray-500" />,
    label: '帮助与反馈',
    bgColor: 'bg-gray-100'
  },
  {
    icon: <Settings className="w-5 h-5 text-gray-700" />,
    label: '设置',
    bgColor: 'bg-gray-100'
  }
];

const statistics = [
  {
    label: '本月发布',
    value: '12篇',
    percentage: 60,
    color: 'bg-orange-500'
  },
  {
    label: '获赞总数',
    value: '1.8K',
    percentage: 85,
    color: 'bg-rose-500'
  },
  {
    label: '探店次数',
    value: '28次',
    percentage: 70,
    color: 'bg-blue-500'
  },
  {
    label: '烹饪时长',
    value: '45小时',
    percentage: 45,
    color: 'bg-green-500'
  }
];

function ContentCenterView({ navigate, contentTab, setContentTab, onBack }: { navigate: (page: PageType, data?: any) => void; contentTab: 'recipes' | 'visits'; setContentTab: (tab: 'recipes' | 'visits') => void; onBack: () => void }) {
  return (
    <div className="p-4 space-y-6">
      <button className="w-full flex items-center justify-center gap-2 py-4 bg-white text-gray-600 rounded-2xl shadow-md hover:shadow-lg transition-shadow mb-8" onClick={onBack}>
        <ChevronRight className="w-5 h-5 rotate-180" />
        <span>返回</span>
      </button>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl">我的内容</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 rounded-full ${
              contentTab === 'recipes'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setContentTab('recipes')}
          >
            食谱
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              contentTab === 'visits'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setContentTab('visits')}
          >
            探店
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {contentTab === 'recipes' && (
          <>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 border-2 border-orange-300">
              <div className="text-3xl">🍳</div>
              <span className="text-xs text-center text-gray-700">食谱1</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 border-2 border-orange-300">
              <div className="text-3xl">🍳</div>
              <span className="text-xs text-center text-gray-700">食谱2</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 border-2 border-orange-300">
              <div className="text-3xl">🍳</div>
              <span className="text-xs text-center text-gray-700">食谱3</span>
            </div>
          </>
        )}
        {contentTab === 'visits' && (
          <>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 border-2 border-orange-300">
              <div className="text-3xl">🗺️</div>
              <span className="text-xs text-center text-gray-700">探店1</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 border-2 border-orange-300">
              <div className="text-3xl">🗺️</div>
              <span className="text-xs text-center text-gray-700">探店2</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 border-2 border-orange-300">
              <div className="text-3xl">🗺️</div>
              <span className="text-xs text-center text-gray-700">探店3</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}