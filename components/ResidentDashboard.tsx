
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
  const [aiTip, setAiTip] = useState<string>('Generating clean city insights...');
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
    setWasteType(WasteType.GENERAL);
    setPriority(Priority.MEDIUM);
    setDate('');
    setHouseNumber('');
    setStreetName('');
    setLandmark('');
    setNotes('');
    setCoords(undefined);
    setPreferredPspId('');
  };

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-emerald-900 dark:bg-emerald-950 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className={`text-5xl transition-transform ${isTipLoading ? 'animate-pulse scale-110' : 'group-hover:scale-110'}`}>
              {isTipLoading ? '✨' : '🤖'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-emerald-400 font-semibold">AI Waste Insight</h3>
                <button 
                  onClick={() => fetchTip(wasteType)} 
                  className="text-[10px] bg-emerald-800 dark:bg-emerald-900 hover:bg-emerald-700 dark:hover:bg-emerald-800 px-2 py-1 rounded-md transition-colors"
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

        <button 
          onClick={() => setShowScanner(true)}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-emerald-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all group flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
            📸
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white">Scan Waste with AI</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Unsure how to dispose? Take a photo!</p>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Pickups</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${showForm ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
        >
          {showForm ? '✕ Close Form' : '➕ Request Pickup'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in slide-in-from-top-4 transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span>📝</span> New Disposal Request
          </h3>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Waste Category</label>
                <select value={wasteType} onChange={(e) => setWasteType(e.target.value as WasteType)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200">
                  {Object.values(WasteType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Urgency Level</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200">
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p} Priority</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Preferred Date</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium dark:text-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">House Number</label>
                <input type="text" required placeholder="e.g. Plot 12A" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Street Name</label>
                <input type="text" required placeholder="e.g. Osuntokun Ave" value={streetName} onChange={(e) => setStreetName(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Landmark</label>
                <input type="text" placeholder="e.g. Near Bodija Market" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contact Phone</label>
                <input type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-slate-200" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Choose Waste Collector (PSP)</label>
              <select 
                required
                value={preferredPspId} 
                onChange={(e) => setPreferredPspId(e.target.value)} 
                className="w-full p-4 bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-800 dark:text-emerald-400"
              >
                <option value="">Select a Professional PSP...</option>
                {availablePsps.map(psp => (
                  <option key={psp.id} value={psp.id}>{psp.name} — Covering {psp.location}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-2 italic">Select your preferred organization to handle this specific pickup.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><span>🗺️</span> Digital Map Attachment</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Providing GPS coordinates helps operators find your address precisely.</p>
              </div>
              <div className="flex items-center gap-4">
                {coords ? (
                   <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 animate-in zoom-in-95">
                     <span>📍 GPS Attached: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                     <button type="button" onClick={() => setCoords(undefined)} className="text-emerald-900 dark:text-emerald-200 hover:text-emerald-700 dark:hover:text-emerald-400">✕</button>
                   </div>
                ) : (
                  <button type="button" onClick={fetchLocation} disabled={isLocating} className="bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                    {isLocating ? '📡 Locating...' : '📍 Fetch Current GPS'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Additional Instructions (Optional)</label>
              <textarea placeholder="e.g. Ring bell twice, gate is black, leave bin outside..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] dark:text-slate-200" />
            </div>
          </div>

          <button type="submit" className="w-full mt-10 bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none">
            Submit Request to Chosen PSP
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${req.status === PickupStatus.ON_THE_WAY ? 'border-yellow-400 ring-4 ring-yellow-400/10' : 'border-slate-200 dark:border-slate-800'} shadow-sm hover:shadow-xl hover:border-emerald-100 dark:hover:border-emerald-900/50 transition-all group`}>
            {req.status === PickupStatus.ON_THE_WAY && (
                <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400 animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    Driver is On the Way
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <span className="text-4xl group-hover:scale-110 transition-transform">{WASTE_ICONS[req.wasteType]}</span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${STATUS_COLORS[req.status]} dark:opacity-90`}>
                  {req.status.replace('_', ' ')}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-tighter flex items-center gap-1 ${PRIORITY_COLORS[req.priority]} dark:opacity-90`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {req.priority} Priority
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-0.5">{req.wasteType}</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                <span className="opacity-60 text-lg">🏠</span> {req.houseNumber} {req.streetName}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                 <span className="font-black uppercase tracking-widest text-[8px]">Zone:</span> {req.location}
              </p>
              {req.landmark && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">📍 Near: {req.landmark}</p>}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
               <div className="flex items-center justify-between text-[11px]">
                  <div className="text-slate-400">
                    <p className="uppercase font-black text-[9px] tracking-widest mb-0.5">Scheduled</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{new Date(req.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="uppercase font-black text-[9px] tracking-widest mb-0.5">PSP Partner</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[100px]">{req.operatorName || 'Assigning...'}</p>
                  </div>
               </div>
               
               {req.status !== PickupStatus.COMPLETED && req.status !== PickupStatus.CANCELLED && (
                   <div className="grid grid-cols-2 gap-2 mt-2">
                      <button 
                        onClick={() => handleContactPSP(req.operatorId)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                      >
                        📞 Contact
                      </button>
                      {(req.status === PickupStatus.ON_THE_WAY || req.status === PickupStatus.SCHEDULED) && (
                        <button 
                            onClick={() => onUpdateStatus(req.id, PickupStatus.COMPLETED)}
                            className="bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-sm"
                        >
                            ✅ Done
                        </button>
                      )}
                   </div>
               )}
            </div>
          </div>
        ))}

        {requests.length === 0 && !showForm && (
          <div className="col-span-full py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
            <div className="text-7xl mb-6">✨</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Your schedule is clear!</h3>
            <p className="text-slate-400 mt-2 max-w-xs mx-auto">Help keep Ibadan flood-free by scheduling your waste collection today.</p>
            <button onClick={() => setShowForm(true)} className="mt-8 text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-widest hover:underline">
              Get Started Now →
            </button>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactingPSP && (
          <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                    🏢
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{contactingPSP.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 italic">Partnering for a Clean Oyo State</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span className="text-xl">📞</span>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{contactingPSP.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span className="text-xl">📧</span>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{contactingPSP.email}</p>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a href={`tel:${contactingPSP.phone}`} className="bg-emerald-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200">Call Now</a>
                    <button onClick={() => setContactingPSP(null)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">Close</button>
                  </div>
              </div>
          </div>
      )}

      {showScanner && <WasteScanner onClose={() => setShowScanner(false)} />}
    </div>
  );
};
