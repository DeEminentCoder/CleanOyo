
import React, { useState } from 'react';
import { User, PickupRequest, PickupStatus, WasteType } from '../types';
import { STATUS_COLORS, IBADAN_ZONES } from '../constants';

interface PSPOperatorDashboardProps {
  user: User;
  requests: PickupRequest[];
  onUpdateStatus: (id: string, status: PickupStatus) => void;
  onAddRequest: (req: Omit<PickupRequest, 'id' | 'status'>) => void;
}

export const PSPOperatorDashboard: React.FC<PSPOperatorDashboardProps> = ({ user, requests, onUpdateStatus, onAddRequest }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    residentName: '',
    location: '',
    wasteType: WasteType.GENERAL,
    notes: ''
  });

  const stats = [
    { label: 'Today\'s Total', value: requests.length, icon: '📋' },
    { label: 'Completed', value: requests.filter(r => r.status === PickupStatus.COMPLETED).length, icon: '✅' },
    { label: 'Remaining', value: requests.filter(r => r.status !== PickupStatus.COMPLETED).length, icon: '🚛' },
  ];

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    // Fix: Updated to use operatorId/operatorName and provided missing createdAt/updatedAt fields.
    onAddRequest({
      residentId: 'guest-' + Date.now(),
      residentName: formData.residentName,
      location: formData.location,
      wasteType: formData.wasteType,
      scheduledDate: new Date().toISOString().split('T')[0],
      operatorId: user.id,
      operatorName: user.name,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setFormData({ residentName: '', location: '', wasteType: WasteType.GENERAL, notes: '' });
    setShowConfirmDialog(false);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Operator Overview</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          {showAddForm ? 'Cancel' : '➕ Add Manual Pickup'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleInitialSubmit} className="bg-white p-6 rounded-xl border-2 border-emerald-100 shadow-lg animate-in fade-in slide-in-from-top-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📝</span> Manual Pickup Entry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resident Name</label>
              <input 
                type="text" 
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. John Doe"
                value={formData.residentName}
                onChange={e => setFormData({...formData, residentName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input 
                type="text" 
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Street address or landmark"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Waste Type</label>
              <select 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.wasteType}
                onChange={e => setFormData({...formData, wasteType: e.target.value as WasteType})}
              >
                {Object.values(WasteType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Instructions</label>
              <input 
                type="text" 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Urgent, gated community, etc."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md">
              Review and Save
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Dialog Overlay */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4 text-3xl">
                ❓
              </div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Pickup Addition</h3>
              <p className="text-slate-500 mt-2">Please verify the details before adding this to your route.</p>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Resident:</span>
                <span className="font-semibold text-slate-900">{formData.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900 text-right">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="font-semibold text-emerald-600">{formData.wasteType}</span>
              </div>
              {formData.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Notes:</span>
                  <p className="text-slate-700 italic">"{formData.notes}"</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleFinalConfirm}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Yes, Add to My Route
              </button>
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Go Back and Edit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-3xl p-3 bg-slate-50 rounded-xl">{stat.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-800">Job Board</h3>
            <div className="flex gap-2">
               <button className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md font-bold">Active</button>
               <button className="px-3 py-1 text-xs bg-slate-100 text-slate-500 rounded-md font-bold">Past</button>
            </div>
          </div>
          
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                    {req.residentId.startsWith('guest-') ? '👤' : '📍'}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 flex items-center gap-2">
                      {req.residentName}
                      {req.residentId.startsWith('guest-') && <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Manual Entry</span>}
                    </h5>
                    <p className="text-sm text-slate-500">{req.location}</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">{req.wasteType}</p>
                    {req.notes && <p className="text-[10px] text-slate-400 italic mt-1">"{req.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <select 
                    value={req.status}
                    onChange={(e) => onUpdateStatus(req.id, e.target.value as PickupStatus)}
                    className={`text-xs font-bold p-2 rounded-lg outline-none cursor-pointer ${STATUS_COLORS[req.status]}`}
                  >
                    <option value={PickupStatus.SCHEDULED}>SCHEDULED</option>
                    <option value={PickupStatus.ON_THE_WAY}>ON THE WAY</option>
                    <option value={PickupStatus.COMPLETED}>COMPLETED</option>
                    <option value={PickupStatus.CANCELLED}>CANCELLED</option>
                  </select>
                  <button className="p-2 text-slate-400 hover:text-emerald-600">🗺️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Map / Quick View */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Route Map (Ibadan)</h3>
          <div className="bg-slate-200 h-64 rounded-2xl relative overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
            <p className="text-slate-400 font-medium z-10">Interactive Map Visualization</p>
            <div className="absolute inset-0 opacity-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10 20 Q 30 10, 50 20 T 90 20" fill="none" stroke="#059669" strokeWidth="1" />
                <path d="M10 50 Q 40 40, 60 60 T 90 50" fill="none" stroke="#059669" strokeWidth="1" />
                <path d="M20 10 Q 15 40, 30 90" fill="none" stroke="#059669" strokeWidth="1" />
              </svg>
            </div>
            {IBADAN_ZONES.map((zone, i) => (
               <div 
                key={zone.id}
                className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125 ${zone.floodRisk === 'High' ? 'bg-red-500' : zone.floodRisk === 'Medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                style={{ top: `${20 + i * 12}%`, left: `${15 + i * 15}%` }}
                title={`${zone.name} - Risk: ${zone.floodRisk}`}
               />
            ))}
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-800 mb-3">Zone Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <span>High Flood Risk</span>
                 </div>
                 <span className="text-slate-400">2 Zones</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <span>Medium Risk</span>
                 </div>
                 <span className="text-slate-400">2 Zones</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                   <span>Safe / Low Risk</span>
                 </div>
                 <span className="text-slate-400">2 Zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
