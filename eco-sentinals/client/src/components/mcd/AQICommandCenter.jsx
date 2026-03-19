import React, { useState } from 'react';

// Generates an array of bar objects { h: number, bgClass: string, opClass: string }
const generateBars = (count) => {
  return Array.from({ length: count }, (_, i) => {
    const val = Math.floor(Math.random() * 80) + 20; // 20% to 100%
    let bgClass = 'bg-surface-container-high';
    let opClass = '';
    
    // Simulate color distribution similar to Stitch html
    if (val > 80) { bgClass = 'bg-tertiary'; opClass = 'opacity-90'; }
    else if (val > 60) { bgClass = 'bg-primary-container'; opClass = 'opacity-80'; }
    
    return { h: val, bgClass, opClass };
  });
};

const CHART_24H = generateBars(14);
const CHART_30D = generateBars(30);

const AQICommandCenter = () => {
  const [timeRange, setTimeRange] = useState('24H');
  const activeData = timeRange === '24H' ? CHART_24H : CHART_30D;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="font-headline font-bold text-on-surface">Air Quality Trend</h3>
          <div className="flex bg-surface-container-highest rounded-lg p-0.5 shadow-inner">
            <button 
              onClick={() => setTimeRange('24H')}
              className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${timeRange === '24H' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >24H</button>
            <button 
              onClick={() => setTimeRange('30D')}
              className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${timeRange === '30D' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >30D</button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="text-xs font-medium text-on-surface-variant">Central Delhi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="text-xs font-medium text-on-surface-variant">NCR Border</span>
          </div>
        </div>
      </div>
      
      {/* Minimalist Line Chart Placeholder */}
      <div className="h-32 w-full flex items-end gap-1">
        {activeData.map((bar, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-t-sm transition-all duration-500 hover:opacity-100 cursor-crosshair ${bar.bgClass} ${bar.opClass}`}
            style={{ height: `${bar.h}%` }}
          ></div>
        ))}
      </div>
      
      <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
        {timeRange === '24H' ? (
          <>
            <span>06:00 AM</span>
            <span>12:00 PM</span>
            <span>06:00 PM</span>
            <span>12:00 AM</span>
            <span>Now</span>
          </>
        ) : (
          <>
            <span>Day 1</span>
            <span>Day 7</span>
            <span>Day 15</span>
            <span>Day 22</span>
            <span>Today</span>
          </>
        )}
      </div>
    </div>
  );
};

export default AQICommandCenter;
