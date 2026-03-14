import React, { useState } from 'react';
import { Camera, Scan, CheckCircle, XCircle } from 'lucide-react';

const WasteScanner = () => {
  const [scanState, setScanState] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'wrong'

  const handleScan = () => {
    setScanState('scanning');
    
    // Simulate API call/ML processing for 1.5 seconds
    setTimeout(() => {
      // 80% chance of correct segregation for demo purposes
      const isCorrect = Math.random() > 0.2;
      setScanState(isCorrect ? 'success' : 'wrong');
      
      // Reset after showing result
      setTimeout(() => setScanState('idle'), 2500);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-mcd-dark-surface rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center transition-colors duration-300">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scan size={20} className="text-mcd-primary dark:text-mcd-success" />
          Segregate & Earn
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
          Point Camera at Bin
        </span>
      </div>

      {/* Simulated Camera Viewfinder */}
      <div 
        className={`relative w-full aspect-square max-w-sm rounded-2xl bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center border-4 transition-all duration-300 ${
          scanState === 'success' ? 'border-mcd-success shadow-[0_0_30px_rgba(42,157,143,0.4)]' : 
          scanState === 'wrong' ? 'border-mcd-danger shadow-[0_0_30px_rgba(231,111,81,0.4)]' : 
          scanState === 'scanning' ? 'border-mcd-accent animate-pulse' : 
          'border-slate-800 dark:border-slate-700'
        }`}
      >
        {/* Viewfinder Target Reticle */}
        <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60 -translate-x-1 -translate-y-1 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60 translate-x-1 -translate-y-1 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60 -translate-x-1 translate-y-1 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60 translate-x-1 translate-y-1 rounded-br-lg"></div>
        </div>

        {/* State Content inside Camera */}
        {scanState === 'idle' && (
          <Camera size={48} className="text-white/40" />
        )}
        
        {scanState === 'scanning' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full absolute top-0 left-0 h-1 bg-mcd-accent animate-[scan_1.5s_ease-in-out_infinite] shadow-[0_0_15px_#FB8B24]"></div>
            <p className="text-mcd-accent font-bold font-mono tracking-widest text-sm animate-pulse">
              ANALYZING WASTE...
            </p>
          </div>
        )}

        {scanState === 'success' && (
          <div className="absolute inset-0 bg-mcd-success/20 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
            <CheckCircle size={64} className="text-white drop-shadow-lg mb-2" />
            <p className="text-white font-bold text-lg drop-shadow">Perfect Match!</p>
            <p className="text-white/80 text-sm font-mono">+50 pts Added</p>
          </div>
        )}

        {scanState === 'wrong' && (
          <div className="absolute inset-0 bg-mcd-danger/20 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
            <XCircle size={64} className="text-white drop-shadow-lg mb-2" />
            <p className="text-white font-bold text-lg drop-shadow">Check Bin Label</p>
            <p className="text-white/80 text-sm">Please re-segregate</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        onClick={handleScan}
        disabled={scanState !== 'idle'}
        className={`mt-6 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
          scanState !== 'idle' 
            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-70' 
            : 'bg-mcd-primary hover:bg-mcd-primary/90 hover:shadow-xl'
        }`}
      >
        <Scan size={20} />
        {scanState === 'idle' ? 'Tap to Scan Waste' : 'Scanning...'}
      </button>

      {/* Custom Keyframes for Scan line */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WasteScanner;
