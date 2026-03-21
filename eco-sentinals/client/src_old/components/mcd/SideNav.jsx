import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'mobile_layout',  label: 'Dashboard', to: '/mcd-dashboard' },
  { id: 'maps',      icon: 'map',            label: 'Maps',      to: '/mcd-dashboard' },
  { id: 'alerts',    icon: 'notifications',  label: 'Alerts',    to: '/alerts-management' },
  { id: 'policy',    icon: 'gavel',          label: 'Policy',    to: '/mcd-dashboard' },
  { id: 'settings',  icon: 'settings',       label: 'Settings',  to: '/mcd-profile' },
];

const SideNav = ({ activePage }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#0d1d2a] flex flex-col justify-between py-8 px-4 border-r-0 h-screen fixed left-0 top-0 z-40">
      <div className="flex flex-col gap-8">
        <div className="px-3">
          <h1 className="font-headline text-white text-xl font-bold tracking-tight">EcoNode</h1>
          <p className="text-secondary-fixed-dim text-xs font-medium uppercase tracking-widest mt-1">Delhi Governance</p>
        </div>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ id, icon, label, to }) => {
            const isActive = activePage === id || (activePage === 'dashboard' && id === 'dashboard' && location.pathname === '/mcd-dashboard');
            return (
              <Link
                key={id}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive
                    ? 'bg-primary text-white'
                    : 'text-secondary-fixed-dim hover:bg-white/5'
                  }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                <span className="font-medium text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 flex items-center gap-3">
        <Link to="/mcd-profile" className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-white/10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-slate-500" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </Link>
        <div className="flex flex-col cursor-pointer" onClick={() => window.location.href='/mcd-profile'}>
          <span className="text-white text-sm font-semibold hover:underline">Admin User</span>
          <span className="text-secondary-fixed-dim text-xs">Commissioner</span>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
