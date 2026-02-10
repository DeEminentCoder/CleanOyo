
import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const FloodAnalysis: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState(false);

  const rainfallData = [
    { month: 'May', rainfall: 150, risk: 20 },
    { month: 'Jun', rainfall: 280, risk: 45 },
    { month: 'Jul', rainfall: 320, risk: 75 },
    { month: 'Aug', rainfall: 210, risk: 60 },
    { month: 'Sep', rainfall: 380, risk: 92 },
    { month: 'Oct', rainfall: 240, risk: 50 },
  ];

  const hotspots = [
    { area: 'Odo-Ona River Bank', status: 'Critical', blockage: '85%', pop: '1.2k', psp: 'EcoWaste' },
    { area: 'Challenge Underpass', status: 'High', blockage: '40%', pop: '3.5k', psp: 'CleanOyo' },
    { area: 'Moniya Drainage B', status: 'Critical', blockage: '92%', pop: '0.8k', psp: 'Ibadan Central' },
    { area: 'Bodija Market Exit', status: 'Moderate', blockage: '25%', pop: '12k', psp: 'Green Path' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Flood Vulnerability & Drainage</h2>
          <p className="text-slate-500 text-sm">Real-time monitoring of Ibadan drainage infrastructure.</p>
        </div>
        <button 
          onClick={() => setActiveAlert(!activeAlert)}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${activeAlert ? 'bg-red-600 text-white animate-pulse' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          {activeAlert ? '⚠️ ACTIVE FLOOD ALERT' : 'Issue Test Warning'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stat Card */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
               <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">2023 Monsoon Forecast</span>
               <h2 className="text-3xl font-bold mt-4 mb-4">Ibadan Rainfall & Risk Profile</h2>
               <div className="h-64 w-full min-w-0 mt-6">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={rainfallData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="risk" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} />
                      <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                 </ResponsiveContainer>
               </div>
               <div className="flex gap-6 mt-4 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-500"></div> Flood Risk (%)</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 border-dashed border"></div> Rainfall (mm)</div>
               </div>
             </div>
             <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl">🌊</div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-900">Drainage Blockage Hotspots</h3>
               <button className="text-xs font-bold text-emerald-600 hover:underline">Full Audit Report</button>
            </div>
            <div className="divide-y divide-slate-100">
              {hotspots.map((h, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex gap-4 items-center">
                     <div className={`w-3 h-3 rounded-full ${h.status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></div>
                     <div>
                        <h5 className="font-bold text-slate-900">{h.area}</h5>
                        <p className="text-xs text-slate-500">Risk: {h.status} • Assigned PSP: {h.psp}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-red-600 mb-1">Blockage: {h.blockage}</p>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className={`h-full ${h.status === 'Critical' ? 'bg-red-600' : 'bg-orange-500'}`} style={{ width: h.blockage }}></div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 group-hover:text-emerald-600">📡</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-200">
              <h4 className="font-bold mb-2">Desilting Operations</h4>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">Manage manual drainage clearing crews across Oyo state districts.</p>
              <div className="space-y-3">
                 <div className="bg-white/10 p-3 rounded-xl">
                    <div className="flex justify-between text-[10px] mb-1"><span>Current Progress</span><span>64%</span></div>
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white w-[64%]"></div></div>
                 </div>
                 <button className="w-full bg-white text-emerald-700 py-2 rounded-xl text-xs font-bold">Deploy New Crew</button>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4">Community Impact</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Pop. at Risk</span>
                    <span className="text-sm font-bold text-slate-900">42,500</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Property Value</span>
                    <span className="text-sm font-bold text-slate-900">₦1.2B</span>
                 </div>
                 <div className="pt-4 border-t border-slate-100">
                    <button className="w-full text-center text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">View Resiliency Plan →</button>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
              <span className="text-3xl block mb-2">☁️</span>
              <h5 className="font-bold text-slate-800 text-sm">Meteorological Link</h5>
              <p className="text-[10px] text-slate-400">Sync with Ibadan weather stations for automatic risk scaling.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
