import React from 'react';

const TopBar = () => {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface-container-lowest border-b-0 shadow-sm z-10 w-full fixed top-0 left-64 right-0" style={{ width: 'calc(100% - 16rem)' }}>
      <div className="flex items-center gap-6">
        <h2 className="font-headline text-lg font-bold text-on-surface tracking-tight">AQI Governance Hub</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">Live Stream</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none placeholder:text-slate-400 font-medium text-slate-700"
            placeholder="Search sectors..."
          />
        </div>
        <button className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
          <span className="material-symbols-outlined text-on-surface">help</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
