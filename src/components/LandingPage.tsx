import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notebookService } from '../services/notebookService';
import type { Notebook } from '../services/firebase';
import InlineEdit from './InlineEdit';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadNotebooks();
  }, [user]);

  const loadNotebooks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedNotebooks = await notebookService.getAllNotebooks(user.uid);
      setNotebooks(fetchedNotebooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notebooks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewNotebook = async () => {
    if (!user) return;
    
    try {
      setCreating(true);
      const cells = notebookService.createDefaultCells();
      const notebookId = await notebookService.createNotebook({
        title: 'Untitled Notebook',
        description: 'New notebook created',
        cells,
        tags: ['new'],
      }, user.uid);
      
      // Redirect to the new notebook
      window.location.href = `/notebook/${notebookId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notebook');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSample = async () => {
    if (!user) return;
    
    try {
      setCreating(true);
      const notebookId = await notebookService.createSampleTemplate(user.uid);
      window.location.href = `/notebook/${notebookId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sample notebook');
    } finally {
      setCreating(false);
    }
  };

  const handleRenameNotebook = async (id: string, newTitle: string) => {
    try {
      await notebookService.updateNotebook(id, { title: newTitle });
      setNotebooks(notebooks.map(notebook => 
        notebook.id === id ? { ...notebook, title: newTitle, updatedAt: Date.now() } : notebook
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to rename notebook');
    }
  };

  const handleDeleteNotebook = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await notebookService.deleteNotebook(id);
      setNotebooks(notebooks.filter(notebook => notebook.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notebook');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notebooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateNewNotebook}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <span className="mr-2">➕</span>
              )}
              Create New Notebook
            </button>
            
            <button
              onClick={handleCreateSample}
              disabled={creating}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <span className="mr-2">📚</span>
              )}
              Create Sample Notebook
            </button>

            <button
              onClick={loadNotebooks}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <span className="mr-2">🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notebooks Grid */}
        {notebooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notebooks yet</h3>
            <p className="text-gray-500 mb-6">Create your first notebook to get started!</p>
            <button
              onClick={handleCreateNewNotebook}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create Your First Notebook
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Notebooks ({notebooks.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notebooks.map((notebook) => (
                <div key={notebook.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  {/* Notebook Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2">
                          <InlineEdit
                            value={notebook.title}
                            onSave={(newTitle) => handleRenameNotebook(notebook.id, newTitle)}
                            className="text-lg font-semibold text-gray-900 block"
                            placeholder="Enter notebook title..."
                          />
                        </div>
                        {notebook.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {notebook.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center ml-4">
                        {notebook.isPublic ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            🌐 Public
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            🔒 Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notebook Metadata */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{notebook.cells.length} cells</span>
                      <span>Updated {formatDate(notebook.updatedAt)}</span>
                    </div>

                    {/* Tags */}
                    {notebook.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {notebook.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/notebook/${notebook.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-sm text-sm font-medium transition-colors"
                      >
                        Open
                      </Link>
                      <button
                        onClick={() => handleDeleteNotebook(notebook.id, notebook.title)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
