import { Cell } from './Cell';

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
