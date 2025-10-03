import { useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { CodeEditorProps } from '../../types';
import { LANGUAGES } from '../../constants/languages';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import './CodeEditor.css';

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'javascript',
  onLanguageChange,
  showLanguageSelector = true,
  onFocus,
  cellId
}: CodeEditorProps & { 
  onLanguageChange?: (language: string) => void;
  showLanguageSelector?: boolean;
  onFocus?: () => void;
  cellId?: string;
}): JSX.Element => {
  const { theme } = useTheme();
  const selectedLanguage = useMemo(() => {
    return LANGUAGES.find(l => l.id === language) || LANGUAGES[0];
  }, [language]);

  const handleEditorMount = useCallback((editor: any) => {
    // Configure editor options after mounting
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      lineNumbers: 'on',
      tabSize: 2,
      wordWrap: 'on',
      contextmenu: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      renderLineHighlight: 'all',
      scrollBeyondLastLine: false,
      folding: true,
      bracketPairColorization: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showConstants: true,
        showConstructors: true,
      }
    });

    // Add focus event listener to auto-select the cell
    editor.onDidFocusEditorWidget(() => {
      if (onFocus) {
        onFocus();
      }
    });

    // Add keyboard shortcuts for this specific editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (cellId && onFocus) {
        onFocus(); // First select the cell
        // Dispatch a custom event that the parent can listen to
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('run-cell', { detail: { cellId } }));
        }, 10);
      }
    });

    // Format shortcut (Cmd+Shift+F)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      if (cellId && onFocus) {
        onFocus(); // First select the cell
        // Dispatch a custom event that the parent can listen to
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('format-cell', { detail: { cellId } }));
        }, 10);
      }
    });
  }, [onFocus, cellId]);

  const handleChange = useCallback((newValue: string | undefined) => {
    onChange(newValue || '');
  }, [onChange]);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  }, [onLanguageChange]);

  return (
    <div className={`flex flex-col h-[300px] rounded-lg overflow-hidden ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors`}>
      <div className={`flex items-center gap-2 p-2 ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} border-b transition-colors`}>
        {showLanguageSelector && (
          <select
            value={language}
            onChange={handleLanguageChange}
            className={`text-sm border rounded px-2 py-1 ${
              theme === Theme.Dark 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-black border-gray-300'
            } transition-colors`}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <Editor
          height="100%"
          language={selectedLanguage.monacoLanguage}
          theme={theme === Theme.Dark ? 'vs-dark' : 'vs-light'}
          value={value}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            lineNumbers: 'on',
            tabSize: 2,
            wordWrap: 'on',
            contextmenu: true,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            folding: true,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showConstants: true,
              showConstructors: true,
            }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;