import React, { useState } from 'react';
import { Bot, FileDown, CheckCircle, ChevronRight, Cpu } from 'lucide-react';

const RECS = [
  { id: 1, action: 'Deploy anti-smog guns to Ward 14', impact: 'Critical', time: 'Immediate', done: false },
  { id: 2, action: 'Halt construction sites in Okhla Phase 2', impact: 'High', time: '< 2 hrs', done: false },
  { id: 3, action: 'Reroute heavy traffic from NH-44', impact: 'Medium', time: 'Evening peak', done: true },
];

const IMPACT_STYLES = {
  Critical: { bg: 'rgba(231,111,81,0.12)', text: '#E76F51', dot: '#E76F51' },
  High:     { bg: 'rgba(227,100,20,0.12)', text: '#E36414', dot: '#E36414' },
  Medium:   { bg: 'rgba(233,196,106,0.12)',text: '#C79B1E', dot: '#E9C46A' },
};

const PolicyPanel = () => {
  const [completed, setCompleted] = useState({ 3: true });
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1800);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-mcd-dark-border bg-white dark:bg-mcd-dark-surface shadow-card-dark transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-mcd-dark-border bg-slate-50/60 dark:bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mcd-secondary to-mcd-accent flex items-center justify-center shadow-amber-glow">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Policy Automation</h3>
            <p className="text-[10px] text-slate-400 font-medium">Article 21 Compliance Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[rgba(42,157,143,0.12)] text-mcd-success">
          <CheckCircle size={11} />
          ACTIVE
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-3">
          Recommended Interventions
        </p>
        {RECS.map(rec => {
          const done = !!completed[rec.id];
          const style = IMPACT_STYLES[rec.impact];
          return (
            <button
              key={rec.id}
              onClick={() => setCompleted(p => ({ ...p, [rec.id]: !p[rec.id] }))}
              className={`w-full text-left group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200
                ${done
                  ? 'border-mcd-success/30 dark:border-mcd-success/20 bg-[rgba(42,157,143,0.06)]'
                  : 'border-slate-100 dark:border-mcd-dark-border bg-white dark:bg-[rgba(255,255,255,0.03)] hover:border-mcd-secondary/40'
                }`}
            >
              {/* Left indicator */}
              <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: done ? '#2A9D8F' : style.dot, backgroundColor: done ? 'rgba(42,157,143,0.2)' : 'transparent' }}>
                {done && <CheckCircle size={11} className="text-mcd-success" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-snug transition-colors ${done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-mcd-secondary'}`}>
                  {rec.action}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: style.bg, color: style.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                    {rec.impact}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{rec.time}</span>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-300 dark:text-slate-600 group-hover:text-mcd-secondary transition-colors mt-0.5 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* AI source */}
      <div className="flex items-center gap-2 px-5 pb-4">
        <Cpu size={12} className="text-slate-400" />
        <p className="text-[10px] text-slate-400 font-medium">
          Powered by EcoNode ML · Last sync 2 min ago
        </p>
      </div>

      {/* Report button */}
      <div className="px-5 pb-5">
        <button
          onClick={handleDownload}
          className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-mcd-dark-border
            hover:border-mcd-primary dark:hover:border-mcd-success
            hover:bg-[rgba(15,76,92,0.05)] dark:hover:bg-[rgba(42,157,143,0.06)]
            text-slate-700 dark:text-slate-300 font-semibold text-sm
            flex items-center justify-center gap-2 transition-all duration-200 group"
        >
          {downloading
            ? <><span className="w-4 h-4 rounded-full border-2 border-mcd-success border-t-transparent animate-spin" /> Generating PDF…</>
            : <><FileDown size={16} className="group-hover:text-mcd-primary dark:group-hover:text-mcd-success transition-colors" /> Auto-Generate DPCC Report</>
          }
        </button>
      </div>
    </div>
  );
};

export default PolicyPanel;
