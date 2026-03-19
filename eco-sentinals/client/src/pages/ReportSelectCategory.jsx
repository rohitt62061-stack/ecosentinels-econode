import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'air',
    span: 'md:col-span-4',
    icon: 'air',
    iconBg: 'bg-primary-container',
    iconColor: 'text-on-primary-container',
    title: 'Air Quality',
    desc: 'Report smoke, persistent odors, or localized pollution spikes affecting your area.',
    size: 'large',
  },
  {
    id: 'water',
    span: 'md:col-span-2',
    icon: 'water_drop',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
    title: 'Water Quality',
    desc: 'Contamination or leaks.',
    size: 'small',
  },
  {
    id: 'waste',
    span: 'md:col-span-2',
    icon: 'delete_outline',
    iconBg: 'bg-surface-container-highest',
    iconColor: 'text-on-surface-variant',
    title: 'Waste',
    desc: 'Missed collection or illegal dumping.',
    size: 'small',
  },
  {
    id: 'grid',
    span: 'md:col-span-4',
    icon: 'bolt',
    iconBg: 'bg-tertiary-container',
    iconColor: 'text-on-tertiary-container',
    title: 'Grid Issues',
    desc: 'Street lights, power fluctuations, or damaged infrastructure.',
    size: 'wide',
  },
  {
    id: 'other',
    span: 'md:col-span-6',
    icon: 'more_horiz',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-secondary',
    title: 'Other Concerns',
    desc: null,
    size: 'full',
  },
];

const ReportSelectCategory = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="w-full top-0 sticky z-50 bg-slate-50">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-200/50 transition-colors text-emerald-700"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-lg tracking-tight text-emerald-700">Report Issue</h1>
          </div>
          <Link to="/" className="text-xl font-extrabold font-headline text-emerald-800">CivicPulse</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-12 pb-32">
        {/* Hero Header */}
        <div className="mb-12">
          <span className="text-secondary font-label font-semibold mb-3 block tracking-wider text-xs uppercase">New Report</span>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight leading-tight">
            What are you reporting?
          </h2>
          <p className="text-on-surface-variant mt-4 text-lg max-w-2xl font-body">
            Select the category that best fits the environmental or civic infrastructure concern you've observed in your neighborhood.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {CATEGORIES.map(({ id, span, icon, iconBg, iconColor, title, desc, size }) => (
            <div key={id} className={`${span} group cursor-pointer`}>
              {size === 'full' ? (
                <div className="h-full bg-surface-container-low rounded-xl p-6 transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-[0px_20px_40px_rgba(25,28,29,0.06)] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center ${iconColor}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <h3 className="font-headline font-bold text-lg">{title}</h3>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">navigate_next</span>
                </div>
              ) : size === 'wide' ? (
                <div className="h-full bg-surface-container-low rounded-xl p-8 transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-[0px_20px_40px_rgba(25,28,29,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex gap-6">
                    <div className={`w-14 h-14 ${iconBg} rounded-lg flex-shrink-0 flex items-center justify-center ${iconColor}`}>
                      <span className="material-symbols-outlined text-3xl">{icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-2xl mb-2">{title}</h3>
                      <p className="text-on-surface-variant max-w-xs">{desc}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-primary px-6 py-3 rounded-md text-on-primary font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
                      Select
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-surface-container-low rounded-xl p-8 transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-[0px_20px_40px_rgba(25,28,29,0.06)] flex flex-col justify-between relative overflow-hidden">
                  {size === 'large' && (
                    <div className="absolute -right-12 -top-12 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>{icon}</span>
                    </div>
                  )}
                  <div>
                    <div className={`w-14 h-14 ${iconBg} rounded-lg flex items-center justify-center mb-6 ${iconColor}`}>
                      <span className="material-symbols-outlined text-3xl">{icon}</span>
                    </div>
                    <h3 className={`font-headline font-bold mb-2 ${size === 'large' ? 'text-2xl' : 'text-xl'}`}>{title}</h3>
                    <p className={`text-on-surface-variant ${size === 'small' ? 'text-sm' : 'max-w-sm'}`}>{desc}</p>
                  </div>
                  <div className="mt-8 flex items-center text-primary font-semibold">
                    {size === 'large' ? (
                      <>
                        <span>Begin report</span>
                        <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </>
                    ) : (
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">trending_flat</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Trust Bar */}
        <div className="mt-12 p-8 bg-surface-container rounded-xl flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full border-2 border-primary-container p-1">
              <div className="w-full h-full rounded-full bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
            </div>
            <div>
              <h4 className="font-headline font-bold text-on-surface">Trusted Reporting</h4>
              <p className="text-sm text-on-surface-variant">Your reports are routed directly to verified city agencies.</p>
            </div>
          </div>
          <div className="flex items-center -space-x-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-primary-container/30 border-2 border-surface-container-lowest flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-[10px] text-on-primary font-bold border-2 border-surface-container-lowest">12k+</div>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 rounded-t-3xl bg-white/70 backdrop-blur-xl shadow-[0px_-10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center px-4 pb-6 pt-3">
          {[
            { icon: 'home', label: 'Home', to: '/citizen-app', active: false },
            { icon: 'map', label: 'Map', to: '/citizen-app', active: false },
            { icon: 'add_circle', label: 'Report', to: '/report', active: true },
            { icon: 'person', label: 'Profile', to: '/citizen-profile', active: false },
          ].map(({ icon, label, to, active }) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all active:scale-95
                ${active ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:text-emerald-500'}`}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
              <span className="font-headline text-[11px] font-semibold tracking-wide">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ReportSelectCategory;
