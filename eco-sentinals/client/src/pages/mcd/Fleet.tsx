import { useEffect, useState, useMemo } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SkeletonCard } from '../../components/Skeleton';
import { ErrorState, EmptyState } from '../../components/StateFeedback';
import {
  Trash2, Battery, AlertCircle, CheckCircle, Settings,
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';
import { Ward, IoTSensorReading } from '../../types/database';

interface FleetRouteData {
  truckId: number;
  binsCount: number;
  distance: number;
  duration: number;
  geometry: [number, number][];
  algorithm: string;
}

interface GhostNode {
  id: string;
  latitude: number;
  longitude: number;
  confidence: number;
}

export default function Fleet() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all');
  const [optimizing, setOptimizing] = useState(false);
  const [routes, setRoutes] = useState<FleetRouteData[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Wards
  const { data: wardsData = [] } = useQuery<Pick<Ward, 'id' | 'ward_name'>[]>({
    queryKey: ['wards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('wards').select('id, ward_name').order('ward_name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const wards = useMemo(() => {
    const map: Record<string, string> = {};
    wardsData.forEach((w) => {
      if (w.id) map[w.id] = w.ward_name;
    });
    return map;
  }, [wardsData]);

  // 2. Fetch Bins
  const { data: bins = [], isLoading: loadingBins, error: errorBins, refetch: refetchBins } = useQuery<IoTSensorReading[]>({
    queryKey: ['bin-readings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('latest_bin_readings').select('*');
      if (error) throw error;
      return (data as any[]) || [];
    },
    staleTime: 30 * 1000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:iot_sensor_readings_fleet_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'iot_sensor_readings' },
        (payload) => {
          const newReading = payload.new as IoTSensorReading;
          queryClient.setQueryData(['bin-readings'], (old: IoTSensorReading[] | undefined) => {
            if (!old) return [newReading];
            const current = [...old];
            const existingIndex = current.findIndex(b => b.bin_id === newReading.bin_id);
            if (existingIndex > -1) {
              current[existingIndex] = newReading;
              return current;
            }
            return [newReading, ...current];
          });
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const filteredBins = useMemo(() => {
    let result = [...bins];
    if (selectedWard !== 'all') result = result.filter(b => b.ward_id === selectedWard);
    if (selectedWasteType !== 'all') result = result.filter(b => b.waste_type_detected === selectedWasteType);
    return result;
  }, [bins, selectedWard, selectedWasteType]);

  const stats = useMemo(() => {
    const total = filteredBins.length;
    const needsCollection = filteredBins.filter(b => (b.fill_level_pct || 0) > 80).length;
    const sumFill = filteredBins.reduce((sum, b) => sum + (b.fill_level_pct || 0), 0);
    const avgFill = total > 0 ? Math.round(sumFill / total) : 0;
    return { total, needsCollection, avgFill };
  }, [filteredBins]);

  const [ghostNodes, setGhostNodes] = useState<GhostNode[]>([]);
  const [showGhosts, setShowGhosts] = useState(true);

  // 3. Fetch Ghost Waste (Predictive)
  const fetchGhostNodes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ghost-waste');
      if (error) throw error;
      if (data?.status === 'success') {
        setGhostNodes(data.ghost_nodes);
      }
    } catch (err) {
      console.error("Ghost Waste Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchGhostNodes();
  }, []);

  const optimizeRoutes = async () => {
    try {
      setOptimizing(true);
      const collectionTargets = [
        ...bins.filter(b => (selectedWard === 'all' || b.ward_id === selectedWard) && (b.fill_level_pct || 0) > 70),
        ...(showGhosts ? ghostNodes : [])
      ];

      if (collectionTargets.length < 2) {
        showToast('Not enough targets for optimization', 'info');
        return;
      }

      // Call Backend ACO Optimizer
      const locations = collectionTargets.map(t => ({ lat: t.latitude, lng: t.longitude }));
      const { data, error: invokeError } = await supabase.functions.invoke('optimize-fleet', {
        body: { locations }
      });

      if (invokeError) throw invokeError;

      if (data?.status === 'success') {
        const optimizedIndices = data.optimized_indices;
        const sortedTargets = optimizedIndices.map((idx: number) => collectionTargets[idx]);

        // Final Pathing via OSRM
        const coords = sortedTargets.map((t: any) => `${t.longitude},${t.latitude}`).join(';');
        const osrmRes = await fetch(`http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
        const osrmData = await osrmRes.json();

        if (osrmData.routes && osrmData.routes[0]) {
          setRoutes([{
            truckId: 1,
            binsCount: sortedTargets.length,
            distance: osrmData.routes[0].distance / 1000,
            duration: osrmData.routes[0].duration / 60,
            geometry: osrmData.routes[0].geometry.coordinates.map((pos: [number, number]) => [pos[1], pos[0]]),
            algorithm: "ACO (Ant Colony)"
          }]);
          showToast('ACO Optimization Complete: Route calculated.', 'success');
        }
      }
    } catch (err) {
      console.error("Route Optimization Error:", err);
      showToast('Optimization Failed', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  const saveRoutes = async () => {
    try {
      const { error } = await supabase.from('fleet_routes').insert(
        routes.map(r => ({
          ward_id: selectedWard !== 'all' ? selectedWard : null,
          truck_id: String(r.truckId),
          total_distance_km: r.distance,
          estimated_duration_min: Math.round(r.duration),
          waypoints: r.geometry,
          route_date: new Date().toISOString().split('T')[0]
        }))
      );
      if (error) throw error;
      showToast('Routes saved to manifest securely', 'success');
    } catch (err: unknown) {
       const errorMessage = err instanceof Error ? err.message : 'Unknown error';
       showToast('Failed saving: ' + errorMessage, 'error');
    }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Bins</span>
              {loadingBins ? (
                <div className="h-9 w-12 bg-[var(--bg3)] animate-pulse rounded mt-1" />
              ) : (
                <h2 className="text-3xl font-black text-[var(--text-primary)] mt-1">{stats.total}</h2>
              )}
            </div>
            <Trash2 className="text-[var(--text-muted)]" size={32} />
          </div>
          <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Needs Collection</span>
              {loadingBins ? (
                <div className="h-9 w-12 bg-[var(--bg3)] animate-pulse rounded mt-1" />
              ) : (
                <h2 className="text-3xl font-black text-rose-500 mt-1">{stats.needsCollection}</h2>
              )}
            </div>
            <AlertCircle className="text-rose-500/50" size={32} />
          </div>
          <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] px-6 py-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Average Fill</span>
              {loadingBins ? (
                <div className="h-9 w-12 bg-[var(--bg3)] animate-pulse rounded mt-1" />
              ) : (
                <h2 className="text-3xl font-black text-emerald-400 mt-1">{stats.avgFill}%</h2>
              )}
            </div>
            <CheckCircle className="text-emerald-500/50" size={32} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-secondary)]/40 border border-[var(--border)] p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-bold text-[var(--text-secondary)]">Grid Controls:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

        {loadingBins ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} lines={3} />)}
          </div>
        ) : errorBins ? (
          <ErrorState message="Satellite Link Interrupted: Unable to sync bin telemetry" onRetry={refetchBins} />
        ) : filteredBins.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredBins.map(b => (
              <div key={b.bin_id} className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] p-4 rounded-xl flex flex-col gap-3 relative hover:border-[var(--border-strong)] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-[var(--text-primary)]">{b.bin_id}</span>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <Battery size={14} className={(b.battery_level ?? 100) < 20 ? "text-rose-500 animate-pulse" : "text-emerald-500"} />
                    <span>{Math.round(b.battery_level ?? 0)}%</span>
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">{(b.ward_id ? wards[b.ward_id] : null) || 'Ward ...'}</div>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[var(--text-secondary)]">Fill Level</span>
                    <span className="font-black text-[var(--text-primary)]">{Math.round(b.fill_level_pct ?? 0)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--bg-primary)] rounded-full border border-[var(--border)] overflow-hidden">
                    <div className={`h-full ${getFillColor(b.fill_level_pct ?? 0)} transition-all`} style={{ width: `${Math.min(100, Math.max(0, b.fill_level_pct ?? 0))}%` }} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getWasteBadgeStyle(b.waste_type_detected || 'biodegradable')}`}>
                    {b.waste_type_detected}
                  </span>
                  {(b.fill_level_pct ?? 0) > 80 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/40">
                      Collection Needed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12">
            <EmptyState message="No sensor nodes detected within current filter parameters" />
          </div>
        )}

        {/* Route Optimizer Panel */}
        <div className="bg-[var(--bg-secondary)]/40 border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wide">Route Optimizer</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Autonomous collection tracking utilizing ACO (Ant Colony Optimization)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--bg-primary)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Predictive Layer</span>
                <button
                  onClick={() => setShowGhosts(!showGhosts)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${showGhosts ? 'bg-emerald-500' : 'bg-[var(--bg-tertiary)]'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showGhosts ? 'left-4.5' : 'left-0.5'}`} />
                </button>
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
          </div>

          {(routes.length > 0 || (showGhosts && ghostNodes.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {routes.length > 0 ? routes.map(r => (
                  <div key={r.truckId} className="bg-[var(--bg-primary)]/60 border border-[var(--border)] p-3 rounded-xl flex flex-col gap-1.5 relative overflow-hidden">
                     <div className="flex items-center justify-between">
                       <span className={`text-[11px] font-black uppercase tracking-wide text-emerald-400`}>Optimized Path (ACO)</span>
                       <span className="text-[10px] text-[var(--text-muted)]">{r.binsCount} targets</span>
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
                  </div>
                )) : (
                  <div className="bg-[var(--bg-primary)]/40 border border-dashed border-[var(--border)] p-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">
                    Run Optimizer to calculate path
                  </div>
                )}
                {routes.length > 0 && (
                  <button onClick={saveRoutes} className="w-full py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 transition-colors mt-1">Save Route Manifest</button>
                )}
              </div>
              <div className="h-48 md:h-auto bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] overflow-hidden relative z-10 min-h-[300px]">
                {/* @ts-ignore */}
                <MapContainer center={[28.6139, 77.2090] as [number, number]} zoom={13} className="w-full h-full">
                   {/* @ts-ignore */}
                   <TileLayer
                     key={theme}
                     url={
                       theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" :
                       theme === 'civic' ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" :
                       "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                     }
                     /* @ts-ignore */
                     attribution={
                       theme === 'dark' ? "© OpenStreetMap © CARTO" :
                       theme === 'civic' ? "© OpenStreetMap © CARTO" :
                       "© OpenStreetMap contributors"
                     }
                   />

                   {/* Ghost Nodes */}
                   {showGhosts && ghostNodes.map((v: any) => (
                      /* @ts-ignore */
                      <CircleMarker
                        key={v.id}
                        center={[v.latitude, v.longitude]}
                        radius={8 as any}
                        pathOptions={{
                          fillColor: '#f59e0b', // Assuming ghost nodes are always 'amber' like the original
                          fillOpacity: 1,
                          color: '#ffffff',
                          weight: 2,
                          dashArray: '2, 4'
                        }}
                      >
                         {/* @ts-ignore */}
                        <Popup>
                          <div className="p-2 min-w-[120px]">
                            <div className="text-[10px] font-black uppercase tracking-tight text-amber-500">Ghost Waste Node</div>
                            <div className="text-[9px] text-[var(--text-secondary)] mt-1 font-bold">Confidence: {(v.confidence * 100).toFixed(0)}%</div>
                            <div className="text-[8px] text-[var(--text-muted)] mt-0.5 italic">High correlation with PM2.5 spike</div>
                          </div>
                        </Popup>
                      </CircleMarker>
                   ))}

                   {routes.map(r => (
                      /* @ts-ignore */
                      <Polyline key={r.truckId} positions={r.geometry as [number, number][]} pathOptions={{ color: '#10b981', weight: 4, lineCap: 'round' }} />
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
