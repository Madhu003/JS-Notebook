import React from 'react';
import { cn } from '../../../lib/utils';
import { badgeStyles } from './constants';
import type { BadgeProps } from './interface';

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
