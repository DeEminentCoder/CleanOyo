
import React, { useState, useMemo } from 'react';
import { User, PickupRequest, PickupStatus } from '../types';
import { IBADAN_ZONES } from '../constants';
import { getRouteOptimizationAdvice, RouteOptimizationResult } from '../services/geminiService';

interface FullMapViewProps {
  user: User;
  requests: PickupRequest[];
}

export const FullMapView: React.FC<FullMapViewProps> = ({ user, requests }) => {
  const [selectedPin, setSelectedPin] = useState<PickupRequest | null>(null);
  const [optimization, setOptimization] = useState<RouteOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Filter for pending/scheduled requests to focus the route
  const activePickups = useMemo(() => 
    requests.filter(r => r.status !== PickupStatus.COMPLETED && r.status !== PickupStatus.CANCELLED),
    [requests]
  );

  const handleOptimizeRoute = async () => {
    if (activePickups.length === 0) {
      alert("No active pickups to optimize!");
      return;
    }
    
    setIsOptimizing(true);
    const locations = activePickups.map(r => r.location);
    try {
      const result = await getRouteOptimizationAdvice(locations);
      setOptimization(result);
    } catch (error) {
      alert("Error generating route optimization. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Helper to map 0-100 coordinates for pins based on Ibadan zones
  // Mock deterministic positioning for the visualization
  const getPinPosition = (idx: number) => {
    const x = 15 + ((idx * 37) % 70);
    const y = 20 + ((idx * 23) % 60);
    return { x, y };
  };

  // Order of pickups to show in the sidebar and line rendering
  const sortedPickups = useMemo(() => {
    if (!optimization) return activePickups;
    return optimization.optimizedOrder.map(idx => activePickups[idx]).filter(Boolean);
  }, [activePickups, optimization]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Operational Map Viewer</h2>
          <p className="text-sm text-slate-500">Managing {activePickups.length} active stops in {user.location}</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleOptimizeRoute}
            disabled={isOptimizing}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
           >
             {isOptimizing ? '🤖 Calculating...' : '✨ Optimize Route'}
           </button>
           <button className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
             📡 Sync GPS
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Interactive Map Area */}
        <div className="flex-1 bg-slate-900 rounded-3xl relative overflow-hidden border-8 border-slate-800 shadow-2xl group">
          {/* Schematic Ibadan Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {Array.from({length: 10}).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="white" strokeWidth="0.1" />
                ))}
                {Array.from({length: 10}).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="white" strokeWidth="0.1" />
                ))}
             </svg>
          </div>

          {/* Zones Circles */}
          {IBADAN_ZONES.map((zone, idx) => {
            const isUserZone = zone.name === user.location;
            return (
              <div 
                key={zone.id}
                className={`absolute w-32 h-32 rounded-full border border-dashed flex items-center justify-center transition-all
                  ${isUserZone ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-700/40 bg-slate-700/5'}
                `}
                style={{ top: `${15 + idx * 8}%`, left: `${10 + idx * 12}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="text-center opacity-40">
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{zone.name}</p>
                </div>
              </div>
            );
          })}

          {/* Path Highlight Line */}
          {optimization && sortedPickups.length > 1 && (
            <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <polyline 
                points={sortedPickups.map((_, i) => {
                  const originalIndex = activePickups.indexOf(sortedPickups[i]);
                  const p = getPinPosition(originalIndex);
                  return `${p.x},${p.y}`;
                }).join(' ')} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="0.8" 
                strokeLinecap="round" 
                strokeDasharray="2 1"
                filter="url(#glow)"
                className="animate-[dash_20s_linear_infinite]"
                style={{ strokeDashoffset: 100 }}
              />
            </svg>
          )}

          {/* Map Pins */}
          {activePickups.map((req, idx) => {
            const pos = getPinPosition(idx);
            const isSelected = selectedPin?.id === req.id;
            const stopOrder = optimization ? optimization.optimizedOrder.indexOf(idx) + 1 : null;
            
            return (
              <button
                key={req.id}
                onClick={() => setSelectedPin(req)}
                className={`absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center transition-all transform hover:scale-125 hover:z-50
                  ${isSelected ? 'scale-125 z-40' : 'z-30'}
                `}
                style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
              >
                <div className={`w-full h-full rounded-full border-2 border-white shadow-xl flex flex-col items-center justify-center text-[10px] font-black text-white
                  ${req.status === PickupStatus.SCHEDULED ? 'bg-blue-500' : 'bg-orange-500'}
                  ${stopOrder ? 'ring-4 ring-emerald-500/30' : ''}
                `}>
                  {stopOrder ? `#${stopOrder}` : '🚛'}
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                )}
              </button>
            );
          })}

          {/* Floating Legend */}
          <div className="absolute bottom-6 left-6 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl pointer-events-none">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Map Legend</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-slate-200 font-bold">Scheduled Stop</span>
              </div>
              {optimization && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 border border-white"></div>
                  <span className="text-[10px] text-slate-200 font-bold">AI Optimized Order (#)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          {/* AI Route List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>{optimization ? 'Optimized Path' : 'Assigned Jobs'}</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 font-black uppercase tracking-widest">
                {sortedPickups.length} STOPS
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
              {sortedPickups.map((req, i) => (
                <button
                  key={req.id}
                  onClick={() => setSelectedPin(req)}
                  className={`w-full p-3 rounded-2xl border transition-all text-left flex gap-3 items-center group
                    ${selectedPin?.id === req.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs
                    ${optimization ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}
                  `}>
                    {optimization ? i + 1 : '📍'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{req.residentName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{req.location}</p>
                  </div>
                </button>
              ))}
              
              {sortedPickups.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <span className="text-3xl block mb-2">📭</span>
                  <p className="text-xs font-bold">No active stops assigned</p>
                </div>
              )}
            </div>

            {optimization && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">AI Logic</p>
                    <p className="text-[10px] text-emerald-800 leading-relaxed italic">{optimization.justification}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detail Card */}
          <div className={`bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl transition-all duration-300 ${selectedPin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
             {selectedPin && (
               <>
                 <div className="flex justify-between items-start mb-4">
                   <h4 className="text-white font-bold">Stop Details</h4>
                   <button onClick={() => setSelectedPin(null)} className="text-slate-500 hover:text-white">✕</button>
                 </div>
                 <div className="space-y-4">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</p>
                     <p className="text-sm text-emerald-400 font-bold">{selectedPin.location}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Type</p>
                       <p className="text-xs text-white font-medium">{selectedPin.wasteType.split(' ')[0]}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status</p>
                       <p className="text-xs text-blue-400 font-bold">{selectedPin.status}</p>
                     </div>
                   </div>
                   <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/40">
                     LAUNCH NAVIGATOR
                   </button>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
