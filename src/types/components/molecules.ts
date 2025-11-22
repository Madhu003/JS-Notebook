import React from 'react';
import { InputProps } from './atoms';
import { Snippet } from '../models/Snippet';
import { Notebook } from '../models/Notebook';

// FormField component props
export interface FormFieldProps extends Omit<InputProps, 'label'> {
    label?: string;
    containerClassName?: string;
}

// SearchBar component props
export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSearch?: (value: string) => void;
}

// Modal component props
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// InlineEdit component props
export interface InlineEditProps {
    value: string;
    onSave?: (newValue: string) => Promise<void>;
    onChange?: (newValue: string) => void;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
}

// NotebookCard component props
export interface NotebookCardProps {
    notebook: Notebook;
    onRename: (id: string, newTitle: string) => void;
    onDelete: (id: string, title: string) => void;
    onOpen: (id: string) => void;
}

// SnippetCard component props
export interface SnippetCardProps {
    snippet: Snippet;
    onEdit: (snippet: Snippet) => void;
    onDelete: (snippet: Snippet) => void;
}
