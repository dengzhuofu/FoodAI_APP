import { Menu, Search, Bell, HelpCircle } from 'lucide-react';

const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center">
            <button onClick={onToggleSidebar} className="text-slate-500 hover:text-slate-700 mr-4 focus:outline-none">
                <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">工作台</h2>
        </div>
        <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
                <input type="text" placeholder="搜索..." className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 w-64 outline-none" />
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            {/* Settings */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <HelpCircle className="w-5 h-5" />
            </button>
        </div>
    </header>
  );
};

export default Header;
