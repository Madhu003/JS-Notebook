import { describe, it, expect } from 'vitest'

describe('Basic Functionality Tests', () => {
  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
    expect(15 / 3).toBe(5)
  })

  it('should handle string operations', () => {
    const str = 'Hello, World!'
    expect(str.length).toBe(13)
    expect(str.toUpperCase()).toBe('HELLO, WORLD!')
    expect(str.toLowerCase()).toBe('hello, world!')
    expect(str.includes('World')).toBe(true)
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr.length).toBe(5)
    expect(arr.includes(3)).toBe(true)
    expect(arr.filter(x => x > 3)).toEqual([4, 5])
    expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10])
  })

  it('should work with objects', () => {
    const obj = { name: 'Test', value: 42, active: true }
    expect(obj.name).toBe('Test')
    expect(obj.value).toBe(42)
    expect(obj.active).toBe(true)
    expect(Object.keys(obj)).toEqual(['name', 'value', 'active'])
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success')
    const result = await promise
    expect(result).toBe('success')
  })

  it('should handle errors', () => {
    const throwError = () => {
      throw new Error('Test error')
    }
    
    expect(throwError).toThrow('Test error')
  })
})

describe('JS-Notebook Logic Tests', () => {
  it('should validate email format', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
  })

  it('should validate password strength', () => {
    const isStrongPassword = (password: string) => {
      return password.length >= 6
    }

    expect(isStrongPassword('password123')).toBe(true)
    expect(isStrongPassword('short')).toBe(false)
    expect(isStrongPassword('')).toBe(false)
  })

  it('should format code snippets', () => {
    const formatSnippet = (code: string, language: string) => {
      const trimmed = code.trim()
      return `\`\`\`${language}\n${trimmed}\n\`\`\``
    }

    const result = formatSnippet('console.log("hello");', 'javascript')
    expect(result).toBe('```javascript\nconsole.log("hello");\n```')
  })

  it('should parse notebook cells', () => {
    const parseCell = (content: string, type: 'code' | 'markdown') => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        content,
        createdAt: Date.now(),
      }
    }

    const cell = parseCell('console.log("test");', 'code')
    expect(cell.type).toBe('code')
    expect(cell.content).toBe('console.log("test");')
    expect(cell.id).toBeDefined()
    expect(cell.createdAt).toBeDefined()
  })

  it('should filter snippets by language', () => {
    const snippets = [
      { id: '1', language: 'javascript', name: 'JS Snippet' },
      { id: '2', language: 'typescript', name: 'TS Snippet' },
      { id: '3', language: 'javascript', name: 'Another JS' },
      { id: '4', language: 'react', name: 'React Snippet' },
    ]

    const filterByLanguage = (snippets: any[], language: string) => {
      return snippets.filter(s => s.language === language)
    }

    const jsSnippets = filterByLanguage(snippets, 'javascript')
    expect(jsSnippets).toHaveLength(2)
    expect(jsSnippets[0].name).toBe('JS Snippet')
    expect(jsSnippets[1].name).toBe('Another JS')
  })

  it('should handle theme switching', () => {
    const themes = ['light', 'dark']
    let currentTheme = 'light'

    const toggleTheme = () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light'
      return currentTheme
    }

    expect(toggleTheme()).toBe('dark')
    expect(toggleTheme()).toBe('light')
    expect(toggleTheme()).toBe('dark')
  })

  it('should validate notebook titles', () => {
    const isValidTitle = (title: string) => {
      return title && title.trim().length > 0 && title.length <= 100
    }

    expect(isValidTitle('My Notebook')).toBe(true)
    expect(isValidTitle('')).toBe(false)
    expect(isValidTitle('   ')).toBe(false)
    expect(isValidTitle('A'.repeat(101))).toBe(false)
    expect(isValidTitle('A'.repeat(100))).toBe(true)
  })

  it('should handle search functionality', () => {
    const notebooks = [
      { id: '1', title: 'JavaScript Basics', description: 'Learn JS' },
      { id: '2', title: 'React Tutorial', description: 'Learn React' },
      { id: '3', title: 'TypeScript Guide', description: 'Learn TS' },
    ]

    const searchNotebooks = (notebooks: any[], query: string) => {
      const lowercaseQuery = query.toLowerCase()
      return notebooks.filter(n => 
        n.title.toLowerCase().includes(lowercaseQuery) ||
        n.description.toLowerCase().includes(lowercaseQuery)
      )
    }

    const jsResults = searchNotebooks(notebooks, 'javascript')
    expect(jsResults).toHaveLength(1)
    expect(jsResults[0].title).toBe('JavaScript Basics')

    const learnResults = searchNotebooks(notebooks, 'learn')
    expect(learnResults).toHaveLength(3)
  })

  it('should handle export filename generation', () => {
    const generateFilename = (title: string, extension: string = 'pdf') => {
      const sanitized = title.replace(/[^a-zA-Z0-9\s-]/g, '-')
      return `${sanitized}.${extension}`
    }

    expect(generateFilename('My Notebook')).toBe('My Notebook.pdf')
    expect(generateFilename('Test/Notebook: Special!')).toBe('Test-Notebook- Special-.pdf')
    expect(generateFilename('Simple Title', 'json')).toBe('Simple Title.json')
  })

  it('should handle error message mapping', () => {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    }

    const getErrorMessage = (errorCode: string) => {
      return errorMessages[errorCode] || 'An unexpected error occurred'
    }

    expect(getErrorMessage('auth/user-not-found')).toBe('No account found with this email')
    expect(getErrorMessage('auth/wrong-password')).toBe('Incorrect password')
    expect(getErrorMessage('unknown-error')).toBe('An unexpected error occurred')
  })
})
