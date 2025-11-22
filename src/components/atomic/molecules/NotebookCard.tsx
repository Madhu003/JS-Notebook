import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { InlineEdit } from './InlineEdit';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import { Notebook } from '../../../../services/firebase';

interface NotebookCardProps {
  notebook: Notebook;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
}

export const NotebookCard: React.FC<NotebookCardProps> = ({
  notebook,
  onRename,
  onDelete,
  onOpen,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow bg-white">
      <CardHeader className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 overflow-hidden">
            <div className="mb-2">
              <InlineEdit
                value={notebook.title}
                onSave={(newTitle) => onRename(notebook.id, newTitle)}
                className="text-lg font-semibold text-gray-900 block"
                placeholder="Enter notebook title..."
              />
            </div>
            {notebook.description && (
              <Typography variant="muted" className="line-clamp-2">
                {notebook.description}
              </Typography>
            )}
          </div>
          <div className="flex items-center ml-4">
            {notebook.isPublic ? (
              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
                <PublicIcon style={{ fontSize: 14, marginRight: 4 }} /> Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">
                <LockIcon style={{ fontSize: 14, marginRight: 4 }} /> Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{notebook.cells.length} cells</span>
          <span>Updated {formatDate(notebook.updatedAt)}</span>
        </div>

        {notebook.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {notebook.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <div className="flex-1">
            <Button
              onClick={() => onOpen(notebook.id)}
              variant="primary"
              className="w-full"
            >
              Open
            </Button>
          </div>
          <Button
            onClick={() => onDelete(notebook.id, notebook.title)}
            variant="danger"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
