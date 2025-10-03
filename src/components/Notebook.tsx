 import { useState, useEffect } from 'react';
import React from 'react';
import * as Babel from '@babel/standalone';
import CodeEditor from './CodeEditor/CodeEditor';
import MarkdownEditor from './MarkdownEditor/MarkdownEditor';
import { useParams, useNavigate } from 'react-router-dom';
import type { Cell } from '../types';
import { CellType, isCodeCell } from '../types';
import { getLanguageConfig } from '../constants/languages';
import { notebookService } from '../services/notebookService';
import type { Notebook } from '../services/firebase';
import InlineEdit from './InlineEdit';
import { useAuth } from '../contexts/AuthContext';
 

const Notebook = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cells, setCells] = useState<Cell[]>([{
    id: Date.now().toString(),
    type: CellType.Code,
    content: '',
    language: 'javascript'
  }] as Cell[]);

  // Load notebook when component mounts
  useEffect(() => {
    const loadNotebook = async () => {
      if (id) {
        try {
          setLoading(true);
          const fetchedNotebook = await notebookService.getNotebook(id);
          
          if (fetchedNotebook) {
            setNotebook(fetchedNotebook);
            setCells(fetchedNotebook.cells || notebookService.createDefaultCells());
          } else {
            setError('Notebook not found');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load notebook');
        } finally {
          setLoading(false);
        }
      } else {
        // Create new notebook
        setLoading(false);
      }
    };

    loadNotebook();
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (!id || loading || !notebook) return;
    
    const timeoutId = setTimeout(async () => {
      await saveNotebook(false);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [cells, id, notebook, loading]);

  const saveNotebook = async (showMessage = true): Promise<boolean> => {
    try {
      setSaving(true);
      
      if (id) {
        // Update existing notebook
        await notebookService.updateNotebook(id, {
          title: notebook?.title || 'Untitled Notebook',
          description: notebook?.description,
          cells,
          tags: notebook?.tags || [],
          isPublic: notebook?.isPublic || false,
        });
      } else {
        // Create new notebook
        const newId = await notebookService.createNotebook({
          title: 'Untitled Notebook',
          description: '',
          cells,
          tags: [],
          isPublic: false,
        }, user?.uid || '');
        navigate(`/notebook/${newId}`, { replace: true });
      }
      
      if (showMessage) {
        // You could add a toast message here
        console.log('✅ Notebook saved successfully');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notebook');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRenameNotebook = async (newTitle: string) => {
    if (!id || !notebook) return;
    
    try {
      setSaving(true);
      await notebookService.updateNotebook(id, { title: newTitle });
      setNotebook({ ...notebook, title: newTitle, updatedAt: Date.now() });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to rename notebook');
    } finally {
      setSaving(false);
    }
  };

  const addCell = (type: CellType) => {
    setCells(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content: '',
      language: type === 'code' ? 'javascript' : undefined
    }]);
  };

  const deleteCell = (id: string) => {
    setCells(prev => prev.filter(cell => cell.id !== id));
  };

  const handleContentChange = (id: string, content: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === id ? { ...cell, content } : cell
    ));
  };

  const handleLanguageChange = (id: string, language: string) => {
    setCells(prev => prev.map(cell => {
      if (cell.id !== id) return cell;
      if (!isCodeCell(cell)) return cell as Cell;
      // Only change the language, keep the existing content (don't auto-add boilerplate)
      return { ...cell, language } as Cell;
    }));
  };

  // Execute code in a cell and store output/error on that cell
  const runCode = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || !isCodeCell(cell)) return;

    try {
      // Reset output/error first
      setCells(prev => prev.map(c => c.id === cellId ? { ...c, output: undefined, error: undefined } : c));

      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
        }
      };

      const code = cell.content || '';
      const lang = cell.language || 'javascript';

      let runnable = code;
      
      // Handle React/React-TS code with export statements
      if (lang === 'react' || lang === 'react-ts') {
        // Remove export statements and execute the component directly
        const modifiedCode = code
          .replace(/export default /g, 'const exportedComponent = ')
          .replace(/export /g, 'const ');
        
        const presets: any[] = [];
        if (lang === 'react-ts') presets.push('typescript');
        presets.push(['react', { runtime: 'classic' }]);
        
        const result = Babel.transform(modifiedCode, { presets });
        runnable = result.code || '';
        
        // Execute the React component code with React available
        const fn = new Function('console', 'React', runnable);
        await fn(customConsole as Console, React);
        
        // Simple React component rendering with debug info
        try {
          logs.push('');
          logs.push('✅ React Component Created Successfully!');
          logs.push('🔍 Debug: Checking for preview container...');
          
          // Get preview container
          const previewContainer = document.getElementById(`react-preview-${cellId}`);
          logs.push(`🔍 Debug: Preview container found: ${!!previewContainer}`);
          
          if (previewContainer) {
            // Clear container
            previewContainer.innerHTML = '';
            
            // Try simple static HTML first for testing
            const staticHTML = `
              <div style="padding: 20px; border-radius: 8px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-family: system-ui, sans-serif;">
                <h1 style="color: #61dafb; margin-top: 0;">Hello, React! ✨</h1>
                <p style="color: #6c757d;">Start editing to see some magic happen!</p>
                <button 
                  style="background-color: #61dafb; border: none; color: white; padding: 12px 24px; border-radius: 6px; cursor: pointer;"
                  onclick="console.log('🎉 Button was clicked!')"
                >
                  Click Me! 🚀
                </button>
              </div>
            `;
            
            previewContainer.innerHTML = staticHTML;
            logs.push('🎯 React Preview Rendered (Static HTML)');
            
            // Try to render actual React component
            try {
              logs.push('🔍 Debug: Attempting React DOM rendering...');
              
              // Execute component code in a controlled environment
              const componentCode = `
                ${runnable}
                
                // Export the component
                if (typeof exportedComponent !== 'undefined') {
                  window.lastExportedComponent = exportedComponent;
                } else if (typeof App !== 'undefined') {
                  window.lastExportedComponent = App;
                }
              `;
              
              const fn = new Function('React', 'console', componentCode);
              await fn(React, customConsole as Console);
              
              // Check if component was exported
              const ComponentToRender = (window as any).lastExportedComponent;
              logs.push(`🔍 Debug: Component found: ${!!ComponentToRender}`);
              
              if (ComponentToRender) {
                // Try to render with ReactDOM
                try {
                  // @ts-ignore
                  const { createRoot } = await import('react-dom/client');
                  const element = React.createElement(ComponentToRender);
                  const root = createRoot(previewContainer);
                  root.render(element);
                  logs.push('🎯 Real React Component Rendered!');
                } catch (reactDOMError) {
                  const errorMsg = reactDOMError instanceof Error ? reactDOMError.message : String(reactDOMError);
                  logs.push(`⚠️ ReactDOM Error: ${errorMsg}`);
                  logs.push('🎯 Using Static Preview Instead');
                }
              } else {
                logs.push('⚠️ No valid React component found');
              }
              
            } catch (componentError) {
              const errorMsg = componentError instanceof Error ? componentError.message : String(componentError);
              logs.push(`⚠️ Component Error: ${errorMsg}`);
              logs.push('🎯 Using Static Preview Instead');
            }
          } else {
            logs.push('⚠️ Preview container not found!');
          }
          
        } catch (renderError) {
          logs.push('');
          logs.push('⚠️  React rendering failed completely');
          logs.push(`Error: ${renderError instanceof Error ? renderError.message : String(renderError)}`);
        }
      } else if (lang === 'typescript') {
        // Handle TypeScript without React
        const result = Babel.transform(code, { presets: ['typescript', 'env'] });
        runnable = result.code || '';
        
        const fn = new Function('console', runnable);
        await fn(customConsole as Console);
      } else {
        // Handle vanilla JavaScript
        const fn = new Function('console', runnable);
        await fn(customConsole as Console);
      }

      setCells(prev => prev.map(c =>
        c.id === cellId ? { ...c, output: logs.join('\n'), error: undefined } : c
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setCells(prev => prev.map(c =>
        c.id === cellId ? { ...c, error: message, output: undefined } : c
      ));
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notebook...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notebook toolbar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
            
            <div className="text-xl font-semibold text-gray-800">
              <InlineEdit
                value={notebook?.title || 'Untitled Notebook'}
                onSave={handleRenameNotebook}
                className="font-semibold text-gray-800"
                placeholder="Enter notebook title..."
              />
            </div>
            
            {saving && (
              <span className="text-sm text-blue-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Saving...
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveNotebook(true)}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded transition-colors flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>💾</span>
              )}
              <span>Save Notebook</span>
            </button>
            
            <button
              type="button"
              onClick={() => addCell(CellType.Code)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              + Code Cell
            </button>
            <button
              type="button"
              onClick={() => addCell(CellType.Markdown)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              + Markdown Cell
            </button>
          </div>
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
                  <>
                    <button 
                      type="button"
                      onClick={() => { void runCode(cell.id); }}
                      className="text-sm text-gray-500 hover:text-gray-700 bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Run
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const currentLanguage = cell.language || 'javascript';
                        console.log('Boilerplate button clicked for language:', currentLanguage);
                        const languageConfig = getLanguageConfig(currentLanguage);
                        console.log('Language config:', languageConfig);
                        const boilerplate = languageConfig.boilerplate;
                        console.log('Boilerplate content:', boilerplate);
                        if (boilerplate) {
                          handleContentChange(cell.id, boilerplate);
                          console.log('Boilerplate inserted successfully');
                        } else {
                          console.error('No boilerplate found for language:', currentLanguage);
                        }
                      }}
                      className="text-sm text-blue-500 hover:text-blue-700 bg-white px-3 py-1 rounded border border-blue-300 hover:bg-blue-50"
                    >
                      Boilerplate
                    </button>
                  </>
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
                    language={cell.language}
                    onLanguageChange={(lang) => handleLanguageChange(cell.id, lang)}
                  />
                </div>
              ) : (
                <div className="h-full">
                  <MarkdownEditor
                    value={cell.content}
                    onChange={(value) => handleContentChange(cell.id, value)}
                  />
                </div>
              )}
              
              {/* React Preview Section - Always visible for React components */}
              {cell.type === 'code' && cell.language === 'react' && (
                <div className="mt-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border-b">
                      🎯 Live React Preview
                    </div>
                    <div className="p-4 bg-white min-h-[200px]">
                      <div id={`react-preview-${cell.id}`} className="react-preview-container">
                        {/* React component will be rendered here */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Output section */}
              {cell.type === 'code' && (cell.output || cell.error) && (
                <div className="mt-4">
                  {/* Console Output */}
                  <div className={`p-3 rounded font-mono text-sm mb-2 ${
                    cell.error ? 'bg-red-50 text-red-700' : 'bg-gray-800 text-gray-100'
                  }`}>
                    <pre className="whitespace-pre-wrap">
                      {cell.error || cell.output}
                    </pre>
                  </div>
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
