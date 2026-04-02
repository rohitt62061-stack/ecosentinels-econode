import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative flex items-center w-[56px] h-7 rounded-full transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mcd-primary focus-visible:ring-offset-2
        ${isDark
          ? 'bg-mcd-primary shadow-inner shadow-black/30'
          : 'bg-slate-200 shadow-inner shadow-black/10'
        }`}
    >
      {/* Knob */}
      <span
        className={`absolute flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transition-all duration-400
          ${isDark ? 'left-[33px]' : 'left-[3px]'}`}
      >
        {isDark
          ? <Moon size={11} className="text-mcd-primary" />
          : <Sun  size={11} className="text-mcd-secondary" />
        }
      </span>

      {/* Opposite icon (ghosted) */}
      <span className={`absolute transition-all duration-300 ${isDark ? 'left-[5px] opacity-40' : 'right-[5px] opacity-40'}`}>
        {isDark
          ? <Sun  size={11} className="text-white" />
          : <Moon size={11} className="text-slate-500" />
        }
      </span>
    </button>
  );
};

export default ThemeToggle;
