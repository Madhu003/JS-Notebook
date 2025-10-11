/**
 * Comprehensive Test Suite for TypeScript and React Execution
 * Run this in the browser console to test the functionality
 */

async function runComprehensiveTests() {
  console.log('🧪 Starting Comprehensive TypeScript and React Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    babelLoaded: false,
    typescriptCompilation: false,
    reactCompilation: false,
    reactTSCompilation: false,
    errors: []
  };
  
  try {
    // Test 1: Check if Babel is loaded
    console.log('\n📋 Test 1: Babel Loading Status');
    const { babelService } = await import('./src/services/babelService');
    results.babelLoaded = babelService.isBabelLoaded();
    console.log(`Babel loaded: ${results.babelLoaded ? '✅' : '❌'}`);
    
    if (!results.babelLoaded) {
      console.log('🔄 Loading Babel...');
      await babelService.loadBabel();
      results.babelLoaded = babelService.isBabelLoaded();
      console.log(`Babel loaded after attempt: ${results.babelLoaded ? '✅' : '❌'}`);
    }
    
    // Test 2: TypeScript Compilation
    console.log('\n📋 Test 2: TypeScript Compilation');
    const tsCode = `
function main(): string {
  console.log('Hello, TypeScript!');
  return 'Success';
}

const result = main();
console.log(result);
`;
    
    try {
      const tsResult = await babelService.compileTypeScript(tsCode);
      results.typescriptCompilation = tsResult.success;
      console.log(`TypeScript compilation: ${tsResult.success ? '✅' : '❌'}`);
      if (!tsResult.success) {
        console.log(`Error: ${tsResult.error}`);
        results.errors.push(`TypeScript: ${tsResult.error}`);
      } else {
        console.log('Compiled code preview:', tsResult.code.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log(`TypeScript compilation: ❌ (${error.message})`);
      results.errors.push(`TypeScript: ${error.message}`);
    }
    
    // Test 3: React Compilation
    console.log('\n📋 Test 3: React Compilation');
    const reactCode = `
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
`;
    
    try {
      const reactResult = await babelService.compileReact(reactCode, false);
      results.reactCompilation = reactResult.success;
      console.log(`React compilation: ${reactResult.success ? '✅' : '❌'}`);
      if (!reactResult.success) {
        console.log(`Error: ${reactResult.error}`);
        results.errors.push(`React: ${reactResult.error}`);
      } else {
        console.log('Compiled code preview:', reactResult.code.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log(`React compilation: ❌ (${error.message})`);
      results.errors.push(`React: ${error.message}`);
    }
    
    // Test 4: React TypeScript Compilation
    console.log('\n📋 Test 4: React TypeScript Compilation');
    const reactTSCode = `
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
`;
    
    try {
      const reactTSResult = await babelService.compileReact(reactTSCode, true);
      results.reactTSCompilation = reactTSResult.success;
      console.log(`React TypeScript compilation: ${reactTSResult.success ? '✅' : '❌'}`);
      if (!reactTSResult.success) {
        console.log(`Error: ${reactTSResult.error}`);
        results.errors.push(`React TS: ${reactTSResult.error}`);
      } else {
        console.log('Compiled code preview:', reactTSResult.code.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log(`React TypeScript compilation: ❌ (${error.message})`);
      results.errors.push(`React TS: ${error.message}`);
    }
    
    // Test Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Babel Loaded: ${results.babelLoaded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`TypeScript: ${results.typescriptCompilation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React: ${results.reactCompilation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React TypeScript: ${results.reactTSCompilation ? '✅ PASS' : '❌ FAIL'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const allPassed = results.babelLoaded && results.typescriptCompilation && 
                     results.reactCompilation && results.reactTSCompilation;
    
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    results.errors.push(`Test suite: ${error.message}`);
    return results;
  }
}

// Export for browser console
(window as any).runComprehensiveTests = runComprehensiveTests;

console.log('🧪 Comprehensive Test Suite loaded.');
console.log('Run runComprehensiveTests() in the console to test TypeScript and React functionality.');
