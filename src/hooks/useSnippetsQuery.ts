import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { snippetService } from '../services/snippetService';
import { useAuth } from '../contexts/AuthContext';
import type { CreateSnippetData, UpdateSnippetData } from '../types';

// Query Keys
export const snippetKeys = {
    all: (userId: string | undefined) => ['snippets', userId] as const,
    lists: (userId: string | undefined) => [...snippetKeys.all(userId), 'list'] as const,
    detail: (userId: string | undefined, id: string) => [...snippetKeys.all(userId), id] as const,
};

export const useSnippets = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: snippetKeys.lists(user?.uid),
        queryFn: () => {
            if (!user?.uid) throw new Error('User not authenticated');
            return snippetService.getAllSnippets(user.uid);
        },
        enabled: !!user?.uid,
    });
};

export const useCreateSnippet = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: CreateSnippetData) => {
            if (!user?.uid) throw new Error('User not authenticated');
            return snippetService.createSnippet(data, user.uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: snippetKeys.lists(user?.uid) });
        },
    });
};

export const useUpdateSnippet = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSnippetData }) =>
            snippetService.updateSnippet(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: snippetKeys.lists(user?.uid) });
        },
    });
};

export const useDeleteSnippet = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (id: string) => snippetService.deleteSnippet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: snippetKeys.lists(user?.uid) });
        },
    });
};

export const useImportSnippets = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (jsonData: string) => {
            if (!user?.uid) throw new Error('User not authenticated');
            return snippetService.importSnippets(jsonData, user.uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: snippetKeys.lists(user?.uid) });
        },
    });
};
