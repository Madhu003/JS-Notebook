import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface InlineEditProps {
  value: string;
  onSave?: (newValue: string) => Promise<void>;
  onChange?: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

const InlineEdit = ({ value, onSave, onChange, className = '', placeholder = 'Enter text...', multiline = false }: InlineEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(value);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (editValue.trim() === '') {
      setError('Title cannot be empty');
      return;
    }

    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      if (onChange) {
        onChange(editValue.trim());
        setIsEditing(false);
      } else if (onSave) {
        await onSave(editValue.trim());
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn(
              className,
              "resize-none overflow-hidden border border-blue-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder={placeholder}
            rows={Math.max(2, Math.ceil(editValue.length / 50))}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn(
              className,
              "border border-blue-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder={placeholder}
            disabled={saving}
          />
        )}
        
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 z-10">
            {error}
          </div>
        )}
        
        {saving && (
          <div className="absolute top-1 right-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className={cn(
        className,
        "hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors text-left min-w-[100px] group"
      )}
      title="Click to edit"
    >
      <span className="relative">
        {value}
        <span className="absolute -right-5 top-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        </span>
      </span>
    </button>
  );
};

export default InlineEdit;
