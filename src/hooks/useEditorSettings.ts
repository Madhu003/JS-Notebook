import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as monaco from 'monaco-editor';
import type { EditorSettings } from '../types/services/editor';

// Default settings
const defaultSettings: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  minimap: true,
  lineNumbers: true,
  wordWrap: true,
  folding: true,
  showFoldingControls: 'mouseover',
  foldingStrategy: 'auto',
  foldingHighlight: true,
  multiCursorModifier: 'alt',
  multiCursorPaste: 'spread',
  findAddExtraSpaceOnTop: true,
  findAutoFindInSelection: 'never',
  findSeedSearchStringFromSelection: 'always',
};

// Query keys
export const editorSettingsKeys = {
  all: ['editorSettings'] as const,
  settings: () => [...editorSettingsKeys.all, 'settings'] as const,
};

// Editor settings service functions
const getEditorSettings = (): EditorSettings => {
  try {
    const storedSettings = localStorage.getItem('editorSettings');
    return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
  } catch (error) {
    console.error("Failed to parse editor settings from localStorage, using defaults.", error);
    return defaultSettings;
  }
};

const saveEditorSettings = (settings: EditorSettings): void => {
  try {
    localStorage.setItem('editorSettings', JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save editor settings to localStorage.", error);
  }
};

// Editor settings query hooks
export const useEditorSettings = () => {
  return useQuery({
    queryKey: editorSettingsKeys.settings(),
    queryFn: getEditorSettings,
    staleTime: Infinity, // Settings don't change often
    gcTime: Infinity, // Keep in cache indefinitely
  });
};

export const useUpdateEditorSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: keyof EditorSettings; value: any }) => {
      const currentSettings = queryClient.getQueryData<EditorSettings>(editorSettingsKeys.settings()) || defaultSettings;
      const newSettings = { ...currentSettings, [key]: value };
      saveEditorSettings(newSettings);
      return newSettings;
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(editorSettingsKeys.settings(), newSettings);
    },
  });
};

export const useResetEditorSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      saveEditorSettings(defaultSettings);
      return defaultSettings;
    },
    onSuccess: (defaultSettings) => {
      queryClient.setQueryData(editorSettingsKeys.settings(), defaultSettings);
    },
  });
};

// Combined editor settings hook for backward compatibility
export const useEditorSettingsContext = () => {
  const { data: settings = defaultSettings, isLoading: loading } = useEditorSettings();
  const updateMutation = useUpdateEditorSetting();
  const resetMutation = useResetEditorSettings();

  const updateSetting = <T extends keyof EditorSettings>(key: T, value: EditorSettings[T]) => {
    updateMutation.mutate({ key, value });
  };

  const resetToDefaults = () => {
    resetMutation.mutate();
  };

  return {
    settings,
    loading,
    updateSetting,
    resetToDefaults,
    isUpdating: updateMutation.isPending,
    isResetting: resetMutation.isPending,
  };
};
