import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type { CodeEditorProps } from '../../types';
import './CodeEditor.css';

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'javascript' 
}: CodeEditorProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language,
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

  // Update language when prop changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  return (
    <div className="h-[300px] rounded-lg overflow-hidden border border-gray-700">
      <div
        ref={containerRef}
        className="w-full h-full"
        data-testid="code-editor"
      />
    </div>
  );
};

export default CodeEditor;