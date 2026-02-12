
import React, { useState, useEffect } from 'react';
import { User, PickupRequest, WasteType, PickupStatus, Priority, Coordinates, UserRole } from '../types';
import { STATUS_COLORS, WASTE_ICONS, PRIORITY_COLORS } from '../constants';
import { getWasteManagementTips } from '../services/geminiService';
import { WasteScanner } from './WasteScanner';
import { apiService } from '../services/apiService';

interface ResidentDashboardProps {
  user: User;
  requests: PickupRequest[];
  onAddRequest: (req: Omit<PickupRequest, 'id' | 'status'>) => void;
  onUpdateStatus: (id: string, status: PickupStatus) => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({ user, requests, onAddRequest, onUpdateStatus }) => {
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [wasteType, setWasteType] = useState<WasteType>(WasteType.GENERAL);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [date, setDate] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactPhone, setContactPhone] = useState(user.phone);
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<Coordinates | undefined>(undefined);
  const [preferredPspId, setPreferredPspId] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [aiTip, setAiTip] = useState('Generating clean city insights...');
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [availablePsps, setAvailablePsps] = useState<User[]>([]);
  const [contactingPSP, setContactingPSP] = useState<User | null>(null);

  useEffect(() => {
    const fetchPsps = async () => {
      const users = await apiService.getUsers();
      setAvailablePsps(users.filter(u => u.role === UserRole.PSP_OPERATOR));
    };
    fetchPsps();
  }, []);

  const fetchTip = async (type: WasteType) => {
    setIsTipLoading(true);
    const tip = await getWasteManagementTips(type);
    setAiTip(tip);
    setIsTipLoading(false);
  };

  useEffect(() => {
    fetchTip(wasteType);
  }, [wasteType]);

  const fetchLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error fetching location", error);
        alert("Unable to fetch location. Please ensure GPS is enabled.");
        setIsLocating(false);
      }
    );
  };

  const handleContactPSP = async (pspId?: string) => {
    if (!pspId) return;
    const users = await apiService.getUsers();
    const psp = users.find(u => u.id === pspId);
    if (psp) setContactingPSP(psp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRequest({
      residentId: user.id,
      residentName: user.name,
      location: user.location,
      houseNumber,
      streetName,
      landmark,
      contactPhone,
      coordinates: coords,
      wasteType,
      priority,
      operatorId: preferredPspId || undefined,
      scheduledDate: date || new Date().toISOString().split('T')[0],
      notes: notes || 'Please call before arrival',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-emerald-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden group">
          <div className="relative z-10 flex items-start gap-4">
            <div className="text-3xl shrink-0 mt-1">🤖</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">AI Waste Insight</h3>
                <button onClick={() => fetchTip(wasteType)} className="text-[9px] bg-emerald-800/50 hover:bg-emerald-700 px-2 py-0.5 rounded transition-colors uppercase font-bold" disabled={isTipLoading}>Refresh</button>
              </div>
              <p className={`text-sm leading-relaxed italic ${isTipLoading ? 'opacity-50' : 'opacity-100'}`}>"{aiTip}"</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowScanner(true)}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all group flex items-center gap-4 text-left"
        >
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-xl shrink-0">📸</div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Waste Scanner</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Identify waste via camera</p>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Pickups</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${showForm ? 'bg-slate-200 dark:bg-slate-800 text-slate-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50'}`}
        >
          {showForm ? '✕ Close' : '➕ Request Pickup'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">📝 Disposal Request Form</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="sm:col-span-1 lg:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Waste Category</label>
              <select value={wasteType} onChange={(e) => setWasteType(e.target.value as WasteType)} className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500">
                {Object.values(WasteType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Urgency</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold">
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pickup Date</label>
              <input type="date" required min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">PSP Partner</label>
              <select required value={preferredPspId} onChange={(e) => setPreferredPspId(e.target.value)} className="w-full text-sm p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800 rounded-lg outline-none font-bold text-emerald-800">
                <option value="">Choose Operator...</option>
                {availablePsps.map(psp => <option key={psp.id} value={psp.id}>{psp.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">House Number</label>
              <input type="text" required placeholder="Plot 12A" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Street Name</label>
              <input type="text" required placeholder="Osuntokun Ave" value={streetName} onChange={(e) => setStreetName(e.target.value)} className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone</label>
              <input type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={fetchLocation} disabled={isLocating} className="w-full text-[10px] font-black uppercase py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors">
                {coords ? '📍 GPS Attached' : isLocating ? 'Locating...' : '📍 Tag GPS'}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md">Submit Request</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{WASTE_ICONS[req.wasteType]}</span>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[req.status]}`}>
                  {req.status.replace('_', ' ')}
                </span>
                <span className={`text-[8px] font-bold text-slate-400 uppercase`}>#{req.id.slice(-4)}</span>
              </div>
            </div>
            
            <div className="mb-4 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{req.wasteType}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">🏠 {req.houseNumber} {req.streetName}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{req.location}</p>
            </div>

            <div className="pt-3 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button onClick={() => handleContactPSP(req.operatorId)} className="text-[9px] font-black uppercase py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-500">Contact</button>
                {req.status === PickupStatus.ON_THE_WAY && <button onClick={() => onUpdateStatus(req.id, PickupStatus.COMPLETED)} className="text-[9px] font-black uppercase py-1.5 bg-emerald-600 text-white rounded-lg">Confirm</button>}
            </div>
          </div>
        ))}
      </div>

      {showScanner && <WasteScanner onClose={() => setShowScanner(false)} />}
    </div>
  );
};
