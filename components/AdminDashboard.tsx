
import React from 'react';
import { PickupRequest, PickupStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IBADAN_ZONES } from '../constants';

interface AdminDashboardProps {
  requests: PickupRequest[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests }) => {
  const chartData = IBADAN_ZONES.map(zone => ({
    name: zone.name,
    requests: Math.floor(Math.random() * 50) + 10,
    completion: Math.floor(Math.random() * 80) + 20,
  }));

  const pieData = [
    { name: 'Completed', value: requests.filter(r => r.status === PickupStatus.COMPLETED).length, color: '#10b981' },
    { name: 'Pending', value: requests.filter(r => r.status !== PickupStatus.COMPLETED).length, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Oyo Waste Authority Control</h2>
            <p className="text-slate-500">Ibadan Metropolitan Oversight</p>
         </div>
         <div className="flex gap-2">
            <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Export CSV</button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">Generate Report</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Collection Efficiency Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Zone Performance (%)</h3>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="completion" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Pickup Status Overview</h3>
          <div className="h-64 w-full min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {pieData.map((d, i) => (
              <div key={i} className="text-center p-3 bg-slate-50 rounded-xl">
                 <p className="text-xs text-slate-500 font-medium">{d.name}</p>
                 <p className="text-xl font-bold text-slate-900">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flood Prone Areas Alert */}
      <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌊</span>
          <h3 className="text-lg font-bold text-orange-900">Flood Warning System</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {IBADAN_ZONES.filter(z => z.floodRisk === 'High').map(zone => (
            <div key={zone.id} className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
               <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-slate-900">{zone.name}</span>
                 <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Critical</span>
               </div>
               <p className="text-sm text-slate-600 mb-3">{zone.activeRequests} pending pickups in blockage-prone areas.</p>
               <button className="text-xs font-bold text-emerald-600 hover:underline">Dispatch Rapid Response →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
