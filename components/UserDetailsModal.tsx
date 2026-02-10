
import React, { useState, useEffect, useRef } from 'react';
import { User, ActivityLog, PickupRequest, UserRole } from '../types';
import { apiService } from '../services/apiService';
import { STATUS_COLORS, WASTE_ICONS } from '../constants';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  onUserUpdated?: (updatedUser: User) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, onUserUpdated }) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'REQUESTS'>('LOGS');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [userLogs, userRequests] = await Promise.all([
        apiService.getUserActivityLogs(user.id),
        apiService.getRequests(user.id, user.role)
      ]);
      setLogs(userLogs);
      setRequests(userRequests);
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedUser = { ...currentUser, avatar: base64String };
        
        // Save to mock database
        apiService.saveUser(updatedUser);
        
        // Update local state
        setCurrentUser(updatedUser);
        
        // Notify parent to refresh list
        if (onUserUpdated) {
          onUserUpdated(updatedUser);
        }
        
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors bg-white/10 rounded-full"
          >
            ✕
          </button>
          <div className="flex items-center gap-6">
            <div className="relative group shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/30" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-4xl shadow-lg font-bold">
                  {currentUser.name[0]}
                </div>
              )}
              
              <button 
                onClick={triggerFileInput}
                disabled={isUploading}
                className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
              >
                {isUploading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-xl">📷</span>
                    <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Update</span>
                  </>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold">{currentUser.name}</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest
                  ${currentUser.role === UserRole.ADMIN ? 'bg-purple-500 text-white' : 
                    currentUser.role === UserRole.PSP_OPERATOR ? 'bg-blue-500 text-white' : 
                    'bg-emerald-500 text-white'}
                `}>
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{currentUser.email} • {currentUser.phone}</p>
              <p className="text-xs text-emerald-400 font-medium mt-1">📍 Location: {currentUser.location}, Ibadan</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-8 bg-slate-50 shrink-0">
          <button 
            onClick={() => setActiveTab('LOGS')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'LOGS' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Activity Logs ({logs.length})
          </button>
          <button 
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'REQUESTS' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Pickup Requests ({requests.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Fetching user data history...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {activeTab === 'LOGS' ? (
                <div className="space-y-4">
                  {logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                        📜
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{log.action.replace('_', ' ')}</p>
                          <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-700">{log.details}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 opacity-30 italic">No activity logs recorded for this user.</div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.length > 0 ? requests.map((req) => (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl">{WASTE_ICONS[req.wasteType]}</span>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${STATUS_COLORS[req.status]}`}>
                          {req.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{req.wasteType}</h4>
                      <p className="text-[10px] text-slate-500 mb-4 truncate">{req.location}</p>
                      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-[10px]">
                        <div className="text-slate-400">
                           <p>Job ID</p>
                           <p className="font-mono">#{req.id.slice(-6)}</p>
                        </div>
                        <div className="text-right text-slate-400">
                           <p>Scheduled</p>
                           <p className="font-bold text-slate-700">{new Date(req.scheduledDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-20 opacity-30 italic">No pickup requests found for this user.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            Close Profile Review
          </button>
        </div>
      </div>
    </div>
  );
};
