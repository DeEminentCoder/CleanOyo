
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { apiService } from '../services/apiService';

interface LoginProps {
  onLogin: (email: string, role: UserRole, password?: string) => Promise<void>;
  onRegister: (details: { name: string; email: string; phone: string; role: UserRole; location?: string; password?: string }) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
}

type AuthView = 'login' | 'register' | 'forgot';

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onForgotPassword }) => {
  const [view, setView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetSent, setIsResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Bodija');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.RESIDENT);

  useEffect(() => {
    setError(null);
    setIsResetSent(false);
  }, [view, selectedRole]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Please enter your credentials.");
    setIsLoading(true);
    try {
      await onLogin(email, selectedRole, password);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    
    setIsLoading(true);
    try {
      await onRegister({ name, email, phone, role: selectedRole, location, password });
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onForgotPassword(email);
      setIsResetSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-[360px] bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none mx-auto flex items-center justify-center text-xl mb-3">🌱</div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Waste Up Ibadan</h1>
          <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-widest font-black">Clean Oyoo0o Initiative</p>
        </div>

        {/* View Toggles */}
        {view !== 'forgot' && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
            <button 
              onClick={() => setSelectedRole(UserRole.RESIDENT)} 
              className={`py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${selectedRole === UserRole.RESIDENT ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'}`}
            >
              Resident
            </button>
            <button 
              onClick={() => setSelectedRole(UserRole.PSP_OPERATOR)} 
              className={`py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${selectedRole === UserRole.PSP_OPERATOR ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'}`}
            >
              Operator
            </button>
            <button 
              onClick={() => setSelectedRole(UserRole.ADMIN)} 
              className={`py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${selectedRole === UserRole.ADMIN ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'}`}
            >
              Admin
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-bold mb-4 border border-red-100 dark:border-red-900/30">
            ⚠️ {error}
          </div>
        )}

        {isResetSent && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-bold mb-4 border border-emerald-100 dark:border-emerald-900/30">
            ✅ Reset instructions sent to your email.
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none dark:text-white transition-all" 
                placeholder="name@mail.com"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" onClick={() => setView('forgot')} className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Forgot?</button>
              </div>
              <div className="relative">
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none dark:text-white transition-all" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-emerald-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isLoading ? 'VERIFYING...' : 'ENTER PORTAL'}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-6">
              Don't have an account? <button type="button" onClick={() => setView('register')} className="text-emerald-600 font-bold">Sign Up</button>
            </p>
          </form>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Phone</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Primary Zone</label>
              <select value={location} onChange={e => setLocation(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white font-bold">
                <option value="Bodija">Bodija</option>
                <option value="Akobo">Akobo</option>
                <option value="Challenge">Challenge</option>
                <option value="Dugbe">Dugbe</option>
                <option value="Moniya">Moniya</option>
                <option value="Apata">Apata</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Confirm</label>
                <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 mt-2 shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4">
              Already have an account? <button type="button" onClick={() => setView('login')} className="text-emerald-600 font-bold">Login</button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">Enter your registered email and we'll send reset instructions.</p>
            <div>
              <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-slate-900 dark:bg-slate-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-md disabled:opacity-50"
            >
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
            <button type="button" onClick={() => setView('login')} className="w-full text-xs text-slate-400 font-bold hover:text-slate-600">Back to Login</button>
          </form>
        )}

      </div>
    </div>
  );
};
