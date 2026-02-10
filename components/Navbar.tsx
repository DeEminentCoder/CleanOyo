
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentTab }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-slate-800">{currentTab}</h1>
        <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block"></div>
        <span className="text-xs text-slate-400 hidden sm:block capitalize">{user.role.replace('_', ' ').toLowerCase()} Portal</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
           <span className="text-slate-500">📍</span>
           <span className="text-sm font-medium text-slate-600">{user.location}, Ibadan</span>
        </div>
        <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-lg border border-slate-200">
          <span>🔔</span>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};
