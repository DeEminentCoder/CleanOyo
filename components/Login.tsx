
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (email: string, role: UserRole, password?: string) => Promise<void>;
  onRegister: (details: { name: string; email: string; phone: string; role: UserRole; location?: string; password?: string }) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
}

type AuthView = 'login' | 'register' | 'forgot';

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Bodija');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(UserRole.RESIDENT);
  const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.RESIDENT);
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setError(null);
    setIsResetSent(false);
  }, [view, selectedRole, registerRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedRole) {
      setError("Please choose your portal role to proceed.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setIsLoading(true);
    try {
      await onLogin(email, selectedRole, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !phone || !password) {
      setError("Please complete all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your entries.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    try {
      await onRegister({
        name,
        email,
        phone,
        role: registerRole,
        location,
        password
      });
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await onForgotPassword(email);
      setIsResetSent(true);
    } catch (err: any) {
      setError(err.message || "Request failed. Check if the email is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-xl text-xs font-semibold mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
        <span className="shrink-0">⚠️</span>
        <p>{error}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-50 -ml-48 -mb-48"></div>
      
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-12 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-200 mb-6 text-4xl transform -rotate-6">
            🌱
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Waste Up</h1>
          <p className="text-slate-400 font-medium text-sm">Clean Oyo Scheduler • Ibadan Pilot</p>
        </div>

        {view === 'login' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              {[
                { id: UserRole.RESIDENT, label: 'Resident' },
                { id: UserRole.PSP_OPERATOR, label: 'Operator' },
                { id: UserRole.ADMIN, label: 'Admin' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all ${selectedRole === r.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {renderError()}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  required 
                  type="email" 
                  placeholder="name@mail.ng" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setView('forgot')}
                    className="text-[10px] font-bold text-emerald-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 bottom-4 text-slate-400 hover:text-emerald-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Access Portal'}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-500">
                New to Waste Up? 
                <button onClick={() => setView('register')} className="text-emerald-600 font-bold ml-1 hover:underline">Register Here</button>
              </p>
            </div>
          </div>
        ) : view === 'forgot' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setView('login')} 
              className="text-emerald-600 font-bold text-xs hover:underline flex items-center gap-1"
            >
              ← Back to Login
            </button>
            
            <div className="mb-4">
              <h3 className="text-2xl font-black text-slate-900">Reset Password</h3>
              <p className="text-sm text-slate-400">Enter your email to receive a recovery link.</p>
            </div>

            {isResetSent ? (
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center animate-in zoom-in-95">
                <div className="text-4xl mb-4">📧</div>
                <h4 className="font-bold text-emerald-800 mb-2">Recovery Sent!</h4>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  We've sent a recovery link to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
                <button 
                  onClick={() => setView('login')}
                  className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <>
                {renderError()}
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Account Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="name@mail.ng" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Send Recovery Link'}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setView('login')} 
              className="text-emerald-600 font-bold text-xs hover:underline flex items-center gap-1"
            >
              ← Back to Login
            </button>
            
            <div className="mb-4">
              <h3 className="text-2xl font-black text-slate-900">Create Account</h3>
              <p className="text-sm text-slate-400">Join the clean city initiative today.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              {[
                { id: UserRole.RESIDENT, label: 'Resident' },
                { id: UserRole.PSP_OPERATOR, label: 'Operator' },
                { id: UserRole.ADMIN, label: 'Admin' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegisterRole(r.id)}
                  className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all ${registerRole === r.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {renderError()}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                  <input required type="text" placeholder="Ayo Balogun" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
                    <input required type="email" placeholder="ayo@mail.ng" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Phone</label>
                    <input required type="tel" placeholder="080XXXXXXXX" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Service Area (Ibadan Zone)</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={location} onChange={e => setLocation(e.target.value)}>
                    <option value="Bodija">Bodija</option>
                    <option value="Akobo">Akobo</option>
                    <option value="Challenge">Challenge</option>
                    <option value="Dugbe">Dugbe</option>
                    <option value="Moniya">Moniya</option>
                    <option value="Apata">Apata</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Password</label>
                    <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Confirm</label>
                    <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Join Waste Up'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
