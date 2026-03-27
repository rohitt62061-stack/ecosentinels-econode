import { useEffect, useState } from 'react';
import CitizenLayout from '../../components/CitizenLayout';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Award, Lock, Sparkles, Flame, ShieldCheck, Trophy, Star } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface ScoreData {
  total_scans: number;
  correct_scans: number;
  segregation_score: number;
  monthly_credits: number;
  streak_days: number;
}

interface LeaderboardItem {
  ward_name: string;
  citizens: number;
  avg_score: number;
}

export default function Score() {
  const { session } = useAuth();
  const [score, setScore] = useState<ScoreData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchScore();
      fetchLeaderboard();
    }
  }, [session]);

  const fetchScore = async () => {
    try {
      const { data, error } = await supabase
        .from('citizen_scores')
        .select('*')
        .eq('user_id', session?.user?.id)
        .maybeSingle();

      if (error) throw error;
      setScore(data);
    } catch (err) {
      console.error("Error fetching score:", err);
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('ward_leaderboard').select('ward_name, citizens, avg_score').limit(5);
    if (data) setLeaderboard(data);
  };

  const getBadgeStatus = (badgeId: string) => {
    if (!score) return false;
    if (badgeId === 'first_scan') return score.total_scans > 0;
    if (badgeId === 'week_warrior') return score.streak_days >= 7;
    if (badgeId === 'scans_100') return score.total_scans >= 100;
    if (badgeId === 'perfect_month') return score.segregation_score > 90 && score.total_scans > 20;
    return false;
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = score ? Math.min(score.segregation_score, 100) / 100 : 0;
  const offset = circumference * (1 - progress);

  return (
    <CitizenLayout>
      <div className="flex flex-col h-full bg-[var(--surface)] text-[var(--text-primary)] transition-colors duration-500 overflow-y-auto pb-32">
        
        {/* Editorial Header */}
        <div className="p-8 pb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2 block">
            Screen 08: Achievement Ledger
          </span>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Ecology Dividends
          </h1>
          <div className="w-12 h-[1px] bg-[var(--primary)] opacity-20 mt-4"></div>
        </div>

        {/* Score Ring Section - Tonal Layering */}
        <ErrorBoundary fallback={<div className="mx-4 mb-8 bg-[var(--surface-container-low)] rounded-[var(--radius-lg)] p-12 flex items-center justify-center text-[var(--text-muted)] italic">Score analysis unavailable</div>}>
          <div className="mx-4 mb-8 bg-[var(--surface-container-low)] rounded-[var(--radius-lg)] p-8 flex flex-col items-center relative overflow-hidden">
            {/* Decorative Corner Element */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy size={48} />
            </div>

            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r={radius} stroke="var(--surface-container-highest)" strokeWidth="8" fill="transparent" className="opacity-30" />
                <circle 
                  cx="96" cy="96" r={radius} 
                  stroke="var(--primary)" strokeWidth="10" fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">Citizen Score</span>
                <h2 className="text-5xl font-bold text-[var(--primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {score ? Math.round(score.segregation_score) : 0}
                </h2>
                <div className="flex items-center gap-1 mt-2 text-amber-600 font-bold text-xs">
                  <Sparkles size={12} /> ₹{score ? score.monthly_credits : '0.00'}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8 w-full">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Weekly Streak</span>
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <Flame size={16} />
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{score?.streak_days || 0} Days</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Global Rank</span>
                <div className="flex items-center gap-2 text-[var(--primary)] font-bold">
                  <Award size={16} />
                  <span style={{ fontFamily: 'var(--font-mono)' }}>#12/28k</span>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Achievement Badges - No Lines, Tonal Hierarchy */}
        <div className="px-8 mb-12">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
            Sovereign Commendations
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'first_scan', label: 'First Metabolism', icon: Trophy },
              { id: 'week_warrior', label: 'Consistency Seal', icon: Flame },
              { id: 'scans_100', label: 'Centurion Scout', icon: Star },
              { id: 'perfect_month', label: 'Metabolic Master', icon: ShieldCheck },
            ].map(b => {
              const earned = getBadgeStatus(b.id);
              return (
                <div 
                  key={b.id} 
                  className={`p-6 rounded-[var(--radius-lg)] flex flex-col items-center text-center gap-3 transition-all duration-500 ${
                    earned 
                      ? 'bg-[var(--tertiary-fixed)] text-[var(--tertiary)] shadow-[var(--shadow-ambient)]' 
                      : 'bg-[var(--surface-container)] text-[var(--text-muted)] opacity-40'
                  }`}
                  style={{ borderRadius: '0.75rem' }} // soft-seal
                >
                  <div className="relative">
                    <b.icon size={28} className={earned ? 'animate-pulse' : ''} />
                    {!earned && <Lock size={12} className="absolute -top-1 -right-1" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard - No Dividers */}
        <div className="px-8">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
            Inter-Ward Standings
          </h3>
          <div className="flex flex-col gap-[0.3rem]">
            {leaderboard.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 rounded-[var(--radius-md)] ${
                  index % 2 === 0 ? 'bg-[var(--surface-container-low)]' : 'bg-[var(--surface)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{item.ward_name}</p>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                      {item.citizens} Nodes Active
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[var(--primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {item.avg_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </CitizenLayout>
  );
}
