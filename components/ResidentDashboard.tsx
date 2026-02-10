
import React, { useState, useEffect } from 'react';
import { User, PickupRequest, WasteType, PickupStatus } from '../types';
import { STATUS_COLORS, WASTE_ICONS } from '../constants';
import { getWasteManagementTips } from '../services/geminiService';

interface ResidentDashboardProps {
  user: User;
  requests: PickupRequest[];
  onAddRequest: (req: Omit<PickupRequest, 'id' | 'status'>) => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({ user, requests, onAddRequest }) => {
  const [showForm, setShowForm] = useState(false);
  const [wasteType, setWasteType] = useState<WasteType>(WasteType.GENERAL);
  const [date, setDate] = useState('');
  const [aiTip, setAiTip] = useState<string>('Generating clean city insights...');
  const [isTipLoading, setIsTipLoading] = useState(false);

  const fetchTip = async (type: WasteType) => {
    setIsTipLoading(true);
    const tip = await getWasteManagementTips(type);
    setAiTip(tip);
    setIsTipLoading(false);
  };

  useEffect(() => {
    fetchTip(wasteType);
  }, [wasteType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRequest({
      residentId: user.id,
      residentName: user.name,
      location: 'Bodija Estate, Phase 2',
      wasteType,
      scheduledDate: date || new Date().toISOString().split('T')[0],
      notes: 'Please call before arrival',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* AI Tip Section */}
      <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className={`text-5xl transition-transform ${isTipLoading ? 'animate-pulse scale-110' : 'group-hover:scale-110'}`}>
            {isTipLoading ? '✨' : '🤖'}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-emerald-400 font-semibold">AI Waste Insight</h3>
              <button 
                onClick={() => fetchTip(wasteType)} 
                className="text-[10px] bg-emerald-800 hover:bg-emerald-700 px-2 py-1 rounded-md transition-colors"
                disabled={isTipLoading}
              >
                {isTipLoading ? 'Processing...' : 'Refresh Tip'}
              </button>
            </div>
            <p className={`text-emerald-50 leading-relaxed italic transition-opacity ${isTipLoading ? 'opacity-50' : 'opacity-100'}`}>
              "{aiTip}"
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl">🌱</div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">My Pickups</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          {showForm ? 'Cancel' : '➕ Request Pickup'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Waste Category</label>
              <select 
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value as WasteType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {Object.values(WasteType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
            Confirm Request
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl">{WASTE_ICONS[req.wasteType]}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_COLORS[req.status]}`}>
                {req.status.replace('_', ' ')}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{req.wasteType}</h4>
            <p className="text-sm text-slate-500 mb-4">{req.location}</p>
            <div className="flex items-center justify-between text-xs border-t pt-4">
              <div className="text-slate-400">
                <p>Scheduled For</p>
                <p className="font-semibold text-slate-700">{new Date(req.scheduledDate).toLocaleDateString()}</p>
              </div>
              {req.operatorName && (
                <div className="text-right">
                  <p className="text-slate-400">Assigned PSP</p>
                  <p className="font-semibold text-emerald-600">{req.operatorName}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && !showForm && (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-slate-500">Your schedule is clear! No pending pickups.</p>
          </div>
        )}
      </div>
    </div>
  );
};
