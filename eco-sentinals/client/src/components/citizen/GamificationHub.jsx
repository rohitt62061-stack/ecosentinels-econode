import React from 'react';
import { Flame, Trophy, Award, MapPin } from 'lucide-react';
import { citizenData, leaderboard } from '../../data/mockData';

const GamificationHub = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Primary Stats Panel */}
      <div className="bg-gradient-to-br from-mcd-accent/10 to-transparent dark:from-mcd-accent/5 dark:to-transparent bg-white dark:bg-mcd-dark-surface rounded-3xl shadow-lg border border-mcd-accent/20 dark:border-mcd-accent/10 p-6 flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300">
        
        {/* Streak Counter text top-left */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur">
            <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={16} />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {citizenData.streak} days correct segregation!
            </span>
          </div>
          <Award className="text-mcd-accent drop-shadow-sm" size={24} />
        </div>

        {/* Large Points Display */}
        <div className="flex flex-col items-center justify-center my-4">
          <span className="text-5xl font-extrabold font-mono text-mcd-accent drop-shadow-md">
            {citizenData.points}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 tracking-widest uppercase">
            Civic Points
          </span>
        </div>

        {/* Rank / Level */}
        <div className="mt-2 w-full flex items-center justify-center gap-2">
          <span className="text-sm font-bold text-slate-800 dark:text-white px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            Level: {citizenData.level}
          </span>
        </div>
      </div>

      {/* Leaderboard Panel */}
      <div className="bg-white dark:bg-mcd-dark-surface rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-300">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={20} />
          Ward Leaderboard
        </h3>
        
        <ul className="space-y-3">
          {leaderboard.map((entry) => (
            <li key={entry.rank} className={`flex items-center justify-between p-3 rounded-2xl border ${ entry.rank === 1 ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' } group`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono shadow-sm ${
                  entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
                  entry.rank === 2 ? 'bg-slate-300 text-slate-800' : 
                  'bg-orange-300 text-orange-900'
                }`}>
                  {entry.rank}
                </span>
                <span className="text-sm justify-center items-center font-bold text-slate-800 dark:text-slate-200 flex gap-1.5 group-hover:text-mcd-primary transition-colors">
                  <MapPin size={14} className="opacity-50" />
                  {entry.ward}
                </span>
              </div>
              <span className="text-sm font-bold font-mono text-mcd-accent">
                {entry.score} pts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GamificationHub;
