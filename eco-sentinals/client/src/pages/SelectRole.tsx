import { useNavigate } from 'react-router-dom';

export default function SelectRole() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-[var(--text-primary)] transition-colors duration-300">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-headline font-bold text-[var(--text-primary)]">Welcome to Econode</h1>
        <p className="text-[var(--text-muted)] mt-2">Select your access role to continue</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* MCD Card */}
        <div className="bg-[var(--mcd-primary)]/5 border border-[var(--border)] rounded-2xl p-6 flex flex-col items-start hover:border-[var(--accent)] transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-[var(--mcd-primary)] flex items-center justify-center mb-4 text-white">
            🏢
          </div>
          <h2 className="text-xl font-headline font-bold text-[var(--mcd-primary)] group-hover:text-[var(--accent)] transition-colors">MCD Officer</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Institutional Access</p>
          <p className="text-[var(--text-secondary)] text-sm mt-3 flex-1">
            Access real-time AQI heatmaps, fleet management, and governance dashboard.
          </p>
          <button 
            onClick={() => navigate('/mcd/login')}
            className="w-full mt-6 py-3 bg-[var(--mcd-primary)] hover:opacity-90 text-white rounded-xl font-semibold transition-all"
          >
            Continue
          </button>
        </div>

        {/* Citizen Card */}
        <div className="bg-[var(--citizen-primary)]/5 border border-[var(--border)] rounded-2xl p-6 flex flex-col items-start hover:border-[var(--accent)] transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-[var(--citizen-primary)] flex items-center justify-center mb-4 text-white">
            🌱
          </div>
          <h2 className="text-xl font-headline font-bold text-[var(--citizen-primary)] group-hover:text-[var(--accent)] transition-colors">Citizen Node</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Public Access</p>
          <p className="text-[var(--text-secondary)] text-sm mt-3 flex-1">
            Check local air quality, classify waste using AI, and earn Eco rewards.
          </p>
          <button 
            onClick={() => navigate('/citizen/login')}
            className="w-full mt-6 py-3 bg-[var(--citizen-primary)] hover:opacity-90 text-white rounded-xl font-semibold transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
