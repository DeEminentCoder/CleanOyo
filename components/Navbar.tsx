
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Notification } from '../services/notificationService';

interface NavbarProps {
  user: User;
  currentTab: string;
  onMenuClick: () => void;
  theme: string;
  onToggleTheme: () => void;
  notifications: Notification[];
  onClearNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  currentTab, 
  onMenuClick, 
  theme, 
  onToggleTheme,
  notifications = [],
  onClearNotifications
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 transition-colors duration-200 relative z-50">
      <div className="flex items-center gap-2">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          aria-label="Toggle Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentTab}</h1>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 mx-1.5 hidden sm:block"></div>
        <span className="text-[10px] font-black text-slate-400 hidden sm:block uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={onToggleTheme}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
           <span className="text-xs">📍</span>
           <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{user.location}</span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-1.5 transition-colors rounded-lg border border-slate-200 dark:border-slate-700 ${showNotifications ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600'}`}
          >
            <span className="text-base">🔔</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white text-[8px] font-black rounded-full ring-2 ring-white dark:ring-slate-900 animate-in zoom-in">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Recent Activity</h3>
                {notifications.length > 0 && (
                  <button onClick={onClearNotifications} className="text-[9px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-tight">Clear All</button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${n.medium === 'SMS' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                          {n.medium === 'SMS' ? '📱' : '✉️'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{n.type.replace('_', ' ')}</p>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">"{n.message}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center">
                    <p className="text-xs font-bold text-slate-400">All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
