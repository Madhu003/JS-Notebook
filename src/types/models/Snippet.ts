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
