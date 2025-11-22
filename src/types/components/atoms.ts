import React from 'react';

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
