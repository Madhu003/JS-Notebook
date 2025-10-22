import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToPDF } from '../utils/export'
import { createMockNotebook, createMockCell } from '../../../test/utils'

// Mock html2canvas
const mockHtml2canvas = vi.fn()
vi.mock('html2canvas', () => ({
  default: mockHtml2canvas,
}))

// Mock jspdf
const mockJsPDF = vi.fn()
const mockPdf = {
  addPage: vi.fn(),
  addImage: vi.fn(),
  save: vi.fn(),
}
mockJsPDF.mockReturnValue(mockPdf)
vi.mock('jspdf', () => ({
  default: mockJsPDF,
}))

describe('exportToPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHtml2canvas.mockClear()
    mockJsPDF.mockClear()
    mockPdf.addPage.mockClear()
    mockPdf.addImage.mockClear()
    mockPdf.save.mockClear()
  })

  it('should export notebook to PDF successfully', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Test Notebook',
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title\nSome content' }),
        createMockCell({ type: 'code', content: 'console.log("Hello");', language: 'javascript' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockJsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    expect(mockPdf.addPage).toHaveBeenCalled()
    expect(mockPdf.addImage).toHaveBeenCalledWith('data:image/png;base64,mock-image-data', 'PNG', 0, 0, 210, 297)
    expect(mockPdf.save).toHaveBeenCalledWith('Test Notebook.pdf')
  })

  it('should handle empty notebook', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Empty Notebook',
      description: 'An empty notebook',
      cells: [],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockPdf.save).toHaveBeenCalledWith('Empty Notebook.pdf')
  })

  it('should handle notebook with special characters in title', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Test/Notebook: With Special Characters',
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockPdf.save).toHaveBeenCalledWith('Test-Notebook- With Special Characters.pdf')
  })

  it('should handle notebook with very long title', async () => {
    const longTitle = 'A'.repeat(100)
    const mockNotebook = createMockNotebook({
      title: longTitle,
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockPdf.save).toHaveBeenCalledWith(`${longTitle}.pdf`)
  })

  it('should handle notebook with undefined title', async () => {
    const mockNotebook = createMockNotebook({
      title: undefined as any,
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockPdf.save).toHaveBeenCalledWith('Untitled.pdf')
  })

  it('should handle notebook with null title', async () => {
    const mockNotebook = createMockNotebook({
      title: null as any,
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockPdf.save).toHaveBeenCalledWith('Untitled.pdf')
  })

  it('should handle notebook with empty title', async () => {
    const mockNotebook = createMockNotebook({
      title: '',
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockPdf.save).toHaveBeenCalledWith('Untitled.pdf')
  })

  it('should handle html2canvas errors', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Test Notebook',
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title' }),
      ],
    })

    const error = new Error('Canvas rendering failed')
    mockHtml2canvas.mockRejectedValue(error)

    await expect(exportToPDF(mockNotebook)).rejects.toThrow('Canvas rendering failed')
  })

  it('should handle jsPDF errors', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Test Notebook',
      description: 'A test notebook',
      cells: [
        createMockCell({ type: 'markdown', content: '# Title' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    const error = new Error('PDF creation failed')
    mockJsPDF.mockImplementation(() => {
      throw error
    })

    await expect(exportToPDF(mockNotebook)).rejects.toThrow('PDF creation failed')
  })

  it('should handle different cell types', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Mixed Notebook',
      description: 'A notebook with different cell types',
      cells: [
        createMockCell({ type: 'markdown', content: '# Markdown Cell' }),
        createMockCell({ type: 'code', content: 'console.log("JS");', language: 'javascript' }),
        createMockCell({ type: 'code', content: 'const App = () => <div>React</div>;', language: 'react' }),
        createMockCell({ type: 'code', content: 'interface User { name: string; }', language: 'typescript' }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockPdf.save).toHaveBeenCalledWith('Mixed Notebook.pdf')
  })

  it('should handle cells with output', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Notebook with Output',
      description: 'A notebook with cell output',
      cells: [
        createMockCell({ 
          type: 'code', 
          content: 'console.log("Hello");', 
          language: 'javascript',
          output: 'Hello',
          executionTime: 50,
        }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockPdf.save).toHaveBeenCalledWith('Notebook with Output.pdf')
  })

  it('should handle cells with errors', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Notebook with Errors',
      description: 'A notebook with cell errors',
      cells: [
        createMockCell({ 
          type: 'code', 
          content: 'invalid syntax {', 
          language: 'javascript',
          error: 'SyntaxError: Unexpected token',
        }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockPdf.save).toHaveBeenCalledWith('Notebook with Errors.pdf')
  })

  it('should handle large notebooks', async () => {
    const cells = Array.from({ length: 50 }, (_, i) => 
      createMockCell({ 
        type: 'code', 
        content: `console.log("Cell ${i}");`, 
        language: 'javascript' 
      })
    )

    const mockNotebook = createMockNotebook({
      title: 'Large Notebook',
      description: 'A notebook with many cells',
      cells,
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockPdf.save).toHaveBeenCalledWith('Large Notebook.pdf')
  })

  it('should handle cells with special characters', async () => {
    const mockNotebook = createMockNotebook({
      title: 'Special Characters Notebook',
      description: 'A notebook with special characters',
      cells: [
        createMockCell({ 
          type: 'code', 
          content: 'console.log("Hello, 世界! 🌍");', 
          language: 'javascript' 
        }),
        createMockCell({ 
          type: 'markdown', 
          content: '# Special Characters\n\nSome **bold** and *italic* text with `code`.' 
        }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockPdf.save).toHaveBeenCalledWith('Special Characters Notebook.pdf')
  })

  it('should handle cells with long content', async () => {
    const longContent = 'console.log("Hello");\n'.repeat(100)
    const mockNotebook = createMockNotebook({
      title: 'Long Content Notebook',
      description: 'A notebook with long cell content',
      cells: [
        createMockCell({ 
          type: 'code', 
          content: longContent, 
          language: 'javascript' 
        }),
      ],
    })

    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    }
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    await exportToPDF(mockNotebook)

    expect(mockHtml2canvas).toHaveBeenCalled()
    expect(mockPdf.save).toHaveBeenCalledWith('Long Content Notebook.pdf')
  })

  it('should handle null notebook', async () => {
    await expect(exportToPDF(null as any)).rejects.toThrow()
  })

  it('should handle undefined notebook', async () => {
    await expect(exportToPDF(undefined as any)).rejects.toThrow()
  })

  it('should handle notebook without cells property', async () => {
    const mockNotebook = {
      id: 'test-id',
      title: 'Test Notebook',
      description: 'A test notebook',
      userId: 'test-user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublic: false,
      tags: [],
    }

    await expect(exportToPDF(mockNotebook as any)).rejects.toThrow()
  })
})
