import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme, Theme } from '../context/ThemeContext';
import { Sun, Moon, TreePine } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Show only on MCD dashboard routes
  if (!location.pathname.startsWith('/mcd')) return null;

  const themes: { id: Theme; label: string; icon: any; color: string }[] = [
    { id: 'light', label: 'Light', icon: Sun, color: '#f8f7f4' },
    { id: 'dark', label: 'Dark', icon: Moon, color: '#0a0a0c' },
    { id: 'civic', label: 'Civic', icon: TreePine, color: '#f4fbf8' },
  ];

  return (
    <div 
      className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full p-2 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl overflow-hidden backdrop-blur-md ${
          isHovered ? 'max-w-xs' : 'max-w-[48px]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-max px-1">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`group relative flex items-center justify-center h-8 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'w-24 bg-[var(--accent)] text-[var(--accent-fg)] shadow-lg' 
                    : isHovered ? 'w-8 hover:bg-[var(--bg-tertiary)]' : 'w-0 opacity-0 pointer-events-none'
                } ${!isHovered && isActive ? 'w-8' : ''}`}
                title={t.label}
              >
                <div className={`flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Icon size={isActive ? 16 : 14} />
                </div>
                
                {/* Label (visible when active and hovered) */}
                {isActive && isHovered && (
                  <span className="ml-2 text-[10px] font-black uppercase tracking-tighter animate-in fade-in slide-in-from-left-1 duration-300">
                    {t.label}
                  </span>
                )}
                
                {/* Active Ring */}
                {isActive && (
                   <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] animate-ping opacity-10 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Dynamic Tagline */}
      <div className="mr-3 overflow-hidden h-4">
        {!isHovered && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] animate-in slide-in-from-bottom-2 duration-500">
            {theme} mode
          </span>
        )}
      </div>
    </div>
  );
}
