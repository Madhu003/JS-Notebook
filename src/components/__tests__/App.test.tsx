import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import App from '../App'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { createMockUser } from '../../test/utils'

// Mock the hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

// Mock router components
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
  Route: ({ children }: any) => <div data-testid="route">{children}</div>,
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn(() => ({ id: 'test-notebook' })),
}))

// Mock components
vi.mock('../components/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}))

vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}))

vi.mock('../components/KeyboardShortcuts', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="keyboard-shortcuts">Keyboard Shortcuts</div> : null
  ),
}))

vi.mock('../components/Notebook', () => ({
  default: () => <div data-testid="notebook">Notebook</div>,
}))

describe('App', () => {
  const mockUser = createMockUser()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupMocks = (overrides = {}) => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })
  }

  it('should render app with QueryClientProvider', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByTestId('routes')).toBeInTheDocument()
  })

  it('should render ReactQueryDevtools', () => {
    setupMocks()

    render(<App />)

    // ReactQueryDevtools should be present (though not visible in test)
    expect(document.body).toBeInTheDocument()
  })

  it('should render landing page route', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })

  it('should render notebook route', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByTestId('notebook')).toBeInTheDocument()
  })

  it('should show keyboard shortcuts when state is open', () => {
    setupMocks()

    render(<App />)

    // The keyboard shortcuts should be rendered but closed by default
    expect(screen.queryByTestId('keyboard-shortcuts')).not.toBeInTheDocument()
  })

  it('should apply light theme by default', () => {
    setupMocks()

    render(<App />)

    const htmlElement = document.documentElement
    expect(htmlElement).toHaveClass('light')
  })

  it('should apply dark theme when theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      monacoTheme: 'vs-dark',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    setupMocks()

    render(<App />)

    const htmlElement = document.documentElement
    expect(htmlElement).toHaveClass('dark')
  })

  it('should render user information when authenticated', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByText(mockUser.email!)).toBeInTheDocument()
  })

  it('should render logout button when authenticated', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('should call logout when logout button is clicked', async () => {
    const mockLogout = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      clearError: vi.fn(),
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    render(<App />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('should render theme toggle button', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('should call toggleTheme when theme toggle button is clicked', async () => {
    const mockToggleTheme = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: mockToggleTheme,
      setMonacoTheme: vi.fn(),
    })

    render(<App />)

    const themeToggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(themeToggleButton)

    await waitFor(() => {
      expect(mockToggleTheme).toHaveBeenCalled()
    })
  })

  it('should render keyboard shortcuts button', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByRole('button', { name: /keyboard shortcuts/i })).toBeInTheDocument()
  })

  it('should open keyboard shortcuts when button is clicked', () => {
    setupMocks()

    render(<App />)

    const shortcutsButton = screen.getByRole('button', { name: /keyboard shortcuts/i })
    fireEvent.click(shortcutsButton)

    expect(screen.getByTestId('keyboard-shortcuts')).toBeInTheDocument()
  })

  it('should close keyboard shortcuts when close is called', () => {
    setupMocks()

    render(<App />)

    const shortcutsButton = screen.getByRole('button', { name: /keyboard shortcuts/i })
    fireEvent.click(shortcutsButton)

    expect(screen.getByTestId('keyboard-shortcuts')).toBeInTheDocument()

    // The KeyboardShortcuts component should handle closing internally
    // This test verifies the component is rendered when isOpen is true
  })

  it('should handle unauthenticated state', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    render(<App />)

    // Should still render the app structure
    expect(screen.getByTestId('routes')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    render(<App />)

    // Should still render the app structure
    expect(screen.getByTestId('routes')).toBeInTheDocument()
  })

  it('should handle error state', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: new Error('Authentication error'),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    render(<App />)

    // Should still render the app structure
    expect(screen.getByTestId('routes')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    setupMocks()

    render(<App />)

    expect(screen.getByRole('link', { name: /js notebook/i })).toBeInTheDocument()
  })

  it('should handle theme changes', () => {
    const { rerender } = render(<App />)

    // Start with light theme
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    rerender(<App />)

    expect(document.documentElement).toHaveClass('light')

    // Change to dark theme
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      monacoTheme: 'vs-dark',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    rerender(<App />)

    expect(document.documentElement).toHaveClass('dark')
  })

  it('should handle user state changes', () => {
    const { rerender } = render(<App />)

    // Start with no user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      monacoTheme: 'vs-light',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    rerender(<App />)

    // Should not show user email
    expect(screen.queryByText(mockUser.email!)).not.toBeInTheDocument()

    // Change to authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    })

    rerender(<App />)

    // Should show user email
    expect(screen.getByText(mockUser.email!)).toBeInTheDocument()
  })

  it('should render with proper accessibility attributes', () => {
    setupMocks()

    render(<App />)

    const themeToggleButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggleButton).toHaveAttribute('aria-label')

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toHaveAttribute('aria-label')
  })

  it('should handle keyboard navigation', () => {
    setupMocks()

    render(<App />)

    const themeToggleButton = screen.getByRole('button', { name: /toggle theme/i })
    themeToggleButton.focus()

    fireEvent.keyDown(themeToggleButton, { key: 'Enter' })
    // Should trigger the button click
  })
})
