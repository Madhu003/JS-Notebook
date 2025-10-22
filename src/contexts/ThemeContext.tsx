import React, { createContext, useContext, useState, useEffect } from 'react';
import * as monaco from 'monaco-editor';

export const Theme = {
  Light: 'light',
  Dark: 'dark'
} as const;

export const MonacoTheme = {
  Light: 'vs-light',
  Dark: 'vs-dark',
  Monokai: 'monokai',
  Dracula: 'dracula',
  Solarized: 'solarized-dark',
  GitHub: 'github-dark',
  OneDark: 'one-dark-pro'
} as const;

export type Theme = typeof Theme[keyof typeof Theme];
export type MonacoThemeType = typeof MonacoTheme[keyof typeof MonacoTheme];

interface ThemeContextType {
  theme: Theme;
  monacoTheme: MonacoThemeType;
  toggleTheme: () => void;
  setMonacoTheme: (theme: MonacoThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define custom Monaco themes
const defineCustomThemes = () => {
  // Monokai theme
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'regexp', foreground: 'e6db74' },
      { token: 'operator', foreground: 'f92672' },
      { token: 'namespace', foreground: 'a6e22e' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'struct', foreground: '66d9ef' },
      { token: 'class', foreground: 'a6e22e' },
      { token: 'interface', foreground: 'a6e22e' },
      { token: 'parameter', foreground: 'fd971f' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'constant', foreground: 'ae81ff' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#75715e',
      'editor.selectionBackground': '#49483e',
      'editor.inactiveSelectionBackground': '#3e3d32',
      'editorCursor.foreground': '#f8f8f0',
      'editorWhitespace.foreground': '#3b3a32',
    }
  });

  // Dracula theme
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'regexp', foreground: 'f1fa8c' },
      { token: 'operator', foreground: 'ff79c6' },
      { token: 'namespace', foreground: '50fa7b' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'struct', foreground: '8be9fd' },
      { token: 'class', foreground: '50fa7b' },
      { token: 'interface', foreground: '50fa7b' },
      { token: 'parameter', foreground: 'ffb86c' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'constant', foreground: 'bd93f9' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#6272a4',
      'editor.selectionBackground': '#44475a',
      'editor.inactiveSelectionBackground': '#3c3e4a',
      'editorCursor.foreground': '#f8f8f0',
      'editorWhitespace.foreground': '#3b3a32',
    }
  });

  // Solarized Dark theme
  monaco.editor.defineTheme('solarized-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '586e75' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'regexp', foreground: '2aa198' },
      { token: 'operator', foreground: '859900' },
      { token: 'namespace', foreground: '268bd2' },
      { token: 'type', foreground: 'b58900' },
      { token: 'struct', foreground: 'b58900' },
      { token: 'class', foreground: '268bd2' },
      { token: 'interface', foreground: '268bd2' },
      { token: 'parameter', foreground: 'cb4b16' },
      { token: 'variable', foreground: '839496' },
      { token: 'function', foreground: '268bd2' },
      { token: 'constant', foreground: 'd33682' },
    ],
    colors: {
      'editor.background': '#002b36',
      'editor.foreground': '#839496',
      'editorLineNumber.foreground': '#586e75',
      'editor.selectionBackground': '#073642',
      'editor.inactiveSelectionBackground': '#0a4b5a',
      'editorCursor.foreground': '#839496',
      'editorWhitespace.foreground': '#3b3a32',
    }
  });

  // GitHub Dark theme
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'regexp', foreground: 'a5d6ff' },
      { token: 'operator', foreground: 'ff7b72' },
      { token: 'namespace', foreground: '7ee787' },
      { token: 'type', foreground: '79c0ff' },
      { token: 'struct', foreground: '79c0ff' },
      { token: 'class', foreground: '7ee787' },
      { token: 'interface', foreground: '7ee787' },
      { token: 'parameter', foreground: 'ffa657' },
      { token: 'variable', foreground: 'f0f6fc' },
      { token: 'function', foreground: '7ee787' },
      { token: 'constant', foreground: '79c0ff' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#f0f6fc',
      'editorLineNumber.foreground': '#8b949e',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#1c2a3a',
      'editorCursor.foreground': '#f0f6fc',
      'editorWhitespace.foreground': '#3b3a32',
    }
  });

  // One Dark Pro theme
  monaco.editor.defineTheme('one-dark-pro', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370' },
      { token: 'keyword', foreground: 'c678dd' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'regexp', foreground: '98c379' },
      { token: 'operator', foreground: 'c678dd' },
      { token: 'namespace', foreground: 'e06c75' },
      { token: 'type', foreground: '61afef' },
      { token: 'struct', foreground: '61afef' },
      { token: 'class', foreground: 'e5c07b' },
      { token: 'interface', foreground: 'e5c07b' },
      { token: 'parameter', foreground: 'e06c75' },
      { token: 'variable', foreground: 'e06c75' },
      { token: 'function', foreground: '61afef' },
      { token: 'constant', foreground: 'd19a66' },
    ],
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'editorLineNumber.foreground': '#5c6370',
      'editor.selectionBackground': '#3e4451',
      'editor.inactiveSelectionBackground': '#2c313c',
      'editorCursor.foreground': '#528bff',
      'editorWhitespace.foreground': '#3b3a32',
    }
  });
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('notebook-theme');
    return (savedTheme as Theme) || Theme.Light;
  });

  const [monacoTheme, setMonacoTheme] = useState<MonacoThemeType>(() => {
    const savedMonacoTheme = localStorage.getItem('monaco-theme');
    return (savedMonacoTheme as MonacoThemeType) || MonacoTheme.Dark;
  });

  useEffect(() => {
    // Define custom themes when the component mounts
    defineCustomThemes();
  }, []);

  useEffect(() => {
    localStorage.setItem('notebook-theme', theme);
    localStorage.setItem('monaco-theme', monacoTheme);
    document.documentElement.classList.toggle('dark', theme === Theme.Dark);
    document.documentElement.classList.toggle('light', theme === Theme.Light);
  }, [theme, monacoTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.Light ? Theme.Dark : Theme.Light);
  };

  const handleSetMonacoTheme = (newTheme: MonacoThemeType) => {
    setMonacoTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      monacoTheme, 
      toggleTheme, 
      setMonacoTheme: handleSetMonacoTheme 
    }}>
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
