import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../../services/authService'
import { createMockUser } from '../../../test/utils'

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = vi.fn()
const mockCreateUserWithEmailAndPassword = vi.fn()
const mockSignOut = vi.fn()
const mockUpdateProfile = vi.fn()
const mockOnAuthStateChanged = vi.fn()

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  updateProfile: mockUpdateProfile,
  onAuthStateChanged: mockOnAuthStateChanged,
}))

// Mock Firebase app
const mockAuth = {
  currentUser: null,
}

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}))

vi.mock('./firebase', () => ({
  auth: mockAuth,
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.currentUser = null
  })

  describe('mapFirebaseUser', () => {
    it('should map Firebase user to AuthUser correctly', () => {
      const firebaseUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      }

      const result = (authService as any).mapFirebaseUser(firebaseUser)

      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      })
    })

    it('should return null for null Firebase user', () => {
      const result = (authService as any).mapFirebaseUser(null)
      expect(result).toBeNull()
    })

    it('should handle undefined properties', () => {
      const firebaseUser = {
        uid: 'test-uid',
        email: null,
        displayName: null,
        photoURL: null,
      }

      const result = (authService as any).mapFirebaseUser(firebaseUser)

      expect(result).toEqual({
        uid: 'test-uid',
        email: null,
        displayName: null,
        photoURL: null,
      })
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser()
      const mockUserCredential = {
        user: {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
        },
      }

      mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential)

      const result = await authService.login('test@example.com', 'password123')

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@example.com', 'password123')
      expect(result).toEqual(mockUser)
    })

    it('should handle user not found error', async () => {
      const error = new Error('Firebase: Error (auth/user-not-found).')
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.login('nonexistent@example.com', 'password123'))
        .rejects.toThrow('No account found with this email')
    })

    it('should handle wrong password error', async () => {
      const error = new Error('Firebase: Error (auth/wrong-password).')
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Incorrect password')
    })

    it('should handle invalid email error', async () => {
      const error = new Error('Firebase: Error (auth/invalid-email).')
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.login('invalid-email', 'password123'))
        .rejects.toThrow('Invalid email address')
    })

    it('should handle user disabled error', async () => {
      const error = new Error('Firebase: Error (auth/user-disabled).')
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.login('test@example.com', 'password123'))
        .rejects.toThrow('This account has been disabled')
    })

    it('should handle too many requests error', async () => {
      const error = new Error('Firebase: Error (auth/too-many-requests).')
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.login('test@example.com', 'password123'))
        .rejects.toThrow('Too many failed attempts. Please try again later')
    })

    it('should handle generic errors', async () => {
      const error = new Error('Unknown error')
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.login('test@example.com', 'password123'))
        .rejects.toThrow('Login failed')
    })
  })

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockUser = createMockUser()
      const mockUserCredential = {
        user: {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
        },
      }

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential)
      mockUpdateProfile.mockResolvedValue(undefined)

      const result = await authService.register('test@example.com', 'password123', 'Test User')

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@example.com', 'password123')
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUserCredential.user, {
        displayName: 'Test User',
      })
      expect(result).toEqual(mockUser)
    })

    it('should handle email already in use error', async () => {
      const error = new Error('Firebase: Error (auth/email-already-in-use).')
      mockCreateUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.register('existing@example.com', 'password123', 'Test User'))
        .rejects.toThrow('An account with this email already exists')
    })

    it('should handle invalid email error', async () => {
      const error = new Error('Firebase: Error (auth/invalid-email).')
      mockCreateUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.register('invalid-email', 'password123', 'Test User'))
        .rejects.toThrow('Invalid email address')
    })

    it('should handle weak password error', async () => {
      const error = new Error('Firebase: Error (auth/weak-password).')
      mockCreateUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.register('test@example.com', '123', 'Test User'))
        .rejects.toThrow('Password should be at least 6 characters')
    })

    it('should handle generic errors', async () => {
      const error = new Error('Unknown error')
      mockCreateUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(authService.register('test@example.com', 'password123', 'Test User'))
        .rejects.toThrow('Registration failed')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockSignOut.mockResolvedValue(undefined)

      await authService.logout()

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth)
    })

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed')
      mockSignOut.mockRejectedValue(error)

      await expect(authService.logout()).rejects.toThrow('Logout failed')
    })
  })

  describe('onAuthStateChanged', () => {
    it('should register auth state change listener', () => {
      const callback = vi.fn()
      const unsubscribe = vi.fn()

      mockOnAuthStateChanged.mockReturnValue(unsubscribe)

      const result = authService.onAuthStateChanged(callback)

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function))
      expect(result).toBe(unsubscribe)
    })

    it('should call callback with mapped user', () => {
      const callback = vi.fn()
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      }

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser)
        return vi.fn()
      })

      authService.onAuthStateChanged(callback)

      expect(callback).toHaveBeenCalledWith({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      })
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const mockUser = createMockUser()
      mockAuth.currentUser = {
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        photoURL: mockUser.photoURL,
      }

      const result = await authService.getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null when not authenticated', async () => {
      mockAuth.currentUser = null

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })
})
