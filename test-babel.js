/**
 * Test Babel Service functionality
 * This test will help verify that TypeScript and React compilation is working
 */

// Test TypeScript compilation
const testTypeScriptCode = `
function main(): string {
  console.log('Hello, TypeScript!');
  return 'Execution completed';
}

const result = main();
console.log(result);
`;

// Test React compilation
const testReactCode = `
function App() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <div className="app" style={{ padding: '20px' }}>
      <h1>Hello React!</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}
`;

// Test React TypeScript compilation
const testReactTSCode = `
interface Props {
  title: string;
}

function App({ title }: Props) {
  const handleClick = (): void => {
    console.log('Button clicked!');
  };

  return (
    <div className="app" style={{ padding: '20px' }}>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}
`;

async function testBabelService() {
  console.log('🧪 Starting Babel Service Tests...');
  
  try {
    // Import the babel service
    const { babelService } = await import('./src/services/babelService');
    
    // Test 1: TypeScript compilation
    console.log('\n📝 Test 1: TypeScript Compilation');
    const tsResult = await babelService.compileTypeScript(testTypeScriptCode);
    console.log('TypeScript compilation result:', {
      success: tsResult.success,
      error: tsResult.error,
      codeLength: tsResult.code.length,
      firstLine: tsResult.code.split('\n')[0]
    });
    
    // Test 2: React compilation
    console.log('\n⚛️ Test 2: React Compilation');
    const reactResult = await babelService.compileReact(testReactCode, false);
    console.log('React compilation result:', {
      success: reactResult.success,
      error: reactResult.error,
      codeLength: reactResult.code.length,
      firstLine: reactResult.code.split('\n')[0]
    });
    
    // Test 3: React TypeScript compilation
    console.log('\n⚛️📘 Test 3: React TypeScript Compilation');
    const reactTSResult = await babelService.compileReact(testReactTSCode, true);
    console.log('React TypeScript compilation result:', {
      success: reactTSResult.success,
      error: reactTSResult.error,
      codeLength: reactTSResult.code.length,
      firstLine: reactTSResult.code.split('\n')[0]
    });
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`TypeScript: ${tsResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React: ${reactResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React TS: ${reactTSResult.success ? '✅ PASS' : '❌ FAIL'}`);
    
    return {
      typescript: tsResult.success,
      react: reactResult.success,
      reactTS: reactTSResult.success
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      typescript: false,
      react: false,
      reactTS: false,
      error: error.message
    };
  }
}

// Export for use in browser console
(window as any).testBabelService = testBabelService;

console.log('🧪 Babel Service Test loaded. Run testBabelService() in console to test.');
