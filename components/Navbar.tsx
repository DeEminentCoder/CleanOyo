
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

  // Close dropdown when clicking outside
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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 transition-colors duration-300 relative z-50">
      <div className="flex items-center gap-2">
        {/* Mobile Menu Trigger */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-sm md:text-lg font-semibold text-slate-800 dark:text-white truncate">{currentTab}</h1>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
        <span className="text-[10px] text-slate-400 hidden sm:block capitalize">{user.role.replace('_', ' ').toLowerCase()} Portal</span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
           <span className="text-slate-500">📍</span>
           <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{user.location}, Ibadan</span>
        </div>
        
        {/* Mobile Location Badge (Icon only) */}
        <div className="sm:hidden flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border border-slate-200 dark:border-slate-700" title={`${user.location}, Ibadan`}>
          📍
        </div>

        {/* Functional Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 transition-colors rounded-lg border border-slate-200 dark:border-slate-700 ${showNotifications ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600'}`}
          >
            <span>🔔</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full ring-2 ring-white dark:ring-slate-900 animate-in zoom-in">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={onClearNotifications}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-tight"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${n.medium === 'SMS' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                          {n.medium === 'SMS' ? '📱' : '✉️'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{n.type.replace('_', ' ')}</p>
                            <span className="text-[9px] text-slate-300 dark:text-slate-600 font-medium">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-2 italic">
                            "{n.message}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-6 text-center">
                    <div className="text-4xl mb-4 opacity-20">🔔</div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">You're all caught up!</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">New activity in Ibadan will appear here.</p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">Showing your latest session alerts</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
