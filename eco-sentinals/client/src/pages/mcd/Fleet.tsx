import { useEffect, useState } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { 
  Trash2, Battery, AlertCircle, Filter, CheckCircle, RefreshCw 
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';

interface BinReading {
  id: string;
  bin_id: string;
  ward_id: string;
  fill_level_pct: number;
  waste_type_detected: string;
  battery_level: number;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface SummaryStats {
  total: number;
  needsCollection: number;
  avgFill: number;
}

export default function Fleet() {
  const { theme } = useTheme();
  const [bins, setBins] = useState<BinReading[]>([]);
  const [filteredBins, setFilteredBins] = useState<BinReading[]>([]);
  const [wards, setWards] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all');

  // Stats
  const [stats, setStats] = useState<SummaryStats>({ total: 0, needsCollection: 0, avgFill: 0 });

  // Optimizer States
  const [optimizing, setOptimizing] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const optimizeRoutes = async () => {
    try {
      setOptimizing(true);
      const fullyBins = bins.filter(b => (selectedWard === 'all' || b.ward_id === selectedWard) && b.fill_level_pct > 70);

      if (fullyBins.length < 3) {
        showToast('No collection needed today — all bins under 70%', 'info');
        return;
      }

      const chunk = Math.ceil(fullyBins.length / 3);
      const groups = [fullyBins.slice(0, chunk), fullyBins.slice(chunk, chunk * 2), fullyBins.slice(chunk * 2)];

      const fetchedRoutes = [];
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (group.length === 0) continue;
        const coords = group.map(b => `${b.longitude},${b.latitude}`).join(';');
        
        const res = await fetch(`http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          fetchedRoutes.push({
            truckId: i + 1,
            binsCount: group.length,
            distance: data.routes[0].distance / 1000,
            duration: data.routes[0].duration / 60,
            geometry: data.routes[0].geometry.coordinates.map((pos: any) => [pos[1], pos[0]]) // [lat, lng]
          });
        }
      }
      setRoutes(fetchedRoutes);
    } catch (err) {
      console.error("Route Optimization Error:", err);
    } finally {
      setOptimizing(false);
    }
  };

  const saveRoutes = async () => {
    try {
      const { error } = await supabase.from('fleet_routes').insert(
        routes.map(r => ({
          ward_id: selectedWard !== 'all' ? selectedWard : null,
          truck_id: r.truckId,
          total_distance: r.distance,
          estimated_duration: r.duration,
          route_geometry: r.geometry,
          captured_at: new Date().toISOString()
        }))
      );
      if (error) throw error;
      showToast('Routes saved to manifest securely', 'success');
    } catch (err: any) {
       showToast('Failed saving: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    fetchWards();
    fetchBins();

    // Subscribe to realtime readings inserts
    const channel = supabase
      .channel('public:iot_sensor_readings_fleet')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'iot_sensor_readings' },
        (payload: any) => {
          const newReading = payload.new as BinReading;
          setBins(prevBins => {
            // Find if bin exists, replacing it with latest row
            const existingIndex = prevBins.findIndex(b => b.bin_id === newReading.bin_id);
            if (existingIndex > -1) {
              const updated = [...prevBins];
              updated[existingIndex] = newReading;
              return updated;
            }
            return [newReading, ...prevBins];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFiltersAndCalcStats();
  }, [bins, selectedWard, selectedWasteType]);

  const fetchWards = async () => {
    const { data } = await supabase.from('wards').select('id, ward_name');
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(w => map[w.id] = w.ward_name);
      setWards(map);
    }
  };

  const fetchBins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('latest_bin_readings')
        .select('*');

      if (error) throw error;
      if (data) setBins(data as unknown as BinReading[]);
    } catch (err) {
      console.error('Error fetching bins:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndCalcStats = () => {
    let result = [...bins];

    if (selectedWard !== 'all') {
      result = result.filter(b => b.ward_id === selectedWard);
    }

    if (selectedWasteType !== 'all') {
      result = result.filter(b => b.waste_type_detected === selectedWasteType);
    }

    setFilteredBins(result);

    // Calc Stats
    const total = result.length;
    const needsCollection = result.filter(b => b.fill_level_pct > 80).length;
    const sumFill = result.reduce((sum, b) => sum + b.fill_level_pct, 0);
    const avgFill = total > 0 ? Math.round(sumFill / total) : 0;

    setStats({ total, needsCollection, avgFill });
  };

  const getFillColor = (pct: number) => {
    if (pct < 60) return 'bg-emerald-500';
    if (pct <= 80) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getWasteBadgeStyle = (type: string) => {
    if (type === 'biodegradable') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (type === 'recyclable') return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  };

  return (
    <McdLayout>
      <div className="p-6 bg-[var(--bg-primary)] min-h-full text-[var(--text-primary)] flex flex-col gap-6 overflow-y-auto transition-colors duration-300">
        
        {/* Toast notification */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 animate-slideIn transition-all ${
            toast.type === 'success' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' :
            toast.type === 'error'   ? 'bg-rose-950 border-rose-500/40 text-rose-400' :
                                       'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
          }`}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'} {toast.message}
          </div>
        )}
        
        <div className="border-b border-[var(--border)] pb-4">
          <h1 className="text-2xl font-black font-manrope tracking-tight">Fleet Management</h1>
          <p className="text-sm text-[var(--text-secondary)]">Smart bin grid monitoring and sensor fleets diagnostics overviews.</p>
        </div>


        {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Bins</span>
              <h2 className="text-3xl font-black text-[var(--text-primary)] mt-1">{stats.total}</h2>
            </div>
            <Trash2 className="text-[var(--text-muted)]" size={32} />
          </div>
          <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Needs Collection</span>
              <h2 className="text-3xl font-black text-rose-500 mt-1">{stats.needsCollection}</h2>
            </div>
            <AlertCircle className="text-rose-500/50" size={32} />
          </div>
          <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Average Fill</span>
              <h2 className="text-3xl font-black text-emerald-400 mt-1">{stats.avgFill}%</h2>
            </div>
            <CheckCircle className="text-emerald-500/50" size={32} />
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-secondary)]/40 border border-[var(--border)] p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-bold text-[var(--text-secondary)]">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Ward dropdown */}
            <select 
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-emerald-500"
            >
              <option value="all">All Wards</option>
              {Object.entries(wards).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            {/* Waste Type filters */}
            <div className="flex bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-0.5">
              {['all', 'biodegradable', 'recyclable', 'hazardous'].map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedWasteType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${selectedWasteType === t ? 'bg-emerald-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bins Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
            <RefreshCw size={24} className="animate-spin mr-2" />
            Loading bins...
          </div>
        ) : filteredBins.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            {filteredBins.map(b => (
              <div key={b.bin_id} className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] p-4 rounded-xl flex flex-col gap-3 relative hover:border-[var(--border-strong)] transition-colors">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-[var(--text-primary)]">{b.bin_id}</span>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <Battery size={14} className={b.battery_level < 20 ? "text-rose-500 animate-pulse" : "text-emerald-500"} />
                    <span>{Math.round(b.battery_level)}%</span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="text-[11px] text-[var(--text-muted)]">
                  {wards[b.ward_id] || 'Ward ...'}
                </div>

                {/* Fill Level visualization */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[var(--text-secondary)]">Fill Level</span>
                    <span className="font-black text-[var(--text-primary)]">{Math.round(b.fill_level_pct)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--bg-primary)] rounded-full border border-[var(--border)] overflow-hidden">
                    <div 
                      className={`h-full ${getFillColor(b.fill_level_pct)} transition-all`} 
                      style={{ width: `${Math.min(100, Math.max(0, b.fill_level_pct))}%` }}
                    />
                  </div>
                </div>

                {/* Badges footer */}
                <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getWasteBadgeStyle(b.waste_type_detected)}`}>
                    {b.waste_type_detected}
                  </span>
                  {b.fill_level_pct > 80 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/40">
                      Collection Needed
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] italic">
            No bins found matching filters.
          </div>
        )}

        {/* Route Optimizer Panel */}
        <div className="bg-[var(--bg-secondary)]/40 border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wide">Route Optimizer</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Autonomous collection tracking utilizing OSRM APIs</p>
            </div>
            <button 
              onClick={optimizeRoutes}
              disabled={optimizing || selectedWard === 'all'}
              className={`px-4 py-2 rounded-xl border text-xs font-black transition-all ${
                selectedWard === 'all' 
                  ? 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500/20 shadow-lg shadow-emerald-500/10'
              }`}
            >
              {optimizing ? 'Calculating...' : 'Optimize routes'}
            </button>
          </div>

          {routes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {routes.map(r => (
                  <div key={r.truckId} className="bg-[var(--bg-primary)]/60 border border-[var(--border)] p-3 rounded-xl flex flex-col gap-1.5 relative overflow-hiddenGroup">
                     <div className="flex items-center justify-between">
                       <span className={`text-[11px] font-black uppercase tracking-wide ${r.truckId === 1 ? 'text-blue-400' : r.truckId === 2 ? 'text-purple-400' : 'text-amber-400'}`}>
                         Truck #{r.truckId}
                       </span>
                       <span className="text-[10px] text-[var(--text-muted)]">{r.binsCount} full bins</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="flex flex-col">
                         <span className="text-[10px] text-[var(--text-muted)]">Distance</span>
                         <span className="font-bold text-[var(--text-primary)]">{r.distance.toFixed(1)} km</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] text-[var(--text-muted)]">Duration</span>
                         <span className="font-bold text-[var(--text-primary)]">{Math.round(r.duration)} mins</span>
                       </div>
                     </div>
                     <div className="mt-1 text-[10px] text-emerald-400 font-bold">
                       Emission Saved: <span className="text-[var(--text-primary)]">{Math.max(0, (60 - r.distance) * 0.21).toFixed(1)} kg CO₂</span>
                     </div>
                  </div>
                ))}
                
                <button 
                  onClick={saveRoutes}
                  className="w-full py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 transition-colors mt-1"
                >
                  Save Route Manifest
                </button>
              </div>

              {/* Small Map Container */}
              <div className="h-48 md:h-auto bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] overflow-hidden relative z-10">
                {/* @ts-ignore */}
                <MapContainer center={[28.6139, 77.2090] as [number, number]} zoom={12} className="w-full h-full">
                   <TileLayer url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"} />
                   {routes.map(r => (
                      /* @ts-ignore */
                      <Polyline 
                        key={r.truckId} 
                        positions={r.geometry as [number, number][]} 
                        pathOptions={{ color: r.truckId === 1 ? '#60a5fa' : r.truckId === 2 ? '#a78bfa' : '#fbbf24', weight: 4 }}
                      />
                   ))}
                </MapContainer>
              </div>
            </div>
          )}
        </div>

      </div>
    </McdLayout>
  );
}
