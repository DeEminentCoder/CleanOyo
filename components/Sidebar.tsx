
import React from 'react';
import { User } from '../types';
import { ROLE_MENU_ITEMS } from '../constants';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, onLogout }) => {
  const menuItems = ROLE_MENU_ITEMS[user.role] || [];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 shrink-0">
      <div className="flex items-center gap-3 mb-12">
        <span className="text-3xl">🌱</span>
        <h2 className="text-xl font-bold tracking-tight">Waste Up</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, idx) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={idx}
              onClick={() => onTabChange(item.label)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group ${
                isActive 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6 bg-slate-800/50 p-3 rounded-xl">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold ring-2 ring-slate-700">
              {user.name[0]}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
