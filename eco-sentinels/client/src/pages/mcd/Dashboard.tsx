import { useEffect, useState, useMemo } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import WardRankingsTable from '../../components/WardRankingsTable';
import AQIGauge from '../../components/AQIGauge';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  AlertTriangle, Download, Zap, Target
} from 'lucide-react';
import CitizenReportsPanel from '../../components/mcd/CitizenReportsPanel';
import { SkeletonCard, SkeletonTable } from '../../components/Skeleton';
import { ErrorState, EmptyState } from '../../components/StateFeedback';

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

const formatXAxis = (tickItem: string, timeRange: string) => {
  const date = new Date(tickItem);
  if (timeRange === '24h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function Dashboard() {
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '3m'>('24h');
  const [pollutant, setPollutant] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'so2'>('aqi');
  
  // 1. Fetch Wards
  const { data: wardsData } = useSupabaseQuery<Ward[]>(
    async () => {
      const { data, error } = await supabase.from('wards').select('id, ward_name').order('ward_name');
      return { data: data as Ward[], error };
    },
    []
  );

  // 2. Fetch Alerts (Last 6 hours)
  const sixHoursAgo = useMemo(() => new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), []);
  const { data: alertsData, loading: loadingAlerts, error: errorAlerts, refetch: refetchAlerts } = useSupabaseQuery<Alert[]>(
    async () => {
      const { data, error } = await supabase
        .from('pollution_detections')
        .select('*, wards(ward_name)')
        .eq('policy_triggered', true)
        .gt('detected_at', sixHoursAgo)
        .order('detected_at', { ascending: false });
      return { data: data as unknown as Alert[], error };
    },
    [sixHoursAgo]
  );

  const wards = useMemo(() => wardsData || [], [wardsData]);
  const alerts = useMemo(() => alertsData || [], [alertsData]);

  // 3. Fetch Readings (Chart Data)
  useEffect(() => {
    if (wards.length > 0 && !selectedWard) {
      setSelectedWard(wards[0].id);
    }
  }, [wards, selectedWard]);

  const pastDate = useMemo(() => {
    const d = new Date();
    if (timeRange === '24h') d.setHours(d.getHours() - 24);
    else if (timeRange === '7d') d.setDate(d.getDate() - 7);
    else if (timeRange === '30d') d.setDate(d.getDate() - 30);
    else if (timeRange === '3m') d.setMonth(d.getMonth() - 3);
    return d.toISOString();
  }, [timeRange]);

  const { data: readingsData, loading: loadingReadings } = useSupabaseQuery<Reading[]>(
    async () => {
      const targetWard = selectedWard || (wards.length > 0 ? wards[0].id : null);
      if (!targetWard) return Promise.resolve({ data: [], error: null });
      
      const { data, error } = await supabase
        .from('aqi_readings')
        .select('recorded_at, aqi_value, pm25, pm10, no2, so2')
        .eq('ward_id', targetWard)
        .gt('recorded_at', pastDate)
        .order('recorded_at', { ascending: true });
      return { data: data as Reading[], error };
    },
    [selectedWard, pastDate, wards.length]
  );

  const readings = useMemo(() => readingsData || [], [readingsData]);

  const stats = useMemo(() => {
    if (readings.length === 0) return { avg: 0, peak: null, lowest: 0 };
    const key = pollutant === 'aqi' ? 'aqi_value' : pollutant;
    const values = readings.map(r => r[key as keyof Reading] as number).filter(v => v !== null);
    if (values.length === 0) return { avg: 0, peak: null, lowest: 0 };
    return { 
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      peak: Math.max(...values),
      lowest: Math.min(...values)
    };
  }, [readings, pollutant]);

  const downloadCSV = () => {
    if (readings.length === 0) return;
    const headers = ['Timestamp', 'AQI', 'PM25', 'PM10', 'NO2', 'SO2'];
    const rows = readings.map(r => [
      new Date(r.recorded_at).toLocaleString(),
      r.aqi_value, r.pm25, r.pm10, r.no2, r.so2
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mcd_data_${selectedWard}_${timeRange}.csv`;
    link.click();
  };

  return (
    <McdLayout>
      <div className="flex flex-col h-full bg-[var(--surface)] text-[var(--text-primary)] transition-colors duration-500 overflow-y-auto pb-20">
        
        {/* Editorial Header */}
        <div className="p-8 border-b border-[var(--surface-container-highest)] border-opacity-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2 block">
                Executive Oversight Dashboard
              </span>
              <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Air Quality Ledger
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <select 
                value={selectedWard} 
                onChange={(e) => setSelectedWard(e.target.value)}
                className="bg-[var(--surface-container-low)] text-[var(--text-primary)] px-4 py-2 rounded-[var(--radius-md)] text-xs font-mono border-none outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all"
              >
                {wards.map(w => <option key={w.id} value={w.id}>{w.ward_name}</option>)}
              </select>

              <div className="flex bg-[var(--surface-container-low)] rounded-[var(--radius-md)] p-1">
                {(['24h', '7d', '30d'] as const).map(r => (
                  <button 
                    key={r} 
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 text-[10px] font-mono rounded-[var(--radius-sm)] transition-all ${timeRange === r ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>

              <button 
                onClick={downloadCSV}
                className="p-2 rounded-[var(--radius-md)] bg-[var(--surface-container-low)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Hero Section: AQI Gauge & Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-[var(--surface-container-low)] rounded-[var(--radius-lg)] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target size={64} />
              </div>
              {loadingReadings ? (
                <div className="animate-pulse space-y-4 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full bg-[var(--surface-container)]" />
                  <div className="h-4 w-24 bg-[var(--surface-container)] rounded" />
                </div>
              ) : (
                <>
                  <ErrorBoundary fallback={<div className="h-48 flex items-center justify-center text-[10px] text-[var(--text-muted)] italic">Gauge failed</div>}>
                    <AQIGauge value={stats.avg} label="Live Average" size="lg" />
                  </ErrorBoundary>
                  <div className="mt-8 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      Status Assessment
                    </p>
                    <p className="text-sm font-bold mt-1 text-[var(--primary)]">
                      {stats.avg <= 50 ? 'Optimal Atmospheric Conditions' : stats.avg <= 100 ? 'Moderate Particle Density' : 'Elevated Risk Level'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 px-2">
                Ward Performance Metrics
              </h3>
              <WardRankingsTable rankings={[
                { ward_name: 'Civil Lines', aqi: 42, trend: 'down', compliance: 98 },
                { ward_name: 'Model Town', aqi: 56, trend: 'stable', compliance: 92 },
                { ward_name: 'Chandni Chowk', aqi: 128, trend: 'up', compliance: 74 },
                { ward_name: 'Rohini', aqi: 38, trend: 'down', compliance: 99 },
                { ward_name: 'Dwarka', aqi: 45, trend: 'stable', compliance: 95 }
              ]} />
            </div>
          </div>

          {/* Analytical Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 bg-[var(--surface-container-low)] rounded-[var(--radius-lg)] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Temporal Distribution</h3>
                <div className="flex bg-[var(--surface-container)] rounded-[var(--radius-sm)] p-0.5">
                  {(['aqi', 'pm25', 'pm10'] as const).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setPollutant(p)}
                      className={`px-3 py-1 text-[9px] font-mono rounded-[var(--radius-sm)] transition-all ${pollutant === p ? 'bg-[var(--surface)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[300px] w-full">
                {loadingReadings ? (
                  <div className="w-full h-full p-4">
                    <SkeletonTable rows={4} />
                  </div>
                ) : readings.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <EmptyState message="No reading data available for selected parameters" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-highest)" vertical={false} opacity={0.1} />
                      <XAxis 
                        dataKey="recorded_at" 
                        stroke="var(--text-muted)" 
                        tickFormatter={(t) => formatXAxis(t, timeRange)} 
                        style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="var(--text-muted)" 
                        style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--surface-container-high)', 
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-ambient)'
                        }}
                        labelStyle={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={pollutant === 'aqi' ? 'aqi_value' : pollutant} 
                        stroke="var(--primary)" 
                        strokeWidth={2} 
                        dot={false}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="flex flex-col gap-8">
              {/* Citizen Reports Live Feed */}
              <div className="bg-[var(--surface-container-low)] rounded-[var(--radius-lg)] p-8 h-[500px] flex flex-col">
                <CitizenReportsPanel />
              </div>

              {/* Realtime Alerts Panel */}
              <div className="bg-[var(--surface-container-low)] rounded-[var(--radius-lg)] p-8 flex flex-col h-[400px]">
                <div className="flex items-center gap-2 mb-8">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Live Indices / Anomalies</h3>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  {loadingAlerts ? (
                    <div className="space-y-3">
                      <SkeletonCard lines={2} />
                      <SkeletonCard lines={2} />
                      <SkeletonCard lines={2} />
                    </div>
                  ) : errorAlerts ? (
                    <ErrorState message="Protocol Link Failure" onRetry={refetchAlerts} />
                  ) : alerts.length > 0 ? (
                    alerts.map(a => (
                      <div key={a.id} className="p-4 bg-[var(--surface)] rounded-[var(--radius-md)] relative overflow-hidden group hover:shadow-[var(--shadow-ambient)] transition-all">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-rose-600 opacity-50"></div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-[var(--text-primary)]">{a.wards?.ward_name}</span>
                          <span className="text-[9px] font-mono text-[var(--text-muted)]">
                            {new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-600/10 text-rose-600 text-[8px] font-bold uppercase tracking-wider rounded">
                            {a.source_type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <EmptyState message="Atmosphere Stable" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </McdLayout>
  );
}
