
import React, { useRef, useState } from 'react';
import { User, UserRole } from '../types';

interface ProfileSettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    address: 'Plot 12, Bodija Estate Phase 1',
    availability: user.availability ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateUser({ ...user, avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({
        ...user,
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        availability: formData.availability,
      });
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 600);
  };

  const isOperator = user.role === UserRole.PSP_OPERATOR;

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Account & Preferences</h2>
        <button 
          onClick={handleSaveChanges}
          disabled={isSaving}
          className={`bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 dark:shadow-none transition-all hover:bg-emerald-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isOperator && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Operational Status</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">When unavailable, new requests will not be automatically assigned to you.</p>
              </div>
              <button 
                onClick={() => setFormData({...formData, availability: !formData.availability})}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ${formData.availability ? 'bg-emerald-600 ring-emerald-500' : 'bg-slate-300 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600'}`}
              >
                <span className="sr-only">Toggle availability</span>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.availability ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-500" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold">{user.name[0]}</div>
                )}
                <button className="absolute inset-0 bg-black/40 rounded-full text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">Change</button>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Registered Email Address</label>
                  <input type="email" value={formData.email} disabled className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-400 font-medium cursor-not-allowed" />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Email cannot be changed manually. Contact admin for verification updates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Service Zone</label>
                    <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-700 dark:text-slate-200 font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                      <option value="Bodija">Bodija</option>
                      <option value="Akobo">Akobo</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Dugbe">Dugbe</option>
                      <option value="Moniya">Moniya</option>
                      <option value="Apata">Apata</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Home Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Plot 12, Bodija Estate Phase 1" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <h4 className="font-bold text-slate-800 dark:text-white">Billing & Subscription</h4>
               <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
            </div>
            <div className="p-8">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">Current Plan</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Residential Monthly (2x Weekly)</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900 dark:text-white">₦2,500<span className="text-xs text-slate-400 font-normal">/mo</span></p>
                </div>
              </div>
              <button className="w-full mt-6 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Manage Payment Methods</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
