import { Search, Heart, MessageSquare, Bell, UserPlus } from 'lucide-react';
import { PageType } from '@/app/App';

interface MessagesPageProps {
  navigate: (page: PageType, data?: any) => void;
}

export default function MessagesPage({ navigate }: MessagesPageProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl mb-4">消息</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索消息..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Notifications */}
      <section>
        <h2 className="text-lg mb-3">系统通知</h2>
        <div className="space-y-3">
          {systemNotifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`p-3 rounded-full ${notification.color}`}>
                {notification.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base mb-1">{notification.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                <span className="text-xs text-gray-400">{notification.time}</span>
              </div>
              {notification.unread && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Social Messages */}
      <section>
        <h2 className="text-lg mb-3">互动消息</h2>
        <div className="space-y-3">
          {socialMessages.map((message, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white text-xl">
                {message.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base">{message.user}</h3>
                  <span className="text-xs text-gray-400">{message.time}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                {message.relatedContent && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <span className="text-gray-600">{message.relatedContent}</span>
                  </div>
                )}
              </div>
              {message.unread && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Follow Suggestions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg">推荐关注</h2>
          <button className="text-sm text-orange-600">查看更多</button>
        </div>
        <div className="space-y-3">
          {followSuggestions.map((user, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-base mb-1">{user.name}</h3>
                <p className="text-xs text-gray-500">{user.followers} 粉丝</p>
              </div>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors">
                <UserPlus className="w-4 h-4 inline mr-1" />
                关注
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const systemNotifications = [
  {
    icon: <Bell className="w-6 h-6 text-orange-600" />,
    title: '系统更新',
    content: 'FoodAI 已更新至 v2.0，新增多项AI功能',
    time: '1小时前',
    unread: true,
    color: 'bg-orange-100'
  },
  {
    icon: <Heart className="w-6 h-6 text-rose-600" />,
    title: '会员福利',
    content: 'PRO会员限时优惠，立享8折优惠',
    time: '3小时前',
    unread: true,
    color: 'bg-rose-100'
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
    title: '活动通知',
    content: '美食摄影大赛开始啦！上传作品赢取大奖',
    time: '1天前',
    unread: false,
    color: 'bg-blue-100'
  }
];

const socialMessages = [
  {
    avatar: '👨',
    user: '美食探索者',
    content: '赞了你的菜谱《番茄炒蛋》',
    time: '30分钟前',
    relatedContent: '番茄炒蛋',
    unread: true
  },
  {
    avatar: '👩',
    user: '小厨娘',
    content: '评论了你的探店记录：这家店我也去过，确实不错！',
    time: '2小时前',
    relatedContent: '川渝小馆',
    unread: true
  },
  {
    avatar: '👨',
    user: '厨房新手',
    content: '收藏了你的菜谱《宫保鸡丁》',
    time: '5小时前',
    relatedContent: '宫保鸡丁',
    unread: false
  },
  {
    avatar: '👩',
    user: '吃货小姐姐',
    content: '关注了你',
    time: '1天前',
    relatedContent: null,
    unread: false
  }
];

const followSuggestions = [
  {
    avatar: '👨‍🍳',
    name: '大厨张师傅',
    followers: '2.3万'
  },
  {
    avatar: '👩‍🍳',
    name: '美食Vlogger',
    followers: '1.8万'
  },
  {
    avatar: '🍳',
    name: '家常菜达人',
    followers: '1.2万'
  }
];
