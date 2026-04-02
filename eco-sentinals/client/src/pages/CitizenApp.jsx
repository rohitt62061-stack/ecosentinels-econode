import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ConstitutionalHero from '../components/citizen/ConstitutionalHero';
import WasteScanner from '../components/citizen/WasteScanner';
import GamificationHub from '../components/citizen/GamificationHub';
import MapSection from '../components/mcd/MapSection'; // Reusing map from MCD

const NAV_ITEMS = [
  { id: 'home',    icon: 'home',      label: 'Home',    active: true  },
  { id: 'map',     icon: 'map',       label: 'Map',     active: false },
  { id: 'report',  icon: 'edit_square', label: 'Report', active: false },
  { id: 'impact',  icon: 'analytics', label: 'Impact',  active: false },
];

const CitizenApp = () => {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-32">

      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-md flex items-center justify-between px-6 h-16 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <h1 className="font-headline font-bold tracking-tight text-xl text-emerald-800">EcoNode</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/mcd-dashboard"
            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-surface-container text-secondary hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            MCD View
          </Link>
          <Link to="/citizen-profile" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center transition-all active:scale-95 hover:bg-surface-container-highest cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </Link>
        </div>
      </header>

      {/* Dynamic Content based on Nav */}
      <main className="mt-16 relative">
        {activeNav === 'home' && (
          <div className="space-y-10 px-6 pt-4">
            <section>
              <ConstitutionalHero />
            </section>
            {/* Embedded Map Report in Home Feed */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-headline font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">location_on</span>
                  Local Environment Map
                </h3>
                <p className="text-xs text-slate-500 mt-1">Live telemetry focusing on Delhi NCT region.</p>
              </div>
              <div className="h-64 w-full relative">
                 <MapSection /> {/* Reused leaf map with zero controls visible */}
              </div>
            </section>
            <section>
              <GamificationHub />
            </section>
          </div>
        )}

        {activeNav === 'map' && (
          <div className="h-[calc(100vh-64px)] w-full">
            <MapSection />
          </div>
        )}

        {activeNav === 'report' && (
          <div className="px-6 pt-6 animate-fade-in">
             <WasteScanner />
          </div>
        )}

        {activeNav === 'impact' && (
          <div className="px-6 pt-6 animate-fade-in">
            <h2 className="text-2xl font-headline font-extrabold text-slate-800 mb-6">Your Government Impact</h2>
            <GamificationHub />
            <div className="mt-6 bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
               <p className="text-sm font-bold text-emerald-800">Total Contribution</p>
               <h1 className="text-4xl font-black text-emerald-600 mt-2">1,248</h1>
               <p className="text-xs text-emerald-700/80 mt-1 uppercase tracking-widest font-semibold">Green Credits logged in your ward</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] rounded-t-3xl z-50">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 active:scale-90
                ${isActive
                  ? 'text-emerald-700 bg-emerald-100/50 shadow-sm scale-110'
                  : 'text-slate-500 hover:text-emerald-600'
                }`}
            >
              <span
                className="material-symbols-outlined transition-transform duration-300"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              <span className="font-headline text-[10px] items-center font-extrabold uppercase tracking-widest mt-1">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default CitizenApp;
