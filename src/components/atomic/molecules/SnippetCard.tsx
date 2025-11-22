import React from 'react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Snippet } from '../../../../types';
import { useTheme, Theme } from '../../../../hooks/useTheme';
import { cn } from '../../../../lib/utils';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-colors",
        theme === Theme.Dark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className={cn("font-medium truncate", theme === Theme.Dark ? "text-white" : "text-gray-800")}>
              {snippet.name}
            </h3>
            <Badge variant="secondary" className={cn(
              "border-none",
              theme === Theme.Dark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
            )}>
              {snippet.language}
            </Badge>
            <Badge variant="secondary" className={cn(
              "border-none",
              theme === Theme.Dark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
            )}>
              {snippet.prefix}
            </Badge>
          </div>
          {snippet.description && (
            <Typography variant="muted" className={cn("mb-2 block", theme === Theme.Dark ? "text-gray-300" : "text-gray-600")}>
              {snippet.description}
            </Typography>
          )}
          <pre className={cn(
            "text-xs p-2 rounded overflow-x-auto",
            theme === Theme.Dark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
          )}>
            {snippet.code}
          </pre>
        </div>
        <div className="flex gap-2 ml-4 flex-shrink-0">
          <Button
            onClick={() => onEdit(snippet)}
            variant="ghost"
            size="icon"
            title="Edit snippet"
            className={theme === Theme.Dark ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-200'}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            onClick={() => onDelete(snippet)}
            variant="ghost"
            size="icon"
            title="Delete snippet"
            className={theme === Theme.Dark ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-200'}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </div>
      </div>
    </div>
  );
};
