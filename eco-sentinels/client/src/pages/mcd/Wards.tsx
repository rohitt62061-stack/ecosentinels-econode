import { useEffect, useRef, useState, useMemo } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Declare Leaflet global object from CDN
declare const L: any;

interface WardData {
  ward_id: string;
  ward_name: string;
  ward_number: number;
  latitude: number;
  longitude: number;
  aqi_value: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  wind_speed: number;
  recorded_at: string;
}

interface HistoricalAQI {
  time: string;
  aqi_value: number;
}

export default function Wards() {
  const { theme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [selectedWard, setSelectedWard] = useState<WardData | null>(null);
  const [history, setHistory] = useState<HistoricalAQI[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [sourceDetection, setSourceDetection] = useState<any | null>(null);

  // 1. Fetch Wards Data
  const { data: wardsData, loading: loadingWards, refetch: refetchWards } = useSupabaseQuery<WardData[]>(
    async () => {
      const { data, error } = await supabase.from('latest_ward_aqi').select('*');
      return { data: data as WardData[], error };
    },
    []
  );
  const wards = wardsData || [];

  const stats = useMemo(() => {
    const counts = { total: wards.length, good: 0, mod: 0, poor: 0, severe: 0 };
    wards.forEach((w: WardData) => {
      if (w.aqi_value <= 50) counts.good++;
      else if (w.aqi_value <= 100) counts.mod++;
      else if (w.aqi_value <= 150) counts.poor++;
      else counts.severe++;
    });
    return counts;
  }, [wards]);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#16a34a';
    if (aqi <= 100) return '#ca8a04';
    if (aqi <= 150) return '#ea580c';
    if (aqi <= 200) return '#dc2626';
    if (aqi <= 300) return '#7c3aed';
    return '#4c1d95';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Poor';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Severe';
    return 'Hazardous';
  };

  const fetchDetails = async (wardId: string) => {
    setLoadingHistory(true);
    setLoadingForecast(true);
    try {
      const [historyRes, forecastRes, sourceRes] = await Promise.all([
        supabase.from('aqi_readings').select('recorded_at, aqi_value').eq('ward_id', wardId).order('recorded_at', { ascending: true }).limit(48),
        supabase.functions.invoke('forecast-aqi', { body: { ward_id: wardId } }),
        supabase.from('pollution_detections').select('*').eq('ward_id', wardId).order('detected_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      if (historyRes.data) {
        setHistory(historyRes.data.map((d: any) => ({
          time: new Date(d.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aqi_value: d.aqi_value
        })));
      }
      if (forecastRes.data?.predictions) setForecast(forecastRes.data.predictions);
      setSourceDetection(sourceRes.data);
    } finally {
      setLoadingHistory(false);
      setLoadingForecast(false);
    }
  };

  const updateMarkers = (data: WardData[]) => {
    if (!mapInstance.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    data.forEach((ward) => {
      const color = getAQIColor(ward.aqi_value);
      const circle = L.circleMarker([ward.latitude, ward.longitude], {
        radius: 12, fillColor: color, color: '#fff', weight: 2, opacity: 0.8, fillOpacity: 0.9
      }).addTo(mapInstance.current);
      circle.bindTooltip(`<b>${ward.ward_name}</b><br/>AQI: ${ward.aqi_value}`, { direction: 'top', offset: [0, -10] });
      circle.on('click', () => {
        setSelectedWard(ward);
        fetchDetails(ward.ward_id);
      });
      markersRef.current.push(circle);
    });
  };

  const updateTileLayer = () => {
    if (!mapInstance.current) return;
    if (tileLayerRef.current) tileLayerRef.current.remove();

    const tileConfig: Record<string, { url: string; attribution: string; className: string }> = {
      light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles-light'
      },
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap © CARTO',
        className: 'map-tiles-dark'
      },
      civic: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap © CARTO',
        className: 'map-tiles-civic'
      }
    };

    const config = tileConfig[theme as keyof typeof tileConfig] || tileConfig.light;

    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      className: config.className
    }).addTo(mapInstance.current);
  };

  useEffect(() => { updateTileLayer(); }, [theme]);
  useEffect(() => { if (wards.length > 0) updateMarkers(wards); }, [wards]);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([28.6139, 77.2090], 11);
      updateTileLayer();
      L.control.zoom({ position: 'bottomleft' }).addTo(mapInstance.current);
      const channel = supabase.channel('latest_ward_aqi_changes_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'aqi_readings' }, () => refetchWards()).subscribe();
      const interval = setInterval(refetchWards, 5 * 60 * 1000);
      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
        if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
      };
    }
  }, []);

  return (
    <McdLayout>
      <div className="relative flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-inter transition-colors duration-300">
        
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border)] rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold">Total Wards</p>
              {loadingWards ? <div className="h-6 w-8 shimmer rounded mt-1" /> : <h4 className="text-xl font-bold font-manrope">{stats.total}</h4>}
            </div>
            <div className="h-8 border-r border-[var(--border)]"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-sm">Good: {stats.good}</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-sm">Mod: {stats.mod}</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span className="text-sm">Poor: {stats.poor}</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-sm">Severe: {stats.severe}</span></div>
            </div>
          </div>
          <button onClick={() => refetchWards()} className="p-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-[var(--border)]">
            <RefreshCw size={16} className={loadingWards ? "animate-spin" : ""} />
          </button>
        </div>

        <ErrorBoundary fallback={<div className="flex-1 flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-muted)] italic">Map visualization failed to load</div>}>
          <div ref={mapRef} className="flex-1 w-full h-full z-0" />
        </ErrorBoundary>

        {selectedWard && (
          <div className="absolute top-0 right-0 h-full w-80 bg-[var(--bg-secondary)]/95 backdrop-blur-md border-l border-[var(--border)] z-[1000] shadow-2xl flex flex-col animate-slide-in">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-bold font-manrope text-[var(--text-primary)]">{selectedWard.ward_name}</h3>
              <button onClick={() => setSelectedWard(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="bg-[var(--bg-tertiary)]/50 border border-[var(--border)] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase font-medium">Current AQI</p>
                  <h1 className="text-4xl font-extrabold font-manrope mt-1" style={{ color: getAQIColor(selectedWard.aqi_value) }}>{selectedWard.aqi_value}</h1>
                </div>
                <div className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${getAQIColor(selectedWard.aqi_value)}20`, color: getAQIColor(selectedWard.aqi_value) }}>{getAQICategory(selectedWard.aqi_value)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['PM2.5', 'PM10', 'NO2', 'SO2'].map((p, i) => (
                  <div key={p} className="bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                    <span className="text-xs text-[var(--text-muted)]">{p}</span>
                    <p className="text-sm font-semibold mt-0.5 text-[var(--text-primary)]">
                        {i === 0 ? selectedWard.pm25.toFixed(1) : i === 1 ? selectedWard.pm10.toFixed(1) : i === 2 ? selectedWard.no2.toFixed(1) : selectedWard.so2.toFixed(1)}
                        <span className="text-[10px] text-[var(--text-muted)] ml-1">{i < 2 ? 'µg/m³' : 'ppb'}</span>
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">24h History</p>
                <div className="h-40 bg-[var(--bg-tertiary)]/30 border border-[var(--border)] rounded-xl p-2">
                  {loadingHistory ? <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm shimmer rounded">Loading trend...</div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <XAxis dataKey="time" hide />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="aqi_value" stroke={getAQIColor(selectedWard.aqi_value)} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">AI Forecast (24h)</p>
                <div className="h-40 bg-[var(--bg-tertiary)]/20 border border-dotted border-[var(--border)]/50 rounded-xl p-2">
                  {loadingForecast ? <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm shimmer rounded">Computing forecast...</div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast}>
                        <XAxis dataKey="hour" hide />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="aqi" stroke="#38bdf8" strokeDasharray="3 3" fill="url(#colorAqi)" strokeWidth={2} />
                        <defs><linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient></defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Pollution Source:</span>
                    {sourceDetection ? <span className="text-xs font-bold text-amber-500 uppercase">{sourceDetection.source_type.replace('_', ' ')}</span> : <span className="text-xs text-[var(--text-muted)] italic">None Detected</span>}
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors mt-2">View Policy <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </McdLayout>
  );
}
