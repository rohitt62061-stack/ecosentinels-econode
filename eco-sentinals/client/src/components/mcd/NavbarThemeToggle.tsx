import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, TreePine } from 'lucide-react';

export default function NavbarThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: { id: 'light' | 'dark' | 'civic'; icon: any; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'civic', icon: TreePine, label: 'Civic' },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] p-1 rounded-full border border-[var(--border)]">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-1.5 rounded-full transition-all duration-200 ${
              isActive 
                ? 'bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border2)] shadow-sm' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50'
            }`}
            title={t.label}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
