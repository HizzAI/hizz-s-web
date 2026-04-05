import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1
        ${isDark ? 'bg-zinc-700' : 'bg-primary/30'}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      <span className={`absolute flex items-center justify-center w-5 h-5 rounded-full shadow-md
        transition-all duration-300 transform
        ${isDark ? 'translate-x-7 bg-zinc-200' : 'translate-x-0 bg-white'}`}>
        {isDark
          ? <Moon size={11} className="text-zinc-700" strokeWidth={2.5} />
          : <Sun size={11} className="text-amber-500" strokeWidth={2.5} />
        }
      </span>
    </button>
  );
}
