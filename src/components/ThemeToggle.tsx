
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 ease-in-out gold-focus
        bg-secondary hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/80"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {theme === 'light' ? (
          <Sun className="w-5 h-5 text-gold animate-fade-in" />
        ) : (
          <Moon className="w-5 h-5 text-gold-light animate-fade-in" />
        )}
      </div>
    </button>
  );
};
