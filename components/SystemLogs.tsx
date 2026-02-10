
import React from 'react';
import { ActivityLog } from '../types';

export const SystemLogs: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">System Audit Logs</h2>
           <p className="text-sm text-slate-500">Real-time history of all actions performed in the Oyo Waste Up network.</p>
        </div>
        <button className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1">
          🔄 Refresh Logs
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
              <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0
                ${log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-700' : 
                  log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700' : 
                  'bg-slate-100 text-slate-700'}
              `}>
                {log.action.includes('CREATE') ? '➕' : log.action.includes('UPDATE') ? '🔄' : 'ℹ️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{log.action.replace('_', ' ')}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-800 mb-1">{log.details}</p>
                <p className="text-[10px] text-slate-500">Initiated by User ID: <span className="font-mono">{log.userId}</span></p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-20 text-center opacity-40 italic">
               No system logs recorded in the current session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
