
import React from 'react';
import { PickupRequest } from '../types';
import { STATUS_COLORS, WASTE_ICONS } from '../constants';

export const ResidentSchedule: React.FC<{ requests: PickupRequest[] }> = ({ requests }) => {
  const upcoming = requests.filter(r => new Date(r.scheduledDate) >= new Date()).sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Collection Schedule</h2>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-700">Upcoming Pickups</h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Ibadan North District</span>
        </div>
        <div className="divide-y divide-slate-100">
          {upcoming.length > 0 ? upcoming.map(req => (
            <div key={req.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                  {WASTE_ICONS[req.wasteType]}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{req.wasteType}</p>
                  <p className="text-sm text-slate-500">{new Date(req.scheduledDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                <button className="text-slate-400 hover:text-emerald-600">Edit</button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400">
              <p>No upcoming pickups scheduled.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
