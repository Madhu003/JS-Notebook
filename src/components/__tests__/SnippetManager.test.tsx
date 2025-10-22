import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import SnippetManager from '../SnippetManager/SnippetManager'
import { useSnippetsContext } from '../../hooks/useSnippets'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { createMockSnippet, createMockUser } from '../../../test/utils'

// Mock the hooks
vi.mock('../../hooks/useSnippets', () => ({
  useSnippetsContext: vi.fn(),
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

describe('SnippetManager', () => {
  const mockCreateSnippet = vi.fn()
  const mockUpdateSnippet = vi.fn()
  const mockDeleteSnippet = vi.fn()
  const mockGetSnippetsByLanguage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateSnippet.mockClear()
    mockUpdateSnippet.mockClear()
    mockDeleteSnippet.mockClear()
    mockGetSnippetsByLanguage.mockClear()
  })

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentLanguage: 'javascript',
  }

  const mockUser = createMockUser()

  const defaultMockSnippets = [
    createMockSnippet({ id: '1', name: 'Snippet 1', language: 'javascript' }),
    createMockSnippet({ id: '2', name: 'Snippet 2', language: 'typescript' }),
    createMockSnippet({ id: '3', name: 'Snippet 3', language: 'javascript' }),
  ]

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
      snippets: defaultMockSnippets,
      loading: false,
      error: null,
      createSnippet: mockCreateSnippet,
      updateSnippet: mockUpdateSnippet,
      deleteSnippet: mockDeleteSnippet,
      getSnippetsByLanguage: mockGetSnippetsByLanguage,
      ...overrides,
    })
  }

  it('should render snippet manager when open', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    expect(screen.getByText('Snippet Manager')).toBeInTheDocument()
    expect(screen.getByText('Snippet 1')).toBeInTheDocument()
    expect(screen.getByText('Snippet 2')).toBeInTheDocument()
    expect(screen.getByText('Snippet 3')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Snippet Manager')).not.toBeInTheDocument()
  })

  it('should show loading state', () => {
    setupMocks({ loading: true })

    render(<SnippetManager {...defaultProps} />)

    expect(screen.getByText('Loading snippets...')).toBeInTheDocument()
  })

  it('should show error state', () => {
    const errorMessage = 'Failed to load snippets'
    setupMocks({ error: new Error(errorMessage) })

    render(<SnippetManager {...defaultProps} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should switch to add tab when add button is clicked', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    const addButton = screen.getByRole('button', { name: /add snippet/i })
    fireEvent.click(addButton)

    expect(screen.getByText('Add New Snippet')).toBeInTheDocument()
    expect(screen.getByLabelText(/snippet name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prefix/i)).toBeInTheDocument()
  })

  it('should switch to edit tab when edit button is clicked', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(screen.getByText('Edit Snippet')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Snippet 1')).toBeInTheDocument()
  })

  it('should create a new snippet', async () => {
    setupMocks()
    mockCreateSnippet.mockResolvedValue('new-snippet-id')

    render(<SnippetManager {...defaultProps} />)

    // Switch to add tab
    const addButton = screen.getByRole('button', { name: /add snippet/i })
    fireEvent.click(addButton)

    // Fill form
    fireEvent.change(screen.getByLabelText(/snippet name/i), { target: { value: 'New Snippet' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A new snippet' } })
    fireEvent.change(screen.getByLabelText(/language/i), { target: { value: 'javascript' } })
    fireEvent.change(screen.getByLabelText(/code/i), { target: { value: 'console.log("test");' } })
    fireEvent.change(screen.getByLabelText(/prefix/i), { target: { value: 'test' } })

    // Submit
    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockCreateSnippet).toHaveBeenCalledWith({
        name: 'New Snippet',
        description: 'A new snippet',
        language: 'javascript',
        code: 'console.log("test");',
        prefix: 'test',
      })
    })
  })

  it('should update an existing snippet', async () => {
    setupMocks()
    mockUpdateSnippet.mockResolvedValue(undefined)

    render(<SnippetManager {...defaultProps} />)

    // Switch to edit tab
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    // Update name
    fireEvent.change(screen.getByDisplayValue('Snippet 1'), { target: { value: 'Updated Snippet' } })

    // Submit
    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateSnippet).toHaveBeenCalledWith('1', {
        name: 'Updated Snippet',
        description: 'A test snippet',
        language: 'javascript',
        code: 'console.log("Hello, World!");',
        prefix: 'clg',
      })
    })
  })

  it('should delete a snippet', async () => {
    setupMocks()
    mockDeleteSnippet.mockResolvedValue(undefined)

    render(<SnippetManager {...defaultProps} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /yes, delete/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteSnippet).toHaveBeenCalledWith('1')
    })
  })

  it('should cancel deletion when cancel button is clicked', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockDeleteSnippet).not.toHaveBeenCalled()
  })

  it('should filter snippets by language', () => {
    setupMocks()
    mockGetSnippetsByLanguage.mockReturnValue([
      createMockSnippet({ id: '1', language: 'javascript' }),
      createMockSnippet({ id: '3', language: 'javascript' }),
    ])

    render(<SnippetManager {...defaultProps} />)

    const languageFilter = screen.getByLabelText(/filter by language/i)
    fireEvent.change(languageFilter, { target: { value: 'javascript' } })

    expect(mockGetSnippetsByLanguage).toHaveBeenCalledWith('javascript')
  })

  it('should search snippets by name', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search snippets/i)
    fireEvent.change(searchInput, { target: { value: 'Snippet 1' } })

    expect(screen.getByText('Snippet 1')).toBeInTheDocument()
    expect(screen.queryByText('Snippet 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Snippet 3')).not.toBeInTheDocument()
  })

  it('should export snippets', () => {
    setupMocks()

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => 'mock-url')
    const mockRevokeObjectURL = vi.fn()
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
    })

    // Mock document.createElement and click
    const mockClick = vi.fn()
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)

    render(<SnippetManager {...defaultProps} />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('should import snippets from file', async () => {
    setupMocks()
    mockCreateSnippet.mockResolvedValue('imported-id')

    const mockFile = new File(['[{"name":"Imported","code":"test"}]'], 'snippets.json', {
      type: 'application/json',
    })

    render(<SnippetManager {...defaultProps} />)

    const importButton = screen.getByRole('button', { name: /import/i })
    fireEvent.click(importButton)

    const fileInput = screen.getByLabelText(/choose file/i)
    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    const importConfirmButton = screen.getByRole('button', { name: /import snippets/i })
    fireEvent.click(importConfirmButton)

    await waitFor(() => {
      expect(mockCreateSnippet).toHaveBeenCalledWith({
        name: 'Imported',
        code: 'test',
        description: '',
        language: 'javascript',
        prefix: '',
      })
    })
  })

  it('should handle import errors', async () => {
    setupMocks()

    const mockFile = new File(['invalid json'], 'snippets.json', {
      type: 'application/json',
    })

    render(<SnippetManager {...defaultProps} />)

    const importButton = screen.getByRole('button', { name: /import/i })
    fireEvent.click(importButton)

    const fileInput = screen.getByLabelText(/choose file/i)
    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    const importConfirmButton = screen.getByRole('button', { name: /import snippets/i })
    fireEvent.click(importConfirmButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to import snippets/i)).toBeInTheDocument()
    })
  })

  it('should close modal when close button is clicked', () => {
    setupMocks()
    const mockOnClose = vi.fn()

    render(<SnippetManager {...defaultProps} onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when clicking outside', () => {
    setupMocks()
    const mockOnClose = vi.fn()

    render(<SnippetManager {...defaultProps} onClose={mockOnClose} />)

    const modal = screen.getByRole('dialog')
    fireEvent.click(modal)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should handle empty snippets list', () => {
    setupMocks({ snippets: [] })

    render(<SnippetManager {...defaultProps} />)

    expect(screen.getByText(/no snippets found/i)).toBeInTheDocument()
  })

  it('should validate required fields when creating snippet', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    // Switch to add tab
    const addButton = screen.getByRole('button', { name: /add snippet/i })
    fireEvent.click(addButton)

    // Try to save without filling required fields
    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    expect(mockCreateSnippet).not.toHaveBeenCalled()
  })

  it('should handle keyboard navigation', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    const firstSnippet = screen.getByText('Snippet 1')
    firstSnippet.focus()

    fireEvent.keyDown(firstSnippet, { key: 'Tab' })
    // Should move to next focusable element
  })

  it('should show confirmation dialog for destructive actions', () => {
    setupMocks()

    render(<SnippetManager {...defaultProps} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument()
  })
})
