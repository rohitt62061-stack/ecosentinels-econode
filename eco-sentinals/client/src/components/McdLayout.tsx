import { ReactNode } from 'react';

export default function McdLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0a0f0c] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#111814] p-4 border-r border-[#1e2922] flex flex-col">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 rounded bg-emerald-500"></div>
          <span className="text-xl font-bold tracking-tight text-[#3ecf8e]">Econode</span>
        </div>
        <nav className="flex-1 space-y-1">
          <div className="p-3 text-slate-300 hover:bg-emerald-950/30 hover:text-[#3ecf8e] rounded-lg cursor-pointer transition-colors">Dashboard</div>
          <div className="p-3 text-slate-400 hover:bg-emerald-950/30 hover:text-[#3ecf8e] rounded-lg cursor-pointer transition-colors">Wards</div>
          <div className="p-3 text-slate-400 hover:bg-emerald-950/30 hover:text-[#3ecf8e] rounded-lg cursor-pointer transition-colors">Fleet</div>
          <div className="p-3 text-slate-400 hover:bg-emerald-950/30 hover:text-[#3ecf8e] rounded-lg cursor-pointer transition-colors">Policy</div>
          <div className="p-3 text-slate-400 hover:bg-emerald-950/30 hover:text-[#3ecf8e] rounded-lg cursor-pointer transition-colors">Reports</div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-[#111814] border-b border-[#1e2922] flex items-center justify-between px-6">
          <span className="font-semibold text-slate-200">MCD Officer View</span>
          <div className="w-8 h-8 rounded-full bg-slate-700"></div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
