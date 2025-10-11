import { useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { CodeEditorProps } from '../../types';
import { LANGUAGES } from '../../constants/languages';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import './ReactEditor.css';

interface ReactEditorProps extends CodeEditorProps {
  onFocus?: () => void;
  cellId?: string;
  output?: string;
  error?: string;
  executionTime?: number;
}

const ReactEditor = ({ 
  value, 
  onChange, 
  language = 'react',
  onFocus,
  cellId,
  output,
  error,
  executionTime
}: ReactEditorProps): JSX.Element => {
  const { theme } = useTheme();
  
  // Filter languages to only show React related ones
  const reactLanguages = useMemo(() => {
    return LANGUAGES.filter(lang => 
      ['react', 'react-ts'].includes(lang.id)
    );
  }, []);

  const selectedLanguage = useMemo(() => {
    return reactLanguages.find(l => l.id === language) || reactLanguages[0];
  }, [language, reactLanguages]);

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

  return (
    <div className={`flex flex-col min-h-[400px] rounded-lg overflow-hidden ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors`}>
      <div className={`flex items-center gap-2 p-2 ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} border-b transition-colors`}>
        <span className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
          {language === 'react' ? '⚛️ React' : '⚛️ React TypeScript'}
        </span>
        <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
          ⚛️ React Component • Cmd+Enter to run • Cmd+Shift+F to format
        </span>
      </div>
      <div className="flex flex-1 flex-col min-h-[200px]">
        <Editor
          height="200px"
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
      
      {/* React Preview Section */}
      <div className="mt-4">
        <div className={`border ${theme === Theme.Dark ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
          <div className={`${theme === Theme.Dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-3 py-2 text-sm font-medium border-b`}>
            🎯 Live React Preview
          </div>
          <div className={`p-4 ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} min-h-[200px]`}>
            <div id={`react-preview-${cellId}`} className="react-preview-container min-h-[180px]">
              {/* React component will be rendered here */}
              <div className={`flex items-center justify-center h-full ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">⚛️</div>
                  <p>React Preview will appear here after running the code</p>
                  <p className="text-sm mt-1">Press Cmd+Enter or click Run to execute</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Console Output section */}
      {(output || error) && (
        <div className="mt-4">
          <div className={`border ${theme === Theme.Dark ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
            <div className={`${theme === Theme.Dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-3 py-2 text-sm font-medium border-b flex items-center justify-between`}>
              <span>⚛️ React Console Output</span>
              {executionTime && (
                <span className={`text-xs px-2 py-1 rounded-full font-mono ${theme === Theme.Dark ? 'bg-green-900/80 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                  {executionTime}ms
                </span>
              )}
            </div>
            <div className={`p-3 rounded font-mono text-sm max-h-64 overflow-y-auto ${
              error 
                ? `${theme === Theme.Dark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'}`
                : `${theme === Theme.Dark ? 'bg-gray-800 text-gray-100' : 'bg-gray-800 text-gray-100'}`
            }`}>
              <pre className="whitespace-pre-wrap">
                {error || output}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactEditor;
