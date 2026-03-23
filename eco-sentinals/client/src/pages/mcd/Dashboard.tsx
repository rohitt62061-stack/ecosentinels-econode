import { useEffect, useState } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  AlertTriangle, ArrowDown, ArrowUp, BarChart2, Download, RefreshCw, ArrowRight 
} from 'lucide-react';

interface Ward {
  id: string;
  ward_name: string;
}

interface Reading {
  recorded_at: string;
  aqi_value: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co?: number;
}

interface Alert {
  id: string;
  ward_id: string;
  source_type: string;
  detected_at: string;
  wards: { ward_name: string };
}

const AQI_COLORS = {
  good: '#00e400',
  moderate: '#ffff00',
  unhealthy_sens: '#ff7e00',
  unhealthy: '#ff0000',
  very_unhealthy: '#8f3f97',
  hazardous: '#7e0023'
};

export default function Dashboard() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '3m'>('24h');
  const [pollutant, setPollutant] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'so2'>('aqi');
  
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [avgAqi, setAvgAqi] = useState<number>(0);
  const [peakAqi, setPeakAqi] = useState<{ value: number; time: string } | null>(null);
  const [lowestAqi, setLowestAqi] = useState<number>(0);
  const [percentUnhealthy, setPercentUnhealthy] = useState<number>(0);
  
  // Forecast states
  const [forecasts, setForecasts] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (wards.length > 0) {
      wards.forEach(w => fetchWardForecast(w.id));
    }
  }, [wards]);

  const fetchWardForecast = async (wardId: string) => {
    try {
      const { data } = await supabase.functions.invoke('forecast-aqi', {
        body: { ward_id: wardId }
      });
      if (data?.predictions) {
        setForecasts(prev => ({ ...prev, [wardId]: data.predictions }));
      }
    } catch (err) {
      console.error(`Forecast error for ${wardId}:`, err);
    }
  };

  useEffect(() => {
    fetchWards();
    fetchAlerts();
    
    // Realtime alerts subscription
    const alertsChannel = supabase
      .channel('public:pollution_detections_dashboard')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'pollution_detections', filter: 'policy_triggered=eq.true' },
        (payload: any) => {
          // Fetch complete row with Ward name
          supabase.from('pollution_detections')
            .select('*, wards(ward_name)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) setAlerts(prev => [data as unknown as Alert, ...prev.slice(0, 4)]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  useEffect(() => {
    if (selectedWard || wards.length > 0) {
      if (!selectedWard && wards.length > 0) {
        setSelectedWard(wards[0].id);
        return;
      }
      fetchData();
    }
  }, [selectedWard, timeRange, pollutant, wards]);

  const fetchWards = async () => {
    const { data } = await supabase.from('wards').select('id, ward_name').order('ward_name');
    if (data) setWards(data);
  };

  const fetchAlerts = async () => {
    // Last 6 hours = 6 * 60 * 60 * 1000 ms
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('pollution_detections')
      .select('*, wards(ward_name)')
      .eq('policy_triggered', true)
      .gt('detected_at', sixHoursAgo)
      .order('detected_at', { ascending: false });
    if (data) setAlerts(data as unknown as Alert[]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const targetWard = selectedWard || wards[0]?.id;
      if (!targetWard) return;

      let intervalString = '24 hours';
      if (timeRange === '7d') intervalString = '7 days';
      if (timeRange === '30d') intervalString = '30 days';
      if (timeRange === '3m') intervalString = '3 months';

      const pastDate = new Date();
      if (timeRange === '24h') pastDate.setHours(pastDate.getHours() - 24);
      else if (timeRange === '7d') pastDate.setDate(pastDate.getDate() - 7);
      else if (timeRange === '30d') pastDate.setDate(pastDate.getDate() - 30);
      else if (timeRange === '3m') pastDate.setMonth(pastDate.getMonth() - 3);

      const { data, error } = await supabase
        .from('aqi_readings')
        .select('recorded_at, aqi_value, pm25, pm10, no2, so2')
        .eq('ward_id', targetWard)
        .gt('recorded_at', pastDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setReadings(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Reading[]) => {
    if (data.length === 0) {
      setAvgAqi(0);
      setPeakAqi(null);
      setLowestAqi(0);
      setPercentUnhealthy(0);
      return;
    }

    const key = pollutant === 'aqi' ? 'aqi_value' : pollutant;
    const values = data.map(r => r[key as keyof Reading] as number).filter(v => v !== null && v !== undefined);
    
    if (values.length === 0) {
      setAvgAqi(0);
      setPeakAqi(null);
      setLowestAqi(0);
      setPercentUnhealthy(0);
      return;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    setAvgAqi(Math.round(avg));

    let maxVal = -1;
    let maxTime = '';
    let minVal = 999999;

    data.forEach(r => {
      const v = r[key as keyof Reading] as number;
      if (v !== null && v !== undefined) {
        if (v > maxVal) {
          maxVal = v;
          maxTime = r.recorded_at;
        }
        if (v < minVal) {
          minVal = v;
        }
      }
    });

    setPeakAqi({ value: maxVal, time: maxTime });
    setLowestAqi(minVal);

    // Calculate percent unhealthy (AQI > 150 is Unhealthy or worse generally for this calculation setup threshold)
    const unhealthyCount = data.filter(r => r.aqi_value > 150).length;
    setPercentUnhealthy(Math.round((unhealthyCount / data.length) * 100));
  };

  const getBarChartData = () => {
    const bands = { Good: 0, Moderate: 0, Sensitive: 0, Unhealthy: 0, Severe: 0, Hazardous: 0 };
    readings.forEach(r => {
      if (r.aqi_value <= 50) bands.Good++;
      else if (r.aqi_value <= 100) bands.Moderate++;
      else if (r.aqi_value <= 150) bands.Sensitive++;
      else if (r.aqi_value <= 200) bands.Unhealthy++;
      else if (r.aqi_value <= 300) bands.Severe++;
      else bands.Hazardous++;
    });

    return [
      { name: 'Good', Count: bands.Good, fill: AQI_COLORS.good },
      { name: 'Mod', Count: bands.Moderate, fill: AQI_COLORS.moderate },
      { name: 'Sens', Count: bands.Sensitive, fill: AQI_COLORS.unhealthy_sens },
      { name: 'Unhealthy', Count: bands.Unhealthy, fill: AQI_COLORS.unhealthy },
      { name: 'Severe', Count: bands.Severe, fill: AQI_COLORS.very_unhealthy },
      { name: 'Hazard', Count: bands.Hazardous, fill: AQI_COLORS.hazardous }
    ];
  };

  const downloadCSV = () => {
    if (readings.length === 0) return;
    const headers = ['Timestamp', 'AQI', 'PM25', 'PM10', 'NO2', 'SO2'];
    const rows = readings.map(r => [
      new Date(r.recorded_at).toLocaleString(),
      r.aqi_value,
      r.pm25,
      r.pm10,
      r.no2,
      r.so2
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dashboard_data_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPollutantLabel = () => {
    const map = { aqi: 'AQI', pm25: 'PM2.5', pm10: 'PM10', no2: 'NO2', so2: 'SO2' };
    return map[pollutant];
  };

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (timeRange === '24h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <McdLayout>
      <div className="p-6 bg-slate-950 min-h-full text-slate-100 flex flex-col gap-6 overflow-y-auto">
        
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-black font-manrope tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-slate-400">Hyper-local air quality intelligence overviews</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Ward Selector */}
            <select 
              value={selectedWard} 
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 outline-none focus:border-emerald-500"
            >
              {wards.map(w => <option key={w.id} value={w.id}>{w.ward_name}</option>)}
            </select>

            {/* Time Range */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {(['24h', '7d', '30d', '3m'] as const).map(r => (
                <button 
                  key={r} 
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timeRange === r ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Pollutant Toggle */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {(['aqi', 'pm25', 'pm10', 'no2', 'so2'] as const).map(p => (
                <button 
                  key={p} 
                  onClick={() => setPollutant(p)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${pollutant === p ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Export */}
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm border border-slate-700"
            >
              <Download size={16} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Active Alerts Bar */}
        {alerts.slice(0, 5).length > 0 && (
          <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl px-4 py-2 flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs shrink-0">
              <AlertTriangle size={14} className="animate-pulse" /> ACTIVE ALERTS:
            </div>
            <div className="flex items-center gap-3 text-sm flex-1">
              {alerts.map(a => (
                <div key={a.id} className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
                  <span className="font-semibold text-xs text-white">{a.wards?.ward_name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] uppercase font-bold border border-rose-500/20">{a.source_type.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-500">{new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">Policy <ArrowRight size={10} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Grid Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Main Analytics: Charts and Stats */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl flex flex-col">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg {getPollutantLabel()}</span>
                <span className="text-3xl font-black mt-1 text-emerald-400">{avgAqi}</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl flex flex-col">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Peak {getPollutantLabel()}</span>
                {peakAqi ? (
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-rose-500">{peakAqi.value}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">@{new Date(peakAqi.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ) : <span className="text-3xl font-black mt-1">-</span>}
              </div>
              <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl flex flex-col">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Lowest {getPollutantLabel()}</span>
                <span className="text-3xl font-black mt-1 text-blue-400">{lowestAqi}</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl flex flex-col">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">% time Unhealthy</span>
                <span className="text-3xl font-black mt-1 text-amber-500">{percentUnhealthy}%</span>
              </div>
            </div>

            {/* LineChart Card */}
            <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-xl flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-slate-300 mb-4">{getPollutantLabel()} Trends</h3>
              <div className="flex-1 h-[300px]">
                {readings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="recorded_at" stroke="#64748b" tickFormatter={formatXAxis} style={{ fontSize: '10px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                        labelStyle={{ color: '#94a3b8' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                      />
                      <Line type="monotone" dataKey={pollutant === 'aqi' ? 'aqi_value' : pollutant} stroke={pollutant === 'aqi' ? '#10b981' : '#f59e0b'} strokeWidth={3} dot={false} />
                      {pollutant === 'aqi' && (
                        <>
                          <ReferenceLine y={50} stroke={AQI_COLORS.good} strokeDasharray="3 3" label={{ position: 'right', value: 'Good', fill: AQI_COLORS.good, fontSize: 10 }} />
                          <ReferenceLine y={100} stroke={AQI_COLORS.moderate} strokeDasharray="3 3" label={{ position: 'right', value: 'Mod', fill: AQI_COLORS.moderate, fontSize: 10 }} />
                          <ReferenceLine y={150} stroke={AQI_COLORS.unhealthy_sens} strokeDasharray="3 3" label={{ position: 'right', value: 'Poor', fill: AQI_COLORS.unhealthy_sens, fontSize: 10 }} />
                          <ReferenceLine y={200} stroke={AQI_COLORS.unhealthy} strokeDasharray="3 3" label={{ position: 'right', value: 'Unhealthy', fill: AQI_COLORS.unhealthy, fontSize: 10 }} />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <RefreshCw size={20} className="animate-spin mr-2" />
                    No data in range
                  </div>
                )}
              </div>
            </div>

            {/* BarChart Card (Category bands) */}
            <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-xl">
              <h3 className="text-sm font-bold text-slate-300 mb-4">AQI Category Distribution Counts</h3>
              <div className="h-[200px]">
                {readings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBarChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                      <Bar dataKey="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-slate-500 text-center py-10">No readings to show</p>}
              </div>
            </div>

            {/* Forecast Sparkline Grid */}
            <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-xl">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <span>24h AI Forecast Trends</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">All Wards</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {wards.map(w => {
                  const forecastData = forecasts[w.id] || [];
                  const maxAqi = forecastData.length > 0 ? Math.max(...forecastData.map(d => d.aqi)) : 0;
                  const strokeColor = maxAqi > 150 ? '#f43f5e' : maxAqi > 100 ? '#f59e0b' : '#10b981';
                  return (
                    <div key={w.id} className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl flex flex-col hover:bg-slate-900/50 transition-colors cursor-pointer" onClick={() => setSelectedWard(w.id)}>
                      <span className="text-xs font-semibold text-slate-300 truncate">{w.ward_name}</span>
                      <div className="h-14 mt-2">
                        {forecastData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastData}>
                              <Line type="monotone" dataKey="aqi" stroke={strokeColor} strokeWidth={1.5} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-slate-600 animate-pulse">Loading...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Panel: Alerts & Detections */}
          <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={16} />
              <span>Realtime Policy Detections</span>
            </h3>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map(a => (
                  <div key={a.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{a.wards?.ward_name || 'Unknown Ward'}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
                        {a.source_type}
                      </span>
                    </div>
                    <button className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold self-end mt-1">
                      View Policy →
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 text-center text-xs italic">
                  No active policy alerts in last 6h
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </McdLayout>
  );
}
