import React from 'react';
import ThemeToggle from '../components/ui/ThemeToggle';
import ConstitutionalHero from '../components/citizen/ConstitutionalHero';
import GamificationHub from '../components/citizen/GamificationHub';
import WasteScanner from '../components/citizen/WasteScanner';
import { Leaf } from 'lucide-react';

const CitizenApp = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-mcd-dark-bg text-slate-900 dark:text-slate-50 transition-colors duration-300 pb-20">
      
      {/* Mobile-optimized Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-mcd-dark-surface/90 backdrop-blur-md transition-colors duration-300">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-mcd-success to-mcd-primary text-white shadow-md shadow-mcd-success/20">
              <Leaf size={16} />
            </div>
            <h1 className="text-lg font-bold font-sans tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-mcd-success to-mcd-primary">
              EcoNode Citizen
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content scrollable area */}
      <main className="max-w-md mx-auto w-full p-4 space-y-6">
        
        {/* Right to Clean Air banner */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
          <ConstitutionalHero />
        </section>

        {/* Waste Scanning Interaction */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in fill-mode-both" style={{ animationDelay: '200ms' }}>
          <WasteScanner />
        </section>

        {/* Gamification and Leaderboards */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in fill-mode-both" style={{ animationDelay: '300ms' }}>
          <GamificationHub />
        </section>

      </main>

      {/* Bottom Navigation Mockup for feel */}
      <nav className="fixed bottom-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-mcd-dark-surface pb-safe pt-2 px-6 flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 z-50">
        <div className="flex flex-col items-center gap-1 p-2 text-mcd-primary dark:text-mcd-success">
          <div className="w-6 h-6 rounded-full bg-mcd-primary/10 dark:bg-mcd-success/10 flex items-center justify-center">🏠</div>
          <span>Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full flex items-center justify-center">📷</div>
          <span>Scan</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full flex items-center justify-center">🏆</div>
          <span>Rank</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full flex items-center justify-center">👤</div>
          <span>Profile</span>
        </div>
      </nav>

    </div>
  );
};

export default CitizenApp;
