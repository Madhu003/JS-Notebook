import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as monaco from 'monaco-editor';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const selectedLanguage = useMemo(() => {
    return LANGUAGES.find(l => l.id === language) || LANGUAGES[0];
  }, [language]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language: selectedLanguage.monacoLanguage,
      theme: 'vs-dark',
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

    // Set up change handler
    const changeHandler = editorRef.current.onDidChangeModelContent(() => {
      if (editorRef.current) {
        onChange(editorRef.current.getValue());
      }
    });

    // Focus the editor
    editorRef.current.focus();

    // Cleanup
    return () => {
      changeHandler.dispose();
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []); // Empty dependency array since we handle updates separately

  // Update value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update language when prop changes (map our id -> monaco language id)
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, selectedLanguage.monacoLanguage);
      }
    }
  }, [selectedLanguage.monacoLanguage]);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  }, [onLanguageChange]);

  return (
    <div className="flex flex-col h-[300px] rounded-lg overflow-hidden border border-gray-700">
      {showLanguageSelector && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-900 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="language-selector"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex-1">
        <div
          ref={containerRef}
          className="w-full h-full"
          data-testid="code-editor"
        />
      </div>
    </div>
  );
};

export default CodeEditor;