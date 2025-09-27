import React, { useState } from 'react';

interface Cell {
  id: string;
  content: string;
  type: 'code' | 'markdown';
  output?: string;
  error?: string;
}

const Notebook: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([
    { id: '1', content: '', type: 'code' }
  ]);

  const addCell = (type: 'code' | 'markdown') => {
    const newCell: Cell = {
      id: Date.now().toString(),
      content: '',
      type
    };
    setCells([...cells, newCell]);
  };

  const deleteCell = (id: string) => {
    setCells(cells.filter(cell => cell.id !== id));
  };

  const runCode = (cell: Cell) => {
    if (cell.type !== 'code') return;

    try {
      // Create a new function to capture console.log outputs
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // Evaluate the code
      const result = eval(cell.content);

      // Restore original console.log
      console.log = originalConsoleLog;

      // Update the cell with both the result and console.log outputs
      const output = [
        ...logs,
        result !== undefined ? String(result) : ''
      ].filter(Boolean).join('\\n');

      setCells(cells.map(c =>
        c.id === cell.id ? { ...c, output, error: undefined } : c
      ));
    } catch (err) {
      setCells(cells.map(c =>
        c.id === cell.id ? { ...c, error: (err as Error).message, output: undefined } : c
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notebook toolbar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => addCell('code')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Code Cell
          </button>
          <button
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
                    onClick={() => runCode(cell)}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    Run
                  </button>
                )}
                <button 
                  onClick={() => deleteCell(cell.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            {/* Cell content */}
            <div className="p-4">
              <textarea
                value={cell.content}
                onChange={(e) => {
                  const newCells = cells.map((c) =>
                    c.id === cell.id ? { ...c, content: e.target.value } : c
                  );
                  setCells(newCells);
                }}
                className="w-full min-h-[100px] font-mono bg-gray-50 p-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                placeholder={`Enter ${cell.type} here...`}
              />
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
