import { useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import type { CodeEditorProps } from '../../types';
import { LANGUAGES } from '../../constants/languages';
import './CodeEditor.css';

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'javascript',
  onLanguageChange,
  showLanguageSelector = true
}: CodeEditorProps & { 
  onLanguageChange?: (language: string) => void;
  showLanguageSelector?: boolean;
}): JSX.Element => {
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
  }, []);

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
    <div className="flex flex-col h-[300px] rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
        {showLanguageSelector && (
          <select
            value={language}
            onChange={handleLanguageChange}
            className="text-sm border rounded px-2 py-1"
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
          theme="vs-dark"
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