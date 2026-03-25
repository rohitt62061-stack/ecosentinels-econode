import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/select');
    }, 2400);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center text-[var(--text-primary)] overflow-hidden transition-colors duration-300">
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-letter { opacity: 0; animation: fadeIn 0.4s ease-out forwards; }
        .animate-tagline { opacity: 0; animation: fadeIn 0.6s ease-out 1.2s forwards; }
        .animate-progress { animation: fillProgress 0.8s ease-in-out 1.6s forwards; }
      `}</style>

      {/* Hexagon Logo */}
      <div className="w-24 h-24 mb-6 animate-scale-in">
        <svg viewBox="0 0 120 120" className="w-full h-full text-[var(--accent)]">
          <polygon points="60,10 103,35 103,85 60,110 17,85 17,35" fill="none" stroke="currentColor" strokeWidth="4" />
          {/* Small leaf inside */}
          <path d="M60,40 C68,48 68,60 60,72 C52,60 52,48 60,40 Z" fill="currentColor" opacity="0.9" />
        </svg>
      </div>

      {/* Econode Title */}
      <h1 className="text-4xl font-headline font-bold mb-2 flex text-[var(--text-primary)]">
        {"Econode".split("").map((letter, i) => (
          <span 
            key={i} 
            className="animate-letter"
            style={{ animationDelay: `${0.5 + i * 0.08}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>

      {/* Tagline */}
      <p className="text-[var(--text-muted)] text-sm tracking-wider animate-tagline mb-8">
        Hyper-Local Air & Waste Intelligence
      </p>

      {/* Progress Bar Container */}
      <div className="w-48 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border border-[var(--border)]">
        <div className="h-full bg-[var(--accent)] w-0 animate-progress"></div>
      </div>
    </div>
  );
}
