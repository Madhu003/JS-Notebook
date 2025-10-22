import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement } from 'react'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  ...overrides,
})

export const createMockSnippet = (overrides = {}) => ({
  id: 'test-snippet-id',
  name: 'Test Snippet',
  description: 'A test snippet',
  language: 'javascript' as const,
  code: 'console.log("Hello, World!");',
  prefix: 'clg',
  userId: 'test-user-id',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

export const createMockNotebook = (overrides = {}) => ({
  id: 'test-notebook-id',
  title: 'Test Notebook',
  description: 'A test notebook',
  userId: 'test-user-id',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isPublic: false,
  tags: ['test'],
  cells: [
    {
      id: 'test-cell-id',
      type: 'code' as const,
      content: 'console.log("Hello, World!");',
      language: 'javascript',
    },
  ],
  ...overrides,
})

export const createMockCell = (overrides = {}) => ({
  id: 'test-cell-id',
  type: 'code' as const,
  content: 'console.log("Hello, World!");',
  language: 'javascript',
  output: undefined,
  error: undefined,
  executionTime: undefined,
  isCollapsed: false,
  ...overrides,
})

// Mock service responses
export const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  onAuthStateChanged: vi.fn(),
}

export const mockSnippetService = {
  createSnippet: vi.fn(),
  getAllSnippets: vi.fn(),
  updateSnippet: vi.fn(),
  deleteSnippet: vi.fn(),
}

export const mockNotebookService = {
  createNotebook: vi.fn(),
  getNotebook: vi.fn(),
  getAllNotebooks: vi.fn(),
  updateNotebook: vi.fn(),
  deleteNotebook: vi.fn(),
}

// Helper functions
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }
