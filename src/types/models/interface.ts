import { CellType } from '../enums';

// ===========================
// User Interfaces
// ===========================

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

// ===========================
// Cell Interfaces
// ===========================

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

// ===========================
// Notebook Interfaces
// ===========================

export interface Notebook {
    id: string;
    title: string;
    description?: string;
    cells: Cell[];
    userId: string;
    createdAt: number;
    updatedAt: number;
    isPublic: boolean;
    tags: string[];
}

export interface CreateNotebookData {
    title: string;
    description?: string;
    cells: Cell[];
    isPublic?: boolean;
    tags?: string[];
}

export interface UpdateNotebookData {
    title?: string;
    description?: string;
    cells?: Cell[];
    isPublic?: boolean;
    tags?: string[];
}

// ===========================
// Snippet Interfaces
// ===========================

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
