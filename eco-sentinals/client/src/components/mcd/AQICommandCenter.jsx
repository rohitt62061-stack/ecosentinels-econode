import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, TrendingDown, Zap } from 'lucide-react';

const AQI_LEVELS = [
  { max: 50,  label: 'Good',        color: '#2A9D8F', glow: 'rgba(42,157,143,0.5)' },
  { max: 100, label: 'Satisfactory',color: '#E9C46A', glow: 'rgba(233,196,106,0.5)' },
  { max: 200, label: 'Moderate',    color: '#FB8B24', glow: 'rgba(251,139,36,0.5)'  },
  { max: 300, label: 'Poor',        color: '#E36414', glow: 'rgba(227,100,20,0.5)'  },
  { max: 400, label: 'Very Poor',   color: '#E76F51', glow: 'rgba(231,111,81,0.5)'  },
  { max: 500, label: 'Severe',      color: '#7B1D1D', glow: 'rgba(123,29,29,0.5)'   },
];

const getAQIInfo = (value) =>
  AQI_LEVELS.find(l => value <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];

// SVG Circular gauge
const AQIGauge = ({ value, max = 500 }) => {
  const r = 80;
  const cx = 100, cy = 100;
  const circumference = 2 * Math.PI * r;
  const filled = Math.min(value / max, 1);
  const offset = circumference * (1 - filled * 0.75); // 270° arc
  
  const info = getAQIInfo(value);

  return (
    <div className="relative flex items-center justify-center my-4">
      <svg viewBox="0 0 200 200" className="w-52 h-52 drop-shadow-2xl" style={{ filter: `drop-shadow(0 0 20px ${info.glow})` }}>
        {/* Defs */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={info.color} stopOpacity="1" />
            <stop offset="100%" stopColor={info.color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="14"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={circumference * 0.125}
          strokeLinecap="round"
          transform="rotate(135, 100, 100)"
        />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135, 100, 100)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Inner ring subtle glow */}
        <circle cx={cx} cy={cy} r={64} fill="none" stroke={info.color} strokeWidth="1" strokeOpacity="0.15" />

        {/* Center value */}
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
          fill={info.color} fontSize="38" fontWeight="800" fontFamily="JetBrains Mono, monospace"
          style={{ filter: `drop-shadow(0 0 8px ${info.glow})` }}
        >
          {value}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="3"
        >
          PM 2.5
        </text>

        {/* Level label */}
        <text x={cx} y={162} textAnchor="middle"
          fill={info.color} fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="2"
        >
          {info.label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};

const StatChip = ({ icon: IconComponent, label, value, color }) => ( // eslint-disable-line no-unused-vars
  <div className={`flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[rgba(255,255,255,0.04)] border border-slate-100 dark:border-mcd-dark-border`}>
    <div className={`p-1.5 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
      <IconComponent size={14} style={{ color }} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const AQICommandCenter = () => {
  const [aqi, setAqi] = useState(0);
  const target = 145;

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(v + 6, target);
      setAqi(v);
      if (v >= target) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, []);

  const info = getAQIInfo(aqi);

  return (
    <div className="rounded-2xl overflow-hidden shadow-card-dark border border-slate-100 dark:border-mcd-dark-border bg-white dark:bg-mcd-dark-surface transition-colors duration-300">
      {/* Header strip */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
          <Activity size={18} className="text-mcd-primary dark:text-mcd-success" />
          Live AQI Command
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${info.color}20`, color: info.color }}>
          <AlertTriangle size={11} />
          WARD&nbsp;14 · RED ZONE
        </span>
      </div>

      {/* Gauge */}
      <div className="px-5">
        <AQIGauge value={aqi} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <StatChip icon={TrendingDown} label="Health Saved" value="₹2.4 Cr" color="#2A9D8F" />
        <StatChip icon={Zap} label="Devices Active" value="1,842" color="#FB8B24" />
      </div>

      {/* Constitutional cost callout */}
      <div className="mx-5 mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[rgba(42,157,143,0.12)] to-[rgba(15,76,92,0.12)] border border-mcd-success/20">
        <p className="text-[10px] uppercase tracking-widest font-bold text-mcd-success mb-0.5">Constitutional Health Cost</p>
        <p className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
          ₹2.4 Crore <span className="text-sm font-normal text-slate-500 dark:text-slate-400">saved this month</span>
        </p>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide
          bg-gradient-to-r from-mcd-primary via-[#0D5F73] to-mcd-secondary
          hover:opacity-90 active:scale-[0.98] transition-all duration-200
          shadow-lg hover:shadow-teal-glow
          flex items-center justify-center gap-2">
          <Zap size={16} />
          Deploy Emergency Response
        </button>
      </div>
    </div>
  );
};

export default AQICommandCenter;
