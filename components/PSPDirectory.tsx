
import React, { useState } from 'react';
import { UserRole } from '../types';

interface PSPData {
  id: string;
  name: string;
  zone: string;
  workers: number;
  status: string;
  lead: string;
  email: string;
  phone: string;
  fleetSize: number;
  efficiency: number;
  subZones: string[];
}

interface PSPDirectoryProps {
  userRole: UserRole;
}

export const PSPDirectory: React.FC<PSPDirectoryProps> = ({ userRole }) => {
  const [selectedPSP, setSelectedPSP] = useState<PSPData | null>(null);

  const managers: PSPData[] = [
    { 
      id: 'psp-1', 
      name: 'CleanOyo Ltd', 
      zone: 'Ibadan North', 
      workers: 24, 
      status: 'Active', 
      lead: 'Alhaji Kareem',
      email: 'contact@cleanoyo.ng',
      phone: '0802-345-6789',
      fleetSize: 12,
      efficiency: 94,
      subZones: ['Bodija', 'Samonda', 'UI Area']
    },
    { 
      id: 'psp-2', 
      name: 'EcoWaste Ibadan', 
      zone: 'Ibadan North-East', 
      workers: 18, 
      status: 'Active', 
      lead: 'Sarah Johnson',
      email: 'sarah@ecowaste.ng',
      phone: '0812-987-6543',
      fleetSize: 8,
      efficiency: 88,
      subZones: ['Agodi', 'Iwo Road', 'Bashorun']
    },
    { 
      id: 'psp-3', 
      name: 'Green Path Ltd', 
      zone: 'Ibadan South-West', 
      workers: 32, 
      status: 'Probation', 
      lead: 'Emeka Obi',
      email: 'operations@greenpath.ng',
      phone: '0901-111-2222',
      fleetSize: 15,
      efficiency: 72,
      subZones: ['Ring Road', 'Liberty', 'Challenge']
    },
    { 
      id: 'psp-4', 
      name: 'Ibadan Central Cleaners', 
      zone: 'Ibadan Central', 
      workers: 12, 
      status: 'Active', 
      lead: 'Femi Adeyemi',
      email: 'femi@ib-central.ng',
      phone: '0703-444-5555',
      fleetSize: 5,
      efficiency: 91,
      subZones: ['Dugbe', 'Mokola', 'Gbagi']
    }
  ];

  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">PSP Operator Directory</h2>
          <p className="text-sm text-slate-500">
            {isAdmin ? 'Manage and monitor all active waste service providers.' : 'View partner operators and service coverage area.'}
          </p>
        </div>
        {isAdmin && (
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors">
            Register New PSP
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {managers.map((m) => (
          <div 
            key={m.id} 
            onClick={() => setSelectedPSP(m)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-emerald-50 transition-colors">
                {m.status === 'Active' ? '🚛' : '⏳'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{m.name}</h4>
                <p className="text-xs text-slate-500 mb-3">{m.zone} • {m.workers} Employees</p>
                <div className="flex gap-2">
                   <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Lead: {m.lead}</span>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {m.status}
                   </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
              <span className="text-emerald-600 font-black text-lg">{m.efficiency}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Efficiency</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Profile Modal */}
      {selectedPSP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="bg-slate-900 p-8 text-white relative">
              <button 
                onClick={() => setSelectedPSP(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">🏢</div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedPSP.name}</h3>
                  <p className="text-emerald-400 font-medium">Primary Zone: {selectedPSP.zone}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Fleet Size</p>
                      <p className="text-xl font-bold text-slate-900">{selectedPSP.fleetSize} Trucks</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1">Efficiency</p>
                      <p className="text-xl font-bold text-emerald-700">{selectedPSP.efficiency}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Service Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPSP.subZones.map((sz, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contact Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">👤</div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Operations Lead</p>
                        <p className="text-sm font-bold text-slate-800">{selectedPSP.lead}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">✉️</div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Official Email</p>
                        <p className="text-sm font-bold text-emerald-600 underline cursor-pointer">{selectedPSP.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">📞</div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Hotline</p>
                        <p className="text-sm font-bold text-slate-800">{selectedPSP.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPSP(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Close Profile
              </button>
              {isAdmin && (
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                  Edit Partnership
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
