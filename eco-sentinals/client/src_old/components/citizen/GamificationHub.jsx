import React from 'react';

const GamificationHub = () => {
  return (
    <section className="space-y-4 pb-4">
      <h3 className="text-xl font-headline font-bold text-on-surface">Recent Civic Impact</h3>

      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        {/* CO2 Saved Hero */}
        <div className="p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-3xl">co2</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">This month, your eco-conscious choices saved:</p>
            <h4 className="text-3xl font-headline font-extrabold text-primary">12kg CO2</h4>
          </div>
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 border-t border-outline-variant/10">
          <div className="p-4 border-r border-outline-variant/10 flex flex-col items-center text-center">
            <span className="text-secondary font-bold text-lg">240L</span>
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Water Saved</span>
          </div>
          <div className="p-4 flex flex-col items-center text-center">
            <span className="text-secondary font-bold text-lg">15km</span>
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Cycling Dist</span>
          </div>
        </div>
      </div>

      {/* Achievements Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-headline font-bold text-on-surface">Achievements</h3>
          <button className="text-primary text-sm font-bold">View All</button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
          {[
            { icon: 'delete_sweep', label: 'Waste Warrior',  color: 'bg-surface-container-highest', iconColor: 'text-emerald-800', badge: 'L2' },
            { icon: 'air',         label: 'Clean Air Hero',  color: 'bg-primary-container/30',      iconColor: 'text-primary',      badge: null },
            { icon: 'rocket_launch',label: 'Early Adopter',  color: 'bg-surface-container-highest', iconColor: 'text-slate-400',    badge: null, locked: true },
            { icon: 'groups',      label: 'Community Leader',color: 'bg-surface-container-highest', iconColor: 'text-slate-400',    badge: null, locked: true },
          ].map(({ icon, label, color, iconColor, badge, locked }) => (
            <div key={label} className={`flex-shrink-0 w-28 flex flex-col items-center text-center gap-2 ${locked ? 'opacity-50' : ''}`}>
              <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center relative`}>
                <span
                  className={`material-symbols-outlined text-3xl ${iconColor}`}
                  style={!locked ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                {badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-primary rounded-full text-[10px] flex items-center justify-center font-bold">
                    {badge}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-bold text-on-surface-variant leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamificationHub;
