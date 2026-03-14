import React from 'react';
import ConstitutionalHeader from '../components/mcd/ConstitutionalHeader';
import AQICommandCenter from '../components/mcd/AQICommandCenter';
import InteractiveWardMap from '../components/mcd/InteractiveWardMap';
import PolicyPanel from '../components/mcd/PolicyPanel';

const MCDDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-mcd-dark-bg text-slate-900 dark:text-slate-50 transition-colors duration-300 flex flex-col">
      <ConstitutionalHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Actions */}
        <div className="space-y-6 lg:col-span-1">
          <AQICommandCenter />
          <PolicyPanel />
        </div>

        {/* Right Column: Spatial Data */}
        <div className="lg:col-span-2 h-[600px] lg:h-auto min-h-[500px] rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-mcd-dark-surface transition-colors duration-300">
          <InteractiveWardMap />
        </div>
      </main>
    </div>
  );
};

export default MCDDashboard;
