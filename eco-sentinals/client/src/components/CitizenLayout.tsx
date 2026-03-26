import { ReactNode, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Camera, Award } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useAuthGuardedQuery } from '../hooks/useAuthGuardedQuery';

export default function CitizenLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const isPreview = location.search.includes('preview=true');

  const { data: aqiData } = useAuthGuardedQuery<number>(async () => {
    if (!user) return { data: 0, error: null };
    const { data: profile } = await supabase.from('profiles').select('ward_id').eq('id', user.id).single();
    const wardId = profile?.ward_id;
    if (!wardId) return { data: 0, error: null };
    const { data: aqi } = await supabase.from('latest_ward_aqi').select('aqi_value').eq('ward_id', wardId).single();
    return { data: aqi?.aqi_value || 0, error: null };
  }, [user?.id]);

  const aqiValue = aqiData || 0;

  function getAQITint(aqi: number): string {
    if (aqi <= 0) return 'transparent';
    if (aqi <= 50)  return 'rgba(22, 163, 74, 0.06)';   // pale green
    if (aqi <= 100) return 'rgba(202, 138, 4, 0.06)';   // pale yellow
    if (aqi <= 150) return 'rgba(234, 88, 12, 0.07)';   // pale orange
    if (aqi <= 200) return 'rgba(220, 38, 38, 0.08)';   // pale red
    if (aqi <= 300) return 'rgba(124, 58, 237, 0.08)';  // pale purple
    return 'rgba(153, 27, 27, 0.10)';                   // dark red
  }

  const tintColor = useMemo(() => getAQITint(aqiValue), [aqiValue]);

  const tabs = [
    { label: 'Home', path: '/citizen/home', icon: Home },
    { label: 'Waste', path: '/citizen/waste', icon: Camera },
    { label: 'Score', path: '/citizen/score', icon: Award },
  ];

  return (
    <div 
      className="flex flex-col h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden transition-all duration-300"
      style={{ 
        background: `linear-gradient(180deg, ${tintColor} 0%, transparent 60%)`,
        transition: 'background 3s ease'
      }}
    >
      <style>{`
        @keyframes pulse-warn {
          0%, 100% { opacity: 0.07; }
          50% { opacity: 0.12; }
        }
        .aqi-tint-high { animation: pulse-warn 4s ease-in-out infinite; }
      `}</style>

      {/* Notch/Status Bar Area */}
      <div 
        className={`h-12 w-full transition-all duration-[3000ms] ease-in-out ${aqiValue > 150 ? 'aqi-tint-high' : ''}`}
        style={{ backgroundColor: tintColor }}
      />
      
      {/* Main Content section */}
      <main className={`flex-1 overflow-y-auto p-4 relative ${isPreview ? 'select-none pointer-events-none' : ''}`}>
        {children}
        {isPreview && (
          <div className="absolute inset-0 bg-transparent z-[999] cursor-not-allowed" title="Disabled in preview mode" />
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="min-h-[64px] pb-[env(safe-area-inset-bottom)] bg-[var(--bg-secondary)] border-t border-[var(--border)] flex justify-around items-center px-4 z-[1000]">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={`${tab.path}${isPreview ? '?preview=true' : ''}`}
            className={({ isActive }) => 
              `flex flex-col items-center cursor-pointer transition-colors ${
                isActive ? 'text-[var(--citizen-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${
              location.pathname === tab.path ? 'bg-[var(--citizen-primary)]/20' : ''
            }`}>
              <tab.icon size={20} />
            </div>
            <span className="text-[10px] font-bold mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </footer>
    </div>
  );
}
