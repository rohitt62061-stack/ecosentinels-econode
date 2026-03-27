import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from '../components/mcd/SideNav';
import TopBar from '../components/mcd/TopBar';

const MCDProfile = () => {
  const navigate = useNavigate();
  // MCD defaults to dark, but we allow toggle to light
  const [theme, setTheme] = useState('dark');

  const toggleTheme = (mode) => {
    setTheme(mode);
    alert(`MCD Theme switched to ${mode} mode.`);
  };

  const handleAction = (action) => {
    alert(`Secure MCD Dialog: ${action} initiated...`);
  };

  return (
    <div className={`font-body antialiased overflow-hidden h-screen flex transition-colors ${theme === 'dark' ? 'bg-surface text-on-surface' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar remains dark contextually for MCD */}
      <SideNav activePage="settings" />

      {/* Main Content Area */}
      <main className="ml-64 relative h-screen overflow-hidden flex flex-col flex-1">
        <TopBar />

        {/* Dynamic Content Canvas */}
        <div className={`mt-16 flex-1 flex relative overflow-y-auto p-8 transition-colors ${theme === 'dark' ? 'bg-surface-container-lowest' : 'bg-slate-100'}`}>
          <div className="max-w-xl w-full mx-auto animate-slide-up space-y-6">
            
            {/* Header Block */}
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => navigate('/mcd-dashboard')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                title="Back to Dashboard"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className={`text-2xl font-headline font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Official Settings</h1>
            </div>

            {/* Profile Info */}
            <div className={`rounded-3xl p-8 flex flex-col items-center shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mb-4 border-4 border-emerald-900/50 shadow-md">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <h2 className={`text-2xl font-bold font-headline ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Admin Delhi</h2>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 mb-6">NCT Governance • Access Level 4</p>
              
              <div className={`w-full rounded-2xl p-4 flex flex-wrap justify-center gap-2 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>Okhla Industrial</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>Rohini Sector 12</span>
              </div>
            </div>

            {/* Appearance Settings */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">Appearance</h3>
              <div className={`rounded-2xl overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <button onClick={() => toggleTheme('light')} className={`w-full flex items-center justify-between p-4 ${theme === 'dark' ? 'border-b border-slate-700' : 'border-b border-slate-100'}`}>
                  <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="material-symbols-outlined text-slate-400">light_mode</span>
                    <span className="font-semibold text-sm">Light Mode</span>
                  </div>
                  {theme === 'light' && <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
                </button>
                <button onClick={() => toggleTheme('dark')} className={`w-full flex items-center justify-between p-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                    <span className="font-semibold text-sm">Dark Mode</span>
                  </div>
                  {theme === 'dark' && <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">Account Security</h3>
              <div className={`rounded-2xl overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <button onClick={() => handleAction('Account Management')} className={`w-full flex items-center p-4 gap-3 ${theme === 'dark' ? 'border-b border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-b border-slate-100 hover:bg-slate-50 text-slate-700'}`}>
                  <span className="material-symbols-outlined text-slate-400 bg-slate-500/10 p-1.5 rounded-lg">manage_accounts</span>
                  <span className="font-semibold text-sm text-left flex-1">Managing Account</span>
                  <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
                </button>
                <button onClick={() => handleAction('Account Recovery')} className={`w-full flex items-center p-4 gap-3 ${theme === 'dark' ? 'border-b border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-b border-slate-100 hover:bg-slate-50 text-slate-700'}`}>
                  <span className="material-symbols-outlined text-slate-400 bg-slate-500/10 p-1.5 rounded-lg">health_and_safety</span>
                  <span className="font-semibold text-sm text-left flex-1">Recovery Account</span>
                  <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
                </button>
                <button onClick={() => handleAction('Password Reset')} className={`w-full flex items-center p-4 gap-3 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                  <span className="material-symbols-outlined text-slate-400 bg-slate-500/10 p-1.5 rounded-lg">lock_reset</span>
                  <span className="font-semibold text-sm text-left flex-1">Forget Password</span>
                  <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Logout */}
            <button 
              onClick={() => navigate('/mcd-login')}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all mt-4
                ${theme === 'dark' ? 'bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}
              `}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Secure Logout
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default MCDProfile;
