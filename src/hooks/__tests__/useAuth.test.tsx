import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth, useLogin, useRegister, useLogout, useAuthUser } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { createMockUser } from '../test/utils'

// Mock the auth service
vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
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

describe('useAuthUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user data when authenticated', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuthUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockUser)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should return null when not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    const { result } = renderHook(() => useAuthUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeNull()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle authentication errors', async () => {
    const error = new Error('Authentication failed')
    vi.mocked(authService.getCurrentUser).mockRejectedValue(error)

    const { result } = renderHook(() => useAuthUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login successfully', async () => {
    const mockUser = createMockUser()
    const loginData = { email: 'test@example.com', password: 'password123' }
    
    vi.mocked(authService.login).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync(loginData)

    expect(authService.login).toHaveBeenCalledWith(loginData.email, loginData.password)
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data).toEqual(mockUser)
  })

  it('should handle login errors', async () => {
    const error = new Error('Invalid credentials')
    const loginData = { email: 'test@example.com', password: 'wrongpassword' }
    
    vi.mocked(authService.login).mockRejectedValue(error)

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync(loginData)).rejects.toThrow('Invalid credentials')
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toEqual(error)
  })

  it('should show loading state during login', async () => {
    const mockUser = createMockUser()
    const loginData = { email: 'test@example.com', password: 'password123' }
    
    vi.mocked(authService.login).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
    )

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(loginData)

    expect(result.current.isPending).toBe(true)
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register successfully', async () => {
    const mockUser = createMockUser()
    const registerData = { 
      email: 'test@example.com', 
      password: 'password123', 
      displayName: 'Test User' 
    }
    
    vi.mocked(authService.register).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync(registerData)

    expect(authService.register).toHaveBeenCalledWith(
      registerData.email, 
      registerData.password, 
      registerData.displayName
    )
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data).toEqual(mockUser)
  })

  it('should handle registration errors', async () => {
    const error = new Error('Email already exists')
    const registerData = { 
      email: 'existing@example.com', 
      password: 'password123', 
      displayName: 'Test User' 
    }
    
    vi.mocked(authService.register).mockRejectedValue(error)

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync(registerData)).rejects.toThrow('Email already exists')
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toEqual(error)
  })
})

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should logout successfully', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined)

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync()

    expect(authService.logout).toHaveBeenCalled()
    expect(result.current.isSuccess).toBe(true)
  })

  it('should handle logout errors', async () => {
    const error = new Error('Logout failed')
    vi.mocked(authService.logout).mockRejectedValue(error)

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync()).rejects.toThrow('Logout failed')
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toEqual(error)
  })
})

describe('useAuth (combined hook)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide combined auth functionality', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.logout).toBe('function')
    expect(result.current.isLoggingIn).toBe(false)
    expect(result.current.isRegistering).toBe(false)
    expect(result.current.isLoggingOut).toBe(false)
  })

  it('should handle loading states correctly', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
    )

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeUndefined()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
  })
})
