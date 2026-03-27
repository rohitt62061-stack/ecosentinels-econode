import React from 'react';

const ConstitutionalHero = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Hello, Citizen</h2>
        <p className="text-secondary font-label font-medium uppercase tracking-wider text-[10px]">Your daily sustainability digest</p>
      </div>

      {/* Sustainability Impact Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-xl">
        <div className="flex items-center justify-between">
          {/* Text side */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-headline font-bold">Sustainability Impact</h3>
              <p className="text-primary-fixed font-label text-sm opacity-90">Top 5% in your district</p>
            </div>
            <button className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95">
              View Milestones
            </button>
          </div>

          {/* Circular Progress */}
          <div className="relative flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 112 112">
              <circle
                className="text-on-primary/20"
                cx="56" cy="56" fill="transparent" r="48"
                stroke="currentColor" strokeWidth="8"
              />
              <circle
                className="text-surface-container-lowest"
                cx="56" cy="56" fill="transparent" r="48"
                stroke="currentColor"
                strokeDasharray="301.59"
                strokeDashoffset="45.23"
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-headline font-extrabold">85%</span>
            </div>
          </div>
        </div>

        {/* Decorative bg circle */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

export default ConstitutionalHero;
