import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Truck, ShieldAlert, BarChart3, Eye, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import NavbarThemeToggle from './mcd/NavbarThemeToggle';

export default function McdLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useTheme();

  const navItems = [
    { label: 'Dashboard', path: '/mcd/dashboard', icon: LayoutDashboard },
    { label: 'Wards', path: '/mcd/wards', icon: Map },
    { label: 'Fleet', path: '/mcd/fleet', icon: Truck },
    { label: 'Policy', path: '/mcd/policy', icon: ShieldAlert },
    { label: 'Reports', path: '/mcd/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1090] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-[var(--bg-secondary)] p-4 border-r border-[var(--border)] flex flex-col fixed md:static inset-y-0 left-0 z-[1100] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-between mb-8">
          <Logo showText />
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
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
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions footer panel linked to citizen preview */}
        <div className="border-t border-[var(--border)] pt-4 mt-auto flex flex-col gap-2">
          <NavLink
            to="/mcd/citizen-preview"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 text-sm font-semibold rounded-xl transition-all ${
                isActive 
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
              }`
            }
          >
            <Eye size={18} />
            Preview Citizen View
          </NavLink>
          <NavLink
            to="/mcd/settings/users"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 text-sm font-semibold rounded-xl transition-all ${
                isActive 
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
              }`
            }
          >
            <ShieldAlert size={18} />
            Manage Officers
          </NavLink>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-6 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <Menu size={24} />
             </button>
             <span className="font-semibold text-[var(--text-primary)]">MCD Officer View</span>
          </div>

          <div className="flex items-center gap-4">
            <NavbarThemeToggle />
            <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
              <BarChart3 size={16} />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
