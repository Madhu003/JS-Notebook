import React from 'react';
import { Input} from '../atoms/Input';
import { Typography } from '../atoms/Typography';
import { cn } from '../../../lib/utils';
import type { FormFieldProps, InputProps } from './interface';

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, containerClassName, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <Input
          ref={ref}
          id={inputId}
          error={error}
          className={className}
          {...props}
        />
        {error ? (
          <Typography variant="small" className="text-red-500">
            {error}
          </Typography>
        ) : helperText ? (
          <Typography variant="muted">
            {helperText}
          </Typography>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = "FormField";
