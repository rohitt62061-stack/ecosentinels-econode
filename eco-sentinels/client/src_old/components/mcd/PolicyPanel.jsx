import React from 'react';

const PolicyPanel = () => {
  return (
    <aside className="w-96 shrink-0 bg-surface-container-low p-6 flex flex-col gap-6 overflow-y-auto h-full border-l border-surface-container-highest">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-bold text-on-surface">Live Intelligence</h3>
        <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-black rounded uppercase">3 New</span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Alert Card 1 */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border-l-4 border-tertiary group hover:translate-x-1 transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Critical Alert</span>
            <span className="text-[10px] text-on-surface-variant">2m ago</span>
          </div>
          <h4 className="font-bold text-sm text-on-surface mb-1">PM 2.5 Spike in Okhla</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">Industrial sector 4 recording levels &gt; 400. Automated suppression systems activated.</p>
          <div className="mt-3 flex gap-2">
            <button className="bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-surface-variant transition-colors">Dismiss</button>
            <button className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap">Deploy Team</button>
          </div>
        </div>

        {/* Alert Card 2 (Policy) */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border-l-4 border-secondary-container group hover:translate-x-1 transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Policy Insight</span>
            <span className="text-[10px] text-on-surface-variant">14m ago</span>
          </div>
          <h4 className="font-bold text-sm text-on-surface mb-1">Phase Out: Diesel Generators</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">AI analysis suggests 18% reduction in local PM10 if phased out in residential South Delhi.</p>
          <button className="mt-3 text-primary text-[10px] font-bold uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
            Review Proposal <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Alert Card 3 */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border-l-4 border-primary-container group hover:translate-x-1 transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">System Update</span>
            <span className="text-[10px] text-on-surface-variant">1h ago</span>
          </div>
          <h4 className="font-bold text-sm text-on-surface mb-1">New Sensor Node Active</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">Connaught Place central grid node #C-29 is now broadcasting live AQI metrics.</p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="bg-on-secondary-fixed-variant p-4 rounded-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
            <p className="text-xs font-bold uppercase tracking-widest">AI Forecast</p>
          </div>
          <p className="text-xs leading-relaxed opacity-90 italic">"Tomorrow is expected to be 'Good' air quality due to high winds. Reduced power grid load predicted."</p>
        </div>
      </div>
    </aside>
  );
};

export default PolicyPanel;
