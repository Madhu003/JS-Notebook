import React from 'react';
import { cn } from '../../../../lib/utils';
import { inputStyles } from './styles';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={cn(inputStyles.wrapper, className)}>
        <div className="relative">
          <input
            type={type}
            className={cn(
              inputStyles.base,
              error && inputStyles.error,
              "peer" // Required for the floating label effect
            )}
            placeholder=" " // Required for peer-placeholder-shown to work
            ref={ref}
            id={inputId}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={inputStyles.label}
            >
              {label}
            </label>
          )}
        </div>
        {error ? (
          <p className={inputStyles.errorText}>{error}</p>
        ) : helperText ? (
          <p className={inputStyles.helperText}>{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
