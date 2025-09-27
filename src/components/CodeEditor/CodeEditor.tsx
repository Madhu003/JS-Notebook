import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type { CodeEditorProps } from '../../types';
import { EDITOR_CONFIG } from '../../types';

const CodeEditor = ({ value, onChange, language = 'javascript' }: CodeEditorProps): JSX.Element => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Initialize Monaco editor
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        ...EDITOR_CONFIG,
        value,
        language,
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