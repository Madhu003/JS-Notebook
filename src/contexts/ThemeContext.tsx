import React, { createContext, useContext, useState, useEffect } from 'react';

export const Theme = {
  Light: 'light',
  Dark: 'dark'
} as const;

export type Theme = typeof Theme[keyof typeof Theme];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('notebook-theme');
    return (savedTheme as Theme) || Theme.Light;
  });

  useEffect(() => {
    localStorage.setItem('notebook-theme', theme);
    document.documentElement.classList.toggle('dark', theme === Theme.Dark);
    document.documentElement.classList.toggle('light', theme === Theme.Light);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.Light ? Theme.Dark : Theme.Light);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
