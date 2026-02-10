
import React from 'react';
import { PickupRequest } from '../types';
import { IBADAN_ZONES } from '../constants';

export const ZoneStats: React.FC<{ requests: PickupRequest[] }> = ({ requests }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Zone Management & Coverage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {IBADAN_ZONES.map(zone => (
          <div key={zone.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-lg text-slate-900">{zone.name}</h4>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase
                ${zone.floodRisk === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
              `}>
                {zone.floodRisk} Risk
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Active Requests</span>
                <span className="font-bold text-slate-900">{zone.activeRequests}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Collection Eff.</span>
                <span className="font-bold text-emerald-600">92%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                 <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
