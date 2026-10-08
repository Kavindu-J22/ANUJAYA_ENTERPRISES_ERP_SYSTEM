import React, { useState } from 'react';
import { ShieldCheck, Lock, Building2, UserCheck, KeyRound } from 'lucide-react';

export function LoginModal({ currentPath, onLoginSuccess }) {
  const [role, setRole] = useState(currentPath === 'global' ? 'ADMIN' : 'ADMIN');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (currentPath === 'global') {
      if (role === 'ADMIN' && pin === '9900') {
        onLoginSuccess({ role: 'ADMIN', title: 'Consortium Admin', path: 'global' });
      } else if (role === 'PARTNER' && pin === '1234') {
        onLoginSuccess({ role: 'PARTNER', title: 'Global Enterprises Partner', path: 'global' });
      } else {
        setError('Invalid Consortium Access PIN!');
        setPin('');
      }
    } else {
      if (pin === '9900' || pin === '1234') {
        onLoginSuccess({ role: 'ADMIN', title: 'Kosgama Yard Administrator', path: 'local' });
      } else {
        setError('Invalid Local Yard Access PIN!');
        setPin('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="glass-card max-w-sm w-full p-8 rounded-3xl border border-carbon-700/80 text-center space-y-5 shadow-2xl relative">
        
        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 p-[2px] shadow-lg shadow-sky-950/60">
          <div className="w-full h-full bg-carbon-900 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
          </div>
        </div>

        <div>
          <h3 className="font-display font-black text-xl text-white tracking-wide">
            {currentPath === 'global' ? 'ANUJAYA & GLOBAL ERP' : 'ANUJAYA ENTERPRISES'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {currentPath === 'global' 
              ? 'Consortium Sales & Equity Authentication' 
              : 'Kosgama Central Rental Yard Access'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          {currentPath === 'global' ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setRole('ADMIN'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                  role === 'ADMIN'
                    ? 'border-sky-500 bg-sky-600/30 text-sky-300'
                    : 'border-carbon-700 bg-carbon-850 text-slate-400'
                }`}
              >
                Consortium Admin
              </button>
              <button
                type="button"
                onClick={() => { setRole('PARTNER'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                  role === 'PARTNER'
                    ? 'border-emerald-500 bg-emerald-600/30 text-emerald-300'
                    : 'border-carbon-700 bg-carbon-850 text-slate-400'
                }`}
              >
                Partner View
              </button>
            </div>
          ) : (
            <div className="py-2 px-3 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-sky-400 font-bold">
              Kosgama Central Rental Yard Authentication
            </div>
          )}

          <div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl py-3 rounded-xl bg-carbon-950 border border-carbon-700 text-sky-400 font-mono focus:outline-none focus:border-sky-400 font-bold shadow-inner"
            />
            {error && <p className="text-xs text-rose-400 mt-1.5 font-sans font-semibold">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock System</span>
          </button>

          <div className="text-[10px] text-slate-500 font-mono pt-1">
            Default Admin PIN: <span className="text-slate-400 font-bold">9900</span> • Partner PIN: <span className="text-slate-400 font-bold">1234</span>
          </div>
        </form>
      </div>
    </div>
  );
}
