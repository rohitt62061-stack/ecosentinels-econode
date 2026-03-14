import React, { useState, useEffect } from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import { ShieldCheck, Clock } from 'lucide-react';

const ConstitutionalHeader = () => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Viksit Bharat 2047 target date (15 Aug 2047)
    const targetDate = new Date('2047-08-15T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeRemaining('Target Reached');
        return;
      }

      const years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365.25));
      const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
      
      setTimeRemaining(`${years}y ${days}d`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60 * 60); // Update hourly

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-mcd-dark-surface/80 backdrop-blur-md transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Branding & Tagline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center p-2 rounded-lg bg-mcd-primary text-white shadow-md">
            <ShieldCheck size={32} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold font-sans text-slate-900 dark:text-white tracking-tight">
              MCD Governance Dashboard
            </h1>
            <p className="text-sm font-medium text-mcd-secondary dark:text-mcd-accent">
              74th Amendment Data Sovereignty
            </p>
          </div>
        </div>

        {/* Dynamic Items: Clock & Theme Toggle */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 shadow-inner">
            <Clock size={16} className="text-mcd-primary dark:text-mcd-success" />
            <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
              Viksit Bharat 2047: <span className="text-mcd-primary dark:text-white">{timeRemaining}</span>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default ConstitutionalHeader;
