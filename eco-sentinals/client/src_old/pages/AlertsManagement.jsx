import React from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../components/mcd/SideNav';

const ALERTS_DATA = [
  {
    priority: 'Critical',
    priorityClass: 'bg-tertiary/10 text-tertiary',
    dotClass: 'bg-tertiary',
    type: 'PM 2.5 Spike',
    typeIcon: 'air',
    typeIconColor: 'text-tertiary',
    location: 'Okhla Industrial',
    time: '2 mins ago',
    statusLabel: 'Investigating',
    statusClass: 'bg-orange-100 text-orange-700',
    action: 'Deploy Team',
    actionClass: 'bg-primary text-on-primary',
  },
  {
    priority: 'Warning',
    priorityClass: 'bg-orange-100 text-orange-600',
    dotClass: 'bg-orange-500',
    type: 'Water Contamination',
    typeIcon: 'water_drop',
    typeIconColor: 'text-blue-500',
    location: 'Connaught Place',
    time: '15 mins ago',
    statusLabel: 'Action Needed',
    statusClass: 'bg-tertiary/10 text-tertiary',
    action: 'Notify Residents',
    actionClass: 'text-primary border border-primary',
  },
  {
    priority: 'Low',
    priorityClass: 'bg-slate-200 text-slate-600',
    dotClass: 'bg-slate-400',
    type: 'Waste Collection Delay',
    typeIcon: 'delete_sweep',
    typeIconColor: 'text-secondary',
    location: 'Vasant Kunj',
    time: '1 hour ago',
    statusLabel: 'Under Review',
    statusClass: 'bg-surface-container-high text-on-surface-variant',
    action: 'Assign Driver',
    actionClass: 'text-primary border border-primary',
  },
  {
    priority: 'Critical',
    priorityClass: 'bg-tertiary/10 text-tertiary',
    dotClass: 'bg-tertiary',
    type: 'Grid Overload',
    typeIcon: 'electric_bolt',
    typeIconColor: 'text-orange-600',
    location: 'Dwarka Sec 10',
    time: '3 hours ago',
    statusLabel: 'Investigating',
    statusClass: 'bg-orange-100 text-orange-700',
    action: 'Reroute Power',
    actionClass: 'bg-primary text-on-primary',
  },
];

const FILTERS = ['All Alerts (24)', 'Critical (4)', 'Warning (12)', 'Resolved (8)'];

const AlertsManagement = () => {
  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <SideNav activePage="alerts" />

      <main className="flex-1 ml-64 flex flex-col">
        {/* Top Bar */}
        <header className="w-full sticky top-0 bg-slate-50 shadow-sm flex justify-between items-center px-6 py-3 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search parameters, districts, or alerts..."
                className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-container outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="text-slate-500 hover:bg-emerald-50 p-2 rounded-full transition-colors relative active:scale-95">
              <span className="material-symbols-outlined">notifications_active</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-slate-50"></span>
            </button>
            <Link to="/citizen-profile">
              <button className="text-slate-500 hover:bg-emerald-50 p-2 rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8 flex flex-col lg:flex-row gap-8 overflow-y-auto no-scrollbar">
          {/* Left: Alerts Feed */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Environmental Alerts Management</h1>
              <p className="text-secondary font-label text-sm mt-1">Real-time monitoring and deployment interface for city-wide hazards.</p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {FILTERS.map((f, i) => (
                <button
                  key={f}
                  className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors
                    ${i === 0
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Alerts Table */}
            <div className="bg-surface-container-low rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/50 text-secondary uppercase text-[10px] font-bold tracking-widest">
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Alert Type</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/30">
                    {ALERTS_DATA.map(({ priority, priorityClass, dotClass, type, typeIcon, typeIconColor, location, time, statusLabel, statusClass, action, actionClass }) => (
                      <tr key={`${type}-${location}`} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${priorityClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                            {priority}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${typeIconColor}`}>{typeIcon}</span>
                            <span className="font-semibold text-sm">{type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-secondary">{location}</td>
                        <td className="px-6 py-5 text-sm text-secondary">{time}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[11px] font-bold ${statusClass}`}>{statusLabel}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className={`text-xs font-bold py-2 px-4 rounded-lg transition-all active:scale-95 ${actionClass}`}>{action}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Analytics Panel */}
          <aside className="w-full lg:w-96 space-y-6">
            {/* Daily Frequency Chart */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="font-bold text-sm mb-4 flex justify-between items-center">
                Daily Alert Frequency
                <span className="text-[10px] text-primary font-bold">+12% vs yesterday</span>
              </h3>
              <div className="h-32 flex items-end gap-1.5">
                {[40, 65, 85, 50, 75, 95, 60].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                    style={{ height: `${h}%`, background: i === 3 ? '#50c878' : '#edeeef' }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-secondary font-medium">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
              </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="font-bold text-sm mb-6">Alerts by District</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                    <circle className="text-surface-container-low" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="12"/>
                    <circle className="text-primary-container" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset="120" strokeWidth="12"/>
                    <circle className="text-secondary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset="260" strokeWidth="12"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black">24</span>
                    <span className="text-[8px] uppercase tracking-tighter text-secondary">Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Central', pct: '60%', color: 'bg-primary-container' },
                    { label: 'North',   pct: '25%', color: 'bg-secondary' },
                    { label: 'Other',   pct: '15%', color: 'bg-surface-container-high' },
                  ].map(({ label, pct, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                      <div className="flex-1 flex justify-between text-[11px] font-bold">
                        <span>{label}</span><span>{pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-bold text-sm mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { icon: 'check', iconClass: 'text-primary bg-primary-container/20', text: 'Sensor ID #892 Resolved', sub: 'PM 10 levels stabilized in South Ext.', time: '12 mins ago' },
                  { icon: 'group', iconClass: 'text-on-secondary-container bg-secondary-container/30', text: 'Team Alpha Deployed', sub: 'Responding to leakage in Karol Bagh.', time: '45 mins ago' },
                  { icon: 'check', iconClass: 'text-primary bg-primary-container/20', text: 'Protocol Automated', sub: 'Grid re-balancing completed.', time: '2 hours ago' },
                ].map(({ icon, iconClass, text, sub, time }) => (
                  <div key={text} className="flex gap-3">
                    <div className={`w-5 h-5 rounded-full ${iconClass} flex items-center justify-center z-10 flex-shrink-0`}>
                      <span className="material-symbols-outlined text-[12px]">{icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">{text}</p>
                      <p className="text-[10px] text-secondary mt-0.5">{sub}</p>
                      <p className="text-[10px] font-medium text-primary mt-1">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 border border-outline-variant rounded-lg text-xs font-bold text-secondary hover:bg-white hover:border-primary-container transition-all">
                View Full Audit Log
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_alert</span>
      </button>
    </div>
  );
};

export default AlertsManagement;
