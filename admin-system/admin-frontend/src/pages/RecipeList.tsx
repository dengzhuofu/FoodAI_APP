import { Search, RotateCw, Plus, Edit, Trash, Eye, Flame, Star } from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';

const RecipeList = () => {
    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">菜谱管理</h3>
                <PermissionGuard permission="content:edit">
                    <button className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 shadow-sm transition-all flex items-center">
                        <Plus className="w-4 h-4 mr-2" /> 新建菜谱
                    </button>
                </PermissionGuard>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="搜索菜谱名称/ID..." className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64" />
                </div>
                <select className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">所有状态</option>
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                    <option value="review">待审核</option>
                </select>
                <select className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">所有菜系</option>
                    <option value="sichuan">川菜</option>
                    <option value="cantonese">粤菜</option>
                    <option value="western">西式</option>
                </select>
                <button className="ml-auto px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-md text-sm transition-colors border border-transparent hover:border-slate-200 flex items-center">
                    <RotateCw className="w-4 h-4 mr-1" /> 重置
                </button>
                <button className="px-4 py-1.5 bg-primary-50 text-primary-600 border border-primary-200 rounded-md text-sm font-medium hover:bg-primary-100 transition-colors">
                    查询
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">菜品信息</th>
                            <th className="px-6 py-4">作者</th>
                            <th className="px-6 py-4">状态</th>
                            <th className="px-6 py-4">热度/收藏</th>
                            <th className="px-6 py-4">更新时间</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* Row 1 */}
                        <tr className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src="https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" className="w-12 h-12 rounded-lg object-cover shadow-sm" alt="Food" />
                                    <div>
                                        <div className="font-semibold text-slate-900">Spicy Mapo Tofu</div>
                                        <div className="text-xs text-slate-500">Sichuan Cuisine • Spicy</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80" className="w-6 h-6 rounded-full" alt="Avatar" />
                                    <span>Jenny Wilson</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    已发布
                                </span>
                                <span className="ml-1 text-[10px] border border-slate-200 px-1 rounded text-slate-400">AI 生成</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center text-slate-600"><Flame className="w-4 h-4 text-rose-500 mr-1" /> 2.4k</span>
                                    <span className="flex items-center text-slate-600"><Star className="w-4 h-4 text-amber-500 mr-1" /> 856</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">2 hours ago</td>
                            <td className="px-6 py-4 text-right">
                                <PermissionGuard permission="content:edit">
                                    <button className="text-slate-400 hover:text-emerald-600 mx-1"><Edit className="w-4 h-4" /></button>
                                </PermissionGuard>
                                <PermissionGuard permission="content:publish">
                                    <button className="text-slate-400 hover:text-rose-600 mx-1"><Trash className="w-4 h-4" /></button>
                                </PermissionGuard>
                            </td>
                        </tr>
                        {/* Row 2 */}
                         <tr className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" className="w-12 h-12 rounded-lg object-cover shadow-sm" alt="Food" />
                                    <div>
                                        <div className="font-semibold text-slate-900">Classic Beef Wellington</div>
                                        <div className="text-xs text-slate-500">Western • Gourmet</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80" className="w-6 h-6 rounded-full" alt="Avatar" />
                                    <span>Robert Fox</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    待审核
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center text-slate-600"><Flame className="w-4 h-4 text-slate-300 mr-1" /> --</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">5 mins ago</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-emerald-600 mx-1"><Eye className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                 <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="text-xs text-slate-500">Showing 1 to 2 of 1,234 entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-slate-300 bg-white rounded text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 border border-slate-300 bg-primary-600 text-white rounded text-sm">1</button>
                        <button className="px-3 py-1 border border-slate-300 bg-white rounded text-sm text-slate-600 hover:bg-slate-50">2</button>
                        <button className="px-3 py-1 border border-slate-300 bg-white rounded text-sm text-slate-600 hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default RecipeList;
