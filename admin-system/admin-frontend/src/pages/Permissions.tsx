import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Shield, Users, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Permission {
    id: number;
    name: string; // Display Name
    code: string; // Permission Code (e.g. user:add)
    type: string; // menu, button, api
    parent_id: number | null;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    is_system: boolean;
    permissions: Permission[];
    user_count: number;
}

const API_BASE = 'http://localhost:8000/api/v1/admin';

const Permissions = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Permission Matrix State (ids of selected permissions for the current role)
    const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
    
    // Expanded categories state for tree view
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                fetch(`${API_BASE}/roles`),
                fetch(`${API_BASE}/permissions`)
            ]);
            
            const rolesData = await rolesRes.json();
            const permsData = await permsRes.json();
            
            setRoles(rolesData);
            setAllPermissions(permsData);
            
            // Expand all top-level menus by default
            const topLevelIds = permsData.filter((p: Permission) => !p.parent_id).map((p: Permission) => p.id);
            setExpandedIds(topLevelIds);
            
            if (rolesData.length > 0) {
                selectRole(rolesData[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch data", error);
            setLoading(false);
        }
    };

    const selectRole = (role: Role) => {
        setSelectedRole(role);
        setSelectedPermIds(role.permissions.map(p => p.id));
    };

    const togglePermission = (permId: number) => {
        if (!selectedRole) return;
        if (selectedRole.is_system && selectedRole.name === 'super_admin') return;
        
        // Logic to handle parent/child selection consistency could be complex.
        // For simplicity:
        // 1. If checking a child, check parent automatically? (Optional but good UX)
        // 2. If unchecking a parent, uncheck all children? (Optional)
        // Here we implement basic toggle first.
        
        setSelectedPermIds(prev => {
            const isSelected = prev.includes(permId);
            let newIds = [...prev];
            
            if (isSelected) {
                newIds = newIds.filter(id => id !== permId);
                // If unchecking a parent, uncheck all children
                const children = allPermissions.filter(p => p.parent_id === permId);
                const childIds = children.map(c => c.id);
                newIds = newIds.filter(id => !childIds.includes(id));
            } else {
                newIds.push(permId);
                // If checking a child, ensure parent is checked
                const perm = allPermissions.find(p => p.id === permId);
                if (perm && perm.parent_id && !newIds.includes(perm.parent_id)) {
                    newIds.push(perm.parent_id);
                }
                // If checking a parent, check all children? Maybe not.
            }
            return newIds;
        });
    };
    
    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/roles/${selectedRole.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    permission_ids: selectedPermIds
                })
            });
            
            if (res.ok) {
                const updatedRole = await res.json();
                setRoles(prev => prev.map(r => r.id === updatedRole.id ? {...updatedRole, user_count: r.user_count} : r));
                setSelectedRole({...updatedRole, user_count: selectedRole.user_count});
                alert('权限配置已保存');
            } else {
                alert('保存失败');
            }
        } catch (error) {
            console.error("Failed to save", error);
            alert('保存出错');
        } finally {
            setSaving(false);
        }
    };

    // Build Tree Structure
    const permissionTree = allPermissions.filter(p => !p.parent_id).map(parent => ({
        ...parent,
        children: allPermissions.filter(child => child.parent_id === parent.id)
    }));

    if (loading) return <div className="p-10 text-center text-slate-500">Loading permissions...</div>;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">角色权限</h2>
                    <p className="text-sm text-slate-500 mt-1">配置系统角色与权限策略</p>
                </div>
                <button className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 shadow-sm transition-all flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> 新增角色
                </button>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left: Role List */}
                <div className="w-72 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">角色列表</h4>
                    {roles.map(role => (
                        <div 
                            key={role.id}
                            onClick={() => selectRole(role)}
                            className={clsx(
                                "p-4 rounded-lg border cursor-pointer transition-all group relative overflow-hidden",
                                selectedRole?.id === role.id 
                                    ? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500/20" 
                                    : "border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={clsx("font-bold text-sm", selectedRole?.id === role.id ? "text-primary-700" : "text-slate-700")}>
                                    {role.display_name}
                                </span>
                                <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-medium", role.is_system ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600")}>
                                    {role.is_system ? '系统' : '自定义'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-[2.5em]">{role.description || "暂无描述"}</p>
                            <div className="flex items-center text-xs text-slate-400 font-medium">
                                <Users className="w-3 h-3 mr-1" /> {role.user_count} 人
                            </div>
                            {selectedRole?.id === role.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"></div>}
                        </div>
                    ))}
                </div>

                {/* Right: Permission Matrix Tree */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    {selectedRole && (
                        <>
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                        {selectedRole.display_name}
                                        {selectedRole.is_system && <Shield className="w-4 h-4 text-slate-400" />}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {selectedRole.is_system ? '系统内置角色，部分权限可能不可更改' : '自定义角色，可完全配置权限'}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving || (selectedRole.name === 'super_admin')}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? '保存中...' : '保存配置'}
                                </button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                                {permissionTree.map(parent => (
                                    <div key={parent.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                        {/* Parent (Menu) Header */}
                                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                                             onClick={() => toggleExpand(parent.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-1 rounded hover:bg-slate-200 text-slate-400"
                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(parent.id); }}
                                                >
                                                    {expandedIds.includes(parent.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedPermIds.includes(parent.id)}
                                                        onChange={() => togglePermission(parent.id)}
                                                        disabled={selectedRole.name === 'super_admin'}
                                                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                                                    />
                                                    <span className="font-bold text-slate-700">{parent.name}</span>
                                                </label>
                                                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{parent.code}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Children (Buttons) Grid */}
                                        {expandedIds.includes(parent.id) && (
                                            <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                                                {parent.children.map(child => (
                                                    <label key={child.id} className="flex items-start space-x-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                                        <div className="relative flex items-center pt-0.5">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedPermIds.includes(child.id)}
                                                                onChange={() => togglePermission(child.id)}
                                                                disabled={selectedRole.name === 'super_admin'}
                                                                className="peer h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                                                            />
                                                        </div>
                                                        <div className="text-sm select-none">
                                                            <div className="font-medium text-slate-700 group-hover:text-primary-700 transition-colors">{child.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{child.code}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                                {parent.children.length === 0 && (
                                                    <div className="col-span-full text-center py-2 text-sm text-slate-400 italic">No sub-permissions</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Permissions;
