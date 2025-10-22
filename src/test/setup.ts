import { afterEach, beforeAll, afterAll } from 'vitest'

// Mock Firebase
const mockFirebase = {
  auth: () => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  }),
  firestore: () => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      })),
      add: vi.fn(),
      where: vi.fn(),
      orderBy: vi.fn(),
      limit: vi.fn(),
    })),
  }),
}

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => mockFirebase),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockFirebase.auth()),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockFirebase.firestore()),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}))

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ onMount, ...props }) => {
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
    
    return { type: 'div', props: { 'data-testid': 'monaco-editor', ...props } }
  }),
}))

vi.mock('monaco-editor', () => ({
  languages: {
    registerCompletionItemProvider: vi.fn(),
    CompletionItemKind: {
      Snippet: 15,
    },
    CompletionItemInsertTextRule: {
      InsertAsSnippet: 4,
    },
  },
  editor: {
    defineTheme: vi.fn(),
  },
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn(() => ({ id: 'test-notebook' })),
  Link: ({ children, ...props }: any) => ({ type: 'a', props: { ...props }, children }),
  Routes: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'routes' }, children }),
  Route: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'route' }, children }),
}))

// Mock react-beautiful-dnd
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'drag-drop-context' }, children }),
  Droppable: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'droppable' }, children }),
  Draggable: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'draggable' }, children }),
}))

// Mock react-hotkeys-hook
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockURL = {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
}

// Mock Blob
const mockBlob = vi.fn((content, options) => ({
  content,
  options,
  text: vi.fn(() => Promise.resolve(JSON.stringify(content))),
}))

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Global test setup
beforeAll(() => {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
})
