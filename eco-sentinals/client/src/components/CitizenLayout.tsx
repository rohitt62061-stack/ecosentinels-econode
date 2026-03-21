import { ReactNode } from 'react';

export default function CitizenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-[#0a0f0c] text-white">
      {/* Main Content section */}
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <footer className="h-16 bg-[#111814] border-t border-[#1e2922] flex justify-around items-center px-4">
        <div className="flex flex-col items-center cursor-pointer text-[#3ecf8e]">
          <div className="w-6 h-6 rounded bg-[#1a5c3a]/30 flex items-center justify-center">H</div>
          <span className="text-xs mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-slate-300">
          <div className="w-6 h-6 flex items-center justify-center">W</div>
          <span className="text-xs mt-1">Waste</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-slate-300">
          <div className="w-6 h-6 flex items-center justify-center">S</div>
          <span className="text-xs mt-1">Score</span>
        </div>
      </footer>
    </div>
  );
}
