
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, PickupRequest, PickupStatus, UserRole } from '../types';
import { IBADAN_ZONES } from '../constants';
import { getRouteOptimizationAdvice, RouteOptimizationResult } from '../services/geminiService';
import { apiService } from '../services/apiService';

// Add type for Leaflet since it's loaded via script tag
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
  const [optimization, setOptimization] = useState<RouteOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [allPsps, setAllPsps] = useState<User[]>([]);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const isResident = user.role === UserRole.RESIDENT;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Ibadan coordinates
    const initialLat = user.coordinates?.lat || 7.3775;
    const initialLng = user.coordinates?.lng || 3.9470;

    mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [user.coordinates]);

  // Fetch PSPs for Resident View
  useEffect(() => {
    if (isResident) {
      apiService.getUsers().then(users => {
        setAllPsps(users.filter(u => u.role === UserRole.PSP_OPERATOR));
      });
    }
  }, [isResident]);

  // Update Markers when data or role changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    // 1. My Location Marker
    if (user.coordinates) {
      const userIcon = L.divIcon({
        html: `<div class="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-xl ring-2 ring-white border-2 border-emerald-500">🏠</div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      const userMarker = L.marker([user.coordinates.lat, user.coordinates.lng], { icon: userIcon }).addTo(mapRef.current);
      userMarker.bindPopup('<b>My Home</b><br/>Waste Collection Zone');
      markersRef.current.push(userMarker);
    }

    // 2. Data Markers (PSPs for residents, Pickups for operators)
    if (isResident) {
      allPsps.forEach(psp => {
        if (!psp.coordinates) return;
        const pspIcon = L.divIcon({
          html: `<div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-xl border-2 border-white transition-transform hover:scale-110">🚛</div>`,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        const marker = L.marker([psp.coordinates.lat, psp.coordinates.lng], { icon: pspIcon }).addTo(mapRef.current);
        marker.on('click', () => setSelectedItem(psp));
        markersRef.current.push(marker);
      });
    } else {
      const activePickups = requests.filter(r => r.status !== PickupStatus.COMPLETED && r.status !== PickupStatus.CANCELLED);
      
      activePickups.forEach((req, idx) => {
        if (!req.coordinates) return;
        const stopOrder = optimization ? optimization.optimizedOrder.indexOf(idx) + 1 : null;
        
        const pinIcon = L.divIcon({
          html: `<div class="w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-sm font-black text-white
                    ${req.status === PickupStatus.SCHEDULED ? 'bg-blue-500' : 'bg-orange-500'}
                    ${stopOrder ? 'ring-4 ring-emerald-500/50' : ''}
                  ">
                    ${stopOrder || '📍'}
                  </div>`,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        const marker = L.marker([req.coordinates.lat, req.coordinates.lng], { icon: pinIcon }).addTo(mapRef.current);
        marker.on('click', () => setSelectedItem(req));
        markersRef.current.push(marker);
      });

      // Draw Optimization Path
      if (optimization && activePickups.length > 1) {
        const pathPoints = optimization.optimizedOrder
          .map(idx => activePickups[idx])
          .filter(r => r && r.coordinates)
          .map(r => [r.coordinates!.lat, r.coordinates!.lng]);
        
        polylineRef.current = L.polyline(pathPoints, {
          color: '#10b981',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
          lineJoin: 'round'
        }).addTo(mapRef.current);
      }
    }
  }, [allPsps, requests, optimization, isResident, user]);

  const activePickups = useMemo(() => 
    requests.filter(r => r.status !== PickupStatus.COMPLETED && r.status !== PickupStatus.CANCELLED),
    [requests]
  );

  const handleOptimizeRoute = async () => {
    if (activePickups.length === 0) return;
    setIsOptimizing(true);
    // Use street names/landmarks for AI optimization
    const locations = activePickups.map(r => `${r.houseNumber} ${r.streetName}, ${r.location}, Ibadan`);
    try {
      const result = await getRouteOptimizationAdvice(locations);
      setOptimization(result);
      if (result.justification) {
        alert("AI Optimization: " + result.justification);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleLaunchNavigator = () => {
    if (!selectedItem || !selectedItem.coordinates) return;
    const { lat, lng } = selectedItem.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleLocalRadar = () => {
    if (user.coordinates && mapRef.current) {
      mapRef.current.flyTo([user.coordinates.lat, user.coordinates.lng], 15, {
        duration: 1.5
      });
    }
  };

  const handleRequestPartnership = async () => {
    if (!isResident || !selectedItem || selectedItem.role !== UserRole.PSP_OPERATOR) return;
    setIsUpdatingUser(true);
    try {
      const updatedUser = { ...user, preferredPspId: selectedItem.id };
      await apiService.saveUser(updatedUser);
      // In a real app we'd reload the auth token/context
      alert(`Success! ${selectedItem.name} is now your preferred waste partner.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const sortedPickups = useMemo(() => {
    if (!optimization) return activePickups;
    return optimization.optimizedOrder.map(idx => activePickups[idx]).filter(Boolean);
  }, [activePickups, optimization]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {isResident ? 'Ibadan Waste Explorer' : 'Operational Map Viewer'}
          </h2>
          <p className="text-sm text-slate-500">
            {isResident 
              ? `Real-time map of waste management providers in Ibadan.` 
              : `Managing ${activePickups.length} active stops in ${user.location}`
            }
          </p>
        </div>
        <div className="flex gap-2">
           {!isResident && (
              <button 
                onClick={handleOptimizeRoute}
                disabled={isOptimizing || activePickups.length < 2}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isOptimizing ? '🤖 Analyzing Traffic...' : '✨ Optimize Route'}
              </button>
           )}
           <button 
             onClick={handleLocalRadar}
             className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
           >
             📡 Local Radar
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="flex-1 rounded-[2.5rem] relative overflow-hidden border-8 border-slate-800 dark:border-slate-900 shadow-2xl group z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Floating Map Legend */}
          <div className="absolute bottom-6 left-6 bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-700 shadow-xl pointer-events-none z-[1000]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Map Key</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-tighter">My Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-tighter">{isResident ? 'PSP Truck' : 'Scheduled'}</span>
              </div>
              {!isResident && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-[10px] text-slate-200 font-bold uppercase tracking-tighter">Needs Pickup</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col min-h-0">
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs mb-6 flex justify-between items-center">
              <span>{isResident ? 'Near Operators' : 'Route Sequence'}</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-500">
                {isResident ? allPsps.length : activePickups.length} Results
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
              {(isResident ? allPsps : sortedPickups).map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    if (item.coordinates && mapRef.current) {
                      mapRef.current.flyTo([item.coordinates.lat, item.coordinates.lng], 16);
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex gap-4 items-center group
                    ${selectedItem?.id === item.id ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs
                    ${isResident ? 'bg-blue-600 text-white' : (optimization ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')}
                  `}>
                    {isResident ? '🚛' : (optimization ? i + 1 : '📍')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{isResident ? item.name : item.residentName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{item.location}</p>
                  </div>
                </button>
              ))}
              {(isResident ? allPsps : sortedPickups).length === 0 && (
                <div className="py-10 text-center opacity-40">
                  <p className="text-xs font-bold text-slate-400 italic">No active data to display on map.</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Marker Detail Card */}
          <div className={`bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl transition-all duration-500 ${selectedItem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
             {selectedItem && (
               <>
                 <div className="flex justify-between items-start mb-6">
                   <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">{isResident ? 'Provider Hub' : 'Job Details'}</h4>
                   <button onClick={() => setSelectedItem(null)} className="text-slate-600 hover:text-white text-lg">✕</button>
                 </div>
                 <div className="space-y-6">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isResident ? 'Operator Name' : 'Resident Name'}</p>
                     <p className="text-lg text-emerald-400 font-bold">{isResident ? selectedItem.name : selectedItem.residentName}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Zone</p>
                       <p className="text-xs text-white font-medium">{selectedItem.location}</p>
                     </div>
                     {!isResident && (
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status</p>
                          <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{selectedItem.status}</p>
                        </div>
                     )}
                   </div>

                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-xl">📞</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Contact</p>
                        <p className="text-xs text-white font-bold">{selectedItem.phone || selectedItem.contactPhone}</p>
                      </div>
                   </div>

                   <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleLaunchNavigator}
                      className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700 shadow-xl"
                    >
                      🚀 Launch Navigator
                    </button>
                    {isResident ? (
                      <button 
                        onClick={handleRequestPartnership}
                        disabled={isUpdatingUser || user.preferredPspId === selectedItem.id}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/40 ${user.preferredPspId === selectedItem.id ? 'bg-emerald-900/50 text-emerald-500 cursor-not-allowed border border-emerald-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                      >
                        {isUpdatingUser ? 'Processing...' : user.preferredPspId === selectedItem.id ? 'Current Partner' : 'Request Partnership'}
                      </button>
                    ) : (
                      <button 
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-900/40"
                      >
                        ✅ Complete Pickup
                      </button>
                    )}
                   </div>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-div-icon { background: none; border: none; }
      `}</style>
    </div>
  );
};
