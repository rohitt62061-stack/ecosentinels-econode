import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "w-8 h-8", showText = false }: LogoProps) {
  const { theme } = useTheme();

  // Define colors based on theme
  const colors = {
    light: {
      hexagon: "#000000",
      leaf: "#16a34a", // dark green
    },
    dark: {
      hexagon: "#ffffff",
      leaf: "#4ade80", // bright green
    },
    civic: {
      hexagon: "#064e3b", // dark forest green
      leaf: "#B45309",    // gold accent
    }
  };

  const currentColors = colors[theme as keyof typeof colors] || colors.light;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Hexagon Outline */}
        <polygon 
          points="60,10 103,35 103,85 60,110 17,85 17,35" 
          fill="none" 
          stroke={currentColors.hexagon} 
          strokeWidth="6" 
          className="transition-colors duration-300"
        />
        {/* Leaf Graphic */}
        <path 
          d="M60,40 C68,48 68,60 60,72 C52,60 52,48 60,40 Z" 
          fill={currentColors.leaf}
          className="transition-colors duration-300"
        />
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-tight transition-colors duration-300" style={{ fontFamily: 'var(--font-display)' }}>
          Econode
        </span>
      )}
    </div>
  );
}
