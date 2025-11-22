import React from 'react';
import { cn } from '../../../../lib/utils';
import { badgeStyles } from './styles';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeStyles.variants;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeStyles.base, badgeStyles.variants[variant], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
