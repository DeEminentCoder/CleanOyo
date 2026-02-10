
import React, { useState, useMemo } from 'react';
import { PickupRequest, PickupStatus } from '../types';
import { STATUS_COLORS, WASTE_ICONS } from '../constants';

export const ResidentSchedule: React.FC<{ requests: PickupRequest[] }> = ({ requests }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar Logic
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group requests by date for the calendar
  const requestsByDate = useMemo(() => {
    const map: Record<string, PickupRequest[]> = {};
    requests.forEach(req => {
      const dateStr = new Date(req.scheduledDate).toDateString();
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(req);
    });
    return map;
  }, [requests]);

  // Calendar grid construction
  const calendarDays = useMemo(() => {
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const activeDateRequests = selectedDate ? requestsByDate[selectedDate.toDateString()] || [] : [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Collection Schedule</h2>
          <p className="text-sm text-slate-500">Plan your waste disposal and track historical pickups.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">‹</button>
          <div className="px-4 text-sm font-bold text-slate-700 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">›</button>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <button onClick={goToToday} className="px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Today</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Body */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100 last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 flex-1 min-h-[400px]">
            {calendarDays.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="bg-slate-50/50 border-b border-r border-slate-100"></div>;
              
              const dateStr = date.toDateString();
              const dayRequests = requestsByDate[dateStr] || [];
              const isToday = dateStr === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(date)}
                  className={`relative p-2 h-24 md:h-32 border-b border-r border-slate-100 text-left transition-all hover:bg-emerald-50/30 group
                    ${isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-500/20' : ''}
                  `}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full mb-2
                    ${isToday ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-700'}
                  `}>
                    {date.getDate()}
                  </span>

                  <div className="space-y-1">
                    {dayRequests.slice(0, 2).map(req => (
                      <div key={req.id} className="flex items-center gap-1.5">
                        <span className="text-xs shrink-0">{WASTE_ICONS[req.wasteType]}</span>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0
                          ${req.status === PickupStatus.COMPLETED ? 'bg-emerald-500' : 
                            req.status === PickupStatus.SCHEDULED ? 'bg-blue-500' : 'bg-slate-300'}
                        `}></div>
                        <span className="text-[9px] font-bold text-slate-500 truncate hidden md:block">
                          {req.wasteType.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                    {dayRequests.length > 2 && (
                      <div className="text-[8px] font-black text-emerald-600 mt-1 uppercase tracking-tighter">
                        +{dayRequests.length - 2} More
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Schedule Detail</h3>
              <p className="text-2xl font-bold">
                {selectedDate 
                  ? selectedDate.toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric' })
                  : 'Select a Date'
                }
              </p>
              <div className="mt-6 space-y-4">
                {activeDateRequests.length > 0 ? activeDateRequests.map(req => (
                  <div key={req.id} className="bg-white/10 p-4 rounded-2xl border border-white/10 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{WASTE_ICONS[req.wasteType]}</span>
                        <div>
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-tight">{req.wasteType.split(' ')[0]}</p>
                          <p className="text-xs text-slate-400">{req.status}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 pt-2 border-t border-white/5">
                      <span>PSP: {req.operatorName || 'Unassigned'}</span>
                      <button className="text-emerald-400 font-bold hover:underline">Details →</button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-40">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-sm font-medium">No pickups scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-7xl">📅</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>💡</span> Calendar Legend
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-600 font-medium">Completed Collection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-600 font-medium">Upcoming Scheduled Stop</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="text-xs text-slate-600 font-medium">Pending Assignment</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                * Collection times are typically between 7:00 AM and 11:00 AM for the Bodija Zone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
