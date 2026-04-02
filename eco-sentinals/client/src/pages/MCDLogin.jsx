import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MCDLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate secure auth
    setTimeout(() => {
      navigate('/mcd-dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dark Ambient Nodes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-900/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl w-full max-w-sm border border-slate-800 shadow-2xl relative z-10 animate-fade-in text-slate-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
            <span className="material-symbols-outlined text-emerald-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-white tracking-tight">EcoNode Command</h2>
          <p className="font-body text-slate-500 text-sm mt-2 text-center">Secure MCD and administrative access.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-headline text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Government ID / Email</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-body focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-600"
              placeholder="admin@delhi.gov.in"
            />
          </div>
          <div>
            <label className="block font-headline text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secure Passkey</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-body focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-600"
              placeholder="••••••••••••••"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-headline font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            ) : (
              <>
                <span>Authorize Access</span>
                <span className="material-symbols-outlined text-xl">vpn_key</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 flex justify-between text-center items-center">
          <button onClick={() => navigate('/')} className="text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">
            ← Abort
          </button>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">TLS 1.3 Secure</span>
        </div>
      </div>
    </div>
  );
};

export default MCDLogin;
