import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
  multiCursorModifier: 'ctrlCmd' | 'alt';
  multiCursorPaste: 'spread' | 'full';
  showFoldingControls: 'always' | 'mouseover';
  foldingStrategy: 'auto' | 'indentation';
  foldingHighlight: boolean;
  findAddExtraSpaceOnTop: boolean;
  findAutoFindInSelection: 'never' | 'always' | 'multiline';
  findSeedSearchStringFromSelection: 'never' | 'always' | 'selection';
}

interface EditorSettingsContextType {
  settings: EditorSettings;
  updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  resetToDefaults: () => void;
}

const defaultSettings: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  lineNumbers: true,
  wordWrap: true,
  minimap: false,
  multiCursorModifier: 'ctrlCmd',
  multiCursorPaste: 'spread',
  showFoldingControls: 'always',
  foldingStrategy: 'indentation',
  foldingHighlight: true,
  findAddExtraSpaceOnTop: true,
  findAutoFindInSelection: 'never',
  findSeedSearchStringFromSelection: 'always',
};

const EditorSettingsContext = createContext<EditorSettingsContextType | undefined>(undefined);

interface EditorSettingsProviderProps {
  children: ReactNode;
}

export const EditorSettingsProvider: React.FC<EditorSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const saved = localStorage.getItem('editor-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('editor-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const value: EditorSettingsContextType = {
    settings,
    updateSetting,
    resetToDefaults,
  };

  return (
    <EditorSettingsContext.Provider value={value}>
      {children}
    </EditorSettingsContext.Provider>
  );
};

export const useEditorSettings = (): EditorSettingsContextType => {
  const context = useContext(EditorSettingsContext);
  if (context === undefined) {
    throw new Error('useEditorSettings must be used within an EditorSettingsProvider');
  }
  return context;
};

export default EditorSettingsContext;
