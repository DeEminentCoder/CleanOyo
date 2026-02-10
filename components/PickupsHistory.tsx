
import React, { useState } from 'react';
import { PickupRequest, PickupStatus } from '../types';
import { STATUS_COLORS } from '../constants';

export const PickupsHistory: React.FC<{ requests: PickupRequest[], onUpdateStatus: (id: string, s: PickupStatus) => void }> = ({ requests, onUpdateStatus }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = requests.filter(r => filter === 'ALL' || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Job History & Management</h2>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
          {['ALL', 'COMPLETED', 'SCHEDULED'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Resident</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Type</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Date</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(req => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{req.residentName}</p>
                  <p className="text-xs text-slate-400">{req.location}</p>
                </td>
                <td className="p-4 text-sm text-slate-600">{req.wasteType}</td>
                <td className="p-4 text-sm text-slate-500">{new Date(req.scheduledDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                </td>
                <td className="p-4 text-right">
                  <select 
                    value={req.status}
                    onChange={(e) => onUpdateStatus(req.id, e.target.value as PickupStatus)}
                    className="text-xs border border-slate-200 p-1.5 rounded-lg bg-white shadow-sm outline-none"
                  >
                    {Object.values(PickupStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
