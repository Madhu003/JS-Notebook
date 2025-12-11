import { useCallback, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { CodeEditorProps } from '../../types';
import { LANGUAGES } from '../../constants/languages';
import { useTheme, Theme } from '../../hooks/useTheme';
import { useSnippetsContext } from '../../hooks/useSnippets';
import { useAuth } from '../../hooks/useAuth';
import { useEditorSettingsContext } from '../../hooks/useEditorSettings';
import OutputVisualizer from '../OutputVisualizer';
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
    </div>
  );
};

export default JavaScriptEditor;
