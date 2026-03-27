import { useState, useMemo } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { useAuthGuardedQuery } from '../../hooks/useAuthGuardedQuery';
import { BarChart3, TrendingUp, Users, Leaf, Download, RefreshCw, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, Legend, ComposedChart } from 'recharts';
import MlIntelligenceReport from '../../components/mcd/MlIntelligenceReport';

export default function Reports() {
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('month');
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auth-Guarded Data Fetching
  const { data: rawData, fetching } = useAuthGuardedQuery<{
    events: any[];
    routes: any[];
    leaderboard: any[];
    currentAqi: any[];
    historicalAqi: any[];
    wardInfo: any;
  }>(async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const oneYearAgoStart = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000).toISOString();
    const oneYearAgoEnd = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

    const [eventsRes, routesRes, boardsRes, currentAqiRes, historicalAqiRes, wardRes] = await Promise.all([
      supabase.from('waste_events').select('scanned_at, waste_category, user_id'),
      supabase.from('fleet_routes').select('captured_at, total_distance'),
      supabase.from('ward_leaderboard').select('*').limit(6),
      supabase.from('aqi_readings').select('aqi_value, recorded_at').gt('recorded_at', sevenDaysAgo),
      supabase.from('aqi_readings').select('aqi_value, recorded_at').gt('recorded_at', oneYearAgoStart).lt('recorded_at', oneYearAgoEnd),
      supabase.from('wards').select('id, ward_name, ward_number').limit(1).single()
    ]);

    return {
      data: {
        events: eventsRes.data || [],
        routes: routesRes.data || [],
        leaderboard: boardsRes.data || [],
        currentAqi: currentAqiRes.data || [],
        historicalAqi: historicalAqiRes.data || [],
        wardInfo: wardRes.data
      },
      error: eventsRes.error || routesRes.error || boardsRes.error || wardRes.error
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

    // Group YoY AQI (7-day rolling average style)
    const yoyData: Record<string, any> = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Use a fixed set of days for the chart
    days.forEach(day => {
      yoyData[day] = { day, current: 0, historical: 0, currentCount: 0, historicalCount: 0 };
    });

    (rawData?.currentAqi || []).forEach(r => {
      const day = days[new Date(r.recorded_at).getDay()];
      yoyData[day].current += r.aqi_value;
      yoyData[day].currentCount += 1;
    });

    (rawData?.historicalAqi || []).forEach(r => {
      const day = days[new Date(r.recorded_at).getDay()];
      yoyData[day].historical += r.aqi_value;
      yoyData[day].historicalCount += 1;
    });

    const comparison = Object.values(yoyData).map((d: any) => ({
      day: d.day,
      current: d.currentCount ? Math.round(d.current / d.currentCount) : 0,
      historical: d.historicalCount ? Math.round(d.historical / d.historicalCount) : 0,
    }));

    // Calculate improvement percentage
    const avgCurrent = comparison.reduce((acc, d) => acc + d.current, 0) / (comparison.filter(d => d.current > 0).length || 1);
    const avgHistorical = comparison.reduce((acc, d) => acc + d.historical, 0) / (comparison.filter(d => d.historical > 0).length || 1);
    const improvement = avgHistorical > 0 ? Math.round(((avgHistorical - avgCurrent) / avgHistorical) * 100) : 0;

    return {
      waste: Object.values(groupedWaste),
      fleet: Object.values(groupedFleet),
      leaderboard: rawData?.leaderboard || [],
      yoy: comparison,
      improvement
    };
  }, [rawData]);

  const [reportData, setReportData] = useState<any>(null);

  const generateAIReport = async () => {
    try {
      setGenerating(true);
      setShowModal(true);
      
      // Get a ward_id (for now we use the first one we find or a default)
      const { data: wards } = await supabase.from('wards').select('id').limit(1);
      const wardId = wards?.[0]?.id;
      
      if (!wardId) throw new Error("No wards found to generate report.");

      const { data, error } = await supabase.functions.invoke('generate-ward-report', {
        body: { ward_id: wardId }
      });

      if (error) throw error;
      setReportData(data);
    } catch (err: any) {
      alert("Error generating report: " + err.message);
      setShowModal(false);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Simple SVG Sparkline
    const generateSparkline = (data: any[]) => {
      if (!data.length) return '';
      const min = Math.min(...data.map(d => d.aqi_value));
      const max = Math.max(...data.map(d => d.aqi_value));
      const range = max - min || 1;
      const width = 200;
      const height = 40;
      const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.aqi_value - min) / range) * height;
        return `${x},${y}`;
      }).join(' ');

      return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <polyline points="${points}" fill="none" stroke="#10b981" stroke-width="2" />
        </svg>
      `;
    };

    const reportHTML = `
      <html>
        <head>
          <title>EcoNode Weekly Ward Report - ${reportData.wardName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
            .header { border-bottom: 4px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #059669; }
            .header .ward-seal { width: 60px; height: 60px; background: #f1f5f9; border-radius: 50%; display: flex; items-center; justify-content: center; font-size: 10px; font-weight: bold; color: #94a3b8; border: 2px dashed #cbd5e1; text-align: center; line-height: 1; }
            .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
            .summary-box h3 { margin-top: 0; color: #059669; font-size: 14px; text-transform: uppercase; }
            .summary-box p { font-style: italic; line-height: 1.6; font-size: 15px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
            .card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
            .card h4 { margin: 0 0 10px 0; font-size: 12px; color: #64748b; text-transform: uppercase; }
            .card .value { font-size: 24px; font-weight: 800; }
            .sparkline-container { margin-top: 10px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>EcoNode: Weekly Ward Report</h1>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Ward: <strong>${reportData.wardName}</strong> | Period: ${reportData.period}</p>
            </div>
            <div class="ward-seal">WARD<br/>SEAL</div>
          </div>

          <div class="summary-box">
            <h3>Executive AI Summary</h3>
            <p>${reportData.summary}</p>
          </div>

          <div class="grid">
            <div class="card">
              <h4>AQI Performance</h4>
              <div class="value">${reportData.metrics.aqi.avg} <span style="font-size: 12px; font-weight: normal;">Avg</span></div>
              <div style="font-size: 12px; color: #64748b;">Peak: ${reportData.metrics.aqi.peak} | Low: ${reportData.metrics.aqi.lowest}</div>
              <div class="sparkline-container">${generateSparkline(reportData.metrics.aqi.trend)}</div>
            </div>
            <div class="card">
              <h4>Pollution & Health</h4>
              <div class="value">${reportData.metrics.pollution.topSource}</div>
              <div style="font-size: 12px; color: #64748b;">Top Source This Week</div>
              <div style="margin-top:10px; font-size: 14px; font-weight: bold; color: #ef4444;">Est. Health Cost: ₹${(reportData.metrics.impact.healthCostEstimate / 1000).toFixed(1)}k</div>
            </div>
            <div class="card">
              <h4>Waste & Recovery</h4>
              <div class="value">${reportData.metrics.waste.recyclableRate}%</div>
              <div style="font-size: 12px; color: #64748b;">Recyclable Material Rate</div>
              <div style="margin-top:50px; font-size: 12px;">Total Scans: ${reportData.metrics.waste.total}</div>
            </div>
            <div class="card">
              <h4>Citizen Engagement</h4>
              <div class="value">${reportData.metrics.engagement.avgEcoScore}</div>
              <div style="font-size: 12px; color: #64748b;">Avg Citizen Eco Score</div>
              <div style="margin-top:10px; font-size: 12px;">Active Contributors: ${reportData.metrics.engagement.activeCitizens}</div>
            </div>
          </div>

          <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center;">
            Generated by EcoNode Urban Neural Metabolism | This is a computer-generated document.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
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
              <FileText size={16} /> Generate This Week's Report
            </button>
          </div>
        </div>

        {/* Year-over-Year AQI Comparison */}
        <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-[var(--text-muted)] tracking-wider">Econode Impact: Year-over-Year AQI Comparison</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Comparison of 7-day rolling averages vs same period last year</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] font-bold text-emerald-500 uppercase block">AQI Improvement</span>
              <span className="text-2xl font-black text-emerald-400">-{chartsData.improvement}%</span>
            </div>
          </div>

          <div className="h-72">
            {fetching ? <div className="w-full h-full shimmer rounded" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartsData.yoy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-xl shadow-xl">
                            <p className="text-xs font-bold text-[var(--text-primary)] mb-2">{payload[0].payload.day}</p>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] text-[var(--text-muted)]">Current Year</span>
                                <span className="text-sm font-bold text-emerald-400">{payload[0].value}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] text-[var(--text-muted)]">Last Year</span>
                                <span className="text-sm font-bold text-slate-400">{payload[1].value}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border)] leading-tight italic">
                              Historical data shown for comparative analysis. Improvement attributed to early warning + proactive collection dispatch.
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" align="right" height={36}/>
                  
                  {/* Shaded Area for Impact Zone */}
                  <Area 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="none" 
                    fill="#10b981" 
                    fillOpacity={0.05} 
                    name="Econode Impact Zone"
                  />

                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="Last Year (Baseline)" 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    name="Today (Econode)" 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ML Intelligence Report Section */}
        <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black font-manrope text-[var(--text-primary)]">ML Intelligence Report</h2>
            <p className="text-xs text-[var(--text-muted)] italic">Advanced statistical forecasting and Claude-driven environmental analytics</p>
          </div>
          
          {rawData?.wardInfo && (
            <MlIntelligenceReport 
              wardId={rawData.wardInfo.id}
              wardName={rawData.wardInfo.ward_name}
              wardNumber={rawData.wardInfo.ward_number}
            />
          )}
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
                    <button onClick={handlePrint} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-muted)]"><Download size={16} /></button>
                    <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-muted)]">✕</button>
                  </div>
               </div>
               {generating ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-[var(--text-muted)]">
                    <RefreshCw className="animate-spin text-emerald-400" size={24} />
                    <span>Crunching ledger indices with neural aggregates...</span>
                  </div>
               ) : reportData ? (
                  <div className="flex flex-col gap-6">
                    <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl border border-[var(--border)]">
                      <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] mb-2">Executive Summary</h3>
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)] italic">"{reportData.summary}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--bg-tertiary)]/50 p-3 rounded-xl border border-[var(--border)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Weekly Avg AQI</span>
                        <p className="text-xl font-black text-emerald-400">{reportData.metrics.aqi.avg}</p>
                      </div>
                      <div className="bg-[var(--bg-tertiary)]/50 p-3 rounded-xl border border-[var(--border)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Peak Exposure</span>
                        <p className="text-xl font-black text-amber-400">{reportData.metrics.aqi.peak}</p>
                      </div>
                      <div className="bg-[var(--bg-tertiary)]/50 p-3 rounded-xl border border-[var(--border)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Recycling Rate</span>
                        <p className="text-xl font-black text-blue-400">{reportData.metrics.waste.recyclableRate}%</p>
                      </div>
                      <div className="bg-[var(--bg-tertiary)]/50 p-3 rounded-xl border border-[var(--border)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Policy Approvals</span>
                        <p className="text-xl font-black text-purple-400">{reportData.metrics.policies.approved}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                       <button 
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 font-bold py-3 rounded-xl text-white transition-all shadow-lg shadow-emerald-500/20"
                       >
                         <Download size={18} /> Download Printable PDF
                       </button>
                    </div>
                  </div>
               ) : (
                  <div className="text-center py-10 text-[var(--text-muted)]">Failed to load report data.</div>
               )}
            </div>
          </div>
        )}
      </div>
    </McdLayout>
  );
}
