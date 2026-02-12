import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePermissions } from '../context/PermissionContext';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const { setPermissions } = usePermissions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.access_token);
            
            // Fetch user info to get permissions
            const userRes = await fetch('http://localhost:8000/api/v1/users/me', {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            const userData = await userRes.json();
            if (userData.permissions) {
                setPermissions(userData.permissions);
            }

            navigate('/dashboard');
        } else {
            alert('Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Login error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Food & AI Admin</h1>
                <p className="text-slate-500 mt-2">企业级后台管理系统</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">账号</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" 
                        placeholder="name@company.com" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" 
                        placeholder="••••••••" 
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
                        <label className="ml-2 block text-sm text-slate-600">记住我</label>
                    </div>
                    <a href="#" className="text-sm text-emerald-600 hover:text-emerald-500">忘记密码?</a>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition font-medium">
                    登 录
                </button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-500">
                &copy; 2026 Food & AI Social Inc.
            </div>
        </div>
    </div>
  );
};

export default Login;
