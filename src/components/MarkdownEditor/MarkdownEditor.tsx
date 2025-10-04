import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { marked } from "marked";
import { useTheme, Theme } from '../../contexts/ThemeContext';
import "./MarkdownEditor.css";
import { MarkdownEditorProps, MarkdownSyntaxType, MARKDOWN_EDITOR_CONFIG, MARKED_OPTIONS } from "../../types";

const MarkdownEditor = ({
  value,
  onChange,
  onFocus,
  isFocused = false,
}: MarkdownEditorProps & { onFocus?: () => void; isFocused?: boolean }): JSX.Element => {
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [preview, setPreview] = useState({
    html: "",
    visible: true
  });

  // Initialize marked and handle preview updates
  useEffect(() => {
    marked.setOptions(MARKED_OPTIONS);
    updatePreview(value);
  }, []);

  const updatePreview = async (markdown: string) => {
    try {
      const parseResult = marked.parse(markdown);
      const html = parseResult instanceof Promise ? await parseResult : parseResult;
      setPreview(prev => ({ ...prev, html }));
    } catch (err) {
      console.error('Markdown parsing error:', err);
    }
  };

  // Initialize Monaco editor once
  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      console.log('🔧 Creating Monaco editor with:', value);
      
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        ...MARKDOWN_EDITOR_CONFIG,
        value: value || '',
        language: "markdown",
        theme: theme === Theme.Dark ? 'vs-dark' : 'vs-light',
        automaticLayout: true,
      });

      monacoEditorRef.current.onDidFocusEditorWidget(() => {
        console.log('🎯 Editor focused, calling onFocus');
        onFocus?.();
      });

      monacoEditorRef.current.onDidChangeModelContent(() => {
        const newValue = monacoEditorRef.current?.getValue();
        if (newValue !== undefined) {
          onChange(newValue);
          updatePreview(newValue);
        }
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        console.log('🧹 Cleaning up Monaco editor');
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, []);

  // Update theme
  useEffect(() => {
    if (monacoEditorRef.current) {
      monaco.editor.setTheme(theme === Theme.Dark ? 'vs-dark' : 'vs-light');
    }
  }, [theme]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (monacoEditorRef.current && value !== undefined) {
      const currentValue = monacoEditorRef.current.getValue();
      if (value !== currentValue) {
        console.log('🔄 Updating editor value from:', currentValue?.substring(0, 50), 'to:', value?.substring(0, 50));
        monacoEditorRef.current.setValue(value || '');
        updatePreview(value || '');
      }
    }
  }, [value]);

  // Update readOnly state
  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({
        readOnly: !isFocused
      });
    }
  }, [isFocused]);

  const insertMarkdownSyntax = (syntax: MarkdownSyntaxType, wrap: boolean = false) => {
    if (!monacoEditorRef.current || !isFocused) return;

    const editor = monacoEditorRef.current;
    const selection = editor.getSelection();
    const selectedText = selection
      ? editor.getModel()?.getValueInRange(selection)
      : "";

    if (wrap && selectedText) {
      editor.executeEdits("", [
        {
          range: selection!,
          text: `${syntax}${selectedText}${syntax}`,
        },
      ]);
    } else {
      const position = editor.getPosition();
      if (position) {
        editor.executeEdits("", [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text: syntax,
          },
        ]);
      }
    }
    editor.focus();
  };

  return (
    <div 
      className={`flex flex-col h-[300px] rounded-lg overflow-hidden ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors ${!isFocused ? 'cursor-pointer' : ''}`}
      onClick={!isFocused ? (e) => {
        const isDragging = (e.target as HTMLElement).closest('[data-rbd-drag-handle-draggable-id]');
        const isDragHandle = (e.target as HTMLElement).closest('[role="button"]');
        
        if (!isDragging && !isDragHandle) {
          e.stopPropagation();
          console.log('👆 Cell clicked, focusing');
          onFocus?.();
        }
      } : undefined}
    >
      {/* Markdown Toolbar - only show when focused */}
      {isFocused && (
        <div className={`flex flex-wrap items-center gap-1 p-2 ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} border-b transition-colors`}>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Bold, true)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Italic, true)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.InlineCode, true)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="Code"
          >
            <span>{"<>"}</span>
          </button>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Heading)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="Heading"
          >
            <span>H</span>
          </button>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.UnorderedList)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="List"
          >
            <span>•</span>
          </button>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.OrderedList)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="Numbered List"
          >
            <span>1.</span>
          </button>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Quote)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="Quote"
          >
            <span>❝</span>
          </button>
          <button
            onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.CodeBlock)}
            className={`p-1.5 ${theme === Theme.Dark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100'} rounded transition-colors`}
            title="Code Block"
          >
            <span>{"{  }"}</span>
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => setPreview(prev => ({ ...prev, visible: !prev.visible }))}
            className={`px-3 py-1.5 text-sm ${theme === Theme.Dark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-md transition-colors`}
          >
            {preview.visible ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      )}

      {/* Editor and Preview Container */}
      <div className={`flex flex-1 ${isFocused ? 'h-[calc(100%-48px)]' : 'h-full'}`}>
        {/* Editor - always present, width changes based on focus */}
        <div
          ref={editorRef}
          className={`${isFocused ? (preview.visible ? "w-1/2" : "w-full") : "hidden"} h-full ${theme === Theme.Dark ? 'border-gray-600' : 'border-gray-200'} ${preview.visible && isFocused ? 'border-r' : ''}`}
        />
        
        {/* Preview - always present, full width when not focused */}
        <div
          className={`${isFocused ? (preview.visible ? "w-1/2" : preview.visible ? "w-full" : "hidden") : "w-full"} h-full overflow-auto p-4 ${theme === Theme.Dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} markdown-preview transition-colors`}
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;