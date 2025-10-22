import { describe, it, expect, vi, beforeEach } from 'vitest'
import { snippetService } from '../../services/snippetService'
import { createMockSnippet } from '../../../test/utils'

// Mock Firebase Firestore
const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()
const mockCollection = vi.fn()
const mockDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
}))

// Mock Firebase config
vi.mock('../../services/firebase', () => ({
  db: {},
  COLLECTIONS: {
    SNIPPETS: 'snippets',
  },
}))

describe('SnippetService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSnippet', () => {
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

      mockCollection.mockReturnValue({})
      mockAddDoc.mockResolvedValue({ id: snippetId })

      const result = await snippetService.createSnippet(snippetData, userId)

      expect(mockCollection).toHaveBeenCalledWith({}, 'snippets')
      expect(mockAddDoc).toHaveBeenCalledWith({}, {
        ...snippetData,
        userId,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      })
      expect(result).toBe(snippetId)
    })

    it('should handle creation errors', async () => {
      const snippetData = {
        name: 'Test Snippet',
        description: 'A test snippet',
        language: 'javascript' as const,
        code: 'console.log("Hello");',
        prefix: 'clg',
      }
      const userId = 'test-user-id'
      const error = new Error('Failed to create snippet')

      mockCollection.mockReturnValue({})
      mockAddDoc.mockRejectedValue(error)

      await expect(snippetService.createSnippet(snippetData, userId)).rejects.toThrow('Failed to create snippet')
    })
  })

  describe('getAllSnippets', () => {
    it('should fetch all snippets for a user', async () => {
      const userId = 'test-user-id'
      const mockSnippets = [
        createMockSnippet({ id: '1', userId }),
        createMockSnippet({ id: '2', userId }),
      ]

      const mockQuerySnapshot = {
        forEach: vi.fn((callback) => {
          mockSnippets.forEach(snippet => {
            callback({
              id: snippet.id,
              data: () => snippet,
            })
          })
        }),
      }

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockResolvedValue(mockQuerySnapshot)

      const result = await snippetService.getAllSnippets(userId)

      expect(mockCollection).toHaveBeenCalledWith({}, 'snippets')
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ ...mockSnippets[0], id: '1' })
      expect(result[1]).toEqual({ ...mockSnippets[1], id: '2' })
    })

    it('should sort snippets by updatedAt descending', async () => {
      const userId = 'test-user-id'
      const now = Date.now()
      const mockSnippets = [
        createMockSnippet({ id: '1', userId, updatedAt: now - 1000 }),
        createMockSnippet({ id: '2', userId, updatedAt: now }),
        createMockSnippet({ id: '3', userId, updatedAt: now - 500 }),
      ]

      const mockQuerySnapshot = {
        forEach: vi.fn((callback) => {
          mockSnippets.forEach(snippet => {
            callback({
              id: snippet.id,
              data: () => snippet,
            })
          })
        }),
      }

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockResolvedValue(mockQuerySnapshot)

      const result = await snippetService.getAllSnippets(userId)

      expect(result[0].id).toBe('2') // Most recent
      expect(result[1].id).toBe('3') // Middle
      expect(result[2].id).toBe('1') // Oldest
    })

    it('should handle fetch errors', async () => {
      const userId = 'test-user-id'
      const error = new Error('Failed to fetch snippets')

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockRejectedValue(error)

      await expect(snippetService.getAllSnippets(userId)).rejects.toThrow('Failed to fetch snippets')
    })
  })

  describe('updateSnippet', () => {
    it('should update a snippet successfully', async () => {
      const snippetId = 'test-snippet-id'
      const updateData = {
        name: 'Updated Snippet',
        description: 'Updated description',
      }

      mockDoc.mockReturnValue({})
      mockUpdateDoc.mockResolvedValue(undefined)

      await snippetService.updateSnippet(snippetId, updateData)

      expect(mockDoc).toHaveBeenCalledWith({}, 'snippets', snippetId)
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        ...updateData,
        updatedAt: expect.any(Number),
      })
    })

    it('should handle update errors', async () => {
      const snippetId = 'test-snippet-id'
      const updateData = { name: 'Updated Snippet' }
      const error = new Error('Failed to update snippet')

      mockDoc.mockReturnValue({})
      mockUpdateDoc.mockRejectedValue(error)

      await expect(snippetService.updateSnippet(snippetId, updateData)).rejects.toThrow('Failed to update snippet')
    })
  })

  describe('deleteSnippet', () => {
    it('should delete a snippet successfully', async () => {
      const snippetId = 'test-snippet-id'

      mockDoc.mockReturnValue({})
      mockDeleteDoc.mockResolvedValue(undefined)

      await snippetService.deleteSnippet(snippetId)

      expect(mockDoc).toHaveBeenCalledWith({}, 'snippets', snippetId)
      expect(mockDeleteDoc).toHaveBeenCalledWith({})
    })

    it('should handle deletion errors', async () => {
      const snippetId = 'test-snippet-id'
      const error = new Error('Failed to delete snippet')

      mockDoc.mockReturnValue({})
      mockDeleteDoc.mockRejectedValue(error)

      await expect(snippetService.deleteSnippet(snippetId)).rejects.toThrow('Failed to delete snippet')
    })
  })

  describe('getDefaultSnippets', () => {
    it('should return default snippets', () => {
      const result = snippetService.getDefaultSnippets()

      expect(result).toHaveLength(5)
      expect(result[0].name).toBe('console.log')
      expect(result[0].prefix).toBe('clg')
      expect(result[0].language).toBe('javascript')
      expect(result[1].name).toBe('function')
      expect(result[1].prefix).toBe('fn')
      expect(result[2].name).toBe('arrow function')
      expect(result[2].prefix).toBe('af')
      expect(result[3].name).toBe('React component')
      expect(result[3].prefix).toBe('rc')
      expect(result[3].language).toBe('react')
      expect(result[4].name).toBe('useState hook')
      expect(result[4].prefix).toBe('us')
      expect(result[4].language).toBe('react')
    })
  })

  describe('importSnippets', () => {
    it('should import snippets from JSON string', async () => {
      const snippetsToImport = [
        {
          name: 'Imported Snippet 1',
          description: 'First imported snippet',
          language: 'javascript',
          code: 'console.log("imported 1");',
          prefix: 'imp1',
        },
        {
          name: 'Imported Snippet 2',
          description: 'Second imported snippet',
          language: 'typescript',
          code: 'console.log("imported 2");',
          prefix: 'imp2',
        },
      ]
      const jsonString = JSON.stringify(snippetsToImport)
      const userId = 'test-user-id'

      mockCollection.mockReturnValue({})
      mockAddDoc.mockResolvedValue({ id: 'imported-id' })

      const result = await snippetService.importSnippets(jsonString, userId)

      expect(result).toBe(2)
      expect(mockAddDoc).toHaveBeenCalledTimes(2)
    })

    it('should handle invalid JSON', async () => {
      const invalidJson = 'invalid json'
      const userId = 'test-user-id'

      await expect(snippetService.importSnippets(invalidJson, userId)).rejects.toThrow()
    })

    it('should handle import errors', async () => {
      const snippetsToImport = [
        {
          name: 'Imported Snippet',
          description: 'Imported snippet',
          language: 'javascript',
          code: 'console.log("imported");',
          prefix: 'imp',
        },
      ]
      const jsonString = JSON.stringify(snippetsToImport)
      const userId = 'test-user-id'
      const error = new Error('Failed to import')

      mockCollection.mockReturnValue({})
      mockAddDoc.mockRejectedValue(error)

      await expect(snippetService.importSnippets(jsonString, userId)).rejects.toThrow('Failed to import')
    })
  })

  describe('exportSnippets', () => {
    it('should export snippets as JSON string', async () => {
      const userId = 'test-user-id'
      const mockSnippets = [
        createMockSnippet({ id: '1', userId }),
        createMockSnippet({ id: '2', userId }),
      ]

      const mockQuerySnapshot = {
        forEach: vi.fn((callback) => {
          mockSnippets.forEach(snippet => {
            callback({
              id: snippet.id,
              data: () => snippet,
            })
          })
        }),
      }

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockResolvedValue(mockQuerySnapshot)

      const result = await snippetService.exportSnippets(userId)

      expect(result).toBe(JSON.stringify(mockSnippets, null, 2))
    })

    it('should handle export errors', async () => {
      const userId = 'test-user-id'
      const error = new Error('Failed to export')

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockRejectedValue(error)

      await expect(snippetService.exportSnippets(userId)).rejects.toThrow('Failed to export')
    })
  })
})
