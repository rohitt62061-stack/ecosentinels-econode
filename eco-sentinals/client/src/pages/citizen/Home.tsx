import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import CitizenLayout from '../../components/CitizenLayout';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { useAuthGuardedQuery } from '../../hooks/useAuthGuardedQuery';
import { Heart, Activity, ShieldCheck, RefreshCw, Clock, AlertTriangle, Camera, Megaphone } from 'lucide-react';
import PollutionReportModal from '../../components/citizen/PollutionReportModal';
import { getStreamClient, getStreamToken } from '../../utils/stream';

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
  const { t } = useTranslation();
  const { user, isReady } = useAuth();
  const [minutesAgo, setMinutesAgo] = useState(0);

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('onboarding_complete')) {
       setShowOnboarding(true);
    }
  }, []);

  const handleFinishOnboard = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  // Auth-Guarded Data Fetching
  const { data, fetching, refetch } = useAuthGuardedQuery<{
    aqi: AqiData | null;
    advisories: Advisory[];
  }>(async () => {
    if (!user) return { data: null, error: null };

    // 1. Fetch Profile for ward_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('ward_id')
      .eq('id', user.id)
      .single();

    let targetWardId = profile?.ward_id;

    // Fallback logic
    if (!targetWardId) {
      const { data: fallbackWards } = await supabase
        .from('latest_ward_aqi')
        .select('ward_id')
        .limit(1);
      if (fallbackWards && fallbackWards.length > 0) {
        targetWardId = fallbackWards[0].ward_id;
      }
    }

    if (!targetWardId) return { data: { aqi: null, advisories: [] }, error: null };

    // 2. Fetch Latest AQI & Advisories in parallel
    const [aqiRes, adviceRes] = await Promise.all([
      supabase.from('latest_ward_aqi').select('*').eq('ward_id', targetWardId).single(),
      supabase.from('ai_suggestions').select('id, suggestion_text, suggestion_type').eq('ward_id', targetWardId).limit(3)
    ]);

    return { 
      data: { 
        aqi: aqiRes.data as AqiData, 
        advisories: (adviceRes.data || []) as Advisory[]
      }, 
      error: aqiRes.error 
    };
  }, [user?.id]);

  const aqi = data?.aqi;
  const advisories = data?.advisories || [];

  // Auto-Refresh
  useEffect(() => {
    if (isReady && user) {
      const refreshInterval = setInterval(refetch, 5 * 60 * 1000); // 5 mins
      const timeInterval = setInterval(() => setMinutesAgo(prev => prev + 1), 60 * 1000);
      return () => {
        clearInterval(refreshInterval);
        clearInterval(timeInterval);
      };
    }
  }, [isReady, user]);

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

  const getCommuteAdvice = (aqi: number, hour: number) => {
    const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    
    if (aqi <= 50) return { 
      mode: '🚴 Cycle freely', color: '#16a34a', // green
      tip: 'Excellent air today. Great day for a bike ride or walk.',
      icons: { walk: true, cycle: true, bus: true, metro: true }
    };
    if (aqi <= 100) return { 
      mode: '🚶 Walk is fine', color: '#ca8a04', // yellow
      tip: isRushHour ? 'Avoid main roads during peak traffic. Side lanes are okay.' 
                      : 'Air is acceptable. A short mask is optional.',
      icons: { walk: true, cycle: true, bus: true, metro: true }
    };
    if (aqi <= 150) return { 
      mode: '🪖 Wear N95 mask', color: '#ea580c', // orange
      tip: 'Use metro or bus if possible. Avoid cycling. Carry N95.',
      icons: { walk: true, cycle: false, bus: true, metro: true }
    };
    if (aqi <= 200) return { 
      mode: '🚇 Take metro/bus', color: '#dc2626', // red
      tip: 'Avoid outdoor exposure. If must commute, wear N95 and travel quickly.',
      icons: { walk: false, cycle: false, bus: true, metro: true }
    };
    return { 
      mode: '🏠 Stay indoors', color: '#7c3aed', // purple
      tip: 'Hazardous air quality. Work from home if possible. Essential travel only.',
      icons: { walk: false, cycle: false, bus: false, metro: false }
    };
  };

  const handleReportSubmit = async (report: { type: string; description: string }) => {
    if (!user || !aqi) return;

    try {
      const token = getStreamToken(user.id);
      const client = getStreamClient();
      
      // Get Profile for ward_id again to ensure accuracy
      const { data: profile } = await supabase
        .from('profiles')
        .select('ward_id')
        .eq('id', user.id)
        .single();

      const wardId = profile?.ward_id;
      if (!wardId) throw new Error('Ward ID not found');

      // Connect to the ward feed
      const wardFeed = client.feed('ward', wardId, token);
      
      await wardFeed.addActivity({
        actor: user.id,
        verb: 'reported',
        object: report.type,
        description: report.description,
        ward_id: wardId,
        ward_name: aqi.ward_name,
        location: { lat: aqi.latitude, lng: aqi.longitude },
        timestamp: new Date().toISOString()
      });

      alert('Report submitted successfully to live feed!');
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Failed to submit report. Please try again.');
    }
  };

  const getGaugeOffset = (aqi: number) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const value = Math.min(Math.max(0, aqi), 500);
    const percent = value / 500;
    return circumference - percent * circumference;
  };

  if (fetching && !aqi) {
    return (
      <CitizenLayout>
        <div className="max-width-mobile mx-auto h-full flex flex-col bg-[var(--bg-primary)] px-4 pt-4 gap-6 overflow-hidden">
           <div className="flex items-center justify-between">
              <div className="space-y-2">
                 <div className="w-24 h-3 bg-[var(--bg-tertiary)] rounded shimmer" />
                 <div className="w-32 h-5 bg-[var(--bg-tertiary)] rounded shimmer" />
              </div>
              <div className="w-16 h-6 bg-[var(--bg-tertiary)] rounded shimmer" />
           </div>
           <div className="flex justify-center py-6">
              <div className="w-60 h-60 rounded-full border-8 border-[var(--bg-secondary)] flex flex-col items-center justify-center">
                 <div className="w-12 h-3 bg-[var(--bg-tertiary)] rounded mb-2 shimmer" />
                 <div className="w-20 h-12 bg-[var(--bg-tertiary)] rounded mb-2 shimmer" />
                 <div className="w-16 h-5 bg-[var(--bg-tertiary)] rounded shimmer" />
              </div>
           </div>
           <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 h-24 flex flex-col gap-2">
              <div className="w-24 h-3 bg-[var(--bg-tertiary)] rounded shimmer" />
              <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded shimmer" />
              <div className="w-3/4 h-3 bg-[var(--bg-tertiary)] rounded shimmer" />
           </div>
           <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                 <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-xl h-20 flex flex-col gap-2">
                    <div className="w-12 h-3 bg-[var(--bg-tertiary)] rounded shimmer" />
                    <div className="w-16 h-5 bg-[var(--bg-tertiary)] rounded shimmer" />
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
        <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-center px-6 gap-4 bg-[var(--bg-primary)]">
          <AlertTriangle size={48} className="text-amber-500" />
          <div>
             <p className="font-bold text-[var(--text-primary)]">Data Unavailable</p>
             <p className="text-xs text-[var(--text-muted)]">Failed to fetch local AQI metrics.</p>
          </div>
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
          >
             <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
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
      <div className="max-width-mobile mx-auto h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-inter overflow-y-auto pb-20 transition-colors duration-300">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--text-muted)]">{t('citizen.ward_label')}</p>
            <h3 className="font-bold text-lg flex items-center gap-1" style={{ fontFamily: 'var(--font-display)' }}>
              📍 {aqi.ward_name}, Delhi
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const nextLang = i18n.language === 'en' ? 'hi' : 'en';
                i18n.changeLanguage(nextLang);
                localStorage.setItem('econode-lang', nextLang);
              }}
              className="text-[10px] font-bold bg-[var(--bg-secondary)] border border-[var(--border)] px-2 py-1 rounded-md text-[var(--text-muted)] hover:text-emerald-400 transition-colors"
            >
              {i18n.language === 'en' ? 'EN | हि' : 'हि | EN'}
            </button>
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-1 rounded-md">
              <Clock size={12} />
              <span>{minutesAgo === 0 ? 'Just updated' : `${minutesAgo} min ago`}</span>
            </div>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col items-center justify-center py-8 relative">
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="var(--bg-tertiary)"
              strokeWidth="12"
              fill="transparent"
            />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0 mt-3">
            <span className="text-xs uppercase text-[var(--text-muted)] font-semibold tracking-wider">{t('citizen.aqi_label')}</span>
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
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4" style={{ borderLeft: `4px solid ${color}` }}>
            <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5 text-[var(--text-primary)]">
              <ShieldCheck size={16} style={{ color }} /> {t('citizen.advisory_title')}
            </h4>
            <ul className="space-y-2">
              {advisories.length > 0 ? (
                advisories.flatMap((advice) => {
                  let tips = [];
                  try {
                    const parsed = JSON.parse(advice.suggestion_text);
                    // Check if bilingual format: [{'en': '...', 'hi': '...'}]
                    if (Array.isArray(parsed) && typeof parsed[0] === 'object') {
                      tips = parsed.map(item => item[i18n.language] || item['en']);
                    } else if (Array.isArray(parsed)) {
                      tips = parsed;
                    } else {
                      tips = [advice.suggestion_text];
                    }
                  } catch (e) {
                    tips = [advice.suggestion_text];
                  }
                  return tips.map((tip: string, index: number) => (
                    <li key={`${advice.id}-${index}`} className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[var(--border)] mt-1.5"></div>
                      <span>{tip}</span>
                    </li>
                  ));
                })
              ) : (
                <li className="text-xs text-[var(--text-muted)] italic opacity-60">Generating smart advisory recommendations...</li>
              )}
            </ul>
          </div>
        </div>

        {/* Today's Commute Card */}
        {aqi && (
          <div className="px-4 mb-5">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-sm mb-1">{t('citizen.commute_title')}</h4>
                  <div 
                    className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${getCommuteAdvice(aqi.aqi_value, new Date().getHours()).color}20`, color: getCommuteAdvice(aqi.aqi_value, new Date().getHours()).color }}
                  >
                    {getCommuteAdvice(aqi.aqi_value, new Date().getHours()).mode}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const advice = getCommuteAdvice(aqi.aqi_value, new Date().getHours());
                    const message = `Econode ${aqi.ward_name} AQI today: ${aqi.aqi_value}. Recommendation: ${advice.mode.split(' ').slice(1).join(' ')}. Check yours at ${window.location.origin}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="p-2 bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-muted)] hover:text-[var(--citizen-primary)] transition-all"
                  title="Share advisory"
                >
                  <Megaphone size={14} />
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                {getCommuteAdvice(aqi.aqi_value, new Date().getHours()).tip}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)] border-dashed">
                {[
                  { id: 'walk', label: 'Walk', icon: '🚶' },
                  { id: 'cycle', label: 'Cycle', icon: '🚴' },
                  { id: 'bus', label: 'Bus', icon: '🚌' },
                  { id: 'metro', label: 'Metro', icon: '🚇' }
                ].map(item => {
                  const isEnabled = (getCommuteAdvice(aqi.aqi_value, new Date().getHours()).icons as any)[item.id];
                  return (
                    <div key={item.id} className={`flex flex-col items-center gap-1 ${isEnabled ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                       <span className="text-xl">{item.icon}</span>
                       <span className="text-[8px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reporting Action */}
        <div className="px-4 mb-6">
          <button 
            onClick={() => setReportModalOpen(true)}
            className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <Megaphone size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">{t('citizen.report_button')}</p>
                <p className="text-[10px] text-[var(--text-muted)]">Spotted something? Let the MCD know instantly.</p>
              </div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] group-hover:bg-[var(--bg-primary)] transition-all">
              <span className="text-lg">→</span>
            </div>
          </button>
        </div>

        {/* Quick Stats Grid 2x2 */}
        <div className="px-4 grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-xl">
            <div className="flex items-center gap-1 text-[var(--text-muted)] mb-1">
              <Activity size={14} />
              <span className="text-xs">PM 2.5</span>
            </div>
            <p className="text-lg font-bold">
              {aqi.pm25.toFixed(1)} <span className="text-xs text-[var(--text-muted)] font-normal">µg/m³</span>
            </p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-xl">
            <div className="flex items-center gap-1 text-[var(--text-muted)] mb-1">
              <Activity size={14} fill="transparent" />
              <span className="text-xs">PM 10</span>
            </div>
            <p className="text-lg font-bold">
              {aqi.pm10.toFixed(1)} <span className="text-xs text-[var(--text-muted)] font-normal">µg/m³</span>
            </p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-xl flex flex-col justify-center">
            <span className="text-xs text-[var(--text-muted)] mb-1">Ward Rank</span>
            <p className="text-lg font-bold text-[var(--text-muted)] opacity-30 text-center">-</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-xl flex flex-col justify-center">
            <span className="text-xs text-[var(--text-muted)] mb-1">{t('citizen.score_title')}</span>
            <div className="flex items-center gap-1 justify-center">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
              <span className="font-bold text-[var(--text-muted)] opacity-30">--</span>
            </div>
          </div>
        </div>

        {/* Onboarding Swipeable Modal overlay */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-fadeIn">
             <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4 relative shadow-2xl">
                <button 
                  onClick={handleFinishOnboard}
                  className="absolute top-4 right-4 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Skip
                </button>
                <div className="py-6 flex flex-col items-center gap-4">
                   {onboardStep === 1 && (
                      <div className="flex flex-col items-center gap-3 animate-slideIn">
                         <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                            <Activity size={32} />
                         </div>
                         <h3 className="text-xl font-black font-manrope text-[var(--text-primary)]">{t('citizen.onboarding.step1_title')}</h3>
                         <p className="text-xs text-[var(--text-muted)] px-4">{t('citizen.onboarding.step1_desc')}</p>
                      </div>
                   )}
                   {onboardStep === 2 && (
                      <div className="flex flex-col items-center gap-3 animate-slideIn">
                         <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                            <Camera size={32} />
                         </div>
                         <h3 className="text-xl font-black font-manrope text-[var(--text-primary)]">{t('citizen.onboarding.step2_title')}</h3>
                         <p className="text-xs text-[var(--text-muted)] px-4">{t('citizen.onboarding.step2_desc')}</p>
                      </div>
                   )}
                   {onboardStep === 3 && (
                      <div className="flex flex-col items-center gap-3 animate-slideIn">
                         <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                            <Heart size={32} className="fill-amber-500" />
                          </div>
                         <h3 className="text-xl font-black font-manrope text-[var(--text-primary)]">{t('citizen.onboarding.step3_title')}</h3>
                         <p className="text-xs text-[var(--text-muted)] px-4">{t('citizen.onboarding.step3_desc')}</p>
                      </div>
                   )}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                   {[1, 2, 3].map(dot => (
                      <div key={dot} className={`w-1.5 h-1.5 rounded-full transition-all ${onboardStep === dot ? 'bg-emerald-500 w-4' : 'bg-slate-700'}`} />
                   ))}
                </div>
                <button 
                  onClick={() => onboardStep < 3 ? setOnboardStep(onboardStep + 1) : handleFinishOnboard()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold text-sm py-3 rounded-xl mt-4 transition-all"
                >
                  {onboardStep < 3 ? 'Continue' : 'Get Started'}
                </button>
             </div>
          </div>
        )}
        {/* Reporting Modal */}
        <PollutionReportModal 
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSubmit={handleReportSubmit}
        />
      </div>
    </CitizenLayout>
  );
}
