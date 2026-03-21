import { useEffect, useState } from 'react';
import CitizenLayout from '../../components/CitizenLayout';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Heart, Activity, ShieldCheck, RefreshCw, Clock } from 'lucide-react';

interface AqiData {
  ward_name: string;
  aqi_value: number;
  pm25: number;
  pm10: number;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface Advisory {
  id: string;
  suggestion_text: string;
  suggestion_type: string;
}

export default function Home() {
  const { session } = useAuth();
  const [aqi, setAqi] = useState<AqiData | null>(null);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [minutesAgo, setMinutesAgo] = useState(0);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Poor';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Severe';
    return 'Hazardous';
  };

  const getGaugeOffset = (aqi: number) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    // Cap at 500 for scaling
    const value = Math.min(Math.max(0, aqi), 500);
    const percent = value / 500;
    return circumference - percent * circumference;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) return;

      // 1. Fetch Profile for ward_id
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('ward_id')
        .eq('id', session.user.id)
        .single();

      let targetWardId = profile?.ward_id;

      // Fallback: If no ward configured, fetch first from view
      if (pError || !targetWardId) {
        const { data: fallbackWards } = await supabase
          .from('latest_ward_aqi')
          .select('ward_id')
          .limit(1);
        if (fallbackWards && fallbackWards.length > 0) {
          targetWardId = fallbackWards[0].ward_id;
        }
      }

      if (!targetWardId) {
        setLoading(false);
        return;
      }

      // 2. Fetch Latest AQI
      const { data: aqiData, error: aqiError } = await supabase
        .from('latest_ward_aqi')
        .select('*')
        .eq('ward_id', targetWardId)
        .single();

      if (aqiError) throw aqiError;
      if (aqiData) {
        setAqi(aqiData);
        setLastUpdated(new Date());
        setMinutesAgo(0);
      }

      // 3. Fetch Advisories
      const { data: adviceData } = await supabase
        .from('ai_suggestions')
        .select('id, suggestion_text, suggestion_type')
        .eq('ward_id', targetWardId)
        .limit(3);

      if (adviceData) {
        setAdvisories(adviceData);
      } else {
        setAdvisories([]);
      }

    } catch (err) {
      console.error('Error fetching citizen AQI data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-Refresh & Time Tracker
  useEffect(() => {
    if (session) {
      fetchData();

      const refreshInterval = setInterval(fetchData, 5 * 60 * 1000); // 5 mins
      const timeInterval = setInterval(() => {
        setMinutesAgo(prev => prev + 1);
      }, 60 * 1000); // 1 min update

      return () => {
        clearInterval(refreshInterval);
        clearInterval(timeInterval);
      };
    }
  }, [session]);

  if (loading && !aqi) {
    return (
      <CitizenLayout>
        <div className="flex items-center justify-center h-full text-slate-400">
          <RefreshCw size={24} className="animate-spin mr-2" />
          Loading local AQI data...
        </div>
      </CitizenLayout>
    );
  }

  if (!aqi) {
    return (
      <CitizenLayout>
        <div className="flex items-center justify-center h-full text-slate-400 text-center px-6">
          <AlertTriangle size={32} className="text-amber-500 mb-2 mx-auto" />
          <p>No air quality data available for your area yet.</p>
        </div>
      </CitizenLayout>
    );
  }

  const category = getAQICategory(aqi.aqi_value);
  const color = getAQIColor(aqi.aqi_value);

  return (
    <CitizenLayout>
      <div className="max-width-mobile mx-auto h-full flex flex-col bg-slate-950 text-white font-inter overflow-y-auto pb-20">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-900">
          <div>
            <p className="text-xs text-slate-400">Current Area</p>
            <h3 className="font-bold text-lg font-manrope flex items-center gap-1">
              📍 {aqi.ward_name}, Delhi
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-md">
            <Clock size={12} />
            <span>{minutesAgo === 0 ? 'Just updated' : `${minutesAgo} min ago`}</span>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col items-center justify-center py-8 relative">
          <svg className="w-64 h-64 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#1e293b"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Colored Gauge Indicator */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke={color}
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={getGaugeOffset(aqi.aqi_value)}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          {/* Inner Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0 mt-3">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">AQI</span>
            <h1 className="text-6xl font-black font-manrope tracking-tighter" style={{ color }}>
              {aqi.aqi_value}
            </h1>
            <span className="text-sm font-bold mt-1 px-3 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
              {category}
            </span>
          </div>
        </div>

        {/* Advisory Card */}
        <div className="px-4 mb-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4" style={{ borderLeft: `4px solid ${color}` }}>
            <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5 text-slate-200">
              <ShieldCheck size={16} style={{ color }} /> Today's Advisory
            </h4>
            <ul className="space-y-2">
              {advisories.length > 0 ? (
                advisories.map((advice) => (
                  <li key={advice.id} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-slate-600 mt-1.5"></div>
                    <span>{advice.suggestion_text}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">Generating smart advisory recommendations...</li>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Stats Grid 2x2 */}
        <div className="px-4 grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Activity size={14} />
              <span className="text-xs">PM 2.5</span>
            </div>
            <p className="text-lg font-bold">
              {aqi.pm25.toFixed(1)} <span className="text-xs text-slate-500 font-normal">µg/m³</span>
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Activity size={14} fill="transparent" />
              <span className="text-xs">PM 10</span>
            </div>
            <p className="text-lg font-bold">
              {aqi.pm10.toFixed(1)} <span className="text-xs text-slate-500 font-normal">µg/m³</span>
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-center">
            <span className="text-xs text-slate-400 mb-1">Ward Rank</span>
            <p className="text-lg font-bold text-slate-600 text-center">-</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-center">
            <span className="text-xs text-slate-400 mb-1">Eco Score</span>
            <div className="flex items-center gap-1 justify-center">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
              <span className="font-bold">--</span>
            </div>
          </div>
        </div>

      </div>
    </CitizenLayout>
  );
}
