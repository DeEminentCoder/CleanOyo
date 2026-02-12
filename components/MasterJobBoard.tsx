
import React, { useState } from 'react';
import { PickupRequest, PickupStatus, WasteType } from '../types';
import { STATUS_COLORS, WASTE_ICONS, PRIORITY_COLORS } from '../constants';

export const MasterJobBoard: React.FC<{ requests: PickupRequest[] }> = ({ requests }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = requests.filter(r => {
    const matchesSearch = r.residentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Master Job Board</h2>
           <p className="text-sm text-slate-500">Global overview of all {requests.length} collection tasks in Ibadan.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">Export Master CSV</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by resident name or street..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {Object.values(PickupStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Job ID</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Resident</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">PSP Assigned</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-xs font-mono text-slate-400">#{req.id.slice(-6)}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 text-sm">{req.residentName}</p>
                    <p className="text-[10px] text-slate-500">Created: {new Date(req.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-600 truncate max-w-[120px]">{req.location}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="text-lg">{WASTE_ICONS[req.wasteType]}</span>
                       <span className="text-xs text-slate-600">{req.wasteType.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${PRIORITY_COLORS[req.priority]}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-emerald-600">{req.operatorName || 'Unassigned'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full border uppercase tracking-widest ${STATUS_COLORS[req.status]}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-20 text-center text-slate-400">
             <span className="text-5xl block mb-4">🔦</span>
             <p className="font-bold">No results found for your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
