import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import LoginPage from '../LoginPage'
import { useAuth } from '../../hooks/useAuth'

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('LoginPage', () => {
  const mockLogin = vi.fn()
  const mockRegister = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockClear()
    mockRegister.mockClear()
  })

  it('should render login form correctly', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should update email input value', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should update password input value', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(passwordInput).toHaveValue('password123')
  })

  it('should call login when sign in button is clicked with valid credentials', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    mockLogin.mockResolvedValue(undefined)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should call register when create account button is clicked with valid credentials', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    mockRegister.mockResolvedValue(undefined)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const createAccountButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(createAccountButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', '')
    })
  })

  it('should not call login with empty credentials', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should not call register with empty credentials', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    const createAccountButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(createAccountButton)

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should show loading state during login', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(signInButton)

    expect(signInButton).toBeDisabled()
    expect(signInButton).toHaveTextContent('Signing in...')

    await waitFor(() => {
      expect(signInButton).not.toBeDisabled()
      expect(signInButton).toHaveTextContent('Sign In')
    })
  })

  it('should show loading state during registration', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const createAccountButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(createAccountButton)

    expect(createAccountButton).toBeDisabled()
    expect(createAccountButton).toHaveTextContent('Creating account...')

    await waitFor(() => {
      expect(createAccountButton).not.toBeDisabled()
      expect(createAccountButton).toHaveTextContent('Create Account')
    })
  })

  it('should display error message when login fails', () => {
    const errorMessage = 'Invalid credentials'
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: new Error(errorMessage),
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should display error message when registration fails', () => {
    const errorMessage = 'Email already exists'
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: new Error(errorMessage),
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should handle form submission with Enter key', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    mockLogin.mockResolvedValue(undefined)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should have correct form structure', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should have proper accessibility attributes', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('should handle multiple rapid clicks', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    mockLogin.mockResolvedValue(undefined)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Click multiple times rapidly
    fireEvent.click(signInButton)
    fireEvent.click(signInButton)
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1) // Should only be called once
    })
  })
})
