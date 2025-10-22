import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatCode } from '../utils/formatting'

// Mock prettier
const mockFormat = vi.fn()
vi.mock('prettier', () => ({
  format: mockFormat,
}))

describe('formatCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should format JavaScript code', async () => {
    const inputCode = 'const x=1;const y=2;'
    const expectedFormatted = 'const x = 1;\nconst y = 2;'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'javascript')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'babel',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should format TypeScript code', async () => {
    const inputCode = 'const x:number=1;const y:number=2;'
    const expectedFormatted = 'const x: number = 1;\nconst y: number = 2;'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'typescript')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'typescript',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should format React code', async () => {
    const inputCode = 'const App=()=><div>Hello</div>;'
    const expectedFormatted = 'const App = () => <div>Hello</div>;'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'react')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'babel',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should format React TypeScript code', async () => {
    const inputCode = 'const App:React.FC=()=><div>Hello</div>;'
    const expectedFormatted = 'const App: React.FC = () => <div>Hello</div>;'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'react-ts')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'typescript',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should handle JSON formatting', async () => {
    const inputCode = '{"name":"test","value":123}'
    const expectedFormatted = '{\n  "name": "test",\n  "value": 123\n}'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'json')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'json',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should handle CSS formatting', async () => {
    const inputCode = '.class{color:red;font-size:16px;}'
    const expectedFormatted = '.class {\n  color: red;\n  font-size: 16px;\n}'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'css')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'css',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should handle HTML formatting', async () => {
    const inputCode = '<div><p>Hello</p></div>'
    const expectedFormatted = '<div>\n  <p>Hello</p>\n</div>'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'html')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'html',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should handle Markdown formatting', async () => {
    const inputCode = '# Title\nSome text'
    const expectedFormatted = '# Title\n\nSome text'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'markdown')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'markdown',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should return original code for unsupported languages', async () => {
    const inputCode = 'some unsupported code'
    
    const result = await formatCode(inputCode, 'unsupported')

    expect(mockFormat).not.toHaveBeenCalled()
    expect(result).toBe(inputCode)
  })

  it('should handle formatting errors gracefully', async () => {
    const inputCode = 'invalid syntax {'
    const error = new Error('Syntax error')
    
    mockFormat.mockRejectedValue(error)

    const result = await formatCode(inputCode, 'javascript')

    expect(result).toBe(inputCode) // Should return original code on error
  })

  it('should handle empty code', async () => {
    const inputCode = ''
    
    mockFormat.mockResolvedValue('')

    const result = await formatCode(inputCode, 'javascript')

    expect(mockFormat).toHaveBeenCalledWith('', {
      parser: 'babel',
      plugins: [],
    })
    expect(result).toBe('')
  })

  it('should handle whitespace-only code', async () => {
    const inputCode = '   \n  \t  '
    
    mockFormat.mockResolvedValue('')

    const result = await formatCode(inputCode, 'javascript')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'babel',
      plugins: [],
    })
    expect(result).toBe('')
  })

  it('should handle null input', async () => {
    const inputCode = null as any
    
    const result = await formatCode(inputCode, 'javascript')

    expect(mockFormat).not.toHaveBeenCalled()
    expect(result).toBe('')
  })

  it('should handle undefined input', async () => {
    const inputCode = undefined as any
    
    const result = await formatCode(inputCode, 'javascript')

    expect(mockFormat).not.toHaveBeenCalled()
    expect(result).toBe('')
  })

  it('should handle complex JavaScript code', async () => {
    const inputCode = `
      function complexFunction(a,b,c){
        if(a>b){
          return c.map(x=>x*2).filter(x=>x>10);
        }
        return null;
      }
    `
    const expectedFormatted = `function complexFunction(a, b, c) {
  if (a > b) {
    return c.map(x => x * 2).filter(x => x > 10);
  }
  return null;
}`
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'javascript')

    expect(result).toBe(expectedFormatted)
  })

  it('should handle complex TypeScript code', async () => {
    const inputCode = `
      interface User{id:number;name:string;}
      const processUser=(user:User):string=>{
        return user.name.toUpperCase();
      };
    `
    const expectedFormatted = `interface User {
  id: number;
  name: string;
}

const processUser = (user: User): string => {
  return user.name.toUpperCase();
};`
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'typescript')

    expect(result).toBe(expectedFormatted)
  })

  it('should handle complex React code', async () => {
    const inputCode = `
      const MyComponent=({title,children})=>{
        const[count,setCount]=useState(0);
        return(<div><h1>{title}</h1><button onClick={()=>setCount(count+1)}>{count}</button>{children}</div>);
      };
    `
    const expectedFormatted = `const MyComponent = ({ title, children }) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      {children}
    </div>
  );
};`
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'react')

    expect(result).toBe(expectedFormatted)
  })

  it('should handle case-insensitive language matching', async () => {
    const inputCode = 'const x=1;'
    const expectedFormatted = 'const x = 1;'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'JAVASCRIPT')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'babel',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })

  it('should handle mixed case language names', async () => {
    const inputCode = 'const x=1;'
    const expectedFormatted = 'const x = 1;'
    
    mockFormat.mockResolvedValue(expectedFormatted)

    const result = await formatCode(inputCode, 'JavaScript')

    expect(mockFormat).toHaveBeenCalledWith(inputCode, {
      parser: 'babel',
      plugins: [],
    })
    expect(result).toBe(expectedFormatted)
  })
})
