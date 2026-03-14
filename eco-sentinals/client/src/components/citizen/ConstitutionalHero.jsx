import React, { useState } from 'react';
import { Wind, MapPin } from 'lucide-react';

const AQI_TIERS = [
  { max: 50,  label: 'Good',     color: '#2A9D8F', bg: 'rgba(42,157,143,0.12)',  ring: 'rgba(42,157,143,0.35)' },
  { max: 100, label: 'Fair',     color: '#E9C46A', bg: 'rgba(233,196,106,0.12)', ring: 'rgba(233,196,106,0.35)' },
  { max: 200, label: 'Moderate', color: '#FB8B24', bg: 'rgba(251,139,36,0.12)',  ring: 'rgba(251,139,36,0.35)'  },
  { max: 300, label: 'Poor',     color: '#E36414', bg: 'rgba(227,100,20,0.12)',  ring: 'rgba(227,100,20,0.35)'  },
  { max: 500, label: 'Severe',   color: '#E76F51', bg: 'rgba(231,111,81,0.12)',  ring: 'rgba(231,111,81,0.35)'  },
];
const getTier = v => AQI_TIERS.find(t => v <= t.max) || AQI_TIERS.at(-1);

const ConstitutionalHero = () => {
  const [aqi] = useState(145);
  const tier = getTier(aqi);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-100 dark:border-mcd-dark-border bg-white dark:bg-mcd-dark-surface shadow-card-dark transition-colors duration-300 p-5">
      {/* Ambient glow blob */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-10 transition-all duration-700"
        style={{ backgroundColor: tier.color }} />

      <div className="relative flex items-center justify-between gap-4">
        {/* Text side */}
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1">
            Article 21 · Right to Life
          </p>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mb-3">
            Your Right<br/>to Clean Air
          </h2>

          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sector 14, Delhi</span>
          </div>

          {/* AQI badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ backgroundColor: tier.bg, borderColor: tier.ring }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tier.color }} />
            <span className="text-sm font-bold font-mono" style={{ color: tier.color }}>
              AQI {aqi}
            </span>
            <span className="text-xs font-semibold" style={{ color: tier.color }}>
              · {tier.label}
            </span>
          </div>
        </div>

        {/* Breathing icon side */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          {/* Triple pulsing rings */}
          <div className="relative flex items-center justify-center w-24 h-24">
            {[1, 1.3, 1.6].map((scale, i) => (
              <div key={i} className="absolute rounded-full animate-ping"
                style={{
                  width: 36 * scale, height: 36 * scale,
                  backgroundColor: tier.ring,
                  animationDelay: `${i * 0.6}s`,
                  animationDuration: '2.4s',
                  opacity: 0.3 / (i + 1),
                }}
              />
            ))}
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full shadow-lg"
              style={{ backgroundColor: tier.bg, border: `2px solid ${tier.ring}` }}>
              <Wind size={32} className="animate-breathe" style={{ color: tier.color }} />
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: tier.color }}>
            {tier.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConstitutionalHero;
