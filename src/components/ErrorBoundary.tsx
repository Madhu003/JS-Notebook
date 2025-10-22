import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Preview Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`p-4 rounded-lg border ${theme === Theme.Dark ? 'bg-red-900/20 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">⚠️</span>
        <h3 className="font-semibold">React Component Error</h3>
      </div>
      <p className="text-sm mb-2">
        There was an error rendering your React component:
      </p>
      <pre className={`text-xs p-2 rounded ${theme === Theme.Dark ? 'bg-red-900/40' : 'bg-red-100'} overflow-x-auto`}>
        {error?.message || 'Unknown error occurred'}
      </pre>
      <p className="text-xs mt-2 opacity-75">
        Check your component code for syntax errors or runtime issues.
      </p>
    </div>
  );
};

export default ErrorBoundary;
