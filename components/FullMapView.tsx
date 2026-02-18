
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, PickupRequest, PickupStatus, UserRole } from '../types';
import { IBADAN_ZONES } from '../constants';
// import { getRouteOptimizationAdvice, RouteOptimizationResult } from '../services/geminiService';
import { apiService } from '../services/apiService';

declare const L: any;

interface FullMapViewProps {
  user: User;
  requests: PickupRequest[];
}

export const FullMapView: React.FC<FullMapViewProps> = ({ user, requests }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  // const [optimization, setOptimization] = useState<RouteOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [allPsps, setAllPsps] = useState<User[]>([]);

  const isResident = user.role === UserRole.RESIDENT;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const initialLat = user.coordinates?.lat || 7.3775;
    const initialLng = user.coordinates?.lng || 3.9470;
    mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(mapRef.current);
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [user.coordinates]);

  // Fetch PSPs
  useEffect(() => {
    if (isResident) {
      apiService.getUsers().then(users => setAllPsps(users.filter(u => u.role === UserRole.PSP_OPERATOR)));
    }
  }, [isResident]);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    if (user.coordinates) {
      const userIcon = L.divIcon({
        html: `<div class="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-sm shadow-md border-2 border-white">🏠</div>`,
        className: 'custom-div-icon', iconSize: [24, 24], iconAnchor: [12, 12]
      });
      markersRef.current.push(L.marker([user.coordinates.lat, user.coordinates.lng], { icon: userIcon }).addTo(mapRef.current));
    }

    if (isResident) {
      allPsps.forEach(psp => {
        if (!psp.coordinates) return;
        const pspIcon = L.divIcon({
          html: `<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-base shadow-lg border-2 border-white">🚛</div>`,
          className: 'custom-div-icon', iconSize: [32, 32], iconAnchor: [16, 16]
        });
        const marker = L.marker([psp.coordinates.lat, psp.coordinates.lng], { icon: pspIcon }).addTo(mapRef.current);
        marker.on('click', () => setSelectedItem(psp));
        markersRef.current.push(marker);
      });
    } else {
      const activePickups = requests.filter(r => r.status !== PickupStatus.COMPLETED && r.status !== PickupStatus.CANCELLED);
      activePickups.forEach((req, idx) => {
        if (!req.coordinates) return;
        const stopOrder = null; // optimization ? optimization.optimizedOrder.indexOf(idx) + 1 : null;
        const pinIcon = L.divIcon({
          html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-black text-white ${req.status === PickupStatus.SCHEDULED ? 'bg-blue-500' : 'bg-orange-500'}">${stopOrder || '📍'}</div>`,
          className: 'custom-div-icon', iconSize: [32, 32], iconAnchor: [16, 16]
        });
        const marker = L.marker([req.coordinates.lat, req.coordinates.lng], { icon: pinIcon }).addTo(mapRef.current);
        marker.on('click', () => setSelectedItem(req));
        markersRef.current.push(marker);
      });

      // if (optimization && activePickups.length > 1) {
      //   const pathPoints = optimization.optimizedOrder
      //     .map(idx => activePickups[idx])
      //     .filter(r => r && r.coordinates)
      //     .map(r => [r.coordinates!.lat, r.coordinates!.lng]);
      //   polylineRef.current = L.polyline(pathPoints, { color: '#10b981', weight: 4, opacity: 0.6, dashArray: '8, 8' }).addTo(mapRef.current);
      // }
    }
  }, [allPsps, requests, isResident, user]);

  // const handleOptimizeRoute = async () => {
  //   const active = requests.filter(r => r.status !== PickupStatus.COMPLETED);
  //   if (active.length < 2) return;
  //   setIsOptimizing(true);
  //   try {
  //     const result = await getRouteOptimizationAdvice(active.map(r => `${r.houseNumber} ${r.streetName}, ${r.location}`));
  //     setOptimization(result);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setIsOptimizing(false);
  //   }
  // };

  const handleLaunchNavigator = () => {
    if (!selectedItem || !selectedItem.coordinates) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.coordinates.lat},${selectedItem.coordinates.lng}`, '_blank');
  };

  const handleRequestPartnership = async () => {
    if (!isResident || !selectedItem || selectedItem.role !== UserRole.PSP_OPERATOR) return;
    setIsUpdatingUser(true);
    try {
      const updatedUser = { ...user, preferredPspId: selectedItem.id };
      await apiService.saveUser(updatedUser);
      alert(`Partnership Request Sent! ${selectedItem.name} has been set as your preferred provider.`);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // const sortedItems = useMemo(() => {
  //   const list = isResident ? allPsps : requests.filter(r => r.status !== PickupStatus.COMPLETED);
  //   if (!isResident && optimization) return optimization.optimizedOrder.map(idx => (list as PickupRequest[])[idx]).filter(Boolean);
  //   return list;
  // }, [allPsps, requests, optimization, isResident]);

  return (
    <div className="h-full flex flex-col overflow-hidden gap-3">
      <div className="flex justify-between items-center shrink-0 px-1">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Ibadan Operational Map</h2>
          <p className="text-[10px] text-slate-500">{isResident ? 'Find and partner with verified PSP operators.' : 'Efficiently manage your collection route.'}</p>
        </div>
        <div className="flex gap-1.5">
          {/* {!isResident && (
            <button 
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || requests.filter(r => r.status !== PickupStatus.COMPLETED).length < 2}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {isOptimizing ? '🤖 Optimizing...' : '✨ AI Optimize'}
            </button>
          )} */}
          <button 
            onClick={() => mapRef.current?.flyTo([user.coordinates?.lat || 7.3775, user.coordinates?.lng || 3.9470], 15)} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400"
          >
            📡 Local Radar
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        <div className="flex-1 rounded-xl relative overflow-hidden border-4 border-slate-800 dark:border-slate-900 shadow-xl z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        <div className="w-full md:w-72 flex flex-col gap-3 shrink-0 min-h-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-h-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{isResident ? 'Near Providers' : 'Job Sequence'}</h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-hide">
              {sortedItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedItem(item); if (item.coordinates) mapRef.current?.flyTo([item.coordinates.lat, item.coordinates.lng], 16); }}
                  className={`w-full p-2.5 rounded-lg border text-left flex gap-3 items-center transition-all ${selectedItem?.id === item.id ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${isResident ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {isResident ? '🚛' : i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{isResident ? (item as User).name : (item as PickupRequest).residentName}</p>
                    <p className="text-[9px] text-slate-400 truncate">{item.location}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedItem && (
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl animate-in slide-in-from-right-4">
               <div className="flex justify-between items-start mb-3">
                 <h4 className="text-white font-black text-[9px] uppercase tracking-widest">{isResident ? 'PSP Profile' : 'Resident Info'}</h4>
                 <button onClick={() => setSelectedItem(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
               </div>
               <div className="space-y-3">
                 <p className="text-sm text-emerald-400 font-bold truncate">{isResident ? (selectedItem as User).name : (selectedItem as PickupRequest).residentName}</p>
                 <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="text-slate-400">Zone: <span className="text-white">{selectedItem.location}</span></div>
                    {!isResident && <div className="text-slate-400">Status: <span className="text-blue-400">{selectedItem.status}</span></div>}
                 </div>
                 <div className="flex flex-col gap-2 pt-1">
                   <button 
                    onClick={handleLaunchNavigator} 
                    className="w-full bg-slate-800 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
                   >
                     🚀 Navigate
                   </button>
                   {isResident && (
                     <button 
                      onClick={handleRequestPartnership}
                      disabled={isUpdatingUser || user.preferredPspId === selectedItem.id}
                      className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${user.preferredPspId === selectedItem.id ? 'bg-emerald-900/50 text-emerald-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                     >
                       {isUpdatingUser ? 'WAIT...' : user.preferredPspId === selectedItem.id ? 'PRIMARY PARTNER' : 'SET AS PARTNER'}
                     </button>
                   )}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
      <style>{`.custom-div-icon { background: none; border: none; } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};