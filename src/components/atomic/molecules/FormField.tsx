import React from 'react';
import { Input, InputProps } from '../atoms/Input';
import { Typography } from '../atoms/Typography';
import { cn } from '../../../../lib/utils';

export interface FormFieldProps extends Omit<InputProps, 'label'> {
  label?: string;
  containerClassName?: string;
}

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
