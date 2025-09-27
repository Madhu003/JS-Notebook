import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

const CodeEditor = ({ value, onChange, language = 'javascript' }: CodeEditorProps): JSX.Element => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Initialize Monaco editor
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: 'vs-dark',
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
        padding: { top: 10 },
      });

      // Add onChange listener
      monacoEditorRef.current.onDidChangeModelContent(() => {
        const newValue = monacoEditorRef.current?.getValue();
        if (newValue !== undefined) {
          onChange(newValue);
        }
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
    };
  }, [language]);

  // Update value when prop changes
  useEffect(() => {
    if (monacoEditorRef.current && value !== monacoEditorRef.current.getValue()) {
      monacoEditorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div className="h-[300px] rounded-lg overflow-hidden">
      <div
        ref={editorRef}
        className="w-full h-full"
        data-testid="code-editor"
      />
    </div>
  );
};

export default CodeEditor;