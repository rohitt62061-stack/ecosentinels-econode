import { useEffect, useState } from 'react';
import CitizenLayout from '../../components/CitizenLayout';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Heart, Activity, ShieldCheck, RefreshCw, Clock, AlertTriangle, Camera } from 'lucide-react';

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

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);

  useEffect(() => {
    if (!localStorage.getItem('onboarding_complete')) {
       setShowOnboarding(true);
    }
  }, []);

  const handleFinishOnboard = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setShowOnboarding(false);
  };

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
        <div className="max-width-mobile mx-auto h-full flex flex-col bg-slate-950 px-4 pt-4 gap-6 overflow-hidden">
           {/* Header Shimmer */}
           <div className="flex items-center justify-between">
              <div className="space-y-2">
                 <div className="w-24 h-3 bg-slate-800 rounded animate-shimmer" />
                 <div className="w-32 h-5 bg-slate-800 rounded animate-shimmer" />
              </div>
              <div className="w-16 h-6 bg-slate-800 rounded animate-shimmer" />
           </div>

           {/* Gauge Shimmer */}
           <div className="flex justify-center py-6">
              <div className="w-60 h-60 rounded-full border-8 border-slate-900 animate-shimmer flex flex-col items-center justify-center">
                 <div className="w-12 h-3 bg-slate-800 rounded mb-2" />
                 <div className="w-20 h-12 bg-slate-800 rounded mb-2" />
                 <div className="w-16 h-5 bg-slate-800 rounded" />
              </div>
           </div>

           {/* Advisory Shimmer */}
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-24 animate-shimmer flex flex-col gap-2">
              <div className="w-24 h-3 bg-slate-800 rounded" />
              <div className="w-full h-3 bg-slate-800 rounded" />
              <div className="w-3/4 h-3 bg-slate-800 rounded" />
           </div>

           {/* Grid Shimmer */}
           <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                 <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl h-20 animate-shimmer flex flex-col gap-2">
                    <div className="w-12 h-3 bg-slate-800 rounded" />
                    <div className="w-16 h-5 bg-slate-800 rounded" />
                 </div>
              ))}
           </div>
        </div>
      </CitizenLayout>
    );
  }

  if (!aqi) {
    return (
      <CitizenLayout>
        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-6 gap-4">
          <AlertTriangle size={48} className="text-amber-500" />
          <div>
             <p className="font-bold text-white">Data Unavailable</p>
             <p className="text-xs text-slate-500">Failed to fetch local AQI metrics.</p>
          </div>
          <button 
            onClick={() => {
               setLoading(true);
               fetchData();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all"
          >
             <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
             Tap to Retry
          </button>
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
                advisories.flatMap((advice) => {
                  let tips = [];
                  try {
                    tips = JSON.parse(advice.suggestion_text);
                    if (!Array.isArray(tips)) tips = [advice.suggestion_text];
                  } catch (e) {
                    tips = [advice.suggestion_text];
                  }
                  return tips.map((tip: string, index: number) => (
                    <li key={`${advice.id}-${index}`} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-600 mt-1.5"></div>
                      <span>{tip}</span>
                    </li>
                  ));
                })
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

        {/* Quick stats ... earlier rows details */}

        {/* Onboarding Swipeable Modal overlay */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-fadeIn">
             <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4 relative shadow-2xl shadow-emerald-500/10">
                
                {/* Skip button */}
                <button 
                  onClick={handleFinishOnboard}
                  className="absolute top-4 right-4 text-xs font-bold text-slate-500 hover:text-slate-300"
                >
                  Skip
                </button>

                {/* Simulated Swipe Content */}
                <div className="py-6 flex flex-col items-center gap-4">
                   
                   {onboardStep === 1 && (
                      <div className="flex flex-col items-center gap-3 animate-slideIn">
                         <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                            <Activity size={32} />
                         </div>
                         <h3 className="text-xl font-black font-manrope text-white">See Your Ward's Air Quality</h3>
                         <p className="text-xs text-slate-400 px-4">Get hyper-local real-time AQI updates and AI health advisories specifically for your local street node.</p>
                      </div>
                   )}

                   {onboardStep === 2 && (
                      <div className="flex flex-col items-center gap-3 animate-slideIn">
                         <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                            <Camera size={32} />
                         </div>
                         <h3 className="text-xl font-black font-manrope text-white">Scan Waste, Earn Rewards</h3>
                         <p className="text-xs text-slate-400 px-4">Snap pictures of waste nodes to classify them accurately. Earn Eco Credits for your environmental stewardship dashboards datasets.</p>
                      </div>
                   )}

                   {onboardStep === 3 && (
                      <div className="flex flex-col items-center gap-3 animate-slideIn">
                         <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                            <Heart size={32} className="fill-amber-500" />
                         </div>
                         <h3 className="text-xl font-black font-manrope text-white">Help Your Community</h3>
                         <p className="text-xs text-slate-400 px-4">Climb your local ward leaderboard. Higher precision yields better environment benchmarks for your family node layouts.</p>
                      </div>
                   )}

                </div>

                {/* Paged Navigation Dots layout */}
                <div className="flex items-center gap-1.5 mt-2">
                   {[1, 2, 3].map(dot => (
                      <div key={dot} className={`w-1.5 h-1.5 rounded-full transition-all ${onboardStep === dot ? 'bg-emerald-500 w-4' : 'bg-slate-700'}`} />
                   ))}
                </div>

                {/* Bottom Action Footer sizing */}
                <button 
                  onClick={() => onboardStep < 3 ? setOnboardStep(onboardStep + 1) : handleFinishOnboard()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold text-sm py-3 rounded-xl mt-4 transition-all"
                >
                  {onboardStep < 3 ? 'Continue' : 'Get Started'}
                </button>

             </div>
          </div>
        )}

      </div>
    </CitizenLayout>
  );
}
