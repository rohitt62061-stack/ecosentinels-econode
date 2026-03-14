import React, { useState } from 'react';
import { Camera, Scan, CheckCircle, XCircle, Recycle } from 'lucide-react';

const RESULTS = {
  success: {
    label: 'Correct Segregation!',
    sub: '+50 Civic Points Earned',
    color: '#2A9D8F',
    bg: 'rgba(42,157,143,0.15)',
    icon: CheckCircle,
    ring: '0 0 40px rgba(42,157,143,0.5)',
  },
  fail: {
    label: 'Wrong Bin!',
    sub: 'Please re-segregate. Try again.',
    color: '#E76F51',
    bg: 'rgba(231,111,81,0.15)',
    icon: XCircle,
    ring: '0 0 40px rgba(231,111,81,0.5)',
  },
};

const WasteScanner = () => {
  const [phase, setPhase] = useState('idle'); // idle | scanning | result
  const [result, setResult] = useState(null);

  const scan = () => {
    if (phase !== 'idle') return;
    setPhase('scanning');
    setTimeout(() => {
      const ok = Math.random() > 0.25;
      setResult(ok ? 'success' : 'fail');
      setPhase('result');
      setTimeout(() => { setPhase('idle'); setResult(null); }, 3000);
    }, 2000);
  };

  const res = result ? RESULTS[result] : null;
  const ResultIcon = res?.icon;

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-100 dark:border-mcd-dark-border bg-white dark:bg-mcd-dark-surface shadow-card-dark transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-mcd-dark-border bg-slate-50/60 dark:bg-[rgba(255,255,255,0.02)]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Recycle size={17} className="text-mcd-success" />
          Waste Segregation Scanner
        </h3>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-mcd-primary/10 text-mcd-primary dark:bg-mcd-success/10 dark:text-mcd-success uppercase tracking-wider">
          +50 pts / scan
        </span>
      </div>

      {/* Viewfinder */}
      <div className="px-5 pt-5">
        <div
          className="relative overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center"
          style={{
            aspectRatio: '4/3',
            boxShadow: phase === 'result' && res ? res.ring : 'none',
            transition: 'box-shadow 0.4s ease',
          }}
          onClick={scan}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

          {/* Corner brackets */}
          {['top-3 left-3 border-t-2 border-l-2 rounded-tl-lg',
            'top-3 right-3 border-t-2 border-r-2 rounded-tr-lg',
            'bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg',
            'bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg'].map((cls, i) => (
            <div key={i} className={`absolute w-7 h-7 border-mcd-accent/70 ${cls}`} />
          ))}

          {/* Idle state */}
          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-3 text-white/30">
              <Camera size={48} />
              <span className="text-xs font-medium">Tap to scan</span>
            </div>
          )}

          {/* Scanning */}
          {phase === 'scanning' && (
            <>
              <div className="animate-scan" />
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-12 h-12 rounded-full border-4 border-mcd-accent border-t-transparent animate-spin" />
                <span className="text-mcd-accent text-xs font-bold font-mono tracking-widest animate-pulse">
                  ANALYZING…
                </span>
              </div>
            </>
          )}

          {/* Result */}
          {phase === 'result' && res && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-fade-in"
              style={{ backgroundColor: res.bg, backdropFilter: 'blur(4px)' }}
            >
              <ResultIcon size={56} style={{ color: res.color, filter: `drop-shadow(0 0 12px ${res.color})` }} />
              <div className="text-center">
                <p className="text-white font-extrabold text-lg leading-tight">{res.label}</p>
                <p className="text-white/70 text-sm mt-0.5">{res.sub}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="px-5 py-5">
        <button
          onClick={scan}
          disabled={phase !== 'idle'}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200
            ${phase !== 'idle'
              ? 'bg-slate-100 dark:bg-[rgba(255,255,255,0.05)] text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-mcd-primary to-mcd-success text-white hover:opacity-90 active:scale-[0.98] shadow-lg hover:shadow-teal-glow'
            }`}
        >
          {phase === 'idle'    && <><Scan size={16} /> Tap to Scan Waste</>}
          {phase === 'scanning'&& <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Scanning…</>}
          {phase === 'result'  && <><CheckCircle size={16} /> Scan Complete</>}
        </button>

        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
          Point camera at waste bin · EcoNode AI classifies material
        </p>
      </div>
    </div>
  );
};

export default WasteScanner;
