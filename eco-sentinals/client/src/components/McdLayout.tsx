import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Truck, ShieldAlert, BarChart3, Eye, Menu, X } from 'lucide-react';

export default function McdLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/mcd/dashboard', icon: LayoutDashboard },
    { label: 'Wards', path: '/mcd/wards', icon: Map },
    { label: 'Fleet', path: '/mcd/fleet', icon: Truck },
    { label: 'Policy', path: '/mcd/policy', icon: ShieldAlert },
    { label: 'Reports', path: '/mcd/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-[#0a0f0c] text-white">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1090] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-[#111814] p-4 border-r border-[#1e2922] flex flex-col fixed md:static inset-y-0 left-0 z-[1100] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-emerald-500"></div>
            <span className="text-xl font-bold tracking-tight text-[#3ecf8e]">Econode</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
             <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 p-3 text-sm font-semibold rounded-xl transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions footer panel linked to citizen preview */}
        <div className="border-t border-[#1e2922] pt-4 mt-auto flex flex-col gap-2">
          <NavLink
            to="/mcd/citizen-preview"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 text-sm font-semibold rounded-xl transition-all ${
                isActive 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
              }`
            }
          >
            <Eye size={18} />
            Preview Citizen View
          </NavLink>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#111814] border-b border-[#1e2922] flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
                <Menu size={24} />
             </button>
             <span className="font-semibold text-slate-200">MCD Officer View</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700"></div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
