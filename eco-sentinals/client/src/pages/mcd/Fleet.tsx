import { useEffect, useState } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { 
  Trash2, Battery, AlertCircle, Filter, CheckCircle, RefreshCw 
} from 'lucide-react';

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

      </div>
    </McdLayout>
  );
}
