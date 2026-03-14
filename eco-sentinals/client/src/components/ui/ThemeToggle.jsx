import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-mcd-primary focus:ring-offset-2 ${
        theme === 'dark' ? 'bg-mcd-primary' : 'bg-slate-300'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="h-4 w-4 text-mcd-primary" />
        ) : (
          <Sun className="h-4 w-4 text-mcd-secondary" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
