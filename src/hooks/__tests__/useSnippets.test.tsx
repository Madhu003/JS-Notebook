import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { 
  useSnippets, 
  useSnippetsByLanguage, 
  useCreateSnippet, 
  useUpdateSnippet, 
  useDeleteSnippet,
  useSnippetsContext 
} from '../hooks/useSnippets'
import { snippetService } from '../services/snippetService'
import { createMockSnippet } from '../../test/utils'

// Mock the snippet service
vi.mock('../services/snippetService', () => ({
  snippetService: {
    createSnippet: vi.fn(),
    getAllSnippets: vi.fn(),
    updateSnippet: vi.fn(),
    deleteSnippet: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useSnippets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch snippets for a user', async () => {
    const mockSnippets = [
      createMockSnippet({ id: '1', name: 'Snippet 1' }),
      createMockSnippet({ id: '2', name: 'Snippet 2' }),
    ]
    const userId = 'test-user-id'
    
    vi.mocked(snippetService.getAllSnippets).mockResolvedValue(mockSnippets)

    const { result } = renderHook(() => useSnippets(userId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockSnippets)
    })

    expect(snippetService.getAllSnippets).toHaveBeenCalledWith(userId)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useSnippets(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(snippetService.getAllSnippets).not.toHaveBeenCalled()
  })

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch snippets')
    const userId = 'test-user-id'
    
    vi.mocked(snippetService.getAllSnippets).mockRejectedValue(error)

    const { result } = renderHook(() => useSnippets(userId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useSnippetsByLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter snippets by language', async () => {
    const mockSnippets = [
      createMockSnippet({ id: '1', language: 'javascript' }),
      createMockSnippet({ id: '2', language: 'typescript' }),
      createMockSnippet({ id: '3', language: 'javascript' }),
    ]
    const userId = 'test-user-id'
    const language = 'javascript'
    
    vi.mocked(snippetService.getAllSnippets).mockResolvedValue(mockSnippets)

    const { result } = renderHook(() => useSnippetsByLanguage(userId, language), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2)
      expect(result.current.data?.every(snippet => snippet.language === 'javascript')).toBe(true)
    })
  })

  it('should handle react language grouping', async () => {
    const mockSnippets = [
      createMockSnippet({ id: '1', language: 'react' }),
      createMockSnippet({ id: '2', language: 'react-ts' }),
      createMockSnippet({ id: '3', language: 'javascript' }),
    ]
    const userId = 'test-user-id'
    const language = 'react'
    
    vi.mocked(snippetService.getAllSnippets).mockResolvedValue(mockSnippets)

    const { result } = renderHook(() => useSnippetsByLanguage(userId, language), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2)
      expect(result.current.data?.every(snippet => snippet.language.includes('react'))).toBe(true)
    })
  })
})

describe('useCreateSnippet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a snippet successfully', async () => {
    const snippetData = {
      name: 'Test Snippet',
      description: 'A test snippet',
      language: 'javascript' as const,
      code: 'console.log("Hello");',
      prefix: 'clg',
    }
    const userId = 'test-user-id'
    const snippetId = 'new-snippet-id'
    
    vi.mocked(snippetService.createSnippet).mockResolvedValue(snippetId)

    const { result } = renderHook(() => useCreateSnippet(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ data: snippetData, userId })

    expect(snippetService.createSnippet).toHaveBeenCalledWith(snippetData, userId)
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data).toBe(snippetId)
  })

  it('should handle creation errors', async () => {
    const error = new Error('Failed to create snippet')
    const snippetData = {
      name: 'Test Snippet',
      description: 'A test snippet',
      language: 'javascript' as const,
      code: 'console.log("Hello");',
      prefix: 'clg',
    }
    const userId = 'test-user-id'
    
    vi.mocked(snippetService.createSnippet).mockRejectedValue(error)

    const { result } = renderHook(() => useCreateSnippet(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync({ data: snippetData, userId })).rejects.toThrow('Failed to create snippet')
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toEqual(error)
  })
})

describe('useUpdateSnippet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update a snippet successfully', async () => {
    const snippetId = 'test-snippet-id'
    const updateData = {
      name: 'Updated Snippet',
      description: 'Updated description',
    }
    
    vi.mocked(snippetService.updateSnippet).mockResolvedValue(undefined)

    const { result } = renderHook(() => useUpdateSnippet(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ id: snippetId, data: updateData })

    expect(snippetService.updateSnippet).toHaveBeenCalledWith(snippetId, updateData)
    expect(result.current.isSuccess).toBe(true)
  })

  it('should handle update errors', async () => {
    const error = new Error('Failed to update snippet')
    const snippetId = 'test-snippet-id'
    const updateData = {
      name: 'Updated Snippet',
    }
    
    vi.mocked(snippetService.updateSnippet).mockRejectedValue(error)

    const { result } = renderHook(() => useUpdateSnippet(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync({ id: snippetId, data: updateData })).rejects.toThrow('Failed to update snippet')
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toEqual(error)
  })
})

describe('useDeleteSnippet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a snippet successfully', async () => {
    const snippetId = 'test-snippet-id'
    
    vi.mocked(snippetService.deleteSnippet).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteSnippet(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync(snippetId)

    expect(snippetService.deleteSnippet).toHaveBeenCalledWith(snippetId)
    expect(result.current.isSuccess).toBe(true)
  })

  it('should handle deletion errors', async () => {
    const error = new Error('Failed to delete snippet')
    const snippetId = 'test-snippet-id'
    
    vi.mocked(snippetService.deleteSnippet).mockRejectedValue(error)

    const { result } = renderHook(() => useDeleteSnippet(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync(snippetId)).rejects.toThrow('Failed to delete snippet')
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toEqual(error)
  })
})

describe('useSnippetsContext (combined hook)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide combined snippets functionality', async () => {
    const mockSnippets = [
      createMockSnippet({ id: '1', language: 'javascript' }),
      createMockSnippet({ id: '2', language: 'typescript' }),
    ]
    const userId = 'test-user-id'
    
    vi.mocked(snippetService.getAllSnippets).mockResolvedValue(mockSnippets)

    const { result } = renderHook(() => useSnippetsContext(userId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.snippets).toEqual(mockSnippets)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.createSnippet).toBe('function')
    expect(typeof result.current.updateSnippet).toBe('function')
    expect(typeof result.current.deleteSnippet).toBe('function')
    expect(typeof result.current.getSnippetsByLanguage).toBe('function')
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
  })

  it('should filter snippets by language correctly', async () => {
    const mockSnippets = [
      createMockSnippet({ id: '1', language: 'javascript' }),
      createMockSnippet({ id: '2', language: 'typescript' }),
      createMockSnippet({ id: '3', language: 'javascript' }),
    ]
    const userId = 'test-user-id'
    
    vi.mocked(snippetService.getAllSnippets).mockResolvedValue(mockSnippets)

    const { result } = renderHook(() => useSnippetsContext(userId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.snippets).toEqual(mockSnippets)
    })

    const javascriptSnippets = result.current.getSnippetsByLanguage('javascript')
    expect(javascriptSnippets).toHaveLength(2)
    expect(javascriptSnippets.every(snippet => snippet.language === 'javascript')).toBe(true)
  })

  it('should handle empty userId', () => {
    const { result } = renderHook(() => useSnippetsContext(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.snippets).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
