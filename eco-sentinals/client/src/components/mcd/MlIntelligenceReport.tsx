import { useState, useMemo } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, Legend 
} from 'recharts';
import { 
  FileText, Download, Copy, RefreshCw, 
  TrendingUp, Activity, PieChart as PieIcon, Calendar,
  CheckCircle2, AlertCircle
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

interface MlReportProps {
  wardId: string;
  wardName: string;
  wardNumber: string;
}

export default function MlIntelligenceReport({ wardId, wardName, wardNumber }: MlReportProps) {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch ML data from RPCs
      const [trendRes, anomaliesRes, sourcesRes, timelineRes] = await Promise.all([
        supabase.rpc('analyze_ward_trend', { p_ward_id: wardId, p_days: days }),
        supabase.rpc('detect_aqi_anomalies', { p_ward_id: wardId }),
        supabase.rpc('source_attribution_summary', { p_ward_id: wardId }),
        supabase.from('aqi_readings').select('aqi_value, recorded_at').eq('ward_id', wardId).gt('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()).order('recorded_at', { ascending: true })
      ]);

      if (trendRes.error) throw trendRes.error;
      const trend = trendRes.data?.[0];
      const anomalies = anomaliesRes.data || [];
      const sources = sourcesRes.data || [];
      const timeline = timelineRes.data || [];

      // 2. Call the Edge Function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-ml-report-v3', {
        body: { 
          ward_id: wardId, 
          ward_name: wardName, 
          ward_number: wardNumber,
          days 
        }
      });

      if (aiError) throw aiError;

      setReport({
        text: aiData.reportText,
        trend,
        anomalies,
        sources,
        timeline
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate AI report.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report?.text) return;
    navigator.clipboard.writeText(report.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.print();
  };

  // Prepare Heatmap Data (24h x 7 days)
  const heatmapData = useMemo(() => {
    if (!report?.timeline) return [];
    const grid = Array(24).fill(0).map(() => Array(7).fill({ count: 0, sum: 0 }));
    
    report.timeline.forEach((r: any) => {
      const date = new Date(r.recorded_at);
      const hour = date.getHours();
      const day = date.getDay();
      grid[hour][day] = { 
        count: grid[hour][day].count + 1, 
        sum: grid[hour][day].sum + r.aqi_value 
      };
    });

    return grid.map((row, h) => row.map((cell, d) => ({
      hour: h,
      day: d,
      avg: cell.count > 0 ? Math.round(cell.sum / cell.count) : 0
    }))).flat();
  }, [report]);

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col gap-8 print:p-0">
      
      {/* Controls */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between no-print shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Time range</span>
            <div className="flex bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border)]">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${days === d ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                  Last {d} Days
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
          Generate ML Report
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-sm animate-shake">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && !report && (
        <div className="py-20 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="relative">
             <RefreshCw className="animate-spin text-orange-500" size={48} />
             <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-bold font-fraunces text-[var(--primary)] text-orange-500">Processing Environmental Intelligence</h3>
            <p className="text-sm text-[var(--text-muted)] italic">Aggregating ward trends, analyzing source attribution, and consultinc Claude...</p>
          </div>
        </div>
      )}

      {report && (
        <div className="flex flex-col gap-10 animate-fadeIn">
          
          {/* Visual Supplements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Timeline with Anomalies */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-2">
                    <Activity size={16} className="text-orange-500" /> AQI Timeline & Spikes
                  </h3>
               </div>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="recorded_at" hide />
                      <YAxis stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="aqi_value" 
                        stroke="var(--primary)" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                      {/* Anomaly markers */}
                      {report.anomalies.map((a: any, idx: number) => (
                        <Line
                          key={idx}
                          type="monotone"
                          data={[{ recorded_at: a.res_anomaly_time, aqi_value: a.res_aqi_value }]}
                          dataKey="aqi_value"
                          stroke="transparent"
                          dot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Source Attribution */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
               <h3 className="text-sm font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-2">
                  <PieIcon size={16} className="text-blue-500" /> Source Attribution
               </h3>
               <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.sources}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="occurrence_count"
                        nameKey="source_type"
                      >
                        {report.sources.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Pattern Heatmap */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 flex flex-col gap-4 shadow-sm lg:col-span-2 overflow-x-auto">
               <h3 className="text-sm font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-500" /> Hourly AQI Pattern Heatmap
               </h3>
               <div className="flex flex-col gap-2 min-w-[600px]">
                  <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1">
                    <div />
                    {Array.from({ length: 24 }).map((_, i) => (
                      <span key={i} className="text-[9px] font-bold text-[var(--text-muted)] text-center">{i}h</span>
                    ))}
                    {daysLabels.map((day, d) => (
                      <div key={day} className="contents">
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] self-center">{day}</span>
                        {Array.from({ length: 24 }).map((_, h) => {
                          const val = heatmapData.find(m => m.day === d && m.hour === h)?.avg || 0;
                          return (
                            <div 
                              key={h}
                              title={`${day} ${h}:00 - Avg AQI: ${val}`}
                              className="h-6 rounded-sm transition-all hover:scale-110 cursor-help"
                              style={{ 
                                backgroundColor: val === 0 ? 'var(--bg-primary)' : 
                                                val < 60 ? '#10b981' :
                                                val < 120 ? '#f59e0b' :
                                                val < 180 ? '#f97316' : '#ef4444',
                                opacity: val === 0 ? 0.3 : 1
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Text Report */}
          <div className="bg-white text-slate-900 border border-slate-200 rounded-[2rem] p-12 shadow-2xl relative overflow-hidden transition-all duration-500 print:shadow-none print:border-none print:p-0 min-h-[1000px]">
            
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-emerald-500 to-blue-500 no-print" />
            
            {/* Download/Copy Floating Header */}
            <div className="flex justify-between items-center mb-12 border-b-2 border-slate-100 pb-8 no-print">
              <div className="flex flex-col">
                 <h2 className="text-2xl font-black font-fraunces text-slate-800">Intelligence Briefing</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {wardId.slice(0, 8)} | Ward: {wardName} | Period: Last {days} Days</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-200 transition-all flex items-center gap-2 text-xs font-bold"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-lg shadow-slate-900/10"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>

            {/* The Actual Content (Markdown Styled) */}
            <div className="prose prose-slate max-w-none flex flex-col gap-10 whitespace-pre-wrap">
              {report.text.split(/(?=\d\.\s[A-Z\s]+)/).map((section: string, i: number) => {
                const titleMatch = section.match(/\d\.\s([A-Z\s]+)/);
                const title = titleMatch ? titleMatch[1] : `Section ${i + 1}`;
                const content = section.replace(/\d\.\s[A-Z\s]+/, '').trim();
                
                return (
                  <div key={i} className="flex flex-col gap-4 relative pl-8 border-l-2 border-slate-100 py-2 group">
                    <div className="absolute left-[-5px] top-6 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-orange-500 transition-colors" />
                    <h3 className="text-lg font-black font-fraunces text-slate-800 tracking-tight m-0 uppercase flex items-center gap-3">
                      <span className="text-orange-500/20 text-3xl font-black absolute left-[-40px] top-[-10px] select-none">0{i+1}</span>
                      {title}
                    </h3>
                    <div className="text-slate-600 leading-relaxed font-medium text-sm lg:text-base">
                      {content.split('\n').map((line, li) => (
                        <p key={li} className={line.startsWith('-') ? 'ml-4 flex gap-2' : ''}>
                          {line.startsWith('-') && <span className="text-orange-500">•</span>}
                          {line.startsWith('-') ? line.substring(1).trim() : line}
                        </p>
                      ))}
                    </div>
                    
                    {/* Highlight metrics in content */}
                    {i === 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                         <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <TrendingUp size={10} /> {report.trend.res_trend_direction}
                         </span>
                         <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-200">
                            Avg AQI: {report.trend.res_avg_aqi.toFixed(1)}
                         </span>
                         <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-200">
                            Improvement: {report.trend.res_improvement_pct.toFixed(1)}%
                         </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Official Seal/Footer */}
            <div className="mt-20 pt-10 border-t-2 border-slate-50 flex justify-between items-end italic text-slate-300">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Authenticated By</span>
                  <span className="text-xl font-fraunces font-black bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">EcoNode Neural Engine</span>
               </div>
               <div className="text-[8px] max-w-[200px] text-right">
                  This report is generated using autonomous environmental intelligence and validated against civic metadata. Disseminate only for administrative purposes.
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
