import React, { useState } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface OutputVisualizerProps {
  output: string;
  error?: string;
  executionTime?: number;
}

interface TreeNodeProps {
  data: any;
  level?: number;
  maxLevel?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ data, level = 0, maxLevel = 3 }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(level < 2);

  if (level >= maxLevel) {
    return (
      <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
        ... (max depth reached)
      </span>
    );
  }

  if (data === null) {
    return <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-600'}`}>null</span>;
  }

  if (data === undefined) {
    return <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-600'}`}>undefined</span>;
  }

  if (typeof data === 'string') {
    return (
      <span className={`text-xs ${theme === Theme.Dark ? 'text-green-300' : 'text-green-600'}`}>
        "{data}"
      </span>
    );
  }

  if (typeof data === 'number') {
    return (
      <span className={`text-xs ${theme === Theme.Dark ? 'text-blue-300' : 'text-blue-600'}`}>
        {data}
      </span>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <span className={`text-xs ${theme === Theme.Dark ? 'text-purple-300' : 'text-purple-600'}`}>
        {data.toString()}
      </span>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="ml-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs font-mono ${theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
        >
          {isExpanded ? '▼' : '▶'} Array({data.length})
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1">
            {data.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  [{index}]:
                </span>
                <TreeNode data={item} level={level + 1} maxLevel={maxLevel} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    return (
      <div className="ml-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs font-mono ${theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
        >
          {isExpanded ? '▼' : '▶'} Object({keys.length} properties)
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1">
            {keys.map((key) => (
              <div key={key} className="flex items-start gap-2">
                <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {key}:
                </span>
                <TreeNode data={data[key]} level={level + 1} maxLevel={maxLevel} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-600'}`}>
      {String(data)}
    </span>
  );
};

const OutputVisualizer: React.FC<OutputVisualizerProps> = ({ output, error, executionTime }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'console' | 'return' | 'dom'>('console');

  // Try to parse return value from output
  const parseReturnValue = (output: string) => {
    try {
      // Look for patterns like "Return value: ..." or just try to parse the entire output
      const returnMatch = output.match(/Return value:\s*(.+)/);
      if (returnMatch) {
        return JSON.parse(returnMatch[1]);
      }
      
      // Try to parse the entire output as JSON
      return JSON.parse(output);
    } catch {
      return null;
    }
  };

  const returnValue = parseReturnValue(output);
  const hasReturnValue = returnValue !== null;

  // Check if output contains HTML-like content
  const hasHTMLContent = output.includes('<') && output.includes('>');

  return (
    <div className={`border ${theme === Theme.Dark ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
      <div className={`${theme === Theme.Dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-3 py-2 text-sm font-medium border-b flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span>📝 JavaScript Output</span>
          {executionTime && (
            <span className={`text-xs px-2 py-1 rounded-full font-mono ${theme === Theme.Dark ? 'bg-green-900/80 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'}`}>
              {executionTime}ms
            </span>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'console' ? (theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800') : (theme === Theme.Dark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800')} transition-colors`}
          >
            Console
          </button>
          {hasReturnValue && (
            <button
              onClick={() => setActiveTab('return')}
              className={`px-2 py-1 text-xs rounded ${activeTab === 'return' ? (theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800') : (theme === Theme.Dark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800')} transition-colors`}
            >
              Return Value
            </button>
          )}
          {hasHTMLContent && (
            <button
              onClick={() => setActiveTab('dom')}
              className={`px-2 py-1 text-xs rounded ${activeTab === 'dom' ? (theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800') : (theme === Theme.Dark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800')} transition-colors`}
            >
              DOM Preview
            </button>
          )}
        </div>
      </div>

      <div className={`p-3 ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'}`}>
        {error ? (
          <div className={`p-3 rounded font-mono text-sm ${theme === Theme.Dark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'}`}>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        ) : (
          <>
            {activeTab === 'console' && (
              <div className={`p-3 rounded font-mono text-sm max-h-64 overflow-y-auto ${theme === Theme.Dark ? 'bg-gray-800 text-gray-100' : 'bg-gray-800 text-gray-100'}`}>
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            )}

            {activeTab === 'return' && hasReturnValue && (
              <div className={`p-3 rounded ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Return Value:</span>
                  <span className={`text-xs px-2 py-1 rounded ${theme === Theme.Dark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    {typeof returnValue}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <TreeNode data={returnValue} />
                </div>
              </div>
            )}

            {activeTab === 'dom' && hasHTMLContent && (
              <div className={`p-3 rounded ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">DOM Preview:</span>
                </div>
                <div className={`border rounded p-3 max-h-64 overflow-y-auto ${theme === Theme.Dark ? 'bg-white' : 'bg-white'}`}>
                  <div dangerouslySetInnerHTML={{ __html: output }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputVisualizer;
