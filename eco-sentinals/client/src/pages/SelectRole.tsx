import { useNavigate } from 'react-router-dom';

export default function SelectRole() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0c] flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-headline font-bold text-slate-100">Welcome to Econode</h1>
        <p className="text-slate-400 mt-2">Select your access role to continue</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* MCD Card */}
        <div className="bg-[#1a3560]/10 border border-[#1a3560]/30 rounded-2xl p-6 flex flex-col items-start hover:border-[#33508a]/60 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-[#1a3560] flex items-center justify-center mb-4 text-[#33508a]">
            🏢
          </div>
          <h2 className="text-xl font-headline font-bold text-[#33508a] group-hover:text-blue-400 transition-colors">MCD Officer</h2>
          <p className="text-slate-400 text-sm mt-1">Institutional Access</p>
          <p className="text-slate-300 text-sm mt-3 flex-1">
            Access real-time AQI heatmaps, fleet management, and governance dashboard.
          </p>
          <button 
            onClick={() => navigate('/mcd/login')}
            className="w-full mt-6 py-3 bg-[#1a3560] hover:bg-[#204278] text-white rounded-xl font-semibold transition-colors"
          >
            Continue
          </button>
        </div>

        {/* Citizen Card */}
        <div className="bg-[#1a5c3a]/10 border border-[#1a5c3a]/30 rounded-2xl p-6 flex flex-col items-start hover:border-[#247c50]/60 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-[#1a5c3a] flex items-center justify-center mb-4 text-[#3ecf8e]">
            🌱
          </div>
          <h2 className="text-xl font-headline font-bold text-[#3ecf8e]">Citizen Node</h2>
          <p className="text-slate-400 text-sm mt-1">Public Access</p>
          <p className="text-slate-300 text-sm mt-3 flex-1">
            Check local air quality, classify waste using AI, and earn Eco rewards.
          </p>
          <button 
            onClick={() => navigate('/citizen/login')}
            className="w-full mt-6 py-3 bg-[#1a5c3a] hover:bg-[#207248] text-white rounded-xl font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
