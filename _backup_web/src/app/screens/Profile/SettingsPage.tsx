import { useState } from 'react';
import { ArrowLeft, Bell, Shield, Moon, Globe, Volume2, Info, ChevronRight } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
        <h1 className="text-2xl">设置</h1>
      </div>

      {/* Notification Settings */}
      <section>
        <h2 className="text-lg mb-3 px-2">通知设置</h2>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100">
                <Bell className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-base">推送通知</div>
                <div className="text-xs text-gray-500">接收新消息和更新提醒</div>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-orange-500 transition-colors">
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <Volume2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-base">声音</div>
                <div className="text-xs text-gray-500">播放通知提示音</div>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-orange-500 transition-colors">
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          </div>

          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gray-100">
                <Bell className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-base">通知偏好设置</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Appearance Settings */}
      <section>
        <h2 className="text-lg mb-3 px-2">外观设置</h2>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100">
                <Moon className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <div className="text-base">深色模式</div>
                <div className="text-xs text-gray-500">保护眼睛，节省电量</div>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-orange-500 transition-colors">
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          </div>

          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100">
                <Globe className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-base">语言设置</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">简体中文</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </section>

      {/* Privacy & Security */}
      <section>
        <h2 className="text-lg mb-3 px-2">隐私与安全</h2>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-base">账号安全</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100">
                <Shield className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-base">隐私设置</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-100">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-base">黑名单管理</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-lg mb-3 px-2">关于</h2>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-base">关于 FoodAI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">v1.0.0</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100">
                <Info className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-base">用户协议</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-100">
                <Info className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-base">隐私政策</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Cache Management */}
      <section>
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-base mb-1">缓存管理</div>
              <div className="text-xs text-gray-500">当前缓存: 125.6 MB</div>
            </div>
          </div>
          <button className="w-full py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
            清除缓存
          </button>
        </div>
      </section>
    </div>
  );
}
