import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Users, Zap, Camera, Coins } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
    dau: { label: string; growth: number };
    ai_calls: { label: string; growth: number; success_rate: number };
    new_content: { label: string; growth: number; pending: number };
    token_cost: { label: string; avg_cost: number };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API
    fetch('http://localhost:8000/api/v1/admin/stats')
      .then(res => res.json())
      .then(data => {
          if (data.data) {
             setStats(data.data); // Assuming the response is wrapped in { data: ... }
          } else {
             setStats(data); // Or direct
          }
          setLoading(false);
      })
      .catch(err => {
          console.error("Failed to fetch stats", err);
          // Fallback mock data
          setTimeout(() => {
              setStats({
                  dau: { label: "124.5K", growth: 0.12 },
                  ai_calls: { label: "45,231", growth: 0.085, success_rate: 0.998 },
                  new_content: { label: "1,893", growth: -0.021, pending: 45 },
                  token_cost: { label: "$342.50", avg_cost: 0.007 }
              });
              setLoading(false);
          }, 500);
      });
  }, []);

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'AI Calls',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 45000],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Users',
        data: [500, 800, 600, 1200, 1000, 1500, 2000],
        borderColor: '#64748b',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderDash: [5, 5],
      },
    ],
  };

  const pieChartData = {
    labels: ['Sichuan', 'Cantonese', 'Western', 'Others'],
    datasets: [
      {
        data: [35, 25, 20, 20],
        backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#cbd5e1'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="animate-fade-in space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* DAU */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">总用户数 (DAU)</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats?.dau.label}</h3>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" /> {(stats!.dau.growth * 100).toFixed(0)}%
                            </span>
                            <span className="text-slate-400 ml-2">较昨日</span>
                        </div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
            </div>

             {/* AI Calls */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">今日 AI 调用</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats?.ai_calls.label}</h3>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" /> {(stats!.ai_calls.growth * 100).toFixed(1)}%
                            </span>
                            <span className="text-slate-400 ml-2">成功率 {(stats!.ai_calls.success_rate * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <Zap className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">今日新增内容</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats?.new_content.label}</h3>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center">
                                <ArrowDown className="w-3 h-3 mr-1" /> {(Math.abs(stats!.new_content.growth) * 100).toFixed(1)}%
                            </span>
                            <span className="text-slate-400 ml-2">待审核: {stats?.new_content.pending}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                        <Camera className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Cost */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Token 预估成本</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats?.token_cost.label}</h3>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="text-slate-500">
                                平均 ${stats?.token_cost.avg_cost} / req
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                        <Coins className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">用户增长与 AI 使用趋势</h3>
                <div className="h-80 w-full">
                    <Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">热门菜系分布</h3>
                <div className="h-64 w-full flex justify-center relative">
                     <Doughnut data={pieChartData} options={{ maintainAspectRatio: false, responsive: true, cutout: '70%' }} />
                </div>
                 <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>川菜 (Sichuan)</div>
                        <span className="font-semibold">35%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>粤菜 (Cantonese)</div>
                        <span className="font-semibold">25%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>西式 (Western)</div>
                        <span className="font-semibold">20%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
