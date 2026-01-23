import { useState } from 'react';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';

// Screens
import RecommendScreen from '@/app/screens/Recommend/RecommendScreen';
import ExploreScreen from '@/app/screens/Explore/ExploreScreen';
import WhatToEatScreen from '@/app/screens/Explore/WhatToEatScreen';
import AIKitchenScreen from '@/app/screens/AIKitchen/AIKitchenScreen';
import MyKitchenPage from '@/app/components/MyKitchenPage';
import ProfilePage from '@/app/components/ProfilePage';
import RecipeDetailPage from '@/app/components/RecipeDetailPage';
import RestaurantDetailPage from '@/app/components/RestaurantDetailPage';
import PublishPage from '@/app/components/PublishPage';
import MessagesPage from '@/app/components/MessagesPage';

export type ScreenType = 
  | 'recommend' 
  | 'explore' 
  | 'what-to-eat'
  | 'ai-kitchen' 
  | 'my-kitchen' 
  | 'messages' 
  | 'profile' 
  | 'recipe-detail' 
  | 'restaurant-detail' 
  | 'publish';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('recommend');
  const [showPublish, setShowPublish] = useState(false);
  const [screenData, setScreenData] = useState<any>(null);
  const [navigationHistory, setNavigationHistory] = useState<ScreenType[]>(['recommend']);

  const navigate = (screen: ScreenType | string, data?: any) => {
    const targetScreen = screen as ScreenType;
    
    // 更新导航历史
    setNavigationHistory([...navigationHistory, targetScreen]);
    setActiveScreen(targetScreen);
    setScreenData(data);
    setShowPublish(false);
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // 移除当前screen
      const previousScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setActiveScreen(previousScreen);
      setScreenData(null);
    }
  };

  const handlePublishClick = () => {
    setShowPublish(true);
  };

  const renderScreen = () => {
    if (showPublish) {
      return <PublishPage navigate={navigate} onClose={() => setShowPublish(false)} />;
    }

    const commonProps = {
      onNavigate: navigate,
      navigate: navigate
    };

    switch (activeScreen) {
      case 'recommend':
        return <RecommendScreen onNavigate={navigate} />;
      case 'explore':
        return <ExploreScreen onNavigate={navigate} />;
      case 'what-to-eat':
        return <WhatToEatScreen onNavigate={navigate} onBack={handleBack} />;
      case 'ai-kitchen':
        return <AIKitchenScreen onNavigate={navigate} />;
      case 'my-kitchen':
        return <MyKitchenPage navigate={navigate} />;
      case 'messages':
        return <MessagesPage navigate={navigate} />;
      case 'profile':
        return <ProfilePage navigate={navigate} />;
      case 'recipe-detail':
        return <RecipeDetailPage navigate={navigate} recipe={screenData} />;
      case 'restaurant-detail':
        return <RestaurantDetailPage navigate={navigate} restaurant={screenData} />;
      default:
        return <RecommendScreen onNavigate={navigate} />;
    }
  };

  // 判断是否显示底部导航栏
  const isBottomNavVisible = !showPublish && !['what-to-eat', 'recipe-detail', 'restaurant-detail', 'my-kitchen'].includes(activeScreen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Main Content */}
      <main className={isBottomNavVisible ? "pb-20 max-w-7xl mx-auto" : "max-w-7xl mx-auto"}>
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      {isBottomNavVisible && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-around h-16">
              <TabButton
                icon={<Home className="w-5 h-5" />}
                label="推荐"
                active={activeScreen === 'recommend'}
                onClick={() => navigate('recommend')}
              />
              <TabButton
                icon={<Search className="w-5 h-5" />}
                label="探索"
                active={activeScreen === 'explore'}
                onClick={() => navigate('explore')}
              />
              
              {/* Center Publish Button */}
              <button
                onClick={handlePublishClick}
                className="relative -mt-6"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110">
                  <Plus className="w-7 h-7 text-white" />
                </div>
              </button>

              <TabButton
                icon={<MessageSquare className="w-5 h-5" />}
                label="消息"
                active={activeScreen === 'messages'}
                onClick={() => navigate('messages')}
              />
              <TabButton
                icon={<User className="w-5 h-5" />}
                label="我的"
                active={activeScreen === 'profile'}
                onClick={() => navigate('profile')}
              />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 transition-all ${
        active ? 'text-orange-500' : 'text-gray-500'
      }`}
    >
      <div className={`transition-transform ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </button>
  );
}
