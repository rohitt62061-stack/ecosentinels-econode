import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity } from 'lucide-react';

const AQICommandCenter = () => {
  const [aqi, setAqi] = useState(0);
  const targetAqi = 145; // Simulated target value
  
  useEffect(() => {
    // Animate AQI value on load
    const interval = setInterval(() => {
      setAqi(prev => {
        if (prev < targetAqi) return prev + 5;
        clearInterval(interval);
        return targetAqi;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Calculate colors based on AQI value
  const getColors = (value) => {
    if (value <= 50) return { text: 'text-mcd-success', ring: 'border-mcd-success', shadow: 'shadow-mcd-success/30' };
    if (value <= 100) return { text: 'text-mcd-warning', ring: 'border-mcd-warning', shadow: 'shadow-mcd-warning/30' };
    if (value <= 200) return { text: 'text-mcd-accent', ring: 'border-mcd-accent', shadow: 'shadow-mcd-accent/30' };
    if (value <= 300) return { text: 'text-mcd-secondary', ring: 'border-mcd-secondary', shadow: 'shadow-mcd-secondary/30' };
    return { text: 'text-mcd-danger', ring: 'border-mcd-danger', shadow: 'shadow-mcd-danger/30' };
  };

  const colors = getColors(aqi);

  return (
    <div className="bg-white dark:bg-mcd-dark-surface rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="text-mcd-primary" />
          Live AQI Command Center
        </h2>
        <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-bold font-mono tracking-wider flex items-center gap-1">
          <AlertTriangle size={14} /> WARD 14 (RED ZONE)
        </span>
      </div>

      {/* Animated Gauge */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className={`relative w-48 h-48 rounded-full border-[12px] flex items-center justify-center shadow-xl ${colors.ring} ${colors.shadow} transition-all duration-700 ease-out`}>
          <div className="absolute inset-2 rounded-full border-4 border-slate-100 dark:border-slate-800/50"></div>
          <div className="text-center z-10">
            <span className={`text-6xl font-extrabold font-mono tracking-tighter ${colors.text} drop-shadow-md`}>
              {aqi}
            </span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
              PM 2.5
            </p>
          </div>
        </div>
      </div>

      {/* Health Cost Metrics */}
      <div className="mt-8 mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              Constitutional Health Cost
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              ₹2.4 Crore <span className="text-sm font-normal text-slate-500">saved this month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-mcd-primary to-mcd-secondary hover:from-mcd-secondary hover:to-mcd-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 transform active:scale-95">
        Deploy Emergency Response
      </button>
    </div>
  );
};

export default AQICommandCenter;
