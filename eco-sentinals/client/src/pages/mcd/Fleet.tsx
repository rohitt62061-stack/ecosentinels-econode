import { useEffect, useState } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { 
  Trash2, Battery, AlertCircle, Filter, CheckCircle, RefreshCw 
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

  const optimizeRoutes = async () => {
    try {
      setOptimizing(true);
      const fullyBins = bins.filter(b => (selectedWard === 'all' || b.ward_id === selectedWard) && b.fill_level_pct > 70);

      if (fullyBins.length < 3) {
        alert("No collection needed today — all bins under 70%");
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
      alert("Routes saved to manifest securely");
    } catch (err: any) {
       alert("Failed saving: " + err.message);
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
      <div className="p-6 bg-slate-950 min-h-full text-slate-100 flex flex-col gap-6 overflow-y-auto">
        <div className="border-b border-slate-900 pb-4">
          <h1 className="text-2xl font-black font-manrope tracking-tight">Fleet Management</h1>
          <p className="text-sm text-slate-400">Smart bin grid monitoring and sensor fleets diagnostics overviews frameworks setups layouts.</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-900 px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bins</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.total}</h2>
            </div>
            <Trash2 className="text-slate-700" size={32} />
          </div>
          <div className="bg-slate-900/50 border border-slate-900 px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Needs Collection</span>
              <h2 className="text-3xl font-black text-rose-500 mt-1">{stats.needsCollection}</h2>
            </div>
            <AlertCircle className="text-rose-500/50" size={32} />
          </div>
          <div className="bg-slate-900/50 border border-slate-900 px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Fill</span>
              <h2 className="text-3xl font-black text-emerald-400 mt-1">{stats.avgFill}%</h2>
            </div>
            <CheckCircle className="text-emerald-500/50" size={32} />
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-400">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Ward dropdown */}
            <select 
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="all">All Wards</option>
              {Object.entries(wards).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            {/* Waste Type filters */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {['all', 'biodegradable', 'recyclable', 'hazardous'].map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedWasteType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${selectedWasteType === t ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bins Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mr-2" />
            Loading bins...
          </div>
        ) : filteredBins.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            {filteredBins.map(b => (
              <div key={b.bin_id} className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl flex flex-col gap-3 relative hover:border-slate-800 transition-colors">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-200">{b.bin_id}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Battery size={14} className={b.battery_level < 20 ? "text-rose-500 animate-pulse" : "text-emerald-500"} />
                    <span>{Math.round(b.battery_level)}%</span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="text-[11px] text-slate-500">
                  {wards[b.ward_id] || 'Ward ...'}
                </div>

                {/* Fill Level visualization */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400">Fill Level</span>
                    <span className="font-black text-slate-200">{Math.round(b.fill_level_pct)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-900 overflow-hidden">
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
          <div className="flex-1 flex items-center justify-center text-slate-600 italic">
            No bins found matching filters setups layouts framing.
          </div>
        )}

        {/* Route Optimizer Panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide">Route Optimizer</h3>
              <p className="text-[11px] text-slate-500">Autonomous collection tracking utilizing OSRM APIs</p>
            </div>
            <button 
              onClick={optimizeRoutes}
              disabled={optimizing || selectedWard === 'all'}
              className={`px-4 py-2 rounded-xl border text-xs font-black transition-all ${
                selectedWard === 'all' 
                  ? 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed' 
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
                  <div key={r.truckId} className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl flex flex-col gap-1.5 relative overflow-hiddenGroup">
                     <div className="flex items-center justify-between">
                       <span className={`text-[11px] font-black uppercase tracking-wide ${r.truckId === 1 ? 'text-blue-400' : r.truckId === 2 ? 'text-purple-400' : 'text-amber-400'}`}>
                         Truck #{r.truckId}
                       </span>
                       <span className="text-[10px] text-slate-500">{r.binsCount} full bins</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500">Distance</span>
                         <span className="font-bold text-slate-200">{r.distance.toFixed(1)} km</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500">Duration</span>
                         <span className="font-bold text-slate-200">{Math.round(r.duration)} mins</span>
                       </div>
                     </div>
                     <div className="mt-1 text-[10px] text-emerald-400 font-bold">
                       Emission Saved: <span className="text-slate-200">{Math.max(0, (60 - r.distance) * 0.21).toFixed(1)} kg CO₂</span>
                     </div>
                  </div>
                ))}
                
                <button 
                  onClick={saveRoutes}
                  className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors mt-1"
                >
                  Save Route Manifest
                </button>
              </div>

              {/* Small Map Container */}
              <div className="h-48 md:h-auto bg-slate-950 rounded-xl border border-slate-900 overflow-hidden relative z-10">
                {/* @ts-ignore */}
                <MapContainer center={[28.6139, 77.2090] as [number, number]} zoom={12} className="w-full h-full">
                   <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
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
