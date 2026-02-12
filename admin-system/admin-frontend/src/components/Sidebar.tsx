import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Store, MessageSquare, Tag, ShieldAlert, Activity, Terminal, Users, Shield, Flag, History, Settings, LogOut, Utensils } from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItemClass = (path: string) => clsx(
    "flex items-center px-3 py-2 rounded-md group transition-colors mb-0.5",
    isActive(path) 
      ? "bg-primary-50 text-primary-600 font-medium" 
      : "text-slate-600 hover:bg-slate-100"
  );

  const iconClass = (path: string) => clsx(
    "w-5 h-5 mr-2.5",
    isActive(path) ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"
  );

  return (
    <aside className={clsx(
      "bg-white border-r border-slate-200 flex flex-col transition-all duration-300 flex-shrink-0 z-20 h-full",
      isOpen ? "w-64" : "w-20"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
          <Utensils className="text-white w-4 h-4" />
        </div>
        {isOpen && <span className="text-slate-800 font-bold text-lg tracking-tight">FoodAdmin</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <ul className="space-y-0.5">
          <li>
            <Link to="/dashboard" className={navItemClass('/dashboard')}>
              <LayoutDashboard className={iconClass('/dashboard')} />
              {isOpen && <span className="text-sm">工作台</span>}
            </Link>
          </li>

          {isOpen && <li className="px-3 pt-5 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">内容中心</li>}
          
          <li>
            <Link to="/recipes" className={navItemClass('/recipes')}>
              <BookOpen className={iconClass('/recipes')} />
              {isOpen && <span className="text-sm">菜谱管理</span>}
            </Link>
          </li>
          <li>
            <Link to="/notes" className={navItemClass('/notes')}>
              <Store className={iconClass('/notes')} />
              {isOpen && <span className="text-sm">探店笔记</span>}
            </Link>
          </li>
          <li>
            <Link to="/comments" className={navItemClass('/comments')}>
              <MessageSquare className={iconClass('/comments')} />
              {isOpen && <span className="text-sm">评论互动</span>}
            </Link>
          </li>
          <li>
            <Link to="/tags" className={navItemClass('/tags')}>
              <Tag className={iconClass('/tags')} />
              {isOpen && <span className="text-sm">标签库</span>}
            </Link>
          </li>
           <li>
            <Link to="/moderation" className={navItemClass('/moderation')}>
              <ShieldAlert className={iconClass('/moderation')} />
              {isOpen && (
                  <>
                    <span className="text-sm">审核队列</span>
                    <span className="ml-auto bg-rose-50 text-rose-600 text-xs px-2 py-0.5 rounded-full font-medium">12</span>
                  </>
              )}
            </Link>
          </li>

          {isOpen && <li className="px-3 pt-5 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI 厨房</li>}
          <li>
             <Link to="/ai-monitor" className={navItemClass('/ai-monitor')}>
              <Activity className={iconClass('/ai-monitor')} />
              {isOpen && <span className="text-sm">模型监控</span>}
            </Link>
          </li>
           <li>
             <Link to="/prompts" className={navItemClass('/prompts')}>
              <Terminal className={iconClass('/prompts')} />
              {isOpen && <span className="text-sm">Prompt 管理</span>}
            </Link>
          </li>

          {isOpen && <li className="px-3 pt-5 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">系统管理</li>}
           <li>
             <Link to="/users" className={navItemClass('/users')}>
              <Users className={iconClass('/users')} />
              {isOpen && <span className="text-sm">用户列表</span>}
            </Link>
          </li>
           <li>
             <Link to="/permissions" className={navItemClass('/permissions')}>
              <Shield className={iconClass('/permissions')} />
              {isOpen && <span className="text-sm">角色权限</span>}
            </Link>
          </li>
           <li>
             <Link to="/reports" className={navItemClass('/reports')}>
              <Flag className={iconClass('/reports')} />
              {isOpen && <span className="text-sm">举报中心</span>}
            </Link>
          </li>
           <li>
             <Link to="/logs" className={navItemClass('/logs')}>
              <History className={iconClass('/logs')} />
              {isOpen && <span className="text-sm">操作日志</span>}
            </Link>
          </li>
           <li>
             <Link to="/settings" className={navItemClass('/settings')}>
              <Settings className={iconClass('/settings')} />
              {isOpen && <span className="text-sm">系统设置</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-3">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
            {isOpen && (
                <div className="flex-1 min-w-0">
                    <div className="text-slate-800 text-sm font-medium truncate">Alex Morgan</div>
                    <div className="text-xs text-slate-500 truncate">Super Admin</div>
                </div>
            )}
        </div>
        <button className="flex items-center justify-center text-slate-500 hover:text-rose-600 w-full transition-colors text-xs py-1.5 hover:bg-rose-50 rounded">
            <LogOut className="w-4 h-4 mr-2" />
            {isOpen && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
