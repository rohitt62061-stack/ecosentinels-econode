import { useState, useMemo } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { useAuthGuardedQuery } from '../../hooks/useAuthGuardedQuery';
import { BarChart3, TrendingUp, Users, Leaf, Download, RefreshCw, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function Reports() {
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('month');
  const [aiReport, setAiReport] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auth-Guarded Data Fetching
  const { data: rawData, fetching } = useAuthGuardedQuery<{
    events: any[];
    routes: any[];
    leaderboard: any[];
  }>(async () => {
    const [eventsRes, routesRes, boardsRes] = await Promise.all([
      supabase.from('waste_events').select('scanned_at, waste_category, user_id'),
      supabase.from('fleet_routes').select('captured_at, total_distance'),
      supabase.from('ward_leaderboard').select('*').limit(6)
    ]);

    return {
      data: {
        events: eventsRes.data || [],
        routes: routesRes.data || [],
        leaderboard: boardsRes.data || []
      },
      error: eventsRes.error || routesRes.error || boardsRes.error
    };
  }, [filter]);

  const kpis = useMemo(() => {
    const events = rawData?.events || [];
    const routes = rawData?.routes || [];
    
    const total = events.length;
    const recyclable = events.filter(e => e.waste_category === 'recyclable').length;
    const uniqueUsers = new Set(events.map(e => e.user_id)).size;

    let sumCo2 = 0;
    routes.forEach(r => {
      const dist = r.total_distance || 0;
      sumCo2 += Math.max(0, (60 - dist) * 0.21);
    });

    return {
      totalWaste: total * 0.5,
      recyclingRate: total > 0 ? Math.round((recyclable / total) * 100) : 0,
      activeCitizens: uniqueUsers,
      co2Saved: Math.round(sumCo2)
    };
  }, [rawData]);

  const chartsData = useMemo(() => {
    const events = rawData?.events || [];
    const routes = rawData?.routes || [];

    // Group Waste
    const groupedWaste: Record<string, any> = {};
    events.forEach(e => {
       const date = new Date(e.scanned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
       if (!groupedWaste[date]) groupedWaste[date] = { date, biodegradable: 0, recyclable: 0, hazardous: 0 };
       groupedWaste[date][e.waste_category] = (groupedWaste[date][e.waste_category] || 0) + 0.5;
    });

    // Group Fleet
    const groupedFleet: Record<string, any> = {};
    routes.forEach(r => {
        const dist = r.total_distance || 0;
        const saved = Math.max(0, (60 - dist) * 0.21);
        const date = new Date(r.captured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!groupedFleet[date]) groupedFleet[date] = { date, distance: 0, emissionsSaved: 0 };
        groupedFleet[date].distance += dist;
        groupedFleet[date].emissionsSaved += saved;
    });

    return {
      waste: Object.values(groupedWaste),
      fleet: Object.values(groupedFleet),
      leaderboard: rawData?.leaderboard || []
    };
  }, [rawData]);

  const generateAIReport = async () => {
    try {
      setGenerating(true);
      setShowModal(true);
      await new Promise(r => setTimeout(r, 4000));
      setAiReport(`### Circular Economy Executive Report - ${filter.toUpperCase()}\n\n**Total Waste Management:** Handling **${kpis.totalWaste}kg** with **${kpis.recyclingRate}%** recovery. **${kpis.activeCitizens}** active participants. Carbon offset: **${kpis.co2Saved}kg**.`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <McdLayout>
      <div className="p-6 bg-[var(--bg-primary)] min-h-full text-[var(--text-primary)] flex flex-col gap-6 overflow-y-auto transition-colors duration-300">
        
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-2xl font-black font-manrope">Circular Economy Reports</h1>
            <p className="text-sm text-[var(--text-muted)]">Waste flows, vehicle emissions, and community metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 text-[var(--text-primary)]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={generateAIReport}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 font-bold px-4 py-1.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10"
            >
              <FileText size={16} /> Generate AI Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Waste Classified', value: `${kpis.totalWaste} kg`, icon: BarChart3, color: 'text-blue-400' },
            { label: 'Recycling Rate', value: `${kpis.recyclingRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'CO₂ Saved', value: `${kpis.co2Saved} kg`, icon: Leaf, color: 'text-teal-400' },
            { label: 'Active Citizens', value: kpis.activeCitizens, icon: Users, color: 'text-amber-400' },
          ].map(k => (
            <div key={k.label} className="bg-[var(--bg-secondary)]/40 border border-[var(--border)] p-4 rounded-xl flex flex-col gap-1 hover:border-[var(--border-strong)] transition-colors">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">{k.label}</span>
              <div className="flex items-center justify-between mt-1">
                {fetching ? <div className="h-8 w-16 shimmer rounded" /> : <h2 className="text-2xl font-black text-[var(--text-primary)]">{k.value}</h2>}
                <k.icon size={20} className={k.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3">
             <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wide">Waste breakdown trends</h3>
             <div className="h-56">
                {fetching ? <div className="w-full h-full shimmer rounded" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartsData.waste}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                        <Legend />
                        <Area type="monotone" dataKey="biodegradable" stackId="1" stroke="#10b981" fill="#059669" opacity={0.6} />
                        <Area type="monotone" dataKey="recyclable" stackId="1" stroke="#3b82f6" fill="#2563eb" opacity={0.6} />
                        <Area type="monotone" dataKey="hazardous" stackId="1" stroke="#ef4444" fill="#dc2626" opacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
             </div>
          </div>

          <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3">
             <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wide">Avg Ward Segregation Score</h3>
             <div className="h-56">
                {fetching ? <div className="w-full h-full shimmer rounded" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartsData.leaderboard}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={10} />
                        <YAxis type="category" dataKey="ward_name" stroke="var(--text-muted)" fontSize={10} width={80} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="avg_score" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
             </div>
          </div>

          <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3 md:col-span-2">
             <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wide">Autonomous Operations: Distance vs Offset Saved</h3>
             <div className="h-56">
                {fetching ? <div className="w-full h-full shimmer rounded" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartsData.fleet}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                        <Legend />
                        <Line type="monotone" dataKey="distance" stroke="#3b82f6" strokeWidth={2} name="Distance (km)" dot={false} />
                        <Line type="monotone" dataKey="emissionsSaved" stroke="#10b981" strokeWidth={2} name="CO2 Saved (kg)" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
             </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl w-full max-w-xl p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto shadow-2xl">
               <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                     <FileText size={18} className="text-emerald-400" /> Executive AI Report
                  </h2>
                   <div className="flex items-center gap-2">
                    <button onClick={() => window.print()} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-muted)]"><Download size={16} /></button>
                    <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-muted)]">✕</button>
                  </div>
               </div>
               {generating ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-[var(--text-muted)]">
                    <RefreshCw className="animate-spin text-emerald-400" size={24} />
                    <span>Crunching ledger indices with neural aggregates...</span>
                  </div>
               ) : (
                  <div className="prose prose-invert text-sm leading-relaxed text-[var(--text-secondary)]">
                     {aiReport.split('\n').map((line, i) => (
                        line.startsWith('###') ? <h3 key={i} className="text-white mt-4 font-black">{line.replace('###', '')}</h3> :
                        line.startsWith('**') ? <strong key={i} className="block mt-2 text-slate-200">{line}</strong> :
                        <p key={i} className="mt-1">{line}</p>
                     ))}
                  </div>
               )}
            </div>
          </div>
        )}
      </div>
    </McdLayout>
  );
}
