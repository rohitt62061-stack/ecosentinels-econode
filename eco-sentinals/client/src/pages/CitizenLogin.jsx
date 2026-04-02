import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CitizenLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth flow
    setTimeout(() => {
      navigate('/citizen-app');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none animate-breathe"></div>
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl w-full max-w-sm border border-emerald-100 shadow-xl relative z-10 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-emerald-700 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-emerald-900 tracking-tight">Citizen Portal</h2>
          <p className="font-body text-slate-500 text-sm mt-2 text-center">Sign in to track local pollution and report issues.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-headline text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">EcoID or Phone</label>
            <input 
              type="text" 
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-body focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g. +91 98765 43210"
            />
          </div>
          <div>
            <label className="block font-headline text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-body focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            ) : (
              <>
                <span>Secure Login</span>
                <span className="material-symbols-outlined text-xl">login</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center flex flex-col gap-4">
          <button onClick={() => navigate('/')} className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            ← Back to Onboarding
          </button>
          
          <p className="text-xs text-slate-500 font-medium pt-4 border-t border-emerald-100">
            Don't have an EcoID?{' '}
            <button className="text-emerald-600 hover:text-emerald-700 font-bold underline transition-colors">
              Apply for Citizenship
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
