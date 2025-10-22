import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { snippetService } from '../services/snippetService';
import type { Snippet, CreateSnippetData, UpdateSnippetData } from '../types';

// Query keys
export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (userId: string) => [...snippetKeys.lists(), userId] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: string) => [...snippetKeys.details(), id] as const,
};

// Snippet query hooks
export const useSnippets = (userId: string) => {
  return useQuery({
    queryKey: snippetKeys.list(userId),
    queryFn: () => snippetService.getAllSnippets(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSnippetsByLanguage = (userId: string, language: string) => {
  return useQuery({
    queryKey: [...snippetKeys.list(userId), 'byLanguage', language],
    queryFn: () => snippetService.getAllSnippets(userId),
    enabled: !!userId,
    select: (snippets) => {
      const normalizedLang = language.includes('react') ? 'react' : language;
      return snippets.filter(snippet => snippet.language.includes(normalizedLang));
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSnippet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, userId }: { data: CreateSnippetData; userId: string }) =>
      snippetService.createSnippet(data, userId),
    onSuccess: (snippetId, { userId }) => {
      // Invalidate and refetch snippets list
      queryClient.invalidateQueries({ queryKey: snippetKeys.list(userId) });
    },
    onError: (error) => {
      console.error('Create snippet error:', error);
    },
  });
};

export const useUpdateSnippet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSnippetData }) =>
      snippetService.updateSnippet(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate all snippet queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: snippetKeys.all });
    },
    onError: (error) => {
      console.error('Update snippet error:', error);
    },
  });
};

export const useDeleteSnippet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => snippetService.deleteSnippet(id),
    onSuccess: () => {
      // Invalidate all snippet queries
      queryClient.invalidateQueries({ queryKey: snippetKeys.all });
    },
    onError: (error) => {
      console.error('Delete snippet error:', error);
    },
  });
};

// Combined snippets hook for backward compatibility
export const useSnippetsContext = (userId: string) => {
  const { data: snippets = [], isLoading: loading, error } = useSnippets(userId);
  const createMutation = useCreateSnippet();
  const updateMutation = useUpdateSnippet();
  const deleteMutation = useDeleteSnippet();

  const createSnippet = async (data: CreateSnippetData) => {
    if (!userId) throw new Error('User not authenticated');
    return createMutation.mutateAsync({ data, userId });
  };

  const updateSnippet = async (id: string, data: UpdateSnippetData) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteSnippet = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const getSnippetsByLanguage = (language: string) => {
    const normalizedLang = language.includes('react') ? 'react' : language;
    return snippets.filter(snippet => snippet.language.includes(normalizedLang));
  };

  return {
    snippets,
    loading,
    error: error?.message || null,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    getSnippetsByLanguage,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
