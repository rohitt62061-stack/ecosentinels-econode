import { useEffect, useState } from 'react';
import CitizenLayout from '../../components/CitizenLayout';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Award, Zap, Award as Trophy, Lock, Star, ShieldCheck, Flame } from 'lucide-react';

interface ScoreData {
  total_scans: number;
  correct_scans: number;
  segregation_score: number;
  monthly_credits: number;
  streak_days: number;
}

interface LeaderboardItem {
  ward_name: string;
  ward_number: string;
  citizens: number;
  avg_score: number;
  rank: number;
}

export default function Score() {
  const { session } = useAuth();
  const [score, setScore] = useState<ScoreData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('ward_leaderboard').select('*').limit(5);
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

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = score 
    ? circumference - (Math.min(score.segregation_score, 100) / 100) * circumference 
    : circumference;

  const baseScore = score && score.total_scans > 0 
    ? Math.round((score.correct_scans / score.total_scans) * 100) 
    : 0;

  const multiplier = score ? Math.min(1 + (Math.floor(score.streak_days / 7) * 0.05), 1.5).toFixed(2) : "1.00";

  return (
    <CitizenLayout>
      <div className="p-4 bg-[#0a0f0c] min-h-full text-slate-100 flex flex-col gap-5 max-w-md mx-auto overflow-y-auto pb-20">
        
        <div>
          <h1 className="text-xl font-bold font-manrope">Achievement Ledger</h1>
          <p className="text-xs text-emerald-400/80">Track points, streaks, and ward standings</p>
        </div>

        {/* Circular Score Ring */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          <svg className="w-52 h-52 transform -rotate-90">
            <circle cx="104" cy="104" r={radius} stroke="#0f1712" strokeWidth="10" fill="transparent" />
            <circle 
              cx="104" cy="104" r={radius} 
              stroke="#10b981" strokeWidth="12" fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Segregation</span>
            <h1 className="text-4xl font-black font-manrope text-white">
              {score ? Math.round(score.segregation_score) : 0}
            </h1>
            <div className="flex items-center gap-1 mt-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-400">₹{score ? score.monthly_credits : '0.00'}</span>
            </div>
          </div>
          {score && score.streak_days > 0 && (
            <div className="absolute top-4 right-12 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg animate-bounce">
              <Flame size={12} /> {score.streak_days} DAY
            </div>
          )}
        </div>

        {/* transparent formula card */}
        <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-4 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Scoring Formula</h3>
          <p className="text-[10px] text-slate-500">Correct ÷ Total × 100 × Streak Bonus = Points</p>
          <div className="mt-2 text-sm font-black flex items-center justify-between text-slate-200 bg-slate-950/50 p-2.5 rounded-xl border border-slate-900">
            <span>{score ? score.correct_scans : 0} ÷ {score ? score.total_scans : 0} × 100</span>
            <span className="text-slate-500">=</span>
            <span className="text-emerald-400">{baseScore}</span>
            <span className="text-slate-500">×</span>
            <span>{multiplier}x</span>
            <span className="text-slate-500">=</span>
            <span className="text-emerald-400">{score ? Math.round(score.segregation_score) : 0}</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-300">Badges & Perks</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'first_scan', label: 'First Scan', icon: Trophy },
              { id: 'week_warrior', label: 'Week Warrior', icon: Flame },
              { id: 'scans_100', label: '100 Scans Club', icon: Star },
              { id: 'perfect_month', label: 'Perfect Segregater', icon: ShieldCheck },
            ].map(b => {
              const earned = getBadgeStatus(b.id);
              return (
                <div key={b.id} className={`p-3 border rounded-xl flex flex-col items-center text-center gap-1.5 transition-all ${
                  earned ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/20 border-slate-900 text-slate-600'
                }`}>
                  <b.icon size={24} className={earned ? 'animate-pulse' : 'opacity-40'} />
                  <span className="text-[9px] font-bold leading-tight">{b.label}</span>
                  {!earned && <Lock size={10} className="text-slate-700 mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex flex-col gap-3 mt-1">
          <h3 className="text-sm font-bold text-slate-300">Ward Standings</h3>
          <div className="bg-slate-900/20 border border-slate-900/60 rounded-xl overflow-hidden">
            {leaderboard.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b border-slate-900/60 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`font-black text-xs ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : 'text-slate-500'}`}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{item.ward_name}</p>
                    <p className="text-[9px] text-slate-500">{item.citizens} citizens active</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-xs text-emerald-400">{item.avg_score}</span>
                  <p className="text-[9px] text-slate-600">Avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </CitizenLayout>
  );
}
