import { useCallback, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { CodeEditorProps } from '../../types';
import { LANGUAGES } from '../../constants/languages';
import { useTheme, Theme } from '../../hooks/useTheme';
import { useSnippetsContext } from '../../hooks/useSnippets';
import { useAuth } from '../../hooks/useAuth';
import { useEditorSettingsContext } from '../../hooks/useEditorSettings';
import ErrorBoundary from '../ErrorBoundary';
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
  const { theme, monacoTheme } = useTheme();
  const { user } = useAuth();
  const { getSnippetsByLanguage } = useSnippetsContext(user?.uid || '');
  const { settings } = useEditorSettingsContext();
  const [previewSize, setPreviewSize] = useState<'compact' | 'expanded'>('compact');
  
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
      fontSize: settings.fontSize,
      minimap: { enabled: settings.minimap },
      automaticLayout: true,
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      contextmenu: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      renderLineHighlight: 'all',
      scrollBeyondLastLine: false,
      folding: true,
      showFoldingControls: settings.showFoldingControls,
      foldingStrategy: settings.foldingStrategy,
      foldingHighlight: settings.foldingHighlight,
      bracketPairColorization: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
      multiCursorModifier: settings.multiCursorModifier,
      multiCursorPaste: settings.multiCursorPaste,
      find: {
        addExtraSpaceOnTop: settings.findAddExtraSpaceOnTop,
        autoFindInSelection: settings.findAutoFindInSelection,
        seedSearchStringFromSelection: settings.findSeedSearchStringFromSelection,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showConstants: true,
        showConstructors: true,
      }
    });

    // Register custom snippets
    const registerSnippets = () => {
      const snippets = getSnippetsByLanguage(language);
      const monacoLanguage = language === 'react' ? 'javascript' : 'typescript';
      
      // Register completion provider for snippets
      monaco.languages.registerCompletionItemProvider(monacoLanguage, {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const completionItems = snippets.map(snippet => ({
            label: snippet.name,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.code,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: snippet.description || `Trigger: ${snippet.prefix}`,
            documentation: snippet.code,
            range: range,
            sortText: snippet.prefix,
          }));

          return {
            suggestions: completionItems,
          };
        },
      });
    };

    // Register snippets immediately and when they change
    registerSnippets();

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
  }, [onFocus, cellId, language, getSnippetsByLanguage, settings]);

  const handleChange = useCallback((newValue: string | undefined) => {
    onChange(newValue || '');
  }, [onChange]);

  return (
    <div className={`flex flex-col min-h-[400px] rounded-lg overflow-hidden ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors`}>
      <div className="flex flex-1 flex-col min-h-[200px]">
        <Editor
          height="200px"
          language={selectedLanguage.monacoLanguage}
          theme={monacoTheme}
          value={value}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize: settings.fontSize,
            minimap: { enabled: settings.minimap },
            automaticLayout: true,
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            tabSize: settings.tabSize,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            contextmenu: true,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            folding: true,
            showFoldingControls: settings.showFoldingControls,
            foldingStrategy: settings.foldingStrategy,
            foldingHighlight: settings.foldingHighlight,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            multiCursorModifier: settings.multiCursorModifier,
            multiCursorPaste: settings.multiCursorPaste,
            find: {
              addExtraSpaceOnTop: settings.findAddExtraSpaceOnTop,
              autoFindInSelection: settings.findAutoFindInSelection,
              seedSearchStringFromSelection: settings.findSeedSearchStringFromSelection,
            },
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
          <div className={`${theme === Theme.Dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-3 py-2 text-sm font-medium border-b flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span>Live React Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewSize(previewSize === 'compact' ? 'expanded' : 'compact')}
                className={`px-2 py-1 text-xs rounded ${theme === Theme.Dark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
                title={`Switch to ${previewSize === 'compact' ? 'expanded' : 'compact'} view`}
              >
                {previewSize === 'compact' ? 'Expand' : 'Compact'}
              </button>
              <button
                onClick={() => {
                  const previewElement = document.getElementById(`react-preview-${cellId}`);
                  if (previewElement) {
                    previewElement.innerHTML = '';
                  }
                }}
                className={`px-2 py-1 text-xs rounded ${theme === Theme.Dark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
                title="Clear preview"
              >
                Clear
              </button>
            </div>
          </div>
          <div className={`p-4 ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} ${previewSize === 'expanded' ? 'min-h-[400px]' : 'min-h-[200px]'}`}>
            <ErrorBoundary>
              <div 
                id={`react-preview-${cellId}`} 
                className={`react-preview-container ${previewSize === 'expanded' ? 'min-h-[380px]' : 'min-h-[180px]'} ${theme === Theme.Dark ? 'bg-gray-900' : 'bg-white'} rounded border`}
              >
                {/* React component will be rendered here */}
                <div className={`flex items-center justify-center h-full ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-center">
                    <p>React Preview will appear here after running the code</p>
                    <p className="text-sm mt-1">Press Cmd+Enter or click Run to execute</p>
                    <div className="mt-3 text-xs opacity-75">
                      <p>Tip: Use console.log() to debug your component</p>
                      <p>Tip: Return JSX from your component function</p>
                    </div>
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
      
      {/* Console Output section */}
      {(output || error) && (
        <div className="mt-4">
          <div className={`border ${theme === Theme.Dark ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
            <div className={`${theme === Theme.Dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-3 py-2 text-sm font-medium border-b flex items-center justify-between`}>
              <span>React Console Output</span>
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
