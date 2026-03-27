import { useNavigate } from 'react-router-dom';

export default function SelectRole() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col items-center justify-center p-8 text-[var(--text-primary)] transition-colors duration-500">
      {/* Editorial Header */}
      <div className="text-center mb-16 max-w-lg">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4 block">
          Municipal Access Gateway
        </span>
        <h1 
          className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary)]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          Select Your Mandate
        </h1>
        <div className="w-16 h-[1px] bg-[var(--primary)] opacity-10 mx-auto mt-6"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* MCD Card - Level 2 Surface */}
        <div 
          onClick={() => navigate('/mcd/login')}
          className="group relative bg-[var(--surface-container)] rounded-[var(--radius-lg)] p-8 flex flex-col items-start transition-all duration-300 cursor-pointer hover:bg-[var(--surface-container-highest)]"
        >
          <div className="mb-8 p-4 rounded-full bg-[var(--surface-container-highest)] text-[var(--primary)] group-hover:scale-110 transition-transform duration-500">
            <span className="text-2xl">🏛️</span>
          </div>
          
          <h2 
            className="text-2xl font-bold mb-2 text-[var(--primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            MCD Officer
          </h2>
          <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-widest mb-6">
            Institutional Governance
          </p>
          
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-10 flex-1">
            Access hyper-local intelligence, real-time AQI heatmaps, and fleet orchestration protocols.
          </p>
          
          <button 
            className="w-full py-4 text-xs font-bold uppercase tracking-widest text-[#ffffff] rounded-[var(--radius-md)] transition-all duration-300 group-hover:shadow-[var(--shadow-ambient)]"
            style={{ 
              background: 'linear-gradient(145deg, var(--primary-container), var(--primary))'
            }}
          >
            Authenticate
          </button>

          {/* Overlapping Detail Element */}
          <div className="absolute top-4 right-4 text-[40px] opacity-10 font-bold italic" style={{ fontFamily: 'var(--font-display)' }}>
            01
          </div>
        </div>

        {/* Citizen Card - Level 1 Surface for intentional asymmetry */}
        <div 
          onClick={() => navigate('/citizen/login')}
          className="group relative bg-[var(--surface-container-low)] rounded-[var(--radius-lg)] p-8 flex flex-col items-start transition-all duration-300 cursor-pointer hover:bg-[var(--surface-container)]"
        >
          <div className="mb-8 p-4 rounded-full bg-[var(--surface-container)] text-[var(--primary)] group-hover:scale-110 transition-transform duration-500">
            <span className="text-2xl">🌱</span>
          </div>
          
          <h2 
            className="text-2xl font-bold mb-2 text-[var(--primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Citizen Node
          </h2>
          <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-widest mb-6">
            Public Metabolism
          </p>
          
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-10 flex-1">
            Monitor local breathing zones, verify waste metabolism, and claim community eco-dividends.
          </p>
          
          <button 
            className="w-full py-4 text-xs font-bold uppercase tracking-widest text-[var(--primary)] rounded-[var(--radius-md)] border border-[var(--outline-variant)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300"
          >
            Initialize Access
          </button>

          {/* Overlapping Detail Element */}
          <div className="absolute top-4 right-4 text-[40px] opacity-10 font-bold italic" style={{ fontFamily: 'var(--font-display)' }}>
            02
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-16 text-[var(--text-muted)] text-[9px] font-mono uppercase tracking-[0.4em]">
        Municipal Intelligence & Ecology Network
      </div>
    </div>
  );
}
