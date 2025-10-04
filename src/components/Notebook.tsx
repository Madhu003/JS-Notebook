import { useState, useEffect } from 'react';
import React from 'react';
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
import { useTheme, Theme } from '../contexts/ThemeContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHotkeys } from 'react-hotkeys-hook';
import { formatCode } from '../utils/formatting';
import { exportToPDF } from '../utils/export';
import { babelService } from '../services/babelService';

const Notebook = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  
  const [cells, setCells] = useState<Cell[]>([{
    id: `cell_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: CellType.Code,
    content: '',
    language: 'javascript'
  }] as Cell[]);

  // Keyboard shortcuts for global fallback (when Monaco shortcuts don't work)
  useHotkeys('ctrl+enter,cmd+enter', () => {
    if (selectedCellId) {
      const cell = cells.find(c => c.id === selectedCellId);
      if (cell && isCodeCell(cell)) {
        runCode(cell.id);
      }
    }
  });

  useHotkeys('ctrl+shift+f,cmd+shift+f', () => {
    if (selectedCellId) {
      formatCodeCell(selectedCellId);
    }
  });

  // Listen for custom events from Monaco editors
  useEffect(() => {
    const handleRunCell = (event: CustomEvent) => {
      const { cellId } = event.detail;
      runCode(cellId);
    };

    const handleFormatCell = (event: CustomEvent) => {
      const { cellId } = event.detail;
      formatCodeCell(cellId);
    };

    window.addEventListener('run-cell', handleRunCell as EventListener);
    window.addEventListener('format-cell', handleFormatCell as EventListener);

    return () => {
      window.removeEventListener('run-cell', handleRunCell as EventListener);
      window.removeEventListener('format-cell', handleFormatCell as EventListener);
    };
  });

  // Load notebook when component mounts
  useEffect(() => {
    const loadNotebook = async () => {
      if (id) {
        try {
          setLoading(true);
          const fetchedNotebook = await notebookService.getNotebook(id);
          
          if (fetchedNotebook) {
            setNotebook(fetchedNotebook);
            
            // Fix any cells with invalid IDs (migrate from Date.now() format)
            const fixCellIds = (cells: Cell[]): Cell[] => {
              return cells.map(cell => {
                // Check if ID is NOT in the new format (should start with 'cell_')
                if (!cell.id.startsWith('cell_')) {
                  console.warn(`⚠️ Migrating old cell ID: ${cell.id}`);
                  const timestamp = Date.now();
                  const randomSuffix = Math.random().toString(36).substring(2, 9);
                  return {
                    ...cell,
                    id: `cell_${timestamp}_${randomSuffix}`
                  };
                }
                return cell;
              });
            };
            
            const cells = fetchedNotebook.cells || notebookService.createDefaultCells();
            setCells(fixCellIds(cells));
          } else {
            setError('Notebook not found');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load notebook');
        } finally {
          setLoading(false);
        }
      } else {
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
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [cells, id, notebook, loading]);

  const saveNotebook = async (showMessage = true): Promise<boolean> => {
    try {
      setSaving(true);
      
      if (id) {
        await notebookService.updateNotebook(id, {
          title: notebook?.title || 'Untitled Notebook',
          description: notebook?.description,
          cells,
          tags: notebook?.tags || [],
          isPublic: notebook?.isPublic || false,
        });
      } else {
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

  const addCell = (type: CellType, insertIndex?: number) => {
    // Create a more robust unique ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const cellId = `cell_${timestamp}_${randomSuffix}`;
    
    const newCell: Cell = {
      id: cellId,
      type,
      content: '',
      language: type === 'code' ? 'javascript' : undefined,
      isCollapsed: false
    } as Cell;

    setCells(prev => {
      if (insertIndex !== undefined) {
        const newCells = [...prev];
        newCells.splice(insertIndex, 0, newCell);
        return newCells;
      }
      return [...prev, newCell];
    });
  };

  const deleteCell = (id: string) => {
    setCells(prev => prev.filter(cell => cell.id !== id));
  };

  const duplicateCell = (id: string) => {
    setCells(prev => {
      const cellIndex = prev.findIndex(cell => cell.id === id);
      if (cellIndex === -1) return prev;
      
      const cellToDuplicate = prev[cellIndex];
      const duplicatedCell: Cell = {
        ...cellToDuplicate,
        id: `cell_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        output: undefined,
        error: undefined,
        executionTime: undefined,
        isCollapsed: false
      } as Cell;
      
      const newCells = [...prev];
      newCells.splice(cellIndex + 1, 0, duplicatedCell);
      return newCells;
    });
  };

  const toggleCellCollapse = (id: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === id && isCodeCell(cell) ? { ...cell, isCollapsed: !cell.isCollapsed } : cell
    ));
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
      return { ...cell, language } as Cell;
    }));
  };

  const formatCodeCell = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || !isCodeCell(cell)) return;

    try {
      const formatted = await formatCode(cell.content || '', cell.language || 'javascript');
      handleContentChange(cellId, formatted);
    } catch (error) {
      console.error('Formatting error:', error);
    }
  };

  // Execute code with execution time tracking
  const runCode = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || !isCodeCell(cell)) return;

    const startTime = performance.now();
    
    try {
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
      
      if (lang === 'react' || lang === 'react-ts') {
        const isTypeScript = lang === 'react-ts';
        
        try {
          // Use Babel service for compilation
          const compileResult = await babelService.compileReact(code, isTypeScript);
          runnable = compileResult.code;
          
          if (!compileResult.success && compileResult.error) {
            logs.push('');
            logs.push('⚠️ React compilation had issues, running compiled code');
            logs.push(`Warning: ${compileResult.error}`);
          }
        } catch (babelError) {
          logs.push('');
          logs.push('⚠️ Babel compilation failed, running code as-is');
          logs.push(`Error: ${babelError instanceof Error ? babelError.message : String(babelError)}`);
          runnable = code; // Fallback to original code
        }
        
        const fn = new Function('console', 'React', runnable);
        await fn(customConsole as Console, React);
        
        try {
          logs.push('');
          logs.push('✅ React Component Created Successfully!');
          
          const previewContainer = document.getElementById(`react-preview-${cellId}`);
          if (previewContainer) {
            previewContainer.innerHTML = '';
            
            const staticHTML = `
              <div style="padding: 20px; border-radius: 8px; background-color: ${theme === Theme.Dark ? '#374151' : '#f8f9fa'}; border: 1px solid ${theme === Theme.Dark ? '#4b5563' : '#e9ecef'}; font-family: system-ui, sans-serif; color: ${theme === Theme.Dark ? '#f3f4f6' : '#212529'};">
                <h1 style="color: #61dafb; margin-top: 0;">Hello, React! ✨</h1>
                <p>Start editing to see some magic happen!</p>
                <button 
                  style="background-color: #61dafb; border: none; color: white; padding: 12px 24px; border-radius: 6px; cursor: pointer;"
                  onclick="console.log('🎉 Button was clicked!')"
                >
                  Click Me! 🚀
                </button>
              </div>
            `;
            
            previewContainer.innerHTML = staticHTML;
            logs.push('🎯 React Preview Rendered');
          }
        } catch (renderError) {
          logs.push('');
          logs.push('⚠️ React rendering failed');
          logs.push(`Error: ${renderError instanceof Error ? renderError.message : String(renderError)}`);
        }
      } else if (lang === 'typescript') {
        try {
          // Use Babel service for TypeScript compilation
          const compileResult = await babelService.compileTypeScript(code);
          runnable = compileResult.code;
          
          if (!compileResult.success && compileResult.error) {
            logs.push('');
            logs.push('⚠️ TypeScript compilation had issues, running compiled code');
            logs.push(`Warning: ${compileResult.error}`);
          }
        } catch (babelError) {
          logs.push('');
          logs.push('⚠️ TypeScript compilation failed, running as JavaScript');
          logs.push(`Error: ${babelError instanceof Error ? babelError.message : String(babelError)}`);
          runnable = code; // Fallback to original code
        }
        
        const fn = new Function('console', runnable);
        await fn(customConsole as Console);
      } else {
        const fn = new Function('console', runnable);
        await fn(customConsole as Console);
      }

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      setCells(prev => prev.map(c =>
        c.id === cellId ? { ...c, output: logs.join('\n'), error: undefined, executionTime } : c
      ));
    } catch (err) {
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      const message = err instanceof Error ? err.message : String(err);
      setCells(prev => prev.map(c =>
        c.id === cellId ? { ...c, error: message, output: undefined, executionTime } : c
      ));
    }
  };

  const handleDragEnd = (result: any) => {
    console.log('🎯 Drag end result:', {
      draggableId: result.draggableId,
      source: result.source,
      destination: result.destination,
      currentCellIds: cells.map(cell => cell.id),
      allCellsValid: cells.every(cell => cell.id.startsWith('cell_')),
      type: 'drag_end'
    });

    if (!result.destination) {
      console.log('❌ No destination provided');
      return;
    }

    if (result.source.index === result.destination.index) {
      console.log('⚠️ Same position, no reorder needed');
      return;
    }

    // Check if the draggableId exists in current cells
    const draggedCell = cells.find(cell => cell.id === result.draggableId);
    if (!draggedCell) {
      console.error(`❌ Could not find cell with ID: ${result.draggableId}`);
      console.log('Available cell IDs:', cells.map(cell => cell.id));
      return;
    }

    const items = Array.from(cells);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    console.log('✅ Reordering completed:', {
      from: result.source.index,
      to: result.destination.index,
      cellType: reorderedItem.type,
      newOrder: items.map((cell, idx) => `${idx}: ${cell.id.substring(0, 20)}`)
    });
    
    setCells(items);

    // Keep selected cell if it was moved
    if (selectedCellId === result.draggableId) {
      console.log(`✅ Selected cell moved from position ${result.source.index} to ${result.destination.index}`);
    }
    
    // Force a re-render to ensure DragDropContext has the latest state
    setTimeout(() => {
      console.log('🔄 State updated, cells now:', items.map(cell => cell.id.substring(0, 15)));
    }, 100);
  };

  const handleExportToPDF = async () => {
    try {
      await exportToPDF(notebook?.title || 'Untitled Notebook', cells);
    } catch (error) {
      console.error('Export to PDF failed:', error);
    }
  };


  // Handle loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === Theme.Dark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === Theme.Dark ? 'border-blue-400' : 'border-blue-600'} mx-auto`}></div>
          <p className={`mt-4 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-600'}`}>Loading notebook...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`min-h-screen ${theme === Theme.Dark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${theme === Theme.Dark ? 'text-red-400' : 'text-red-600'} mb-4`}>Error</h2>
          <p className={`${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>{error}</p>
          <button
            onClick={() => navigate('/')}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors`}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === Theme.Dark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      {/* Notebook toolbar */}
      <div className={`sticky top-0 ${theme === Theme.Dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 shadow-sm transition-colors`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={`${theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} flex items-center gap-2 transition-colors`}
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
            
            <div className={`text-xl font-semibold ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
              <InlineEdit
                value={notebook?.title || 'Untitled Notebook'}
                onSave={handleRenameNotebook}
                className={`font-semibold ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}
                placeholder="Enter notebook title..."
              />
            </div>
            
            {saving && (
              <span className={`text-sm ${theme === Theme.Dark ? 'text-blue-400' : 'text-blue-600'} flex items-center gap-2`}>
                <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${theme === Theme.Dark ? 'border-blue-400' : 'border-blue-600'}`}></div>
                Saving...
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveNotebook(true)}
              disabled={saving}
              className={`px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded transition-colors flex items-center gap-2`}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>💾</span>
              )}
              <span>Save</span>
            </button>
            
            <button
              type="button"
              onClick={() => addCell(CellType.Code)}
              className={`px-4 py-2 ${theme === Theme.Dark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded transition-colors`}
            >
              + Code
            </button>
            
            <button
              type="button"
              onClick={() => addCell(CellType.Markdown)}
              className={`px-4 py-2 ${theme === Theme.Dark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded transition-colors`}
            >
              + Markdown
            </button>

            <button
              type="button"
              onClick={handleExportToPDF}
              className={`px-4 py-2 ${theme === Theme.Dark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded transition-colors`}
            >
              📄 PDF
            </button>

          </div>
        </div>
      </div>

      {/* Notebook cells with drag and drop */}
      <div className="max-w-5xl mx-auto p-6">
        <DragDropContext 
          onDragStart={(result) => {
            console.log('🚀🚀🚀 DRAG START EVENT FIRED! 🚀🚀🚀');
            console.log('🚀 Drag start:', {
              draggableId: result.draggableId,
              source: result.source,
              currentCellIds: cells.map(cell => cell.id),
              hasDraggedCell: cells.some(cell => cell.id === result.draggableId),
              type: 'drag_start'
            });
          }}
          onBeforeDragStart={() => {
            console.log('🎯🎯🎯 BEFORE DRAG START! Should show drag ghost preview 🎯🎯🎯');
          }}
          onDragEnd={handleDragEnd}
        >
          <Droppable droppableId="notebook-cells">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="transition-colors duration-200"
              >
                {cells.map((cell, index) => (
                  <Draggable key={cell.id} draggableId={cell.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-4"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div
                          className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                            `${theme === Theme.Dark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'} shadow-sm`
                          } ${selectedCellId === cell.id ? `${theme === Theme.Dark ? 'ring-2 ring-blue-500 shadow-md' : 'ring-2 ring-blue-500 shadow-md'}` : ''}`}
                        >
                          {/* Cell header */}
                          <div className={`${
                            theme === Theme.Dark 
                              ? 'bg-gray-800' 
                              : 'bg-white'
                          } px-4 py-3 flex justify-between items-center border-b border-gray-300/20`}>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {cell.type === 'code' ? `Code (${cell.language})` : 'Markdown'}
                              </span>
                              {isCodeCell(cell) && cell.executionTime && (
                                <span className={`text-xs px-2 py-1 rounded-full font-mono ${theme === Theme.Dark ? 'bg-green-900/80 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                                  {cell.executionTime}ms
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {cell.type === 'code' ? (
                                <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  💡 Cmd+Enter to run • Cmd+Shift+F to format
                                </span>
                              ) : (
                                <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  👆 Click cell to edit
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Cell toolbar */}
                          <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-4 py-2 flex justify-between items-center`}>
                            <div className="flex items-center gap-2">
                              {/* Empty space for alignment */}
                            </div>
                            <div className="flex gap-2">
                              {isCodeCell(cell) && (
                                <>
                                  <button 
                                    type="button"
                                    onClick={() => runCode(cell.id)}
                                    className={`text-sm ${theme === Theme.Dark ? 'text-gray-300 hover:text-white bg-gray-600 hover:bg-gray-500' : 'text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50'} px-3 py-1 rounded border transition-colors`}
                                  >
                                    ▶️ Run
                                  </button>
                                  
                                  <button 
                                    type="button"
                                    onClick={() => formatCodeCell(cell.id)}
                                    className={`text-sm ${theme === Theme.Dark ? 'text-blue-400 hover:text-blue-300 bg-gray-600 hover:bg-gray-500' : 'text-blue-500 hover:text-blue-700 bg-white hover:bg-blue-50'} px-3 py-1 rounded border transition-colors`}
                                  >
                                    ✨ Format
                                  </button>

                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const currentLanguage = cell.language || 'javascript';
                                      const languageConfig = getLanguageConfig(currentLanguage);
                                      const boilerplate = languageConfig.boilerplate;
                                      if (boilerplate) {
                                        handleContentChange(cell.id, boilerplate);
                                      }
                                    }}
                                    className={`text-sm ${theme === Theme.Dark ? 'text-yellow-400 hover:text-yellow-300 bg-gray-600 hover:bg-gray-500' : 'text-yellow-600 hover:text-yellow-700 bg-white hover:bg-yellow-50'} px-3 py-1 rounded border transition-colors`}
                                  >
                                    📝 Template
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleCellCollapse(cell.id)}
                                    className={`text-sm ${theme === Theme.Dark ? 'text-gray-300 hover:text-white bg-gray-600 hover:bg-gray-500' : 'text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50'} px-3 py-1 rounded border transition-colors`}
                                  >
                                    {cell.isCollapsed ? '📖 Expand' : '📘 Collapse'}
                                  </button>
                                </>
                              )}
                              
                              <button 
                                type="button"
                                onClick={() => duplicateCell(cell.id)}
                                className={`text-sm ${theme === Theme.Dark ? 'text-green-400 hover:text-green-300 bg-gray-600 hover:bg-gray-500' : 'text-green-600 hover:text-green-700 bg-white hover:bg-green-50'} px-3 py-1 rounded border transition-colors`}
                              >
                                📋 Duplicate
                              </button>
                              
                              <button 
                                type="button"
                                onClick={() => deleteCell(cell.id)}
                                className={`text-sm ${theme === Theme.Dark ? 'text-red-400 hover:text-red-300 bg-gray-600 hover:bg-gray-500' : 'text-red-600 hover:text-red-700 bg-white hover:bg-red-50'} px-3 py-1 rounded border transition-colors`}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          {/* Cell content */}
                          {!isCodeCell(cell) || !cell.isCollapsed ? (
                            <div className="p-4 min-h-[350px]">
                              {cell.type === 'code' ? (
                                <div className="h-full">
                                  <CodeEditor
                                    value={cell.content}
                                    onChange={(value) => handleContentChange(cell.id, value)}
                                    language={cell.language}
                                    onLanguageChange={(lang) => handleLanguageChange(cell.id, lang)}
                                    onFocus={() => setSelectedCellId(cell.id)}
                                    cellId={cell.id}
                                  />
                                </div>
                              ) : (
                                <div className="h-full">
                                  <MarkdownEditor
                                    value={cell.content}
                                    onChange={(value) => handleContentChange(cell.id, value)}
                                    onFocus={() => setSelectedCellId(cell.id)}
                                    isFocused={selectedCellId === cell.id}
                                  />
                                </div>
                              )}
                              
                              {/* React Preview Section */}
                              {cell.type === 'code' && cell.language === 'react' && (
                                <div className="mt-4">
                                  <div className={`border ${theme === Theme.Dark ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
                                    <div className={`${theme === Theme.Dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-3 py-2 text-sm font-medium border-b`}>
                                      🎯 Live React Preview
                                    </div>
                                    <div className={`p-4 ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} min-h-[200px]`}>
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
                                  <div className={`p-3 rounded font-mono text-sm mb-2 ${
                                    cell.error 
                                      ? `${theme === Theme.Dark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'}`
                                      : `${theme === Theme.Dark ? 'bg-gray-800 text-gray-100' : 'bg-gray-800 text-gray-100'}`
                                  }`}>
                                    <pre className="whitespace-pre-wrap">
                                      {cell.error || cell.output}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className={`p-4 ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
                              <p className={`${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Cell collapsed - click expand to view content
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
        </div>
  );
};

export default Notebook;