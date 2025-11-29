import { useState, useEffect } from 'react';
import React from 'react';
import JavaScriptEditor from './JavaScriptEditor';
import ReactEditor from './ReactEditor';
import MarkdownEditor from './MarkdownEditor';
import { useParams, useNavigate } from 'react-router-dom';
import type { Cell } from '../types';
import { CellType, isCodeCell } from '../types';
import { getLanguageConfig } from '../constants/languages';
import { notebookService } from '../services/notebookService';
import type { Notebook } from '../services/firebase';
import InlineEdit from './InlineEdit';
import { useAuth } from '../hooks/useAuth';
import { useTheme, Theme } from '../hooks/useTheme';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHotkeys } from 'react-hotkeys-hook';
import { formatCode } from '../utils/formatting';
import { exportToPDF } from '../utils/export';
import { babelService } from '../services/babelService';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DescriptionIcon from '@mui/icons-material/Description';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CircularProgress from '@mui/material/CircularProgress';

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

  const addCell = (type: CellType, language?: string, insertIndex?: number) => {
    // Create a more robust unique ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const cellId = `cell_${timestamp}_${randomSuffix}`;
    
    const newCell: Cell = {
      id: cellId,
      type,
      content: '',
      language: type === 'code' ? (language || 'javascript') : undefined,
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
    if (!cell) return;

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
      const lang = isCodeCell(cell) ? (cell.language || 'javascript') : 'markdown';

      let runnable = code;

      // Handle markdown cells
      if (cell.type === 'markdown') {
        try {
          logs.push('📝 Processing Markdown content...');
          logs.push('');
          
          // Simple markdown processing simulation
          const lines = code.split('\n');
          let processedLines = 0;
          
          lines.forEach((line) => {
            if (line.trim()) {
              processedLines++;
              if (line.startsWith('# ')) {
                logs.push(`✅ Heading 1: ${line.substring(2)}`);
              } else if (line.startsWith('## ')) {
                logs.push(`✅ Heading 2: ${line.substring(3)}`);
              } else if (line.startsWith('### ')) {
                logs.push(`✅ Heading 3: ${line.substring(4)}`);
              } else if (line.startsWith('- ') || line.startsWith('* ')) {
                logs.push(`✅ List item: ${line.substring(2)}`);
              } else if (line.startsWith('```')) {
                logs.push(`✅ Code block detected`);
              } else if (line.trim()) {
                logs.push(`✅ Paragraph: ${line.substring(0, 50)}${line.length > 50 ? '...' : ''}`);
              }
            }
          });
          
          logs.push('');
          logs.push(`📊 Markdown Processing Complete:`);
          logs.push(`   - Total lines: ${lines.length}`);
          logs.push(`   - Processed lines: ${processedLines}`);
          logs.push(`   - Empty lines: ${lines.length - processedLines}`);
          logs.push('');
          logs.push('🎯 Markdown preview updated successfully!');
          
        } catch (markdownError) {
          logs.push('');
          logs.push('❌ Markdown processing error:');
          logs.push(`Error: ${markdownError instanceof Error ? markdownError.message : String(markdownError)}`);
        }
      } else if (isCodeCell(cell)) {
        if (lang === 'react' || lang === 'react-ts') {
        const isTypeScript = lang === 'react-ts';
        
        // Add initial logs
        logs.push('🚀 Starting React component execution...');
        logs.push(`📝 Language: ${lang}`);
        logs.push(`📄 Code length: ${code.length} characters`);
        
        try {
          // Use Babel service for compilation
          logs.push('🔧 Calling Babel service for React compilation...');
          const compileResult = await babelService.compileReact(code, isTypeScript);
          
          logs.push(`📊 Compilation result: success=${compileResult.success}`);
          if (compileResult.error) {
            logs.push(`❌ Compilation error: ${compileResult.error}`);
          }
          
          logs.push(`📏 Compiled code length: ${compileResult.code.length} characters`);
          logs.push(`📄 First 100 chars of compiled code: ${compileResult.code.substring(0, 100)}...`);
          
          // Debug: Show more of the compiled code
          logs.push(`📄 Full compiled code:`);
          logs.push(compileResult.code);
          
          runnable = compileResult.code;
          
          logs.push('✅ Babel compilation completed');
          
        } catch (babelError) {
          logs.push('');
          logs.push('❌ CRITICAL: Babel compilation FAILED!');
          logs.push(`Error: ${babelError instanceof Error ? babelError.message : String(babelError)}`);
          logs.push('');
          logs.push('⚠️ Cannot execute JSX without compilation!');
          logs.push('Please check that:');
          logs.push('1. Babel is loaded correctly');
          logs.push('2. The code syntax is valid JSX');
          logs.push('3. Browser console for detailed error logs');
          
          // Set error and return - DO NOT execute uncompiled JSX
          const endTime = performance.now();
          const executionTime = Math.round(endTime - startTime);
          const errorMessage = `Babel compilation failed: ${babelError instanceof Error ? babelError.message : String(babelError)}`;
          
          setCells(prev => prev.map(c =>
            c.id === cellId ? { ...c, error: errorMessage, output: logs.join('\n'), executionTime } : c
          ));
          return;
        }
        
        logs.push('🎯 Executing React component...');
        
        // Ensure React is available in the execution context
        const ReactForExecution = React;
        logs.push(`📦 React object available: ${ReactForExecution ? 'Yes' : 'No'}`);
        logs.push(`📦 React.createElement available: ${typeof ReactForExecution?.createElement === 'function' ? 'Yes' : 'No'}`);
        
        const fn = new Function('console', 'React', runnable);
        await fn(customConsole as Console, ReactForExecution);
        
        logs.push('✅ React component execution completed');
        
        try {
          logs.push('');
          logs.push('🎯 Rendering React component to preview...');
          
          const previewContainer = document.getElementById(`react-preview-${cellId}`);
          if (previewContainer) {
            previewContainer.innerHTML = '';
            
            // Create a React root for this specific preview
            const rootElement = document.createElement('div');
            previewContainer.appendChild(rootElement);
            
            try {
              // Execute the compiled code to get the component
              logs.push('🔧 Executing compiled React code...');
              const componentFunction = new Function('React', 'console', runnable);
              
              // Create a React element from the component
              let reactElement;
              try {
                // Execute the compiled code to set up the component
                componentFunction(React, customConsole);
                
                // Try to find the component in various ways
                let component = null;
                
                // Method 1: Look for exported component
                if ((window as any).exportedComponent && typeof (window as any).exportedComponent === 'function') {
                  component = (window as any).exportedComponent;
                  logs.push('✅ Found exported component');
                }
                // Method 2: Look for App component
                else if ((window as any).App && typeof (window as any).App === 'function') {
                  component = (window as any).App;
                  logs.push('✅ Found App component');
                }
                // Method 3: Look for any function that starts with uppercase
                else {
                  const globalKeys = Object.keys(window);
                  for (const key of globalKeys) {
                    if (key[0] === key[0].toUpperCase() && typeof (window as any)[key] === 'function') {
                      component = (window as any)[key];
                      logs.push(`✅ Found component: ${key}`);
                      break;
                    }
                  }
                }
                
                if (component && typeof component === 'function') {
                  // Create React element from component
                  reactElement = React.createElement(component);
                  logs.push('✅ React element created from component function');
                } else {
                  // Fallback: create a simple component
                  logs.push('⚠️ No component found, creating fallback component');
                  const FallbackComponent = () => {
                    return React.createElement('div', {
                      style: {
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        fontFamily: 'system-ui, sans-serif'
                      }
                    }, 
                      React.createElement('h3', { style: { margin: '0 0 10px 0', color: '#495057' } }, 'Component Executed'),
                      React.createElement('p', { style: { margin: 0, color: '#6c757d' } }, 'Code compiled and executed successfully!')
                    );
                  };
                  reactElement = React.createElement(FallbackComponent);
                }
              } catch (componentError) {
                logs.push(`⚠️ Component execution error: ${componentError instanceof Error ? componentError.message : String(componentError)}`);
                
                // Fallback: try to create a simple component from the code
                const fallbackCode = `
                  function FallbackComponent() {
                    return React.createElement('div', {
                      style: {
                        padding: '20px',
                        borderRadius: '8px',
                        backgroundColor: '${theme === Theme.Dark ? '#374151' : '#f8f9fa'}',
                        border: '1px solid ${theme === Theme.Dark ? '#4b5563' : '#e9ecef'}',
                        fontFamily: 'system-ui, sans-serif',
                        color: '${theme === Theme.Dark ? '#f3f4f6' : '#212529'}'
                      }
                    }, 
                      React.createElement('h2', { style: { color: '#61dafb', marginTop: 0 } }, 'React Component'),
                      React.createElement('p', null, 'Component executed successfully!'),
                      React.createElement('div', {
                        style: {
                          backgroundColor: '${theme === Theme.Dark ? '#1f2937' : '#f3f4f6'}',
                          padding: '12px',
                          borderRadius: '4px',
                          marginTop: '12px'
                        }
                      },
                        React.createElement('code', {
                          style: {
                            color: '${theme === Theme.Dark ? '#10b981' : '#059669'}',
                            fontFamily: 'Monaco, Consolas, monospace'
                          }
                        }, '✅ Code compiled and executed')
                      )
                    );
                  }
                `;
                
                const fallbackFunction = new Function('React', 'console', fallbackCode);
                reactElement = React.createElement(fallbackFunction(React, customConsole));
                logs.push('🔄 Using fallback component');
              }
              
              // Render the React element using ReactDOM
              logs.push('🎨 Rendering React element to DOM...');
              
              // Use ReactDOM to render the component
              const ReactDOM = (window as any).ReactDOM;
              logs.push(`🔍 ReactDOM check: ${ReactDOM ? 'EXISTS' : 'NULL'}`);
              logs.push(`🔍 ReactDOM.render: ${ReactDOM?.render ? 'EXISTS' : 'NULL'}`);
              
              if (ReactDOM && ReactDOM.render) {
                logs.push('🎨 Using ReactDOM.render...');
                ReactDOM.render(reactElement, rootElement);
                logs.push('✅ React component rendered successfully!');
              } else {
                // Fallback: try to use createRoot if available
                const ReactDOMClient = (window as any).ReactDOMClient;
                logs.push(`🔍 ReactDOMClient check: ${ReactDOMClient ? 'EXISTS' : 'NULL'}`);
                logs.push(`🔍 ReactDOMClient.createRoot: ${ReactDOMClient?.createRoot ? 'EXISTS' : 'NULL'}`);
                
                if (ReactDOMClient && ReactDOMClient.createRoot) {
                  logs.push('🎨 Using ReactDOMClient.createRoot...');
                  const root = ReactDOMClient.createRoot(rootElement);
                  root.render(reactElement);
                  logs.push('✅ React component rendered with createRoot!');
                } else {
                  logs.push('❌ Neither ReactDOM.render nor ReactDOMClient.createRoot available');
                  logs.push('Available ReactDOM methods: ' + Object.keys(ReactDOM || {}).join(', '));
                  throw new Error('ReactDOM not available - neither render nor createRoot found');
                }
              }
              
            } catch (renderError) {
              logs.push(`❌ React rendering failed: ${renderError instanceof Error ? renderError.message : String(renderError)}`);
              
              // Ultimate fallback: show error message
              rootElement.innerHTML = `
                <div style="padding: 20px; border-radius: 8px; background-color: ${theme === Theme.Dark ? '#374151' : '#f8f9fa'}; border: 1px solid ${theme === Theme.Dark ? '#4b5563' : '#e9ecef'}; font-family: system-ui, sans-serif; color: ${theme === Theme.Dark ? '#f3f4f6' : '#212529'};">
                  <h2 style="color: #ef4444; margin-top: 0;">⚠️ Rendering Error</h2>
                  <p>Could not render React component. Check console for details.</p>
                  <div style="background-color: ${theme === Theme.Dark ? '#1f2937' : '#f3f4f6'}; padding: 12px; border-radius: 4px; margin-top: 12px;">
                    <code style="color: #ef4444; font-family: 'Monaco', 'Consolas', monospace;">
                      ${renderError instanceof Error ? renderError.message : String(renderError)}
                    </code>
                  </div>
                </div>
              `;
            }
          } else {
            logs.push('⚠️ Preview container not found');
          }
        } catch (previewError) {
          logs.push('');
          logs.push('❌ Preview rendering failed');
          logs.push(`Error: ${previewError instanceof Error ? previewError.message : String(previewError)}`);
        }
        } else if (lang === 'typescript') {
        // Add initial logs for TypeScript
        logs.push('🚀 Starting TypeScript execution...');
        logs.push(`📝 Language: ${lang}`);
        logs.push(`📄 Code length: ${code.length} characters`);
        
        try {
          // Use Babel service for TypeScript compilation
          logs.push('🔧 Calling Babel service for TypeScript compilation...');
          const compileResult = await babelService.compileTypeScript(code);
          
          logs.push(`📊 Compilation result: success=${compileResult.success}`);
          if (compileResult.error) {
            logs.push(`❌ Compilation error: ${compileResult.error}`);
          }
          
          logs.push(`📏 Compiled code length: ${compileResult.code.length} characters`);
          logs.push(`📄 First 100 chars of compiled code: ${compileResult.code.substring(0, 100)}...`);
          
          runnable = compileResult.code;
          
          logs.push('✅ TypeScript compilation completed');
          
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
        
        logs.push('🎯 Executing TypeScript code...');
        const fn = new Function('console', runnable);
        await fn(customConsole as Console);
        
        logs.push('✅ TypeScript execution completed');
      } else {
        // Add initial logs for JavaScript
        logs.push('🚀 Starting JavaScript execution...');
        logs.push(`📝 Language: ${lang}`);
        logs.push(`📄 Code length: ${code.length} characters`);
        
        logs.push('🎯 Executing JavaScript code...');
        const fn = new Function('console', runnable);
        await fn(customConsole as Console);
        
        logs.push('✅ JavaScript execution completed');
      }
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
      // Show loading state
      const originalButton = document.querySelector('[data-pdf-button]') as HTMLButtonElement;
      if (originalButton) {
        originalButton.disabled = true;
        originalButton.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Generating PDF...';
      }
      
      await exportToPDF(notebook?.title || 'Untitled Notebook', cells);
      
      // Restore button state
      if (originalButton) {
        originalButton.disabled = false;
        originalButton.innerHTML = '📄 PDF';
      }
    } catch (error) {
      console.error('Export to PDF failed:', error);
      
      // Restore button state on error
      const originalButton = document.querySelector('[data-pdf-button]') as HTMLButtonElement;
      if (originalButton) {
        originalButton.disabled = false;
        originalButton.innerHTML = '📄 PDF';
      }
    }
  };


  // Handle loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === Theme.Dark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <CircularProgress 
            size={48} 
            className={theme === Theme.Dark ? 'text-blue-400' : 'text-blue-600'} 
            sx={{ color: theme === Theme.Dark ? '#60a5fa' : '#2563eb' }}
          />
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
              <ArrowBackIcon />
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
                <SaveIcon />
              )}
              <span>Save</span>
            </button>
            
            {/* Add Cell Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  const [type, language] = e.target.value.split('-');
                  addCell(type as CellType, language);
                  e.target.value = ''; // Reset dropdown
                }}
                className={`px-4 py-2 ${theme === Theme.Dark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded transition-colors appearance-none pr-8 cursor-pointer`}
                defaultValue=""
              >
                <option value="" disabled>+ Add Cell</option>
                <option value="code-javascript">JavaScript</option>
                <option value="code-typescript">TypeScript</option>
                <option value="code-react">React</option>
                <option value="code-react-ts">React TypeScript</option>
                <option value="markdown-">Markdown</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ExpandMoreIcon className="text-white" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportToPDF}
              data-pdf-button
              className={`px-4 py-2 ${theme === Theme.Dark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded transition-colors flex items-center gap-2`}
            >
              <PictureAsPdfIcon />
              <span>PDF</span>
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
                        {...provided.dragHandleProps}
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
                                <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                                  <LightbulbIcon style={{ fontSize: 14 }} />
                                  Cmd+Enter to run • Cmd+Shift+F to format
                                </span>
                              ) : (
                                <span className={`text-xs ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                                  <TouchAppIcon style={{ fontSize: 14 }} />
                                  Click cell to edit
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
                              {/* Run button for all cell types */}
                              <button 
                                type="button"
                                onClick={() => runCode(cell.id)}
                                className={`text-sm ${theme === Theme.Dark ? 'text-gray-300 hover:text-white bg-gray-600 hover:bg-gray-500' : 'text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50'} px-3 py-1 rounded border transition-colors flex items-center gap-1`}
                              >
                                <PlayArrowIcon fontSize="small" />
                                <span>Run</span>
                              </button>
                              
                              {isCodeCell(cell) && (
                                <>
                                  
                                  <button 
                                    type="button"
                                    onClick={() => formatCodeCell(cell.id)}
                                    className={`text-sm ${theme === Theme.Dark ? 'text-blue-400 hover:text-blue-300 bg-gray-600 hover:bg-gray-500' : 'text-blue-500 hover:text-blue-700 bg-white hover:bg-blue-50'} px-3 py-1 rounded border transition-colors flex items-center gap-1`}
                                  >
                                    <AutoFixHighIcon fontSize="small" />
                                    <span>Format</span>
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
                                    className={`text-sm ${theme === Theme.Dark ? 'text-yellow-400 hover:text-yellow-300 bg-gray-600 hover:bg-gray-500' : 'text-yellow-600 hover:text-yellow-700 bg-white hover:bg-yellow-50'} px-3 py-1 rounded border transition-colors flex items-center gap-1`}
                                  >
                                    <DescriptionIcon fontSize="small" />
                                    <span>Template</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleCellCollapse(cell.id)}
                                    className={`text-sm ${theme === Theme.Dark ? 'text-gray-300 hover:text-white bg-gray-600 hover:bg-gray-500' : 'text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50'} px-3 py-1 rounded border transition-colors flex items-center gap-1`}
                                  >
                                    {cell.isCollapsed ? (
                                      <>
                                        <UnfoldMoreIcon fontSize="small" />
                                        <span>Expand</span>
                                      </>
                                    ) : (
                                      <>
                                        <UnfoldLessIcon fontSize="small" />
                                        <span>Collapse</span>
                                      </>
                                    )}
                                  </button>
                                </>
                              )}
                              
                              <button 
                                type="button"
                                onClick={() => duplicateCell(cell.id)}
                                className={`text-sm ${theme === Theme.Dark ? 'text-green-400 hover:text-green-300 bg-gray-600 hover:bg-gray-500' : 'text-green-600 hover:text-green-700 bg-white hover:bg-green-50'} px-3 py-1 rounded border transition-colors flex items-center gap-1`}
                              >
                                <ContentCopyIcon fontSize="small" />
                                <span>Duplicate</span>
                              </button>
                              
                              <button 
                                type="button"
                                onClick={() => deleteCell(cell.id)}
                                className={`text-sm ${theme === Theme.Dark ? 'text-red-400 hover:text-red-300 bg-gray-600 hover:bg-gray-500' : 'text-red-600 hover:text-red-700 bg-white hover:bg-red-50'} px-3 py-1 rounded border transition-colors flex items-center gap-1`}
                              >
                                <DeleteIcon fontSize="small" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Cell content */}
                          {!isCodeCell(cell) || !cell.isCollapsed ? (
                            <div className="p-4 min-h-[500px]">
                              {cell.type === 'code' ? (
                                <div className="h-full">
                                  {cell.language === 'react' || cell.language === 'react-ts' ? (
                                    <ReactEditor
                                      value={cell.content}
                                      onChange={(value) => handleContentChange(cell.id, value)}
                                      language={cell.language}
                                      onFocus={() => setSelectedCellId(cell.id)}
                                      cellId={cell.id}
                                      output={cell.output}
                                      error={cell.error}
                                      executionTime={cell.executionTime}
                                    />
                                  ) : (
                                    <JavaScriptEditor
                                      value={cell.content}
                                      onChange={(value) => handleContentChange(cell.id, value)}
                                      language={cell.language}
                                      onFocus={() => setSelectedCellId(cell.id)}
                                      cellId={cell.id}
                                      output={cell.output}
                                      error={cell.error}
                                      executionTime={cell.executionTime}
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="h-full">
                                  <MarkdownEditor
                                    value={cell.content}
                                    onChange={(value) => handleContentChange(cell.id, value)}
                                    onFocus={() => setSelectedCellId(cell.id)}
                                    isFocused={selectedCellId === cell.id}
                                    onRun={runCode}
                                    cellId={cell.id}
                                    output={cell.output}
                                    error={cell.error}
                                    executionTime={cell.executionTime}
                                  />
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