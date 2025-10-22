import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import JavaScriptEditor from '../JavaScriptEditor/JavaScriptEditor'
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

describe('JavaScriptEditor', () => {
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
    value: 'console.log("Hello, World!");',
    onChange: mockOnChange,
    language: 'javascript',
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

  it('should render JavaScript editor with correct props', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should display the correct language in toolbar', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    expect(screen.getByText('JavaScript')).toBeInTheDocument()
  })

  it('should display TypeScript when language is typescript', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} language="typescript" />)

    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('should call onChange when editor value changes', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    // Simulate editor change
    const editor = screen.getByTestId('monaco-editor')
    fireEvent.change(editor, { target: { value: 'new code' } })

    expect(mockOnChange).toHaveBeenCalledWith('new code')
  })

  it('should call onFocus when editor is focused', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')
    fireEvent.focus(editor)

    expect(mockOnFocus).toHaveBeenCalled()
  })

  it('should show snippet manager button', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    expect(screen.getByRole('button', { name: /snippets/i })).toBeInTheDocument()
  })

  it('should show editor settings button', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })

  it('should open snippet manager when snippet button is clicked', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    const snippetButton = screen.getByRole('button', { name: /snippets/i })
    fireEvent.click(snippetButton)

    expect(screen.getByText('Snippet Manager')).toBeInTheDocument()
  })

  it('should open editor settings when settings button is clicked', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)

    expect(screen.getByText('Editor Settings')).toBeInTheDocument()
  })

  it('should display output when provided', () => {
    setupMocks()

    render(
      <JavaScriptEditor 
        {...defaultProps} 
        output="Hello, World!" 
        executionTime={100}
      />
    )

    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
    expect(screen.getByText('100ms')).toBeInTheDocument()
  })

  it('should display error when provided', () => {
    setupMocks()

    render(
      <JavaScriptEditor 
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

    render(<JavaScriptEditor {...defaultProps} />)

    const container = screen.getByTestId('monaco-editor').closest('.js-editor-container')
    expect(container).toHaveClass('dark')
  })

  it('should apply light theme when theme is light', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    const container = screen.getByTestId('monaco-editor').closest('.js-editor-container')
    expect(container).toHaveClass('light')
  })

  it('should register snippets when editor mounts', async () => {
    const mockSnippets = [
      createMockSnippet({ name: 'Test Snippet', language: 'javascript' }),
    ]
    mockGetSnippetsByLanguage.mockReturnValue(mockSnippets)

    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    await waitFor(() => {
      expect(mockGetSnippetsByLanguage).toHaveBeenCalledWith('javascript')
    })
  })

  it('should handle different languages correctly', () => {
    setupMocks()

    const { rerender } = render(<JavaScriptEditor {...defaultProps} language="javascript" />)
    expect(screen.getByText('JavaScript')).toBeInTheDocument()

    rerender(<JavaScriptEditor {...defaultProps} language="typescript" />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('should close snippet manager when close button is clicked', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

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

    render(<JavaScriptEditor {...defaultProps} />)

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

    render(<JavaScriptEditor {...defaultProps} value="" />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle undefined value', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} value={undefined} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle long code values', () => {
    setupMocks()

    const longCode = 'console.log("Hello, World!");\n'.repeat(100)

    render(<JavaScriptEditor {...defaultProps} value={longCode} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle special characters in code', () => {
    setupMocks()

    const specialCode = 'console.log("Hello, 世界! 🌍");\nconst obj = { "key": "value" };'

    render(<JavaScriptEditor {...defaultProps} value={specialCode} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle rapid onChange calls', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')

    // Simulate rapid changes
    for (let i = 0; i < 10; i++) {
      fireEvent.change(editor, { target: { value: `code ${i}` } })
    }

    expect(mockOnChange).toHaveBeenCalledTimes(10)
  })

  it('should handle keyboard shortcuts', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')

    // Test common keyboard shortcuts
    fireEvent.keyDown(editor, { key: 'Ctrl', code: 'ControlLeft' })
    fireEvent.keyDown(editor, { key: 's', code: 'KeyS' })
  })

  it('should handle editor resize', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} />)

    const editor = screen.getByTestId('monaco-editor')

    // Simulate window resize
    fireEvent(window, new Event('resize'))

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle different cell IDs', () => {
    setupMocks()

    const { rerender } = render(<JavaScriptEditor {...defaultProps} cellId="cell-1" />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()

    rerender(<JavaScriptEditor {...defaultProps} cellId="cell-2" />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle undefined cellId', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} cellId={undefined} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should handle undefined onFocus', () => {
    setupMocks()

    render(<JavaScriptEditor {...defaultProps} onFocus={undefined} />)

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })
})
