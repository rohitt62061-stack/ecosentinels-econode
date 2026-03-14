import React from 'react';
import { Flame, Trophy, Award, Star, TrendingUp } from 'lucide-react';
import { citizenData, leaderboard } from '../../data/mockData';

const RANK_STYLES = [
  { gradient: 'from-yellow-400 to-amber-500', text: 'text-yellow-900',  glow: 'shadow-amber-glow', medal: '🥇' },
  { gradient: 'from-slate-300 to-slate-400',  text: 'text-slate-800',   glow: '',                  medal: '🥈' },
  { gradient: 'from-orange-300 to-orange-400',text: 'text-orange-900',  glow: '',                  medal: '🥉' },
];

const GamificationHub = () => {
  return (
    <div className="space-y-4">

      {/* Points + Streak Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-100 dark:border-mcd-dark-border bg-white dark:bg-mcd-dark-surface shadow-card-dark p-5 transition-colors duration-300">
        {/* Background glow blob */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,139,36,0.18) 0%, transparent 70%)' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Award size={18} className="text-mcd-accent" />
            Civic Champion
          </h3>
          {/* Streak pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-orange-50 dark:bg-[rgba(251,139,36,0.12)]
            border border-orange-200 dark:border-[rgba(251,139,36,0.25)]">
            <Flame size={14} className="text-orange-500 fill-orange-400" />
            <span className="text-xs font-bold text-orange-600 dark:text-mcd-accent">
              {citizenData.streak}-day streak!
            </span>
          </div>
        </div>

        {/* Large Points */}
        <div className="flex items-end gap-4 mb-4 relative">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1">Civic Points</p>
            <span className="text-5xl font-extrabold font-mono gradient-text-amber leading-none">
              {citizenData.points.toLocaleString()}
            </span>
          </div>
          <div className="mb-1 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-xs font-bold text-mcd-success">
              <TrendingUp size={13} />
              +50 today
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mcd-primary/10 text-mcd-primary dark:bg-mcd-success/10 dark:text-mcd-success uppercase tracking-wider">
              {citizenData.level}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
            <span>Next: Eco-Warrior</span>
            <span>1450 / 2000</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-mcd-accent to-mcd-secondary transition-all duration-1000"
              style={{ width: '72%' }} />
          </div>
        </div>

        {/* Star icons decorative */}
        <div className="absolute top-4 right-14 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Star key={i} size={10} className="text-mcd-accent fill-mcd-accent opacity-40"
              style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>

      {/* Leaderboard Card */}
      <div className="rounded-3xl overflow-hidden border border-slate-100 dark:border-mcd-dark-border bg-white dark:bg-mcd-dark-surface shadow-card-dark transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-mcd-dark-border bg-slate-50/50 dark:bg-[rgba(255,255,255,0.02)]">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            Ward Leaderboard
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Updated now</span>
        </div>

        {/* Leaders */}
        <ul className="divide-y divide-slate-50 dark:divide-mcd-dark-border">
          {leaderboard.map((entry, i) => {
            const style = RANK_STYLES[i] || RANK_STYLES[2];
            return (
              <li key={entry.rank}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors
                  ${i === 0 ? 'bg-amber-50/60 dark:bg-[rgba(251,139,36,0.06)]' : 'hover:bg-slate-50 dark:hover:bg-[rgba(255,255,255,0.02)]'}`}>
                {/* Medal */}
                <span className="text-xl w-7 text-center">{style.medal}</span>

                {/* Ward info */}
                <div className="flex-1">
                  <p className={`text-sm font-bold ${i === 0 ? 'text-amber-700 dark:text-mcd-accent' : 'text-slate-800 dark:text-slate-200'}`}>
                    {entry.ward}
                  </p>
                  {/* Mini progress */}
                  <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-[rgba(255,255,255,0.06)] mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(entry.score / 10000) * 100}%`,
                        background: i === 0 ? '#FB8B24' : i === 1 ? '#94A3B8' : '#CD7F32',
                      }} />
                  </div>
                </div>

                {/* Score */}
                <span className={`text-sm font-bold font-mono ${i === 0 ? 'text-mcd-accent' : 'text-slate-600 dark:text-slate-400'}`}>
                  {entry.score.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default GamificationHub;
