/**
 * Unit Test Suite for Babel Service
 * This will test the Babel compilation functionality in isolation
 */

// Mock Babel service for testing
class MockBabelService {
  private babelLoaded = false;
  private loadingPromise: Promise<boolean> | null = null;

  async loadBabel(): Promise<boolean> {
    if (this.babelLoaded) {
      return true;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise(async (resolve, reject) => {
      try {
        // Check if Babel is already available globally
        if ((window as any).Babel) {
          this.babelLoaded = true;
          resolve(true);
          return;
        }

        console.log('🚀 Loading Babel from CDN...');
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@babel/standalone@7.25.2/babel.min.js';
        
        script.onload = () => {
          console.log('✅ Babel loaded successfully');
          this.babelLoaded = true;
          resolve(true);
        };

        script.onerror = (error) => {
          console.error('❌ Failed to load Babel:', error);
          this.babelLoaded = false;
          reject(new Error('Failed to load Babel from CDN'));
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Error loading Babel:', error);
        this.babelLoaded = false;
        reject(error);
      }
    });

    return this.loadingPromise;
  }

  isBabelLoaded(): boolean {
    return this.babelLoaded || !!(window as any).Babel;
  }

  async compileTypeScript(code: string): Promise<{code: string, success: boolean, error?: string}> {
    try {
      await this.loadBabel();

      const babel = (window as any).Babel;
      if (!babel) {
        throw new Error('Babel is not loaded');
      }

      console.log('🔧 Compiling TypeScript...');
      
      const result = babel.transform(code, { 
        presets: [
          ['typescript', { isTSX: false, allExtensions: false }],
          ['env', { targets: { browsers: ['last 2 versions'] } }]
        ],
        filename: 'script.ts'
      });

      return {
        code: result.code || '',
        success: true
      };
    } catch (error) {
      console.error('❌ TypeScript compilation failed:', error);
      return {
        code: code,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async compileReact(code: string, typeScript = false): Promise<{code: string, success: boolean, error?: string}> {
    try {
      await this.loadBabel();

      const babel = (window as any).Babel;
      if (!babel) {
        throw new Error('Babel is not loaded');
      }

      console.log(`🔧 Compiling React (${typeScript ? 'TypeScript' : 'JavaScript'})...`);
      
      // Prepare code by handling exports
      const modifiedCode = code
        .replace(/export default /g, 'const exportedComponent = ')
        .replace(/export /g, 'const ');
      
      // Configure presets
      const presets: any[] = [];
      if (typeScript) {
        presets.push(['typescript', { isTSX: true, allExtensions: false }]);
      }
      presets.push(['react', { runtime: 'classic' }]);
      presets.push(['env', { targets: { browsers: ['last 2 versions'] } }]);
      
      const result = babel.transform(modifiedCode, { 
        presets,
        filename: typeScript ? 'component.tsx' : 'component.jsx'
      });

      return {
        code: result.code || '',
        success: true
      };
    } catch (error) {
      console.error('❌ React compilation failed:', error);
      return {
        code: code,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Test cases
const testCases = {
  typescript: `
function main(): string {
  console.log('Hello, TypeScript!');
  return 'Success';
}

const result = main();
console.log(result);
`,

  react: `
function App() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Hello React!</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}
`,

  reactTS: `
interface Props {
  title: string;
}

function App({ title }: Props) {
  const handleClick = (): void => {
    console.log('Button clicked!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}
`,

  // Test case from the image - this is the problematic code
  problematicReact: `
// React JSX Boilerplate (React is provided for you; no imports needed)
function App() {
  console.log('🚀 React App is loading...');

  const handleClick = () => {
    console.log('💥 Button was clicked!');
  };

  return (
    <div className="app" style={{ padding: '20px' }}>
      <h1>Hello React!</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}
`
};

// Test runner
async function runUnitTests() {
  console.log('🧪 Starting Unit Tests for Babel Service...');
  console.log('=' .repeat(60));
  
  const mockService = new MockBabelService();
  const results = {
    babelLoaded: false,
    tests: {
      typescript: { passed: false, error: null },
      react: { passed: false, error: null },
      reactTS: { passed: false, error: null },
      problematicReact: { passed: false, error: null }
    }
  };
  
  try {
    // Test 1: Load Babel
    console.log('\n📋 Test 1: Loading Babel');
    results.babelLoaded = await mockService.loadBabel();
    console.log(`Babel loaded: ${results.babelLoaded ? '✅' : '❌'}`);
    
    if (!results.babelLoaded) {
      console.log('❌ Cannot proceed without Babel');
      return results;
    }
    
    // Test 2: TypeScript Compilation
    console.log('\n📋 Test 2: TypeScript Compilation');
    try {
      const tsResult = await mockService.compileTypeScript(testCases.typescript);
      results.tests.typescript.passed = tsResult.success;
      results.tests.typescript.error = tsResult.error || null;
      
      console.log(`TypeScript compilation: ${tsResult.success ? '✅' : '❌'}`);
      if (!tsResult.success) {
        console.log(`Error: ${tsResult.error}`);
      } else {
        console.log('Compiled successfully');
        console.log('First 200 chars:', tsResult.code.substring(0, 200));
      }
    } catch (error) {
      console.log(`TypeScript compilation: ❌ (${error.message})`);
      results.tests.typescript.error = error.message;
    }
    
    // Test 3: React Compilation
    console.log('\n📋 Test 3: React Compilation');
    try {
      const reactResult = await mockService.compileReact(testCases.react, false);
      results.tests.react.passed = reactResult.success;
      results.tests.react.error = reactResult.error || null;
      
      console.log(`React compilation: ${reactResult.success ? '✅' : '❌'}`);
      if (!reactResult.success) {
        console.log(`Error: ${reactResult.error}`);
      } else {
        console.log('Compiled successfully');
        console.log('First 200 chars:', reactResult.code.substring(0, 200));
      }
    } catch (error) {
      console.log(`React compilation: ❌ (${error.message})`);
      results.tests.react.error = error.message;
    }
    
    // Test 4: React TypeScript Compilation
    console.log('\n📋 Test 4: React TypeScript Compilation');
    try {
      const reactTSResult = await mockService.compileReact(testCases.reactTS, true);
      results.tests.reactTS.passed = reactTSResult.success;
      results.tests.reactTS.error = reactTSResult.error || null;
      
      console.log(`React TypeScript compilation: ${reactTSResult.success ? '✅' : '❌'}`);
      if (!reactTSResult.success) {
        console.log(`Error: ${reactTSResult.error}`);
      } else {
        console.log('Compiled successfully');
        console.log('First 200 chars:', reactTSResult.code.substring(0, 200));
      }
    } catch (error) {
      console.log(`React TypeScript compilation: ❌ (${error.message})`);
      results.tests.reactTS.error = error.message;
    }
    
    // Test 5: Problematic React Code (from the image)
    console.log('\n📋 Test 5: Problematic React Code (from image)');
    try {
      const problematicResult = await mockService.compileReact(testCases.problematicReact, false);
      results.tests.problematicReact.passed = problematicResult.success;
      results.tests.problematicReact.error = problematicResult.error || null;
      
      console.log(`Problematic React compilation: ${problematicResult.success ? '✅' : '❌'}`);
      if (!problematicResult.success) {
        console.log(`Error: ${problematicResult.error}`);
      } else {
        console.log('Compiled successfully');
        console.log('First 200 chars:', problematicResult.code.substring(0, 200));
      }
    } catch (error) {
      console.log(`Problematic React compilation: ❌ (${error.message})`);
      results.tests.problematicReact.error = error.message;
    }
    
    // Test Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 UNIT TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Babel Loaded: ${results.babelLoaded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`TypeScript: ${results.tests.typescript.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React: ${results.tests.react.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React TypeScript: ${results.tests.reactTS.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Problematic React: ${results.tests.problematicReact.passed ? '✅ PASS' : '❌ FAIL'}`);
    
    // Show errors
    Object.entries(results.tests).forEach(([testName, result]) => {
      if (!result.passed && result.error) {
        console.log(`\n❌ ${testName} Error: ${result.error}`);
      }
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Unit test suite failed:', error);
    return results;
  }
}

// Export for browser console
(window as any).runUnitTests = runUnitTests;
(window as any).testCases = testCases;

console.log('🧪 Unit Test Suite loaded.');
console.log('Run runUnitTests() in the console to test Babel compilation.');
console.log('Test cases available in testCases object.');
