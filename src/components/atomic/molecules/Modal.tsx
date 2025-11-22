import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../atoms/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../atoms/Card';
import CloseIcon from '@mui/icons-material/Close';
import { cn } from '../../../../lib/utils';
import { useTheme, Theme } from '../../../../hooks/useTheme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  size = 'md',
}) => {
  const { theme } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full m-4',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={overlayRef}
        className={cn(
          "relative w-full animate-in fade-in zoom-in-95 duration-200",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className={cn(
          "w-full overflow-hidden shadow-xl",
          theme === Theme.Dark ? "bg-gray-800 border-gray-700" : "bg-white"
        )}>
          {(title || onClose) && (
            <CardHeader className={cn(
              "flex flex-row items-center justify-between border-b px-6 py-4",
              theme === Theme.Dark ? "border-gray-700 bg-gray-900/50" : "border-gray-100 bg-gray-50/50"
            )}>
              {title && (
                <CardTitle className={theme === Theme.Dark ? "text-white" : "text-gray-900"}>
                  {title}
                </CardTitle>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(
                  "h-8 w-8 rounded-full",
                  theme === Theme.Dark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                )}
              >
                <CloseIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </CardHeader>
          )}
          
          <CardContent className={cn(
            "p-6",
            theme === Theme.Dark ? "text-gray-300" : "text-gray-700"
          )}>
            {children}
          </CardContent>

          {footer && (
            <CardFooter className={cn(
              "flex items-center justify-end gap-2 border-t px-6 py-4",
              theme === Theme.Dark ? "border-gray-700 bg-gray-900/50" : "border-gray-100 bg-gray-50/50"
            )}>
              {footer}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
