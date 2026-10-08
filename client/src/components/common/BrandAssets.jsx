import React from 'react';

export function CompanyLogo({ className = "w-12 h-12" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="greenSwooshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="blueSwooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.22" />
        </filter>
      </defs>
      <circle cx="100" cy="100" r="92" fill="#ffffff" filter="url(#badgeShadow)" />
      <path d="M 32,100 C 32,58 66,24 108,24 C 146,24 168,48 174,72 C 160,54 136,42 108,42 C 76,42 52,66 52,100 C 52,122 62,142 80,154 C 50,144 32,124 32,100 Z" fill="url(#greenSwooshGrad)" />
      <path d="M 168,100 C 168,142 134,176 92,176 C 54,176 32,152 26,128 C 40,146 64,158 92,158 C 124,158 148,134 148,100 C 148,78 138,58 120,46 C 150,56 168,76 168,100 Z" fill="url(#blueSwooshGrad)" />
      <g transform="translate(42, 60)">
        <path d="M 34,76 L 14,76 L 36,4 L 54,4 L 76,76 L 56,76 L 50,56 L 28,56 Z M 34,40 L 45,40 L 40,20 Z" fill="#10b981" />
        <path d="M 64,4 L 112,4 L 112,18 L 82,18 L 82,32 L 106,32 L 106,46 L 82,46 L 82,62 L 114,62 L 114,76 L 64,76 Z" fill="#0284c7" />
      </g>
    </svg>
  );
}

export function MockBarcode({ code = "AE-DOC-2026" }) {
  return (
    <div className="flex flex-col items-end print:items-end">
      <svg className="h-7 w-28" viewBox="0 0 100 22" preserveAspectRatio="none">
        <rect x="0" y="0" width="3" height="22" fill="#0f172a" />
        <rect x="5" y="0" width="1" height="22" fill="#0f172a" />
        <rect x="8" y="0" width="4" height="22" fill="#0f172a" />
        <rect x="15" y="0" width="2" height="22" fill="#0f172a" />
        <rect x="19" y="0" width="1" height="22" fill="#0f172a" />
        <rect x="23" y="0" width="5" height="22" fill="#0f172a" />
        <rect x="31" y="0" width="2" height="22" fill="#0f172a" />
        <rect x="35" y="0" width="3" height="22" fill="#0f172a" />
        <rect x="40" y="0" width="1" height="22" fill="#0f172a" />
        <rect x="44" y="0" width="4" height="22" fill="#0f172a" />
        <rect x="51" y="0" width="2" height="22" fill="#0f172a" />
        <rect x="55" y="0" width="3" height="22" fill="#0f172a" />
        <rect x="60" y="0" width="1" height="22" fill="#0f172a" />
        <rect x="64" y="0" width="4" height="22" fill="#0f172a" />
        <rect x="70" y="0" width="2" height="22" fill="#0f172a" />
        <rect x="74" y="0" width="5" height="22" fill="#0f172a" />
        <rect x="81" y="0" width="1" height="22" fill="#0f172a" />
        <rect x="84" y="0" width="3" height="22" fill="#0f172a" />
        <rect x="89" y="0" width="2" height="22" fill="#0f172a" />
        <rect x="93" y="0" width="4" height="22" fill="#0f172a" />
        <rect x="98" y="0" width="2" height="22" fill="#0f172a" />
      </svg>
      <span className="font-mono text-[8px] text-slate-500 tracking-widest uppercase mt-0.5">{code}</span>
    </div>
  );
}

export function OfficialSealStamp() {
  return (
    <div className="relative inline-flex items-center justify-center p-1.5 border-2 border-emerald-600 rounded-full text-emerald-700 font-mono rotate-[-5deg] select-none opacity-90 shadow-sm bg-white">
      <div className="border border-dashed border-emerald-500 rounded-full px-3 py-2 text-center">
        <div className="text-[8px] font-black tracking-widest uppercase text-emerald-800">ANUJAYA ENTERPRISES</div>
        <div className="text-[7px] font-bold text-slate-800">★ CERTIFIED INDUSTRIAL YARD ★</div>
        <div className="text-[7px] font-extrabold text-emerald-800 tracking-wider">KOSGAMA CENTRAL BASE</div>
        <div className="text-[6px] text-slate-500 font-mono uppercase tracking-widest">OFFICIALLY VERIFIED</div>
      </div>
    </div>
  );
}
