import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Camera, Award } from 'lucide-react';

export default function CitizenLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPreview = location.search.includes('preview=true');

  const tabs = [
    { label: 'Home', path: '/citizen/home', icon: Home },
    { label: 'Waste', path: '/citizen/waste', icon: Camera },
    { label: 'Score', path: '/citizen/score', icon: Award },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0a0f0c] text-white overflow-hidden">
      
      {/* Main Content section */}
      <main className={`flex-1 overflow-y-auto p-4 relative ${isPreview ? 'select-none pointer-events-none' : ''}`}>
        {children}
        {isPreview && (
          <div className="absolute inset-0 bg-transparent z-[999] cursor-not-allowed" title="Disabled in preview mode" />
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="min-h-[64px] pb-[env(safe-area-inset-bottom)] bg-[#111814] border-t border-[#1e2922] flex justify-around items-center px-4 z-[1000]">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={`${tab.path}${isPreview ? '?preview=true' : ''}`}
            className={({ isActive }) => 
              `flex flex-col items-center cursor-pointer transition-colors ${
                isActive ? 'text-[#3ecf8e]' : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${
              location.pathname === tab.path ? 'bg-[#1a5c3a]/30' : ''
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
