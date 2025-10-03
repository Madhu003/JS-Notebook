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
}: MarkdownEditorProps & { onFocus?: () => void }): JSX.Element => {
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
    if (!preview.visible) return;
    
    try {
      const parseResult = marked.parse(markdown);
      const html = parseResult instanceof Promise ? await parseResult : parseResult;
      setPreview(prev => ({ ...prev, html }));
    } catch (err) {
      console.error('Markdown parsing error:', err);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      // Initialize Monaco editor with markdown-specific settings
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        ...MARKDOWN_EDITOR_CONFIG,
        value,
        language: "markdown",
        theme: theme === Theme.Dark ? 'vs-dark' : 'vs-light',
      });

      // Add focus event listener to auto-select the cell
      monacoEditorRef.current.onDidFocusEditorWidget(() => {
        if (onFocus) {
          onFocus();
        }
      });

      // Add onChange listener
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
        monacoEditorRef.current.dispose();
      }
    };
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      monaco.editor.setTheme(theme === Theme.Dark ? 'vs-dark' : 'vs-light');
    }
  }, [theme]);

  // Update value when prop changes
  useEffect(() => {
    if (
      monacoEditorRef.current &&
      value !== monacoEditorRef.current.getValue()
    ) {
      monacoEditorRef.current.setValue(value);
      updatePreview(value);
    }
  }, [value]);

  const insertMarkdownSyntax = (syntax: MarkdownSyntaxType, wrap: boolean = false) => {
    if (!monacoEditorRef.current) return;

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
    <div className={`flex flex-col h-[300px] rounded-lg overflow-hidden ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors`}>
      {/* Markdown Toolbar */}
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

      {/* Editor and Preview */}
      <div className="flex flex-1 h-[calc(100%-48px)]">
        <div
          ref={editorRef}
          className={`${preview.visible ? "w-1/2" : "w-full"} h-full ${theme === Theme.Dark ? 'border-gray-600' : 'border-gray-200'} border-r`}
        />
        {preview.visible && (
          <div
            className={`w-1/2 h-full overflow-auto p-4 ${theme === Theme.Dark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} markdown-preview transition-colors`}
            dangerouslySetInnerHTML={{ __html: preview.html }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
