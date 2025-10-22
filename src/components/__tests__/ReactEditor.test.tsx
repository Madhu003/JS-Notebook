import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import ReactEditor from '../ReactEditor/ReactEditor'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { useSnippetsContext } from '../../hooks/useSnippets'
import { useEditorSettingsContext } from '../../hooks/useEditorSettings'
import { createMockUser, createMockSnippet } from '../../../test/utils'

// Mock the hooks
vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../hooks/useSnippets', () => ({
  useSnippetsContext: vi.fn(),
}))

vi.mock('../../hooks/useEditorSettings', () => ({
  useEditorSettingsContext: vi.fn(),
}))

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ onChange, onMount, ...props }) => {
    const mockEditor = {
      updateOptions: vi.fn(),
      getValue: vi.fn(() => ''),
      setValue: vi.fn(),
      focus: vi.fn(),
      dispose: vi.fn(),
    }
    
    // Simulate editor mount
    setTimeout(() => {
      if (onMount) onMount(mockEditor)
    }, 0)
    
    return <div data-testid="monaco-editor" {...props} />
  }),
}))

// Mock ErrorBoundary
vi.mock('../ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}))

describe('ReactEditor', () => {
  const mockOnChange = vi.fn()
  const mockOnFocus = vi.fn()
  const mockGetSnippetsByLanguage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnChange.mockClear()
    mockOnFocus.mockClear()
    mockGetSnippetsByLanguage.mockClear()
  })

  const defaultProps = {
    value: 'const App = () => <div>Hello, World!</div>;',
    onChange: mockOnChange,
    language: 'react',
    onFocus: mockOnFocus,
    cellId: 'test-cell-id',
  }

  const mockUser = createMockUser()

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

    vi.mocked(useSnippetsContext).mockReturnValue({
      snippets: [],
      loading: false,
      error: null,
      createSnippet: vi.fn(),
      updateSnippet: vi.fn(),
      deleteSnippet: vi.fn(),
      getSnippetsByLanguage: mockGetSnippetsByLanguage,
      ...overrides,
    })

    vi.mocked(useEditorSettingsContext).mockReturnValue({
      settings: {
        fontSize: 14,
        tabSize: 2,
        minimap: true,
        lineNumbers: true,
        wordWrap: true,
        folding: true,
        showFoldingControls: 'mouseover',
        foldingStrategy: 'auto',
        foldingHighlight: true,
        multiCursorModifier: 'alt',
        multiCursorPaste: 'spread',
        findAddExtraSpaceOnTop: true,
        findAutoFindInSelection: 'never',
        findSeedSearchStringFromSelection: 'always',
      },
      updateSetting: vi.fn(),
      resetToDefaults: vi.fn(),
    })
  }

  it('should render React editor with correct props', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('should display TypeScript when language is react-ts', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} language="react-ts" />)

    expect(screen.getByText('React (TS)')).toBeInTheDocument()
  })

  it('should call onChange when editor value changes', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')
    fireEvent.change(editor, { target: { value: 'new code' } })

    expect(mockOnChange).toHaveBeenCalledWith('new code')
  })

  it('should call onFocus when editor is focused', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')
    fireEvent.focus(editor)

    expect(mockOnFocus).toHaveBeenCalled()
  })

  it('should show snippet manager button', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    expect(screen.getByRole('button', { name: /snippets/i })).toBeInTheDocument()
  })

  it('should show editor settings button', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })

  it('should show preview controls', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    expect(screen.getByRole('button', { name: /expand preview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /compact preview/i })).toBeInTheDocument()
  })

  it('should toggle preview size when expand button is clicked', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const expandButton = screen.getByRole('button', { name: /expand preview/i })
    fireEvent.click(expandButton)

    expect(screen.getByRole('button', { name: /compact preview/i })).toBeInTheDocument()
  })

  it('should toggle preview size when compact button is clicked', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const expandButton = screen.getByRole('button', { name: /expand preview/i })
    fireEvent.click(expandButton)

    const compactButton = screen.getByRole('button', { name: /compact preview/i })
    fireEvent.click(compactButton)

    expect(screen.getByRole('button', { name: /expand preview/i })).toBeInTheDocument()
  })

  it('should open snippet manager when snippet button is clicked', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const snippetButton = screen.getByRole('button', { name: /snippets/i })
    fireEvent.click(snippetButton)

    expect(screen.getByText('Snippet Manager')).toBeInTheDocument()
  })

  it('should open editor settings when settings button is clicked', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)

    expect(screen.getByText('Editor Settings')).toBeInTheDocument()
  })

  it('should display React preview', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    expect(screen.getByTestId('react-preview')).toBeInTheDocument()
  })

  it('should display output when provided', () => {
    setupMocks()

    render(
      <ReactEditor 
        {...defaultProps} 
        output="<div>Hello, World!</div>" 
        executionTime={150}
      />
    )

    expect(screen.getByText('<div>Hello, World!</div>')).toBeInTheDocument()
    expect(screen.getByText('150ms')).toBeInTheDocument()
  })

  it('should display error when provided', () => {
    setupMocks()

    render(
      <ReactEditor 
        {...defaultProps} 
        error="Syntax Error: Unexpected token" 
      />
    )

    expect(screen.getByText('Syntax Error: Unexpected token')).toBeInTheDocument()
  })

  it('should apply dark theme when theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      monacoTheme: 'vs-dark',
      toggleTheme: vi.fn(),
      setMonacoTheme: vi.fn(),
    })

    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const container = screen.getByTestId('monaco-editor').closest('.react-editor-container')
    expect(container).toHaveClass('dark')
  })

  it('should apply light theme when theme is light', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const container = screen.getByTestId('monaco-editor').closest('.react-editor-container')
    expect(container).toHaveClass('light')
  })

  it('should register React snippets when editor mounts', async () => {
    const mockSnippets = [
      createMockSnippet({ name: 'React Component', language: 'react' }),
    ]
    mockGetSnippetsByLanguage.mockReturnValue(mockSnippets)

    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    await waitFor(() => {
      expect(mockGetSnippetsByLanguage).toHaveBeenCalledWith('react')
    })
  })

  it('should handle different React languages correctly', () => {
    setupMocks()

    const { rerender } = render(<ReactEditor {...defaultProps} language="react" />)
    expect(screen.getByText('React')).toBeInTheDocument()

    rerender(<ReactEditor {...defaultProps} language="react-ts" />)
    expect(screen.getByText('React (TS)')).toBeInTheDocument()
  })

  it('should close snippet manager when close button is clicked', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    // Open snippet manager
    const snippetButton = screen.getByRole('button', { name: /snippets/i })
    fireEvent.click(snippetButton)

    expect(screen.getByText('Snippet Manager')).toBeInTheDocument()

    // Close snippet manager
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(screen.queryByText('Snippet Manager')).not.toBeInTheDocument()
  })

  it('should close editor settings when close button is clicked', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    // Open editor settings
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)

    expect(screen.getByText('Editor Settings')).toBeInTheDocument()

    // Close editor settings
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(screen.queryByText('Editor Settings')).not.toBeInTheDocument()
  })

  it('should handle empty value', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} value="" />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle undefined value', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} value={undefined} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle complex React components', () => {
    setupMocks()

    const complexComponent = `
      const App = () => {
        const [count, setCount] = useState(0);
        
        return (
          <div>
            <h1>Counter: {count}</h1>
            <button onClick={() => setCount(count + 1)}>
              Increment
            </button>
          </div>
        );
      };
    `

    render(<ReactEditor {...defaultProps} value={complexComponent} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    expect(screen.getByTestId('react-preview')).toBeInTheDocument()
  })

  it('should handle JSX with hooks', () => {
    setupMocks()

    const jsxWithHooks = `
      const MyComponent = () => {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);
        
        useEffect(() => {
          fetchData().then(setData).finally(() => setLoading(false));
        }, []);
        
        if (loading) return <div>Loading...</div>;
        
        return <div>{data}</div>;
      };
    `

    render(<ReactEditor {...defaultProps} value={jsxWithHooks} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle TypeScript React components', () => {
    setupMocks()

    const tsxComponent = `
      interface Props {
        title: string;
        count: number;
      }
      
      const MyComponent: React.FC<Props> = ({ title, count }) => {
        return <div>{title}: {count}</div>;
      };
    `

    render(<ReactEditor {...defaultProps} language="react-ts" value={tsxComponent} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    expect(screen.getByText('React (TS)')).toBeInTheDocument()
  })

  it('should handle rapid onChange calls', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')

    // Simulate rapid changes
    for (let i = 0; i < 10; i++) {
      fireEvent.change(editor, { target: { value: `code ${i}` } })
    }

    expect(mockOnChange).toHaveBeenCalledTimes(10)
  })

  it('should handle keyboard shortcuts', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')

    // Test common keyboard shortcuts
    fireEvent.keyDown(editor, { key: 'Ctrl', code: 'ControlLeft' })
    fireEvent.keyDown(editor, { key: 's', code: 'KeyS' })
  })

  it('should handle editor resize', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')

    // Simulate window resize
    fireEvent(window, new Event('resize'))

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle different cell IDs', () => {
    setupMocks()

    const { rerender } = render(<ReactEditor {...defaultProps} cellId="cell-1" />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()

    rerender(<ReactEditor {...defaultProps} cellId="cell-2" />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle undefined cellId', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} cellId={undefined} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle undefined onFocus', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} onFocus={undefined} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should wrap preview in ErrorBoundary', () => {
    setupMocks()

    render(<ReactEditor {...defaultProps} />)

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })

  it('should handle preview errors gracefully', () => {
    setupMocks()

    const invalidJSX = 'const App = () => <div>Hello, World!</div>; invalid syntax'

    render(<ReactEditor {...defaultProps} value={invalidJSX} />)

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })
})
