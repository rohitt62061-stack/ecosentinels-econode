import React from 'react';
import { Link } from 'react-router-dom';

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-breathe"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Welcome Header */}
      <div className="text-center max-w-xl mb-12 animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <h1 className="font-headline font-bold tracking-tight text-3xl text-emerald-800">EcoNode</h1>
        </div>
        <p className="font-body text-secondary text-base leading-relaxed">
          Welcome to the Smart Urban Metabolism system. Monitor air quality, manage local waste nodes, or report environmental issues in your ward.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full animate-fade-in">
        {/* Citizen Card */}
        <Link 
          to="/citizen-login" 
          className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center border border-surface-container-highest hover:bg-emerald-50/50 hover:border-emerald-200 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-emerald-700 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <h2 className="font-headline font-bold text-lg text-slate-800 mb-2">Citizen App</h2>
          <p className="font-body text-slate-500 text-sm flex-1">
            Report issues, check local air quality, and earn green credits for your contributions.
          </p>
          <div className="mt-6 flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase tracking-wider group-hover:gap-2 transition-all">
            Enter App <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </Link>

        {/* MCD Card */}
        <Link 
          to="/mcd-login" 
          className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center border border-surface-container-highest hover:bg-slate-50/50 hover:border-slate-300 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-slate-700 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          </div>
          <h2 className="font-headline font-bold text-lg text-slate-800 mb-2">MCD Dashboard</h2>
          <p className="font-body text-slate-500 text-sm flex-1">
            Monitor live telemetry streams, approve alerts, and deploy node operators.
          </p>
          <div className="mt-6 flex items-center gap-1 text-slate-600 font-bold text-xs uppercase tracking-wider group-hover:gap-2 transition-all">
            Access Command <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </Link>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">BIOSYNTH-CITY ARCHITECTURE</p>
      </div>
    </div>
  );
};

export default Onboarding;
