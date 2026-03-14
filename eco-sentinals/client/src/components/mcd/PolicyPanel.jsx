import React from 'react';
import { Bot, FileDown, CheckCircle, ChevronRight } from 'lucide-react';

const PolicyPanel = () => {
  const recommendations = [
    { id: 1, action: "Deploy anti-smog guns to Ward 14", impact: "High", time: "Immediate" },
    { id: 2, action: "Halt construction in Okhla phase 2", impact: "Critical", time: "Within 2hrs" },
    { id: 3, action: "Reroute heavy traffic from NH-44", impact: "Medium", time: "Evening peak" }
  ];

  return (
    <div className="bg-white dark:bg-mcd-dark-surface rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="text-mcd-secondary" size={20} />
          AI Policy Automation
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-mcd-success/10 text-mcd-success rounded-full flex items-center gap-1">
          <CheckCircle size={12} /> Article 21 Active
        </span>
      </div>

      {/* Recommendations List */}
      <div className="p-5 flex-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
          Recommended Interventions
        </p>
        <ul className="space-y-3">
          {recommendations.map((rec) => (
            <li 
              key={rec.id} 
              className="group flex flex-col p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-mcd-secondary/50 dark:hover:border-mcd-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-mcd-secondary transition-colors leading-tight">
                  {rec.action}
                </span>
                <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  rec.impact === 'Critical' ? 'bg-mcd-danger/10 text-mcd-danger' : 
                  rec.impact === 'High' ? 'bg-mcd-warning/10 text-mcd-warning' : 
                  'bg-mcd-success/10 text-mcd-success'
                }`}>
                  {rec.impact} Impact
                </span>
                <span className="text-[10px] font-medium text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {rec.time}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Report Button */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button className="w-full py-3 px-4 rounded-lg border-2 border-slate-300 dark:border-slate-700 hover:border-mcd-primary dark:hover:border-mcd-primary hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
          <FileDown size={18} />
          Auto-Generate DPCC Report
        </button>
      </div>
    </div>
  );
};

export default PolicyPanel;
