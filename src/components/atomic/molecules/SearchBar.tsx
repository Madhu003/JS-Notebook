import React from 'react';
import { Input } from '../atoms/Input';
import SearchIcon from '@mui/icons-material/Search';
import { cn } from '../../../lib/utils';
import type { SearchBarProps } from './interface';

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onSearch, onChange, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center w-full", className)}>
        <div className="absolute left-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          ref={ref}
          className="pl-10"
          onChange={onChange}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
