
import React, { useState } from 'react';
import { User, PickupRequest, PickupStatus, WasteType, Priority } from '../types';
import { STATUS_COLORS, IBADAN_ZONES, PRIORITY_COLORS, WASTE_ICONS } from '../constants';

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
    houseNumber: '',
    streetName: '',
    landmark: '',
    contactPhone: '',
    wasteType: WasteType.GENERAL,
    priority: Priority.MEDIUM,
    notes: ''
  });

  const stats = [
    { label: 'Pending Approval', value: requests.filter(r => r.status === PickupStatus.PENDING).length, icon: '🔔' },
    { label: 'Active Jobs', value: requests.filter(r => r.status === PickupStatus.SCHEDULED || r.status === PickupStatus.ON_THE_WAY).length, icon: '🚛' },
    { label: 'Completed Today', value: requests.filter(r => r.status === PickupStatus.COMPLETED).length, icon: '✅' },
  ];

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    onAddRequest({
      residentId: 'guest-' + Date.now(),
      residentName: formData.residentName,
      location: user.location,
      houseNumber: formData.houseNumber,
      streetName: formData.streetName,
      landmark: formData.landmark,
      contactPhone: formData.contactPhone,
      wasteType: formData.wasteType,
      priority: formData.priority,
      scheduledDate: new Date().toISOString().split('T')[0],
      operatorId: user.id,
      operatorName: user.name,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setFormData({ 
      residentName: '', 
      houseNumber: '', 
      streetName: '', 
      landmark: '', 
      contactPhone: '', 
      wasteType: WasteType.GENERAL, 
      priority: Priority.MEDIUM, 
      notes: '' 
    });
    setShowConfirmDialog(false);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Operational Dashboard</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">House Number</label>
              <input 
                type="text" 
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Plot 12A"
                value={formData.houseNumber}
                onChange={e => setFormData({...formData, houseNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Street Name</label>
              <input 
                type="text" 
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Osuntokun Ave"
                value={formData.streetName}
                onChange={e => setFormData({...formData, streetName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input 
                type="tel" 
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="080XXXXXXXX"
                value={formData.contactPhone}
                onChange={e => setFormData({...formData, contactPhone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
              <select 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p} Priority</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Landmark</label>
              <input 
                type="text" 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Near Market"
                value={formData.landmark}
                onChange={e => setFormData({...formData, landmark: e.target.value})}
              />
            </div>
            <div className="md:col-span-4">
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
                <span className="text-slate-500">Address:</span>
                <span className="font-semibold text-slate-900 text-right">{formData.houseNumber} {formData.streetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="font-semibold text-emerald-600">{formData.wasteType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority:</span>
                <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded border ${PRIORITY_COLORS[formData.priority]}`}>{formData.priority}</span>
              </div>
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
            <h3 className="text-xl font-bold text-slate-800">Operational Job Board</h3>
          </div>
          
          <div className="space-y-3">
            {[...requests].sort((a, b) => {
              const statusPriority = { [PickupStatus.PENDING]: 0, [PickupStatus.SCHEDULED]: 1, [PickupStatus.ON_THE_WAY]: 2, [PickupStatus.COMPLETED]: 3, [PickupStatus.CANCELLED]: 4 };
              const priorityMap = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
              
              if (statusPriority[a.status] !== statusPriority[b.status]) {
                return statusPriority[a.status] - statusPriority[b.status];
              }
              return priorityMap[a.priority] - priorityMap[b.priority];
            }).map(req => (
              <div key={req.id} className={`bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${req.priority === Priority.HIGH ? 'ring-2 ring-red-500/10 border-red-100' : ''}`}>
                <div className="flex gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                    {WASTE_ICONS[req.wasteType] || '📍'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h5 className="font-bold text-slate-900 truncate">
                        {req.residentName}
                      </h5>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${PRIORITY_COLORS[req.priority]}`}>
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 font-bold truncate">
                       🏠 {req.houseNumber} {req.streetName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">📞 {req.contactPhone} • {req.wasteType}</p>
                    {req.notes && <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">"{req.notes}"</p>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex gap-2 w-full sm:w-auto">
                    {req.status === PickupStatus.PENDING && (
                        <button 
                            onClick={() => onUpdateStatus(req.id, PickupStatus.SCHEDULED)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                        >
                            Accept Job
                        </button>
                    )}
                    {req.status === PickupStatus.SCHEDULED && (
                        <button 
                            onClick={() => onUpdateStatus(req.id, PickupStatus.ON_THE_WAY)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-yellow-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-600 transition-colors"
                        >
                            Start Journey
                        </button>
                    )}
                    {(req.status === PickupStatus.ON_THE_WAY || req.status === PickupStatus.SCHEDULED) && (
                        <button 
                            onClick={() => onUpdateStatus(req.id, PickupStatus.COMPLETED)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                        >
                            Mark Completed
                        </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-1.5 rounded-lg border uppercase tracking-widest ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                    </span>
                    <a 
                        href={`tel:${req.contactPhone}`}
                        className="p-2 bg-slate-100 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors border border-slate-200"
                        title="Call Resident"
                    >
                        📞
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
                <div className="p-10 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl italic">
                    No jobs currently assigned to your team.
                </div>
            )}
          </div>
        </div>

        {/* Zone Map / Quick View */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Operational Zones</h3>
          <div className="bg-slate-200 h-64 rounded-2xl relative overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
            <p className="text-slate-400 font-medium z-10">Ibadan Deployment Map</p>
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
            <h4 className="font-bold text-sm text-slate-800 mb-3 text-center uppercase tracking-widest text-[10px] text-slate-400">Risk Assessment</h4>
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
