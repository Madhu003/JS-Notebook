import { CellType } from './enums';

// Base cell interface
export interface BaseCell {
  id: string;
  content: string;
  type: CellType;
}

// Code cell interface
export interface CodeCell extends BaseCell {
  type: CellType.Code;
  language?: string;
  output?: string;
  error?: string;
  executionTime?: number;
  isCollapsed?: boolean;
}

// Markdown cell interface
export interface MarkdownCell extends BaseCell {
  type: CellType.Markdown;
}

// Union type for all cell types
export type Cell = CodeCell | MarkdownCell;

// Editor Props interfaces
export interface BaseEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface CodeEditorProps extends BaseEditorProps {
  language?: string;
  onLanguageChange?: (language: string) => void;
  showLanguageSelector?: boolean;
}

export interface MarkdownEditorProps extends BaseEditorProps {}
