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
  output?: string;
  error?: string;
  executionTime?: number;
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

// Snippet interfaces
export interface Snippet {
  id: string;
  name: string;
  description?: string;
  language: 'javascript' | 'typescript' | 'react' | 'react-ts';
  code: string;
  prefix: string; // trigger text
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSnippetData {
  name: string;
  description?: string;
  language: 'javascript' | 'typescript' | 'react' | 'react-ts';
  code: string;
  prefix: string;
}

export interface UpdateSnippetData {
  name?: string;
  description?: string;
  language?: 'javascript' | 'typescript' | 'react' | 'react-ts';
  code?: string;
  prefix?: string;
}
