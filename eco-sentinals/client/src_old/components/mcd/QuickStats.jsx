import React from 'react';

const STATS = [
  { label: 'Current AQI', value: 142, max: 300, color: 'text-primary-container', pct: 0.47, status: 'Moderate', trend: 'trending_up', trendCol: 'text-tertiary', trendLabel: '12% vs yesterday' },
  { label: 'PM 10 Level', value: 88, max: 300, color: 'text-secondary',  pct: 0.29, status: 'Acceptable', trend: 'trending_down', trendCol: 'text-primary', trendLabel: '4% decrease' },
  { label: 'NO2 Density', value: 52, max: 200, color: 'text-tertiary', pct: 0.26, status: 'Sensitive', trend: 'warning', trendCol: 'text-tertiary', trendLabel: 'Peak traffic hours' },
];

const CircleProgress = ({ value, pct, color }) => {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle className="text-surface-container-highest" cx="40" cy="40" fill="transparent" r={r} stroke="currentColor" strokeWidth="8"/>
        <circle
          className={color}
          cx="40" cy="40" fill="transparent" r={r}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none">{value}</span>
      </div>
    </div>
  );
};

const QuickStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {STATS.map(({ label, value, pct, color, status, trend, trendCol, trendLabel }) => (
        <div key={label} className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-6 group hover:-translate-y-1 transition-transform">
          <CircleProgress value={value} pct={pct} color={color} />
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{label}</p>
            <h3 className="text-xl font-bold mt-0.5 text-on-surface">{status}</h3>
            <div className={`flex items-center gap-1 mt-1 ${trendCol} text-[10px] font-bold tracking-wide`}>
              <span className="material-symbols-outlined text-[14px] leading-none">{trend}</span>
              <span>{trendLabel}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
