
import React from 'react';
import { User } from '../types';
import { ROLE_MENU_ITEMS } from '../constants';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, onLogout, isOpen, onClose }) => {
  const menuItems = ROLE_MENU_ITEMS[user.role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 w-60 bg-slate-900 text-white p-5 shrink-0 z-[120] md:z-0
        transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h2 className="text-lg font-bold tracking-tight">Waste Up</h2>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item, idx) => {
            const isActive = activeTab === item.label;
            return (
              <button
                key={idx}
                onClick={() => onTabChange(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <button 
            onClick={() => onTabChange('Settings')}
            className={`w-full flex items-center gap-3 mb-4 p-2.5 rounded-xl transition-all duration-200 text-left group hover:bg-slate-800/80 active:scale-[0.98] ${activeTab === 'Settings' ? 'bg-slate-800/50 ring-1 ring-emerald-500/50' : 'bg-slate-800/30'}`}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500 group-hover:ring-emerald-400 transition-all" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-700 group-hover:bg-emerald-400 transition-all">
                {user.name[0]}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-white group-hover:text-emerald-400 transition-colors">{user.name}</p>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">My Account</p>
            </div>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors text-xs"
          >
            <span>🚪</span>
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
