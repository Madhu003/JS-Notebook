import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { snippetService } from '../services/snippetService';
import type { Snippet, CreateSnippetData, UpdateSnippetData } from '../types';
import { useAuth } from './AuthContext';

interface SnippetContextType {
  snippets: Snippet[];
  loading: boolean;
  error: string | null;
  createSnippet: (data: CreateSnippetData) => Promise<string>;
  updateSnippet: (id: string, data: UpdateSnippetData) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  getSnippetsByLanguage: (language: string) => Snippet[];
  refreshSnippets: () => Promise<void>;
  exportSnippets: () => string;
  importSnippets: (jsonData: string) => Promise<number>;
}

const SnippetContext = createContext<SnippetContextType | undefined>(undefined);

interface SnippetProviderProps {
  children: ReactNode;
}

export const SnippetProvider: React.FC<SnippetProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load snippets when user changes
  useEffect(() => {
    if (user?.id) {
      loadSnippets();
    } else {
      setSnippets([]);
    }
  }, [user?.id]);

  const loadSnippets = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedSnippets = await snippetService.getAllSnippets(user.id);
      setSnippets(fetchedSnippets);
    } catch (err) {
      console.error('Failed to load snippets:', err);
      setError('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const createSnippet = async (data: CreateSnippetData): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);
      const snippetId = await snippetService.createSnippet(data, user.id);
      await loadSnippets(); // Refresh the list
      return snippetId;
    } catch (err) {
      console.error('Failed to create snippet:', err);
      setError('Failed to create snippet');
      throw err;
    }
  };

  const updateSnippet = async (id: string, data: UpdateSnippetData): Promise<void> => {
    try {
      setError(null);
      await snippetService.updateSnippet(id, data);
      await loadSnippets(); // Refresh the list
    } catch (err) {
      console.error('Failed to update snippet:', err);
      setError('Failed to update snippet');
      throw err;
    }
  };

  const deleteSnippet = async (id: string): Promise<void> => {
    try {
      setError(null);
      await snippetService.deleteSnippet(id);
      await loadSnippets(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete snippet:', err);
      setError('Failed to delete snippet');
      throw err;
    }
  };

  const getSnippetsByLanguage = (language: string): Snippet[] => {
    return snippets.filter(snippet => snippet.language === language);
  };

  const refreshSnippets = async (): Promise<void> => {
    await loadSnippets();
  };

  const exportSnippets = (): string => {
    return snippetService.exportSnippets(snippets);
  };

  const importSnippets = async (jsonData: string): Promise<number> => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);
      const importedCount = await snippetService.importSnippets(jsonData, user.id);
      await loadSnippets(); // Refresh the list
      return importedCount;
    } catch (err) {
      console.error('Failed to import snippets:', err);
      setError('Failed to import snippets');
      throw err;
    }
  };

  const value: SnippetContextType = {
    snippets,
    loading,
    error,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    getSnippetsByLanguage,
    refreshSnippets,
    exportSnippets,
    importSnippets,
  };

  return (
    <SnippetContext.Provider value={value}>
      {children}
    </SnippetContext.Provider>
  );
};

export const useSnippets = (): SnippetContextType => {
  const context = useContext(SnippetContext);
  if (context === undefined) {
    throw new Error('useSnippets must be used within a SnippetProvider');
  }
  return context;
};

export default SnippetContext;
