import React, { useState } from 'react';
import { Wind } from 'lucide-react';

const ConstitutionalHero = () => {
  const [aqi] = useState(145); // simulated citizen local AQI

  return (
    <div className="bg-white dark:bg-mcd-dark-surface rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between overflow-hidden relative transition-colors duration-300 transform active:scale-[0.98]">
      {/* Background Decorative Gradient */}
      <div 
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-20 dark:opacity-10 blur-3xl pointer-events-none"
        style={{ background: aqi > 100 ? '#E36414' : '#2A9D8F' }}
      ></div>

      <div className="z-10 w-2/3">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight font-sans tracking-tight mb-2">
          Your Article 21 Right <br/>to Clean Air
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          MCD EcoNode Sensor Data
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full" style={{ background: aqi > 100 ? '#E36414' : '#2A9D8F' }}></span>
          <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
            AQI: {aqi} {aqi > 100 ? '(Moderate)' : '(Good)'}
          </span>
        </div>
      </div>

      {/* Breathing Lung Animation */}
      <div className="z-10 w-1/3 flex justify-end">
        <div className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 shadow-inner border-2 ${aqi > 100 ? 'border-mcd-secondary/20' : 'border-mcd-success/20'}`}>
          <Wind 
            size={40} 
            className={`
              animate-[pulse_3s_ease-in-out_infinite] 
              ${aqi > 100 ? 'text-mcd-secondary drop-shadow-[0_0_8px_rgba(227,100,20,0.5)]' : 'text-mcd-success drop-shadow-[0_0_8px_rgba(42,157,143,0.5)]'}
            `} 
          />
        </div>
      </div>
    </div>
  );
};

export default ConstitutionalHero;
