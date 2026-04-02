import React, { useState } from 'react';
import SideNav from '../components/mcd/SideNav';
import TopBar from '../components/mcd/TopBar';
import QuickStats from '../components/mcd/QuickStats';
import MapSection from '../components/mcd/MapSection';
import AQICommandCenter from '../components/mcd/AQICommandCenter';
import PolicyPanel from '../components/mcd/PolicyPanel';

const MCDDashboard = () => {
  const [deployActive, setDeployActive] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleDeploy = () => {
    setDeployActive(true);
    setTimeout(() => {
      setDeployActive(false);
      alert('Mobile Sensor Node successfully deployed to Delhi sector.');
    }, 1500);
  };

  const MOCK_HISTORY = [
    { id: 1, title: 'Outstanding Governance Award', date: 'March 2026', org: 'Delhi NCT' },
    { id: 2, title: 'Lowest PM2.5 Spike Response', date: 'February 2026', org: 'EcoNode Central' },
  ];

  return (
    <div className="bg-background text-on-surface flex min-h-screen overflow-hidden font-body relative">
      <SideNav activePage="dashboard" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden pl-64">
        <TopBar />

        {/* Dashboard Content Container */}
        <div className="flex-1 flex overflow-hidden mt-16 bg-surface-container/30">
          
          {/* Main Content Area (Map, Stats, Graph) */}
          <section className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto no-scrollbar pb-32">
            <QuickStats />
            <MapSection />
            <AQICommandCenter />
          </section>

          {/* Right Intelligence Panel */}
          <PolicyPanel />
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-12 z-50 flex flex-col items-end gap-3">
          <button 
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-3 px-5 py-3 bg-indigo-900 text-white rounded-full shadow-lg hover:bg-indigo-800 transition-all border border-indigo-700 active:scale-95"
          >
            <span className="material-symbols-outlined text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span className="font-headline font-bold tracking-tight text-xs uppercase text-indigo-100">History Honors</span>
          </button>

          <button 
            onClick={handleDeploy}
            disabled={deployActive}
            className="flex items-center gap-3 px-6 py-4 bg-[#0d1d2a] text-white rounded-full shadow-2xl hover:bg-slate-800 transition-all border border-slate-700 active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {deployActive ? (
              <span className="material-symbols-outlined text-primary-container animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            )}
            <span className="font-headline font-bold tracking-tight text-sm text-primary-fixed-dim">Deploy Mobile Sensor Node</span>
          </button>
        </div>

        {/* History Honors Modal */}
        {historyOpen && (
          <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-fade-in p-6">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-slide-up relative">
              <button 
                onClick={() => setHistoryOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-indigo-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                <h2 className="font-headline font-extrabold text-2xl tracking-tight text-slate-900">History Honors</h2>
              </div>

              <div className="space-y-4">
                {MOCK_HISTORY.map((award) => (
                  <div key={award.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col gap-1">
                    <h3 className="font-bold text-indigo-900">{award.title}</h3>
                    <p className="text-sm font-medium text-indigo-600/80">{award.org} • {award.date}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 border-t pt-4">NCT Governance Archive</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default MCDDashboard;
