import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notebookService } from '../../services/notebookService'
import { createMockNotebook, createMockUser } from '../../../test/utils'

// Mock Firebase Firestore
const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockGetDoc = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()
const mockCollection = vi.fn()
const mockDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDocs: mockGetDocs,
  getDoc: mockGetDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
}))

// Mock Firebase config
vi.mock('../../services/firebase', () => ({
  db: {},
  COLLECTIONS: {
    NOTEBOOKS: 'notebooks',
  },
}))

describe('NotebookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createNotebook', () => {
    it('should create a notebook successfully', async () => {
      const notebookData = {
        title: 'Test Notebook',
        description: 'A test notebook',
        isPublic: false,
        tags: ['test'],
        cells: [],
      }
      const userId = 'test-user-id'
      const notebookId = 'new-notebook-id'

      mockCollection.mockReturnValue({})
      mockAddDoc.mockResolvedValue({ id: notebookId })

      const result = await notebookService.createNotebook(notebookData, userId)

      expect(mockCollection).toHaveBeenCalledWith({}, 'notebooks')
      expect(mockAddDoc).toHaveBeenCalledWith({}, {
        ...notebookData,
        userId,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      })
      expect(result).toBe(notebookId)
    })

    it('should handle creation errors', async () => {
      const notebookData = {
        title: 'Test Notebook',
        description: 'A test notebook',
        isPublic: false,
        tags: ['test'],
        cells: [],
      }
      const userId = 'test-user-id'
      const error = new Error('Failed to create notebook')

      mockCollection.mockReturnValue({})
      mockAddDoc.mockRejectedValue(error)

      await expect(notebookService.createNotebook(notebookData, userId)).rejects.toThrow('Failed to create notebook')
    })
  })

  describe('getNotebook', () => {
    it('should fetch a notebook by ID', async () => {
      const notebookId = 'test-notebook-id'
      const mockNotebook = createMockNotebook({ id: notebookId })

      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockNotebook,
      }

      mockDoc.mockReturnValue({})
      mockGetDoc.mockResolvedValue(mockDocSnapshot)

      const result = await notebookService.getNotebook(notebookId)

      expect(mockDoc).toHaveBeenCalledWith({}, 'notebooks', notebookId)
      expect(result).toEqual({ ...mockNotebook, id: notebookId })
    })

    it('should return null for non-existent notebook', async () => {
      const notebookId = 'non-existent-id'

      const mockDocSnapshot = {
        exists: () => false,
        data: () => undefined,
      }

      mockDoc.mockReturnValue({})
      mockGetDoc.mockResolvedValue(mockDocSnapshot)

      const result = await notebookService.getNotebook(notebookId)

      expect(result).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const notebookId = 'test-notebook-id'
      const error = new Error('Failed to fetch notebook')

      mockDoc.mockReturnValue({})
      mockGetDoc.mockRejectedValue(error)

      await expect(notebookService.getNotebook(notebookId)).rejects.toThrow('Failed to fetch notebook')
    })
  })

  describe('getAllNotebooks', () => {
    it('should fetch all notebooks for a user', async () => {
      const userId = 'test-user-id'
      const mockNotebooks = [
        createMockNotebook({ id: '1', userId }),
        createMockNotebook({ id: '2', userId }),
      ]

      const mockQuerySnapshot = {
        forEach: vi.fn((callback) => {
          mockNotebooks.forEach(notebook => {
            callback({
              id: notebook.id,
              data: () => notebook,
            })
          })
        }),
      }

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockOrderBy.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockResolvedValue(mockQuerySnapshot)

      const result = await notebookService.getAllNotebooks(userId)

      expect(mockCollection).toHaveBeenCalledWith({}, 'notebooks')
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId)
      expect(mockOrderBy).toHaveBeenCalledWith('updatedAt', 'desc')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ ...mockNotebooks[0], id: '1' })
      expect(result[1]).toEqual({ ...mockNotebooks[1], id: '2' })
    })

    it('should handle fetch errors', async () => {
      const userId = 'test-user-id'
      const error = new Error('Failed to fetch notebooks')

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockOrderBy.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockRejectedValue(error)

      await expect(notebookService.getAllNotebooks(userId)).rejects.toThrow('Failed to fetch notebooks')
    })
  })

  describe('getPublicNotebooks', () => {
    it('should fetch public notebooks', async () => {
      const mockNotebooks = [
        createMockNotebook({ id: '1', isPublic: true }),
        createMockNotebook({ id: '2', isPublic: true }),
      ]

      const mockQuerySnapshot = {
        forEach: vi.fn((callback) => {
          mockNotebooks.forEach(notebook => {
            callback({
              id: notebook.id,
              data: () => notebook,
            })
          })
        }),
      }

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockOrderBy.mockReturnValue({})
      mockLimit.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockResolvedValue(mockQuerySnapshot)

      const result = await notebookService.getPublicNotebooks()

      expect(mockCollection).toHaveBeenCalledWith({}, 'notebooks')
      expect(mockWhere).toHaveBeenCalledWith('isPublic', '==', true)
      expect(mockOrderBy).toHaveBeenCalledWith('updatedAt', 'desc')
      expect(mockLimit).toHaveBeenCalledWith(20)
      expect(result).toHaveLength(2)
    })

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch public notebooks')

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockOrderBy.mockReturnValue({})
      mockLimit.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockRejectedValue(error)

      await expect(notebookService.getPublicNotebooks()).rejects.toThrow('Failed to fetch public notebooks')
    })
  })

  describe('updateNotebook', () => {
    it('should update a notebook successfully', async () => {
      const notebookId = 'test-notebook-id'
      const updateData = {
        title: 'Updated Notebook',
        description: 'Updated description',
      }

      mockDoc.mockReturnValue({})
      mockUpdateDoc.mockResolvedValue(undefined)

      await notebookService.updateNotebook(notebookId, updateData)

      expect(mockDoc).toHaveBeenCalledWith({}, 'notebooks', notebookId)
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        ...updateData,
        updatedAt: expect.any(Number),
      })
    })

    it('should handle update errors', async () => {
      const notebookId = 'test-notebook-id'
      const updateData = { title: 'Updated Notebook' }
      const error = new Error('Failed to update notebook')

      mockDoc.mockReturnValue({})
      mockUpdateDoc.mockRejectedValue(error)

      await expect(notebookService.updateNotebook(notebookId, updateData)).rejects.toThrow('Failed to update notebook')
    })
  })

  describe('deleteNotebook', () => {
    it('should delete a notebook successfully', async () => {
      const notebookId = 'test-notebook-id'

      mockDoc.mockReturnValue({})
      mockDeleteDoc.mockResolvedValue(undefined)

      await notebookService.deleteNotebook(notebookId)

      expect(mockDoc).toHaveBeenCalledWith({}, 'notebooks', notebookId)
      expect(mockDeleteDoc).toHaveBeenCalledWith({})
    })

    it('should handle deletion errors', async () => {
      const notebookId = 'test-notebook-id'
      const error = new Error('Failed to delete notebook')

      mockDoc.mockReturnValue({})
      mockDeleteDoc.mockRejectedValue(error)

      await expect(notebookService.deleteNotebook(notebookId)).rejects.toThrow('Failed to delete notebook')
    })
  })

  describe('searchNotebooks', () => {
    it('should search notebooks by title', async () => {
      const userId = 'test-user-id'
      const searchTerm = 'test'
      const mockNotebooks = [
        createMockNotebook({ id: '1', userId, title: 'Test Notebook' }),
        createMockNotebook({ id: '2', userId, title: 'Another Test' }),
      ]

      const mockQuerySnapshot = {
        forEach: vi.fn((callback) => {
          mockNotebooks.forEach(notebook => {
            callback({
              id: notebook.id,
              data: () => notebook,
            })
          })
        }),
      }

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockOrderBy.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockResolvedValue(mockQuerySnapshot)

      const result = await notebookService.searchNotebooks(userId, searchTerm)

      expect(mockCollection).toHaveBeenCalledWith({}, 'notebooks')
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId)
      expect(result).toHaveLength(2)
    })

    it('should handle search errors', async () => {
      const userId = 'test-user-id'
      const searchTerm = 'test'
      const error = new Error('Failed to search notebooks')

      mockCollection.mockReturnValue({})
      mockWhere.mockReturnValue({})
      mockOrderBy.mockReturnValue({})
      mockQuery.mockReturnValue({})
      mockGetDocs.mockRejectedValue(error)

      await expect(notebookService.searchNotebooks(userId, searchTerm)).rejects.toThrow('Failed to search notebooks')
    })
  })

  describe('duplicateNotebook', () => {
    it('should duplicate a notebook successfully', async () => {
      const notebookId = 'test-notebook-id'
      const userId = 'test-user-id'
      const mockNotebook = createMockNotebook({ id: notebookId })

      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockNotebook,
      }

      mockDoc.mockReturnValue({})
      mockGetDoc.mockResolvedValue(mockDocSnapshot)
      mockCollection.mockReturnValue({})
      mockAddDoc.mockResolvedValue({ id: 'duplicated-id' })

      const result = await notebookService.duplicateNotebook(notebookId, userId)

      expect(result).toBe('duplicated-id')
      expect(mockAddDoc).toHaveBeenCalledWith({}, {
        ...mockNotebook,
        title: `${mockNotebook.title} (Copy)`,
        userId,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      })
    })

    it('should handle duplication errors', async () => {
      const notebookId = 'test-notebook-id'
      const userId = 'test-user-id'
      const error = new Error('Failed to duplicate notebook')

      mockDoc.mockReturnValue({})
      mockGetDoc.mockRejectedValue(error)

      await expect(notebookService.duplicateNotebook(notebookId, userId)).rejects.toThrow('Failed to duplicate notebook')
    })
  })
})
