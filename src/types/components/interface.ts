import React from 'react';
import { Snippet } from '../models/interface';
import { Notebook } from '../models/interface';

// ===========================
// Atom Component Interfaces
// ===========================

// Button component props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'neutral' | 'outline' | 'ghost' | 'link' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

// Input component props
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

// Typography component props
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'lead' | 'large' | 'small' | 'muted';
    component?: React.ElementType;
}

// Badge component props
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

// Card component props (all use HTMLAttributes<HTMLDivElement>)
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

// ===========================
// Molecule Component Interfaces
// ===========================

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
