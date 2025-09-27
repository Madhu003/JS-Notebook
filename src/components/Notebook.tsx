import { useState, useCallback } from 'react';
import CodeEditor from './CodeEditor/CodeEditor';
import MarkdownEditor from './MarkdownEditor/MarkdownEditor';

// Define all possible cell types
type CellType = 'code' | 'markdown';

// Define the base cell interface
interface BaseCell {
  id: string;
  content: string;
  type: CellType;
}

// Define specific cell types
interface CodeCell extends BaseCell {
  type: 'code';
  output?: string;
  error?: string;
}

interface MarkdownCell extends BaseCell {
  type: 'markdown';
}

// Union type for all cell types
type Cell = CodeCell | MarkdownCell;

// Type guard to check if a cell is a code cell
const isCodeCell = (cell: Cell): cell is CodeCell => {
  return cell.type === 'code';
};

const Notebook = (): JSX.Element => {
  const [cells, setCells] = useState<Cell[]>([
    { id: '1', content: '', type: 'code' as const }
  ]);

  const addCell = useCallback((type: CellType): void => {
    const newCell: Cell = {
      id: Date.now().toString(),
      content: '',
      type,
      ...(type === 'code' ? {} : {})
    };
    setCells(prevCells => [...prevCells, newCell]);
  }, []);

  const deleteCell = useCallback((id: string): void => {
    setCells(prevCells => prevCells.filter(cell => cell.id !== id));
  }, []);

  const handleContentChange = useCallback((cellId: string, content: string): void => {
    setCells(prevCells => 
      prevCells.map(cell => 
        cell.id === cellId ? { ...cell, content } : cell
      )
    );
  }, []);

  const runCode = useCallback((cell: Cell): void => {
    if (!isCodeCell(cell)) return;

    try {
      // Create a new function to capture console.log outputs
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      const customLog = (...args: unknown[]): void => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      console.log = customLog;

      // Evaluate the code
      const result = eval(cell.content);

      // Restore original console.log
      console.log = originalConsoleLog;

      // Update the cell with both the result and console.log outputs
      const output = [
        ...logs,
        result !== undefined ? String(result) : ''
      ].filter(Boolean).join('\n');

      setCells(prevCells => 
        prevCells.map(c => {
          if (c.id !== cell.id) return c;
          if (!isCodeCell(c)) return c;
          return { ...c, output, error: undefined };
        })
      );
    } catch (err) {
      setCells(prevCells => 
        prevCells.map(c => {
          if (c.id !== cell.id) return c;
          if (!isCodeCell(c)) return c;
          return { ...c, error: err instanceof Error ? err.message : 'Unknown error', output: undefined };
        })
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notebook toolbar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addCell('code')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Code Cell
          </button>
          <button
            type="button"
            onClick={() => addCell('markdown')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            + Markdown Cell
          </button>
        </div>
      </div>

      {/* Notebook cells */}
      <div className="max-w-5xl mx-auto p-6">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Cell toolbar */}
            <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                {cell.type === 'code' ? 'Code' : 'Markdown'}
              </span>
              <div className="flex gap-2">
                {cell.type === 'code' && (
                  <button 
                    type="button"
                    onClick={() => runCode(cell)}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    Run
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => deleteCell(cell.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            {/* Cell content */}
            <div className="p-4 min-h-[350px]">
              {cell.type === 'code' ? (
                <div className="h-full">
                  <CodeEditor
                    value={cell.content}
                    onChange={(value) => handleContentChange(cell.id, value)}
                    language="javascript"
                  />
                  <div className="text-xs text-gray-500 mt-1">JavaScript Editor</div>
                </div>
              ) : (
                <div className="h-full">
                  <MarkdownEditor
                    value={cell.content}
                    onChange={(value) => handleContentChange(cell.id, value)}
                  />
                  <div className="text-xs text-gray-500 mt-1">Markdown Editor</div>
                </div>
              )}
              {/* Output section */}
              {cell.type === 'code' && (cell.output || cell.error) && (
                <div className={`mt-2 p-3 rounded font-mono text-sm ${
                  cell.error ? 'bg-red-50 text-red-700' : 'bg-gray-800 text-gray-100'
                }`}>
                  <pre className="whitespace-pre-wrap">
                    {cell.error || cell.output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notebook;
