import React from 'react';
import { cn } from '../../../../lib/utils';
import { typographyStyles } from './styles';

type TypographyVariant = keyof typeof typographyStyles;

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  component?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = 'p', component, children, ...props }, ref) => {
    const Component = component || (variant.startsWith('h') ? variant : 'p') as React.ElementType;

    return (
      <Component
        ref={ref}
        className={cn(typographyStyles[variant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';
