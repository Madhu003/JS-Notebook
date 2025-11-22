export interface EditorSettings {
    fontSize: number;
    tabSize: number;
    minimap: boolean;
    lineNumbers: boolean;
    wordWrap: boolean;
    folding: boolean;
    showFoldingControls: 'always' | 'mouseover';
    foldingStrategy: 'auto' | 'indentation';
    foldingHighlight: boolean;
    multiCursorModifier: 'alt' | 'ctrlCmd';
    multiCursorPaste: 'spread' | 'full';
    findAddExtraSpaceOnTop: boolean;
    findAutoFindInSelection: 'never' | 'always' | 'multiline';
    findSeedSearchStringFromSelection: 'never' | 'always';
}

export interface BaseEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export interface CodeEditorProps extends BaseEditorProps {
    language?: string;
    onLanguageChange?: (language: string) => void;
    showLanguageSelector?: boolean;
}

export interface MarkdownEditorProps extends BaseEditorProps { }
