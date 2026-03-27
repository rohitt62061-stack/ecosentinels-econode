import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

export default function Splash() {
  console.log('Splash component mounting...');
  const navigate = useNavigate();
  useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/select');
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[var(--surface)] flex flex-col items-center justify-center text-[var(--text-primary)] overflow-hidden transition-colors duration-500">
      <style>{`
        @keyframes editorialFadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoScale {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-editorial-fade { animation: editorialFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-logo-scale { animation: logoScale 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3F%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Signature Gradient Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none"
           style={{ background: 'linear-gradient(145deg, var(--primary-container), var(--primary))' }}>
      </div>

      <div className="relative flex flex-col items-center gap-12 text-center px-6">
        {/* Official Seal / Logo */}
        <div className="animate-logo-scale">
          <Logo className="w-32 h-32" />
        </div>

        <div className="flex flex-col gap-4 animate-editorial-fade" style={{ animationDelay: '0.4s' }}>
          <h1 
            className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--primary)]"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            Econode
          </h1>
          
          <div className="flex flex-col gap-1">
            <p className="text-sm uppercase tracking-[0.2em] font-medium text-[var(--text-secondary)]"
               style={{ fontFamily: 'var(--font-body)' }}>
              The Digital Magistrate
            </p>
            <div className="w-12 h-[1px] bg-[var(--primary)] opacity-20 mx-auto mt-2"></div>
          </div>
        </div>

        {/* Loading Indicator - High End Editorial Style */}
        <div className="mt-8 flex flex-col items-center gap-3 animate-editorial-fade opacity-0" style={{ animationDelay: '1s' }}>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Synchronizing Civic Data
          </span>
          <div className="w-48 h-[2px] bg-[var(--surface-container-highest)] overflow-hidden">
            <div className="h-full bg-[var(--primary)] w-1/3 animate-[loading_2s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
