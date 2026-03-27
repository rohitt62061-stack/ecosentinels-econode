import React from 'react';

interface AQIGaugeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const AQIGauge: React.FC<AQIGaugeProps> = ({ 
  value, 
  size = 'md', 
  label = 'AQI', 
  className = '' 
}) => {
  // Size configurations
  const sizes = {
    sm: { dimension: '80', strokeWidth: '6', fontSize: '1.25rem' },
    md: { dimension: '160', strokeWidth: '10', fontSize: '2.5rem' },
    lg: { dimension: '240', strokeWidth: '14', fontSize: '4rem' }
  };

  const { dimension, strokeWidth, fontSize } = sizes[size];
  const radius = (Number(dimension) - Number(strokeWidth)) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Constrain value to 0-500 for Delhi AQI
  const normalizedValue = Math.min(500, Math.max(0, value));
  const progress = normalizedValue / 500;
  const offset = circumference * (1 - progress);

  // Color mapping based on DESIGN.md: primary (#012D1D) and primary-fixed (#C1ECD4)
  const strokeColor = 'var(--primary)';
  const trackColor = 'var(--primary-fixed)';

  return (
    <div className={`relative flex flex-col items-center justify-center ${className} animate-editorial-fade`}>
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="transform -rotate-90"
      >
        {/* Progress Track (C1ECD4) */}
        <circle
          cx={Number(dimension) / 2}
          cy={Number(dimension) / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="opacity-30"
        />
        {/* Primary Progress (012D1D) */}
        <circle
          cx={Number(dimension) / 2}
          cy={Number(dimension) / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Inner Surface with Backdrop Blur */}
      <div 
        className="absolute inset-4 rounded-full flex flex-col items-center justify-center shadow-inner overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <span 
          className="font-bold tracking-tighter text-[var(--text-primary)] leading-none"
          style={{ fontFamily: 'var(--font-display)', fontSize }}
        >
          {value}
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[var(--text-muted)] mt-1">
          {label}
        </span>
      </div>
      
      {/* Optional decorative indicator shadow/ring below */}
      <div 
        className="absolute -inset-2 rounded-full border border-[var(--outline-variant)] opacity-10 pointer-events-none"
      />
    </div>
  );
};

export default AQIGauge;
