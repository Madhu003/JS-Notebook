import { useCallback, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { CodeEditorProps } from '../../types';
import { LANGUAGES } from '../../constants/languages';
import { useTheme, Theme } from '../../hooks/useTheme';
import { useSnippetsContext } from '../../hooks/useSnippets';
import { useAuth } from '../../hooks/useAuth';
import { useEditorSettingsContext } from '../../hooks/useEditorSettings';
import SnippetManager from '../SnippetManager/SnippetManager';
import OutputVisualizer from '../OutputVisualizer';
import EditorSettings from '../EditorSettings/EditorSettings';
import './JavaScriptEditor.css';

interface JavaScriptEditorProps extends CodeEditorProps {
  onFocus?: () => void;
  cellId?: string;
  output?: string;
  error?: string;
  executionTime?: number;
}

const JavaScriptEditor = ({ 
  value, 
  onChange, 
  language = 'javascript',
  onFocus,
  cellId,
  output,
  error,
  executionTime
}: JavaScriptEditorProps): JSX.Element => {
  const { theme, monacoTheme } = useTheme();
  const { user } = useAuth();
  const { getSnippetsByLanguage } = useSnippetsContext(user?.uid || '');
  const { settings } = useEditorSettingsContext();
  const [isSnippetManagerOpen, setIsSnippetManagerOpen] = useState(false);
  const [isEditorSettingsOpen, setIsEditorSettingsOpen] = useState(false);
  
  // Filter languages to only show JS/TS related ones
  const jsTsLanguages = useMemo(() => {
    return LANGUAGES.filter(lang => 
      ['javascript', 'typescript'].includes(lang.id)
    );
  }, []);

  const selectedLanguage = useMemo(() => {
    return jsTsLanguages.find(l => l.id === language) || jsTsLanguages[0];
  }, [language, jsTsLanguages]);

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
      const monacoLanguage = language === 'javascript' ? 'javascript' : 'typescript';
      
      // Clear existing snippet provider
      const providers = monaco.languages.getLanguages().find(l => l.id === monacoLanguage);
      if (providers) {
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
      }
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
    <div className={`flex flex-col min-h-[300px] rounded-lg overflow-hidden ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors`}>
      <div className={`flex items-center justify-between p-2 ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} border-b transition-colors`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
            {language === 'javascript' ? '📝 JavaScript' : '📘 TypeScript'}
          </span>
          <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
            💡 Cmd+Enter to run • Cmd+Shift+F to format
          </span>
        </div>
        <button
          onClick={() => setIsSnippetManagerOpen(true)}
          className={`px-2 py-1 text-xs rounded-md ${theme === Theme.Dark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors`}
          title="Manage code snippets"
        >
          📝 Snippets
        </button>
        <button
          onClick={() => setIsEditorSettingsOpen(true)}
          className={`px-2 py-1 text-xs rounded-md ${theme === Theme.Dark ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'} transition-colors`}
          title="Editor settings"
        >
          ⚙️ Settings
        </button>
      </div>
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
      
      {/* Console Output section */}
      {(output || error) && (
        <div className="mt-4">
          <OutputVisualizer 
            output={output || ''} 
            error={error} 
            executionTime={executionTime} 
          />
        </div>
      )}
      
      {/* Snippet Manager Modal */}
      <SnippetManager
        isOpen={isSnippetManagerOpen}
        onClose={() => setIsSnippetManagerOpen(false)}
        currentLanguage={language}
      />
      
      {/* Editor Settings Modal */}
      <EditorSettings
        isOpen={isEditorSettingsOpen}
        onClose={() => setIsEditorSettingsOpen(false)}
      />
    </div>
  );
};

export default JavaScriptEditor;
