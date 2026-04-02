import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CitizenProfile = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  const toggleTheme = (mode) => {
    setTheme(mode);
    alert(`Theme switched to ${mode} mode.`);
  };

  const handleAction = (action) => {
    alert(`Opening ${action} dialog...`);
  };

  return (
    <div className={`font-body antialiased overflow-hidden min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-surface text-on-surface'}`}>
      
      {/* Header */}
      <header className={`p-6 flex items-center justify-between sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-surface/80'} backdrop-blur-md`}>
        <button 
          onClick={() => navigate('/citizen-app')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white shadow-sm text-slate-500'}`}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-headline font-extrabold tracking-tight">Profile & Settings</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content Areas */}
      <main className="px-6 pb-20 space-y-6 max-w-md mx-auto animate-slide-up">
        
        {/* Profile Card */}
        <div className={`p-6 rounded-3xl flex flex-col items-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} border`}>
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 border-4 border-emerald-50">
            <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <h2 className={`text-xl font-bold font-headline ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Eco Citizen</h2>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1 mb-4">Level 3 Contributor</p>
          <div className="flex gap-4 text-center">
            <div>
              <p className="font-extrabold text-lg">14</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Reports</p>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div>
              <p className="font-extrabold text-lg text-emerald-600">850</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Points</p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-2">Appearance</h3>
          <div className={`rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            <button onClick={() => toggleTheme('light')} className={`w-full flex items-center justify-between p-4 ${theme === 'dark' ? 'border-b border-slate-700' : 'border-b border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">light_mode</span>
                <span className="font-semibold text-sm">Light Mode</span>
              </div>
              {theme === 'light' && <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
            </button>
            <button onClick={() => toggleTheme('dark')} className="w-full flex items-center justify-between p-4">
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
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-2">Account Security</h3>
          <div className={`rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            <button onClick={() => handleAction('Account Management')} className={`w-full flex items-center p-4 gap-3 ${theme === 'dark' ? 'border-b border-slate-700 hover:bg-slate-700' : 'border-b border-slate-100 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-slate-400 bg-slate-100/10 p-1.5 rounded-lg">manage_accounts</span>
              <span className="font-semibold text-sm text-left flex-1">Managing Account</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
            </button>
            <button onClick={() => handleAction('Account Recovery')} className={`w-full flex items-center p-4 gap-3 ${theme === 'dark' ? 'border-b border-slate-700 hover:bg-slate-700' : 'border-b border-slate-100 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-slate-400 bg-slate-100/10 p-1.5 rounded-lg">health_and_safety</span>
              <span className="font-semibold text-sm text-left flex-1">Recovery Account</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
            </button>
            <button onClick={() => handleAction('Password Reset')} className={`w-full flex items-center p-4 gap-3 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-slate-400 bg-slate-100/10 p-1.5 rounded-lg">lock_reset</span>
              <span className="font-semibold text-sm text-left flex-1">Forget Password</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={() => navigate('/')}
          className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all
            ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-900/50 border hover:bg-red-900/40' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}
          `}
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Secure Logout
        </button>

      </main>
    </div>
  );
};

export default CitizenProfile;
