import { EditorTheme } from './enums';

export const EDITOR_CONFIG = {
  theme: EditorTheme.Dark,
  minimap: { enabled: false },
  automaticLayout: true,
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  roundedSelection: false,
  renderLineHighlight: 'line',
  occurrencesHighlight: 'off',
  folding: true,
  tabSize: 2,
  wordWrap: 'on',
  padding: { top: 10 }
} as const;

export const MARKDOWN_EDITOR_CONFIG = {
  ...EDITOR_CONFIG,
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true,
  },
  suggest: {
    snippetsPreventQuickSuggestions: false,
  }
} as const;

export const INITIAL_CELL = {
  id: '1',
  content: '',
  type: 'code' as const
};

export const MARKED_OPTIONS = {
  breaks: true,
  gfm: true
} as const;

export const EDITOR_MIN_HEIGHT = 300; // pixels
