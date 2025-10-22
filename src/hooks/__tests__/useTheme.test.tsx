import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme, useToggleTheme, useSetMonacoTheme, useThemeState } from '../hooks/useTheme'
import { Theme, MonacoTheme } from '../hooks/useTheme'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    toggle: vi.fn(),
  },
}

Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
})

// Mock Monaco Editor
vi.mock('monaco-editor', () => ({
  editor: {
    defineTheme: vi.fn(),
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

describe('useThemeState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should return default theme state when no saved preferences', async () => {
    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toEqual({
        theme: Theme.Light,
        monacoTheme: MonacoTheme.Dark,
      })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should return saved theme state from localStorage', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce(Theme.Dark) // notebook-theme
      .mockReturnValueOnce(MonacoTheme.Monokai) // monaco-theme

    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toEqual({
        theme: Theme.Dark,
        monacoTheme: MonacoTheme.Monokai,
      })
    })
  })

  it('should handle localStorage errors gracefully', async () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toEqual({
        theme: Theme.Light,
        monacoTheme: MonacoTheme.Dark,
      })
    })
  })
})

describe('useToggleTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockClear()
    mockDocumentElement.classList.toggle.mockClear()
  })

  it('should toggle from light to dark theme', async () => {
    const { result } = renderHook(() => useToggleTheme(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync()

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('notebook-theme', Theme.Dark)
    expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
    expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('light', false)
    expect(result.current.isSuccess).toBe(true)
  })

  it('should toggle from dark to light theme', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce(Theme.Dark) // notebook-theme
      .mockReturnValueOnce(MonacoTheme.Dark) // monaco-theme

    const { result } = renderHook(() => useToggleTheme(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync()

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('notebook-theme', Theme.Light)
    expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('dark', false)
    expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('light', true)
    expect(result.current.isSuccess).toBe(true)
  })

  it('should handle toggle errors', async () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const { result } = renderHook(() => useToggleTheme(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync()).rejects.toThrow('localStorage error')
    expect(result.current.isError).toBe(true)
  })
})

describe('useSetMonacoTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockClear()
  })

  it('should set Monaco theme successfully', async () => {
    const newTheme = MonacoTheme.Dracula

    const { result } = renderHook(() => useSetMonacoTheme(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync(newTheme)

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('monaco-theme', newTheme)
    expect(result.current.isSuccess).toBe(true)
  })

  it('should handle Monaco theme setting errors', async () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const { result } = renderHook(() => useSetMonacoTheme(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync(MonacoTheme.Dracula)).rejects.toThrow('localStorage error')
    expect(result.current.isError).toBe(true)
  })
})

describe('useTheme (combined hook)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should provide combined theme functionality', async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.theme).toBe(Theme.Light)
      expect(result.current.monacoTheme).toBe(MonacoTheme.Dark)
    })

    expect(result.current.loading).toBe(false)
    expect(typeof result.current.toggleTheme).toBe('function')
    expect(typeof result.current.setMonacoTheme).toBe('function')
    expect(result.current.isToggling).toBe(false)
    expect(result.current.isSettingMonacoTheme).toBe(false)
  })

  it('should handle loading states correctly', async () => {
    mockLocalStorage.getItem.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(Theme.Light), 100))
    )

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.theme).toBe(Theme.Light)
  })

  it('should update theme when toggleTheme is called', async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.theme).toBe(Theme.Light)
    })

    await result.current.toggleTheme()

    await waitFor(() => {
      expect(result.current.theme).toBe(Theme.Dark)
    })
  })

  it('should update Monaco theme when setMonacoTheme is called', async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.monacoTheme).toBe(MonacoTheme.Dark)
    })

    await result.current.setMonacoTheme(MonacoTheme.Monokai)

    await waitFor(() => {
      expect(result.current.monacoTheme).toBe(MonacoTheme.Monokai)
    })
  })
})

describe('Theme Constants', () => {
  it('should have correct theme values', () => {
    expect(Theme.Light).toBe('light')
    expect(Theme.Dark).toBe('dark')
  })

  it('should have correct Monaco theme values', () => {
    expect(MonacoTheme.Light).toBe('vs-light')
    expect(MonacoTheme.Dark).toBe('vs-dark')
    expect(MonacoTheme.Monokai).toBe('monokai')
    expect(MonacoTheme.Dracula).toBe('dracula')
    expect(MonacoTheme.Solarized).toBe('solarized-dark')
    expect(MonacoTheme.GitHub).toBe('github-dark')
    expect(MonacoTheme.OneDark).toBe('one-dark-pro')
  })
})
