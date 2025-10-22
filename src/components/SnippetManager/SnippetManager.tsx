import React, { useState, useEffect } from 'react';
import { useSnippets } from '../../contexts/SnippetContext';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import type { Snippet, CreateSnippetData, UpdateSnippetData } from '../../types';

interface SnippetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: string;
}

const SnippetManager: React.FC<SnippetManagerProps> = ({ 
  isOpen, 
  onClose, 
  currentLanguage 
}) => {
  const { theme } = useTheme();
  const { 
    snippets, 
    loading, 
    error, 
    createSnippet, 
    updateSnippet, 
    deleteSnippet, 
    getSnippetsByLanguage,
    exportSnippets,
    importSnippets
  } = useSnippets();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>(currentLanguage || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSnippetData>({
    name: '',
    description: '',
    language: 'javascript',
    code: '',
    prefix: '',
  });

  // Filter snippets
  const filteredSnippets = snippets.filter(snippet => {
    const matchesLanguage = filterLanguage === 'all' || snippet.language === filterLanguage;
    const matchesSearch = snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.prefix.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLanguage && matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      language: 'javascript',
      code: '',
      prefix: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSnippet) {
        await updateSnippet(editingSnippet.id, formData);
        setEditingSnippet(null);
      } else {
        await createSnippet(formData);
      }
      resetForm();
      setActiveTab('list');
    } catch (err) {
      console.error('Failed to save snippet:', err);
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setFormData({
      name: snippet.name,
      description: snippet.description || '',
      language: snippet.language,
      code: snippet.code,
      prefix: snippet.prefix,
    });
    setActiveTab('edit');
  };

  const handleDelete = async (snippet: Snippet) => {
    if (window.confirm(`Are you sure you want to delete "${snippet.name}"?`)) {
      try {
        await deleteSnippet(snippet.id);
      } catch (err) {
        console.error('Failed to delete snippet:', err);
      }
    }
  };

  const handleExport = () => {
    const dataStr = exportSnippets();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'snippets.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      const text = await importFile.text();
      const importedCount = await importSnippets(text);
      alert(`Successfully imported ${importedCount} snippets`);
      setImportFile(null);
    } catch (err) {
      console.error('Failed to import snippets:', err);
      alert('Failed to import snippets. Please check the file format.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-4xl max-h-[90vh] ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-6 py-4 border-b flex items-center justify-between`}>
          <h2 className={`text-xl font-semibold ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
            📝 Code Snippets Manager
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} transition-colors`}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-6 py-2 border-b`}>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'list'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 All Snippets
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingSnippet(null);
                setActiveTab('add');
              }}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'add'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ➕ Add New
            </button>
            {editingSnippet && (
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'edit'
                    ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                    : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className={`mb-4 p-3 rounded-md ${theme === Theme.Dark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          {activeTab === 'list' && (
            <div>
              {/* Filters */}
              <div className="mb-4 flex gap-4 items-center">
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className={`px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option value="all">All Languages</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="react">React</option>
                  <option value="react-ts">React TypeScript</option>
                </select>
                <input
                  type="text"
                  placeholder="Search snippets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}`}
                />
              </div>

              {/* Import/Export */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={handleExport}
                  className={`px-3 py-2 text-sm rounded-md ${theme === Theme.Dark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors`}
                >
                  📤 Export
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer ${theme === Theme.Dark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} transition-colors`}
                >
                  📥 Import
                </label>
                {importFile && (
                  <button
                    onClick={handleImport}
                    className={`px-3 py-2 text-sm rounded-md ${theme === Theme.Dark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} transition-colors`}
                  >
                    Import {importFile.name}
                  </button>
                )}
              </div>

              {/* Snippets List */}
              {loading ? (
                <div className={`text-center py-8 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading snippets...
                </div>
              ) : filteredSnippets.length === 0 ? (
                <div className={`text-center py-8 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No snippets found. Create your first snippet!
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className={`p-4 rounded-lg border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-medium ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                              {snippet.name}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${theme === Theme.Dark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                              {snippet.language}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${theme === Theme.Dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              {snippet.prefix}
                            </span>
                          </div>
                          {snippet.description && (
                            <p className={`text-sm mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {snippet.description}
                            </p>
                          )}
                          <pre className={`text-xs p-2 rounded ${theme === Theme.Dark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} overflow-x-auto`}>
                            {snippet.code}
                          </pre>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(snippet)}
                            className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-200'} transition-colors`}
                            title="Edit snippet"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(snippet)}
                            className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-200'} transition-colors`}
                            title="Delete snippet"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'add' || activeTab === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    placeholder="Snippet name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Language *
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="react">React</option>
                    <option value="react-ts">React TypeScript</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Prefix (Trigger) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="Type this to trigger the snippet"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Code *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md border font-mono text-sm ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="Enter your code snippet. Use $1, $2, etc. for tab stops."
                />
                <p className={`text-xs mt-1 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Use $1, $2, etc. for tab stops. Use $0 for the final cursor position.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md ${theme === Theme.Dark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors`}
                >
                  {editingSnippet ? 'Update Snippet' : 'Create Snippet'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingSnippet(null);
                    setActiveTab('list');
                  }}
                  className={`px-4 py-2 rounded-md ${theme === Theme.Dark ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'} transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetManager;
