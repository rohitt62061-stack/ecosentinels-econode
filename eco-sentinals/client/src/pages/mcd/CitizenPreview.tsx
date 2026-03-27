import McdLayout from '../../components/McdLayout';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CitizenPreview() {
  const navigate = useNavigate();

  return (
    <McdLayout>
      <div className="flex flex-col h-full bg-[var(--bg-primary)] -m-6 transition-colors duration-300">
        
        {/* Navy Top Banner */}
        <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/mcd/dashboard')}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-200">🔍 MCD Preview Mode</span>
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[10px] text-slate-400 font-mono">Citizen Interface</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
             <span>All citizen interactions are logged-disabled for inspection</span>
          </div>
        </div>

        {/* Mobile Simulator viewport */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
           <div className="relative shadow-2xl">
              {/* Phone Frame Outline */}
              <div className="w-[375px] h-[750px] rounded-[40px] border-[12px] border-slate-900 bg-slate-950 overflow-hidden relative shadow-2xl shadow-emerald-950/20">
                 
                 {/* Top Notch Dynamic Island effect */}
                 <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-[1001]">
                    <div className="w-24 h-4 bg-slate-900 rounded-b-xl" />
                 </div>

                 {/* Simulated Content inside Iframe */}
                 <iframe 
                   src="/citizen/home?preview=true" 
                   className="w-full h-full border-none select-none"
                   title="Citizen App Preview"
                 />

              </div>

              {/* Decorative Subtle glow behind phone */}
              <div className="absolute inset-x-10 bottom-10 h-32 bg-emerald-500/10 filter blur-3xl -z-10" />
           </div>
        </div>

      </div>
    </McdLayout>
  );
}
