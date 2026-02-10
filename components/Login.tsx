
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (email: string, role: UserRole) => void;
  onRegister: (details: { name: string; email: string; phone: string; role: UserRole }) => void;
}

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-success';

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [view, setView] = useState<AuthView>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert("Please select your access level first.");
      return;
    }
    setIsLoading(true);
    onLogin(email || 'user@oyo.gov.ng', selectedRole);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert("All fields are required.");
      return;
    }
    setIsLoading(true);
    onRegister({
      name,
      email,
      phone,
      role: UserRole.RESIDENT
    });
    setIsLoading(false);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
          <input type="email" placeholder="oyo_citizen@mail.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
            <button type="button" onClick={() => setView('forgot-password')} className="text-[10px] font-bold text-emerald-600">Forgot?</button>
          </div>
          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Select Portal Access</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { role: UserRole.RESIDENT, label: 'Resident', icon: '🏠' },
            { role: UserRole.PSP_OPERATOR, label: 'Operator', icon: '🚛' },
            { role: UserRole.ADMIN, label: 'Admin', icon: '🏛️' }
          ].map((item) => (
            <button key={item.role} type="button" onClick={() => setSelectedRole(item.role)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedRole === item.role ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400'}`}>
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={isLoading || !selectedRole} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">
        {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
      </button>
      
      <p className="text-center text-xs text-slate-500">
        New to WasteUp? <button type="button" onClick={() => setView('register')} className="text-emerald-600 font-bold">Create a Resident Account</button>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => setView('login')} className="text-emerald-600 font-bold text-xs mb-2">← Back to Login</button>
      <h3 className="text-xl font-bold text-slate-800">Resident Sign Up</h3>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
        <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
        <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number</label>
        <input required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-emerald-100">Create Account</button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-emerald-100 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full opacity-50"></div>
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl mb-6 shadow-lg shadow-emerald-200 rotate-3">
             <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Waste Up</h1>
          <p className="text-slate-500 mt-2 font-medium">Ibadan Metropolitan Backend Pilot</p>
        </div>
        {view === 'login' && renderLoginForm()}
        {view === 'register' && renderRegisterForm()}
        {view === 'forgot-password' && (
          <div className="relative z-10">
             <button onClick={() => setView('login')} className="text-emerald-600 font-bold text-xs mb-4">← Back</button>
             <h3 className="text-xl font-bold">Reset Password</h3>
             <input type="email" placeholder="Your registered email" className="w-full bg-slate-50 border p-3 mt-4 rounded-xl" />
             <button onClick={() => setView('reset-success')} className="w-full bg-slate-900 text-white p-3 mt-4 rounded-xl font-bold">Send Link</button>
          </div>
        )}
        {view === 'reset-success' && (
           <div className="text-center">
              <span className="text-4xl">✉️</span>
              <h3 className="text-xl font-bold mt-4">Check your Email</h3>
              <p className="text-sm text-slate-500 mt-2">Check {email} for the link.</p>
              <button onClick={() => setView('login')} className="w-full bg-slate-900 text-white p-3 mt-6 rounded-xl font-bold">Return to Login</button>
           </div>
        )}
      </div>
    </div>
  );
};
