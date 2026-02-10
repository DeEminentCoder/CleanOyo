
import React, { useRef, useState } from 'react';
import { User, UserRole } from '../types';

interface ProfileSettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for form fields to handle editing
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    location: user.location,
    address: 'Plot 12, Bodija Estate Phase 1', // Mock default address
    availability: user.availability ?? true
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
    // Simulate API delay
    setTimeout(() => {
      onUpdateUser({
        ...user,
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        availability: formData.availability
      });
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 600);
  };

  const isOperator = user.role === UserRole.PSP_OPERATOR;

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Account & Preferences</h2>
        <button 
          onClick={handleSaveChanges}
          disabled={isSaving}
          className={`bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Availability Toggle for Operators */}
          {isOperator && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Operational Status</h4>
                <p className="text-sm text-slate-500">When unavailable, new requests will not be automatically assigned to you.</p>
              </div>
              <button 
                onClick={() => setFormData({...formData, availability: !formData.availability})}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ${formData.availability ? 'bg-emerald-600 ring-emerald-500' : 'bg-slate-300 ring-slate-200'}`}
              >
                <span className="sr-only">Toggle availability</span>
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.availability ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center gap-6 bg-slate-50">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-500" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold">
                    {user.name[0]}
                  </div>
                )}
                <button className="absolute inset-0 bg-black/40 rounded-full text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  Change
                </button>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                  {isOperator && (
                    <span className={`h-2.5 w-2.5 rounded-full ${formData.availability ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} title={formData.availability ? 'Available' : 'Unavailable'}></span>
                  )}
                </div>
                <p className="text-slate-500 text-sm">Member since October 2023</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Service Zone</label>
                    <select 
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      <option value="Bodija">Bodija</option>
                      <option value="Akobo">Akobo</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Dugbe">Dugbe</option>
                      <option value="Moniya">Moniya</option>
                      <option value="Apata">Apata</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Home Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Plot 12, Bodija Estate Phase 1" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h4 className="font-bold text-slate-800">Billing & PSP Subscription</h4>
               <span className="text-xs text-emerald-600 font-bold">Active</span>
            </div>
            <div className="p-8">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Current Plan</p>
                  <p className="text-lg font-bold text-slate-900">Residential Monthly (2x Weekly)</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900">₦2,500<span className="text-xs text-slate-400 font-normal">/mo</span></p>
                </div>
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Payments</p>
                 <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-600">October 2023 Bill</span>
                    <span className="font-bold text-slate-900">Paid • Oct 05</span>
                 </div>
                 <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-600">September 2023 Bill</span>
                    <span className="font-bold text-slate-900">Paid • Sep 04</span>
                 </div>
              </div>
              <button className="w-full mt-6 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Manage Payment Methods</button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span>🔔</span> Alert Preferences
            </h4>
            <div className="space-y-5">
              {[
                { label: 'Pickup Reminders', desc: 'SMS notice 12hrs before' },
                { label: 'Flood Warnings', desc: 'Emergency push alerts' },
                { label: 'Payment Receipts', desc: 'Email and In-app' },
                { label: 'Waste Education', desc: 'Weekly AI-curated tips' }
              ].map((pref, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{pref.label}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <h4 className="font-bold text-red-900 mb-4">Emergency Hotline</h4>
            <p className="text-xs text-red-700 mb-4 leading-relaxed">Contact Oyo State Waste Management Authority (OYWMA) for illegal dumping reports or blocked main drains.</p>
            <a href="tel:0800WASTEUP" className="block w-full text-center bg-red-600 text-white py-2 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-colors">Call: 0800-WASTEUP</a>
          </div>
        </div>
      </div>
    </div>
  );
};
