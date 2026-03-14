import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { ShieldCheck, Clock, LayoutDashboard, Leaf } from 'lucide-react';

const ConstitutionalHeader = () => {
  const [countdown, setCountdown] = useState({ years: 0, days: 0, hours: 0 });
  const location = useLocation();

  useEffect(() => {
    const targetDate = new Date('2047-08-15T00:00:00').getTime();
    const update = () => {
      const now = Date.now();
      const dist = targetDate - now;
      if (dist < 0) return;
      const years = Math.floor(dist / (1000 * 60 * 60 * 24 * 365.25));
      const days  = Math.floor((dist % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdown({ years, days, hours });
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const navLinks = [
    { to: '/mcd-dashboard', label: 'MCD Dashboard', icon: LayoutDashboard },
    { to: '/citizen-app',   label: 'Citizen App',   icon: Leaf },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism bar */}
      <div className="
        border-b border-mcd-light-border dark:border-mcd-dark-border
        bg-white/80 dark:bg-[rgba(19,47,76,0.75)]
        backdrop-blur-lg
        transition-colors duration-300
      ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

          {/* Left: Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-mcd-primary to-mcd-success shadow-teal-glow">
              <ShieldCheck size={24} className="text-white" />
              {/* Ping dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-mcd-success border-2 border-white dark:border-mcd-dark-surface animate-pulse" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                MCD EcoNode
              </h1>
              <p className="text-[11px] font-semibold text-mcd-secondary tracking-wider uppercase">
                74th Amendment Data Sovereignty
              </p>
            </div>
          </div>

          {/* Centre: Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: NavIcon }) => { // eslint-disable-line no-unused-vars
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${active
                      ? 'bg-mcd-primary text-white shadow-teal-glow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.06)]'
                    }`}
                >
                  <NavIcon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Clock + Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-slate-100 dark:bg-[rgba(255,255,255,0.06)]
              border border-slate-200 dark:border-mcd-dark-border
              text-slate-700 dark:text-slate-300"
            >
              <Clock size={13} className="text-mcd-success" />
              <span className="text-xs font-mono font-semibold whitespace-nowrap">
                VB&nbsp;2047:&thinsp;
                <span className="text-mcd-success">{countdown.years}y&nbsp;{countdown.days}d&nbsp;{countdown.hours}h</span>
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ConstitutionalHeader;
