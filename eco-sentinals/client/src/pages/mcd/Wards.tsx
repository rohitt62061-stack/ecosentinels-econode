import { useEffect, useRef, useState } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

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
  recorded_at: string;
  aqi_value: number;
}

export default function Wards() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [wards, setWards] = useState<WardData[]>([]);
  const [selectedWard, setSelectedWard] = useState<WardData | null>(null);
  const [history, setHistory] = useState<HistoricalAQI[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(true);

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
      });

      markersRef.current.push(circle);
    });
  };

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false
      }).setView([28.6139, 77.2090], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

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
      <div className="relative flex flex-col h-full bg-slate-950 text-white font-inter">
        
        {/* Top Stats Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-800/60 rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Wards</p>
              <h4 className="text-xl font-bold font-manrope">{stats.total}</h4>
            </div>
            <div className="h-8 border-r border-slate-800"></div>
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
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Map Container */}
        <div ref={mapRef} className="flex-1 w-full h-full z-0" />

        {/* Slide-In Panel */}
        {selectedWard && (
          <div className="absolute top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 z-[1000] shadow-2xl flex flex-col animate-slide-in">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-manrope">{selectedWard.ward_name}</h3>
              <button 
                onClick={() => setSelectedWard(null)} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Main AQI Display */}
              <div className="bg-slate-800/50 border border-slate-700/30 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-medium">Current AQI</p>
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
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/20">
                  <span className="text-xs text-slate-400">PM2.5</span>
                  <p className="text-sm font-semibold mt-0.5">{selectedWard.pm25.toFixed(1)} <span className="text-xs text-slate-500">µg/m³</span></p>
                </div>
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/20">
                  <span className="text-xs text-slate-400">PM10</span>
                  <p className="text-sm font-semibold mt-0.5">{selectedWard.pm10.toFixed(1)} <span className="text-xs text-slate-500">µg/m³</span></p>
                </div>
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/20">
                  <span className="text-xs text-slate-400">NO2</span>
                  <p className="text-sm font-semibold mt-0.5">{selectedWard.no2.toFixed(1)} <span className="text-xs text-slate-500">ppb</span></p>
                </div>
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/20">
                  <span className="text-xs text-slate-400">SO2</span>
                  <p className="text-sm font-semibold mt-0.5">{selectedWard.so2.toFixed(1)} <span className="text-xs text-slate-500">ppb</span></p>
                </div>
              </div>

              {/* 24h Trend Chart */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">24h History</p>
                <div className="h-40 bg-slate-800/30 border border-slate-700/30 rounded-xl p-2">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading trend...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <XAxis dataKey="time" hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line type="monotone" dataKey="aqi_value" stroke={getAQIColor(selectedWard.aqi_value)} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Source & Actions */}
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/30 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-slate-300">Pollution Source:</span>
                  <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">Construction Dust</span>
                </div>
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
