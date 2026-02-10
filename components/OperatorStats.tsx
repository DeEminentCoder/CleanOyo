
import React from 'react';
import { PickupRequest, PickupStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const OperatorStats: React.FC<{ requests: PickupRequest[] }> = ({ requests }) => {
  const completed = requests.filter(r => r.status === PickupStatus.COMPLETED).length;
  const total = requests.length || 1;
  const rate = Math.round((completed / total) * 100);

  const performanceData = [
    { day: 'Mon', pickups: 12, efficiency: 85 },
    { day: 'Tue', pickups: 15, efficiency: 92 },
    { day: 'Wed', pickups: 8, efficiency: 78 },
    { day: 'Thu', pickups: 22, efficiency: 95 },
    { day: 'Fri', pickups: 18, efficiency: 88 },
    { day: 'Sat', pickups: 25, efficiency: 98 },
    { day: 'Sun', pickups: 5, efficiency: 100 },
  ];

  const stats = [
    { label: 'Weekly Jobs', value: total * 5, trend: '+12%', color: 'text-blue-600', icon: '📦' },
    { label: 'Avg Pickup Time', value: '38m', trend: '-5m', color: 'text-emerald-600', icon: '⏱️' },
    { label: 'Success Rate', value: `${rate}%`, trend: '+2%', color: 'text-orange-600', icon: '📈' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Performance Analytics</h2>
        <div className="flex gap-2">
           <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Download PDF Report</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-5 group-hover:scale-125 transition-transform">{s.icon}</div>
            <p className="text-sm font-medium text-slate-500 mb-2">{s.label}</p>
            <div className="flex items-end gap-3">
              <span className={`text-3xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs font-bold text-emerald-500 pb-1">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Efficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Route Efficiency Trend</h3>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="efficiency" stroke="#10b981" fillOpacity={1} fill="url(#colorEff)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Volume */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Job Volume (Tonnes)</h3>
            <span className="text-xs text-slate-400">By Day</span>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="pickups" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-6">Operator Recognition Score</h3>
        <div className="space-y-4">
          {[
            { metric: 'Community Reliability', score: 9.8, color: 'bg-emerald-500' },
            { metric: 'Safety Compliance', score: 8.5, color: 'bg-emerald-300' },
            { metric: 'Vehicle Maintenance', score: 7.2, color: 'bg-yellow-400' },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500 w-32">{row.metric}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${row.color}`} style={{ width: `${row.score * 10}%` }}></div>
              </div>
              <span className="text-xs font-bold text-slate-900 w-8">{row.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
