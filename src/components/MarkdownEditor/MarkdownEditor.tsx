import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { marked } from "marked";
import "./MarkdownEditor.css";
import { MarkdownEditorProps, MarkdownSyntaxType, MARKDOWN_EDITOR_CONFIG, MARKED_OPTIONS } from "../../types";

const MarkdownEditor = ({
  value,
  onChange,
}: MarkdownEditorProps): JSX.Element => {
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
    <div className="flex flex-col h-[300px] rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Markdown Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b">
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Bold, true)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Bold"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Italic, true)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Italic"
        >
          <span className="italic">I</span>
        </button>
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.InlineCode, true)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Code"
        >
          <span>{"<>"}</span>
        </button>
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Heading)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Heading"
        >
          <span>H</span>
        </button>
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.UnorderedList)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="List"
        >
          <span>•</span>
        </button>
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.OrderedList)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Numbered List"
        >
          <span>1.</span>
        </button>
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.Quote)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Quote"
        >
          <span>❝</span>
        </button>
        <button
          onClick={() => insertMarkdownSyntax(MarkdownSyntaxType.CodeBlock)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Code Block"
        >
          <span>{"{  }"}</span>
        </button>
        <div className="flex-1"></div>
        <button
          onClick={() => setPreview(prev => ({ ...prev, visible: !prev.visible }))}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          {preview.visible ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* Editor and Preview */}
      <div className="flex flex-1 h-[calc(100%-48px)]">
        <div
          ref={editorRef}
          className={`${preview.visible ? "w-1/2" : "w-full"} h-full border-r border-gray-200`}
        />
        {preview.visible && (
          <div
            className="w-1/2 h-full overflow-auto p-4 bg-white markdown-preview"
            dangerouslySetInnerHTML={{ __html: preview.html }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
