import React from 'react';
import { 
  Globe, 
  Warehouse, 
  Database, 
  Languages, 
  Download, 
  Upload, 
  LogOut, 
  ShieldCheck, 
  RotateCw,
  RefreshCw
} from 'lucide-react';
import { CompanyLogo } from './BrandAssets';

export function Navbar({
  currentPath,
  onPathChange,
  currentUser,
  onLogout,
  currentLang,
  onToggleLang,
  usdRate,
  onUsdRateChange,
  dbStatus,
  onExportAudit,
  onTriggerImport,
  onRecalculateStock
}) {
  const isGlobal = currentPath === 'global';
  const isPartner = currentUser?.role === 'PARTNER';

  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Identity & Path Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <CompanyLogo className="w-11 h-11" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white uppercase">
                    ANUJAYA ENTERPRISES
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800">
                    EQUITY CONSORTIUM
                  </span>
                  {currentUser && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border ${
                      currentUser.role === 'ADMIN' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {currentUser.role}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                  <span className="text-sky-400 font-bold">Anujaya Enterprises</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-bold">Global Enterprises (China)</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-mono hidden md:inline">
                    {isGlobal ? "International Sourcing & Sales Distribution" : "Kosgama Central Machinery Rental Yard"}
                  </span>
                </div>
              </div>
            </div>

            {/* Consortium Portal Switcher — hidden for PARTNER role */}
            {!isPartner && (
              <div className="hidden lg:flex items-center p-1 bg-carbon-900 border border-carbon-700/80 rounded-2xl ml-4">
                <button
                  onClick={() => onPathChange('global')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    isGlobal 
                      ? 'bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-carbon-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-300" />
                  <span>Global Sales ERP (China)</span>
                </button>
                <button
                  onClick={() => onPathChange('local')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    !isGlobal 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-carbon-800'
                  }`}
                >
                  <Warehouse className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Local Rental ERP (Yard)</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Mobile Path Switcher — hidden for PARTNER role */}
            {!isPartner && (
              <div className="flex lg:hidden">
                <button
                  onClick={() => onPathChange(isGlobal ? 'local' : 'global')}
                  className="px-2.5 py-1.5 rounded-xl bg-carbon-850 border border-carbon-700 text-xs font-bold text-sky-300 flex items-center gap-1.5"
                >
                  {isGlobal ? <Warehouse className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{isGlobal ? "To Rental Yard" : "To Global Sales"}</span>
                </button>
              </div>
            )}

            {/* DB Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-carbon-900 border border-carbon-700/80 text-[11px] font-mono text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dbStatus?.db?.database || 'Database Sync Active'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Global USD Rate (Active on Global Path) */}
            {isGlobal && (
              <div className="glass-card px-3 py-1.5 rounded-xl border border-carbon-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">1 USD ($) =</span>
                <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                  <span className="text-[11px] text-slate-400">LKR</span>
                  <input
                    type="number"
                    value={usdRate}
                    step="any"
                    min="1"
                    disabled={currentUser?.role === 'PARTNER'}
                    className="w-16 bg-carbon-900 border-b border-amber-500/50 text-center font-mono text-amber-400 font-bold focus:outline-none py-0.5 rounded"
                    onChange={(e) => onUsdRateChange(parseFloat(e.target.value) || 330)}
                  />
                </div>
                {currentUser?.role === 'ADMIN' && (
                  <button 
                    onClick={onRecalculateStock} 
                    title="Recalculate Stock Cost Valuation"
                    className="p-1 text-slate-400 hover:text-amber-400 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Bilingual Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 text-xs font-bold transition shadow-sm"
              title="Toggle Sinhala / English"
            >
              <Languages className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-sky-300">{currentLang === 'en' ? 'සිංහල' : 'English'}</span>
            </button>

            {/* Backup & Audit (Admin Only) */}
            {currentUser?.role === 'ADMIN' && (
              <>
                <button
                  onClick={onExportAudit}
                  title="Download Complete Audit JSON Backup"
                  className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 text-slate-300 hover:text-white transition"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onTriggerImport}
                  title="Restore Backup JSON"
                  className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 text-slate-300 hover:text-white transition"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Logout User"
              className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-800 text-rose-300 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
