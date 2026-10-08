import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Building2, 
  UserCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Warehouse, 
  Globe2, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export function LoginModal({ currentPath, onLoginSuccess }) {
  const [role, setRole] = useState('ADMIN');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isGlobal = currentPath === 'global';

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (isGlobal) {
      if (role === 'ADMIN' && pin === '9900') {
        setLoading(true);
        setTimeout(() => {
          onLoginSuccess({ role: 'ADMIN', title: 'Consortium Admin', path: 'global' });
        }, 300);
      } else if (role === 'PARTNER' && pin === '1234') {
        setLoading(true);
        setTimeout(() => {
          onLoginSuccess({ role: 'PARTNER', title: 'Global Enterprises Partner', path: 'global' });
        }, 300);
      } else {
        setError('Invalid Consortium Access PIN. Please verify credentials.');
        setPin('');
      }
    } else {
      if (pin === '9900' || pin === '1234') {
        setLoading(true);
        setTimeout(() => {
          onLoginSuccess({ role: 'ADMIN', title: 'Kosgama Yard Administrator', path: 'local' });
        }, 300);
      } else {
        setError('Invalid Kosgama Yard Access PIN.');
        setPin('');
      }
    }
  };

  const setPresetPin = (presetPin, targetRole) => {
    if (targetRole) setRole(targetRole);
    setPin(presetPin);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -bottom-20 -right-20 animate-pulse" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-carbon-900/90 backdrop-blur-xl border border-carbon-700/80 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-6">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Consortium ERP Secure Gateway
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-carbon-800/80 px-2 py-0.5 rounded-full border border-carbon-700">
            v3.8 Production
          </span>
        </div>

        {/* Brand & Emblem */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[2px] shadow-xl shadow-sky-950/60">
              <div className="w-full h-full bg-carbon-950 rounded-[14px] flex items-center justify-center">
                {isGlobal ? (
                  <Globe2 className="w-8 h-8 text-sky-400" />
                ) : (
                  <Warehouse className="w-8 h-8 text-emerald-400" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-carbon-900 rounded-lg border border-carbon-700 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
              {isGlobal ? 'ANUJAYA & GLOBAL ENTERPRISES' : 'ANUJAYA ENTERPRISES'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {isGlobal 
                ? 'Industrial Machinery Import & Global Sales ERP' 
                : 'Kosgama Central Machinery Fleet & Rental Yard'}
            </p>
          </div>
        </div>

        {/* Role Selector Tabs (Global Path) */}
        {isGlobal ? (
          <div className="space-y-1.5 font-mono">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
              Select Operating Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-carbon-950/90 rounded-2xl border border-carbon-800">
              <button
                type="button"
                onClick={() => { setRole('ADMIN'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                  role === 'ADMIN'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-950'
                    : 'text-slate-400 hover:text-white hover:bg-carbon-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('PARTNER'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                  role === 'PARTNER'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white hover:bg-carbon-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Partner View</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-carbon-950/80 rounded-2xl border border-carbon-800 flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-left font-mono">
              <span className="text-xs font-bold text-white block">Kosgama Yard Administrator</span>
              <span className="text-[10px] text-slate-400">Rental Fleets, Sub-Leases & Client Audit</span>
            </div>
          </div>
        )}

        {/* PIN Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Security Access PIN
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10px] text-slate-400 hover:text-sky-400 transition flex items-center gap-1"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPin ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPin ? "text" : "password"}
                maxLength={6}
                value={pin}
                autoFocus
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-carbon-950 border border-carbon-700/80 text-white font-mono text-center tracking-[0.3em] font-bold text-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-inner"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 mt-2 font-sans font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick-Access Helper Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Quick One-Click Access Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {isGlobal ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPresetPin('9900', 'ADMIN')}
                    className="text-[10px] font-mono bg-carbon-950 hover:bg-sky-950/80 text-slate-300 hover:text-sky-300 border border-carbon-800 hover:border-sky-700/60 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    <span>Admin PIN: <strong className="text-white">9900</strong></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetPin('1234', 'PARTNER')}
                    className="text-[10px] font-mono bg-carbon-950 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-carbon-800 hover:border-emerald-700/60 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Partner PIN: <strong className="text-white">1234</strong></span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPresetPin('9900')}
                    className="text-[10px] font-mono bg-carbon-950 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-carbon-800 hover:border-emerald-700/60 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Yard Master: <strong className="text-white">9900</strong></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetPin('1234')}
                    className="text-[10px] font-mono bg-carbon-950 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-carbon-800 hover:border-emerald-700/60 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Staff PIN: <strong className="text-white">1234</strong></span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-xl shadow-sky-950/60 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Verifying Terminal Credentials...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Authenticate & Enter ERP</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Note */}
        <div className="pt-3 border-t border-carbon-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-600" />
            256-Bit Terminal Clearance
          </span>
          <span>Dual Persistence Sync</span>
        </div>
      </div>
    </div>
  );
}
