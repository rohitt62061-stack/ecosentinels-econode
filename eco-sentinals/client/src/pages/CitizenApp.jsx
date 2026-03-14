import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import ConstitutionalHero from '../components/citizen/ConstitutionalHero';
import GamificationHub from '../components/citizen/GamificationHub';
import WasteScanner from '../components/citizen/WasteScanner';
import { Leaf, Home, Camera, Trophy, User, LayoutDashboard } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',    icon: Home,    label: 'Home'    },
  { id: 'scan',    icon: Camera,  label: 'Scan'    },
  { id: 'rank',    icon: Trophy,  label: 'Rank'    },
  { id: 'profile', icon: User,    label: 'Profile' },
];

const CitizenApp = () => {
  const [activeNav, setActiveNav] = useState('home');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mcd-light-bg dark:bg-mcd-dark-bg text-slate-900 dark:text-slate-50 transition-colors duration-300 flex flex-col">

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b border-mcd-light-border dark:border-mcd-dark-border bg-white/85 dark:bg-[rgba(19,47,76,0.8)] backdrop-blur-lg transition-colors duration-300">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mcd-success to-mcd-primary flex items-center justify-center shadow-teal-glow">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">EcoNode Citizen</h1>
              <p className="text-[10px] font-semibold text-mcd-success uppercase tracking-wider">India Innovates 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/mcd-dashboard')}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[rgba(255,255,255,0.06)] text-slate-500 dark:text-slate-400 hover:text-mcd-primary dark:hover:text-mcd-success transition-colors"
            >
              <LayoutDashboard size={12} /> MCD
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-5 space-y-5 pb-28">
        <section><ConstitutionalHero /></section>
        <section><WasteScanner /></section>
        <section><GamificationHub /></section>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
        <div className="m-2 rounded-2xl border border-mcd-light-border dark:border-mcd-dark-border bg-white/90 dark:bg-[rgba(19,47,76,0.9)] backdrop-blur-xl shadow-card-dark">
          <div className="flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map(({ id, icon: NavIcon, label }) => { // eslint-disable-line no-unused-vars
              const active = activeNav === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className={`flex flex-col items-center gap-1 min-w-[44px] px-4 py-2 rounded-xl transition-all duration-200
                    ${active
                      ? 'bg-mcd-primary dark:bg-mcd-success text-white shadow-teal-glow'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  <NavIcon size={18} />
                  <span className="text-[10px] font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CitizenApp;
