import { useEffect, useRef, useState } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Settings, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  
  const [wards, setWards] = useState<WardData[]>([]);
  const [selectedWard, setSelectedWard] = useState<WardData | null>(null);
  const [history, setHistory] = useState<HistoricalAQI[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ML States
  const [forecast, setForecast] = useState<any[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [sourceDetection, setSourceDetection] = useState<any | null>(null);

  // Stats Counters
  const [stats, setStats] = useState({
    total: 0,
    good: 0,
    mod: 0,
    poor: 0,
    severe: 0
  });

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400'; // Good
    if (aqi <= 100) return '#ffff00'; // Moderate
    if (aqi <= 150) return '#ff7e00'; // Unhealthy Sensitive
    if (aqi <= 200) return '#ff0000'; // Unhealthy
    if (aqi <= 300) return '#8f3f97'; // Very Unhealthy
    return '#7e0023'; // Hazardous
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Poor';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Severe';
    return 'Hazardous';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('latest_ward_aqi')
        .select('*');

      if (error) throw error;
      if (data) {
        setWards(data);
        
        // Compute stats
        const counts = { total: data.length, good: 0, mod: 0, poor: 0, severe: 0 };
        data.forEach((w: WardData) => {
          if (w.aqi_value <= 50) counts.good++;
          else if (w.aqi_value <= 100) counts.mod++;
          else if (w.aqi_value <= 150) counts.poor++;
          else counts.severe++;
        });
        setStats(counts);
        updateMarkers(data);
      }
    } catch (err) {
      console.error('Error fetching ward AQI:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (wardId: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('aqi_readings')
        .select('recorded_at, aqi_value')
        .eq('ward_id', wardId)
        .order('recorded_at', { ascending: true })
        .limit(48); // 24 hours (30 min intervals)

      if (error) throw error;
      if (data) {
        // Format time for X-Axis
        const formatted = data.map((d: any) => ({
          time: new Date(d.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aqi_value: d.aqi_value
        }));
        setHistory(formatted);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchForecast = async (wardId: string) => {
    setLoadingForecast(true);
    try {
      const { data, error } = await supabase.functions.invoke('forecast-aqi', {
        body: { ward_id: wardId }
      });
      if (error) throw error;
      if (data?.predictions) {
        setForecast(data.predictions);
      }
    } catch (err) {
      console.error('Forecast fetch error:', err);
      setForecast([]);
    } finally {
      setLoadingForecast(false);
    }
  };

  const fetchSourceDetection = async (wardId: string) => {
    try {
      const { data, error } = await supabase
        .from('pollution_detections')
        .select('*')
        .eq('ward_id', wardId)
        .order('detected_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSourceDetection(data);
    } catch (err) {
      console.error('Source detection error:', err);
      setSourceDetection(null);
    }
  };

  const updateMarkers = (data: WardData[]) => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    data.forEach((ward) => {
      const color = getAQIColor(ward.aqi_value);
      
      const circle = L.circleMarker([ward.latitude, ward.longitude], {
        radius: 12,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.9
      }).addTo(mapInstance.current);

      circle.bindTooltip(`<b>${ward.ward_name}</b><br/>AQI: ${ward.aqi_value}`, {
        direction: 'top',
        offset: [0, -10]
      });

      circle.on('click', () => {
        setSelectedWard(ward);
        fetchHistory(ward.ward_id);
        fetchForecast(ward.ward_id);
        fetchSourceDetection(ward.ward_id);
      });

      markersRef.current.push(circle);
    });
  };

  const updateTileLayer = () => {
    if (!mapInstance.current) return;
    
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const url = theme === 'dark' 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
      : "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png";

    tileLayerRef.current = L.tileLayer(url, {
      attribution: '© CartoDB'
    }).addTo(mapInstance.current);
  };

  useEffect(() => {
    updateTileLayer();
  }, [theme]);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false
      }).setView([28.6139, 77.2090], 11);

      updateTileLayer();

      L.control.zoom({ position: 'bottomleft' }).addTo(mapInstance.current);

      // Trigger initial fetch
      fetchData();

      // Realtime subscription setup
      const channel = supabase
        .channel('latest_ward_aqi_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aqi_readings' }, () => {
          fetchData();
        })
        .subscribe();

      // Periodic fallback fetch every 5 mins
      const interval = setInterval(fetchData, 5 * 60 * 1000);

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }
  }, []);

  return (
    <McdLayout>
      <div className="relative flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-inter transition-colors duration-300">
        
        {/* Top Stats Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border)] rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold">Total Wards</p>
              <h4 className="text-xl font-bold font-manrope">{stats.total}</h4>
            </div>
            <div className="h-8 border-r border-[var(--border)]"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00e400' }}></span>
                <span className="text-sm">Good: {stats.good}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ffff00' }}></span>
                <span className="text-sm">Mod: {stats.mod}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff7e00' }}></span>
                <span className="text-sm">Poor: {stats.poor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff0000' }}></span>
                <span className="text-sm">Severe: {stats.severe}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={fetchData} 
            className="p-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-[var(--border)]"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Map Container */}
        <div ref={mapRef} className="flex-1 w-full h-full z-0" />

        {/* Slide-In Panel */}
        {selectedWard && (
          <div className="absolute top-0 right-0 h-full w-80 bg-[var(--bg-secondary)]/95 backdrop-blur-md border-l border-[var(--border)] z-[1000] shadow-2xl flex flex-col animate-slide-in">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-bold font-manrope text-[var(--text-primary)]">{selectedWard.ward_name}</h3>
              <button 
                onClick={() => setSelectedWard(null)} 
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Main AQI Display */}
              <div className="bg-[var(--bg-tertiary)]/50 border border-[var(--border)] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase font-medium">Current AQI</p>
                  <h1 className="text-4xl font-extrabold font-manrope mt-1" style={{ color: getAQIColor(selectedWard.aqi_value) }}>
                    {selectedWard.aqi_value}
                  </h1>
                </div>
                <div className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${getAQIColor(selectedWard.aqi_value)}20`, color: getAQIColor(selectedWard.aqi_value) }}>
                  {getAQICategory(selectedWard.aqi_value)}
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">PM2.5</span>
                  <p className="text-sm font-semibold mt-0.5 text-[var(--text-primary)]">{selectedWard.pm25.toFixed(1)} <span className="text-xs text-[var(--text-muted)]">µg/m³</span></p>
                </div>
                <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">PM10</span>
                  <p className="text-sm font-semibold mt-0.5 text-[var(--text-primary)]">{selectedWard.pm10.toFixed(1)} <span className="text-xs text-[var(--text-muted)]">µg/m³</span></p>
                </div>
                <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">NO2</span>
                  <p className="text-sm font-semibold mt-0.5 text-[var(--text-primary)]">{selectedWard.no2.toFixed(1)} <span className="text-xs text-[var(--text-muted)]">ppb</span></p>
                </div>
                <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">SO2</span>
                  <p className="text-sm font-semibold mt-0.5 text-[var(--text-primary)]">{selectedWard.so2.toFixed(1)} <span className="text-xs text-[var(--text-muted)]">ppb</span></p>
                </div>
              </div>

              {/* 24h Trend Chart */}
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">24h History</p>
                <div className="h-40 bg-[var(--bg-tertiary)]/30 border border-[var(--border)] rounded-xl p-2">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">Loading trend...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <XAxis dataKey="time" hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                          labelStyle={{ color: 'var(--text-muted)' }}
                        />
                        <Line type="monotone" dataKey="aqi_value" stroke={getAQIColor(selectedWard.aqi_value)} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* 24h AI Forecast Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">AI Forecast (24h)</p>
                  {forecast.length > 1 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      forecast[forecast.length - 1].aqi > forecast[0].aqi ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {forecast[forecast.length - 1].aqi > forecast[0].aqi ? '↑ Rising' : '↓ Falling'}
                    </span>
                  )}
                </div>
                <div className="h-40 bg-[var(--bg-tertiary)]/20 border border-dotted border-[var(--border)]/50 rounded-xl p-2">
                  {loadingForecast ? (
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm animate-pulse">Computing forecast...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast}>
                        <XAxis dataKey="hour" hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="aqi" stroke="#38bdf8" strokeDasharray="3 3" fill="url(#colorAqi)" strokeWidth={2} />
                        <defs>
                          <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Source & Actions */}
              <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">Pollution Source:</span>
                  {sourceDetection ? (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                        sourceDetection.source_type === 'construction_dust' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        sourceDetection.source_type === 'biomass_burning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        sourceDetection.source_type === 'vehicle_exhaust' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                        sourceDetection.source_type === 'industrial' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                      }`}>
                        {sourceDetection.source_type.replace('_', ' ')}
                      </span>
                      {sourceDetection.confidence_score > 0.70 && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic">No active source detected</span>
                  )}
                </div>
                {sourceDetection && (
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Confidence: {(sourceDetection.confidence_score * 100).toFixed(0)}% • {new Date(sourceDetection.detected_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </p>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors mt-2">
                  View Policy Recommendations <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </McdLayout>
  );
}
