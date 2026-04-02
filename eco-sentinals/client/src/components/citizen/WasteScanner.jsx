import React from 'react';

const ALERTS = [
  {
    icon: 'water_drop',
    iconColor: 'text-tertiary',
    category: 'Quality Check',
    title: 'Sector 4 Water Sampling',
    desc: 'Routine check scheduled for 10:00 AM. Minimal pressure drops expected.',
  },
  {
    icon: 'park',
    iconColor: 'text-primary',
    category: 'Community Drive',
    title: 'Tree Planting Drive',
    desc: 'Join 40+ citizens this Saturday at Central Park to plant native saplings.',
  },
  {
    icon: 'campaign',
    iconColor: 'text-secondary',
    category: 'Town Hall',
    title: 'Waste Management Policy',
    desc: 'Review the new citizen guidelines for zero-waste segregation.',
  },
];

const WasteScanner = () => {
  return (
    <div className="space-y-10">
      {/* Local Environment Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-headline font-bold text-on-surface">Local Environment</h3>
          <span className="text-primary text-sm font-semibold">Live Updates</span>
        </div>

        {/* AQI Bento Card */}
        <div className="bg-surface-container-low p-6 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-secondary-container rounded-full text-on-secondary-container">
            <span className="material-symbols-outlined">air</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="font-label font-semibold text-secondary text-xs uppercase tracking-widest">Neighborhood AQI</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container uppercase">Moderate</span>
            </div>
            <h4 className="text-2xl font-headline font-bold text-on-surface">Connaught Place: 62</h4>
            <div className="mt-4 h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhood Alerts (Horizontal Scroll) */}
      <section className="space-y-4">
        <h3 className="text-xl font-headline font-bold text-on-surface">Neighborhood Alerts</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {ALERTS.map(({ icon, iconColor, category, title, desc }) => (
            <div key={title} className="min-w-[280px] bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-3">
              <div className={`flex items-center gap-2 ${iconColor}`}>
                <span className="material-symbols-outlined text-sm">{icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{category}</span>
              </div>
              <h5 className="font-headline font-bold text-on-surface">{title}</h5>
              <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WasteScanner;
