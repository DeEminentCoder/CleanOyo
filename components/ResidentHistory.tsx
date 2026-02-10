
import React, { useState } from 'react';
import { PickupRequest, PickupStatus } from '../types';
import { STATUS_COLORS, WASTE_ICONS } from '../constants';

export const ResidentHistory: React.FC<{ requests: PickupRequest[] }> = ({ requests }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort by date descending (most recent first)
  const sortedHistory = [...requests].sort((a, b) => 
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

  const filteredHistory = sortedHistory.filter(req => 
    req.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Request Archive</h2>
          <p className="text-sm text-slate-500">Chronological history of your waste management activity.</p>
        </div>
        <div className="relative w-full md:w-64">
           <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
           <input 
             type="text" 
             placeholder="Search by type or area..." 
             className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Area</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" role="img" aria-label={req.wasteType}>
                        {WASTE_ICONS[req.wasteType]}
                      </span>
                      <p className="font-bold text-slate-800 text-sm">{req.wasteType}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600">{new Date(req.scheduledDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(req.scheduledDate).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600 truncate max-w-[150px]">{req.location}</p>
                  </td>
                  <td className="p-4">
                    <span 
                      key={req.status}
                      className={`
                        text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter
                        transition-all duration-500 hover:scale-110 hover:shadow-md cursor-default
                        animate-in fade-in zoom-in-95
                        border border-current/10
                        ${STATUS_COLORS[req.status]}
                        ${req.status === PickupStatus.ON_THE_WAY ? 'animate-pulse ring-2 ring-yellow-400/20' : ''}
                      `}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors px-2 py-1">
                      View Log
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400">
                    <span className="text-4xl block mb-4">📭</span>
                    <p className="font-bold">No past records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary Stat Card */}
      <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📊</div>
          <div>
            <h4 className="font-bold">Total Disposed</h4>
            <p className="text-xs text-emerald-400">Since joining Waste Up Ibadan</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-3xl font-black text-white">{requests.filter(r => r.status === PickupStatus.COMPLETED).length}</p>
          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Completed Jobs</p>
        </div>
      </div>
    </div>
  );
};
