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
  output?: string;
  error?: string;
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
}

export interface MarkdownEditorProps extends BaseEditorProps {}
