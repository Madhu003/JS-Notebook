/**
 * Complete Test Suite for React and TypeScript Execution
 * Run this in the browser console to test the complete functionality
 */

async function runCompleteTestSuite() {
  console.log('🧪 Complete Test Suite for React and TypeScript Execution');
  console.log('=' .repeat(70));
  
  const results = {
    babelLoaded: false,
    reactCompilation: false,
    typescriptCompilation: false,
    reactExecution: false,
    typescriptExecution: false,
    errors: []
  };
  
  try {
    // Step 1: Load Babel
    console.log('\n📋 Step 1: Loading Babel');
    if (!(window as any).Babel) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@babel/standalone@7.25.2/babel.min.js';
      
      await new Promise((resolve, reject) => {
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Babel'));
        document.head.appendChild(script);
      });
    }
    
    results.babelLoaded = !!(window as any).Babel;
    console.log(`Babel loaded: ${results.babelLoaded ? '✅' : '❌'}`);
    
    if (!results.babelLoaded) {
      throw new Error('Babel failed to load');
    }
    
    const babel = (window as any).Babel;
    
    // Step 2: Test React Compilation
    console.log('\n📋 Step 2: Testing React Compilation');
    const reactCode = `
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
`;
    
    try {
      const reactCompiled = babel.transform(reactCode, {
        presets: [
          ['react', { runtime: 'classic' }],
          ['env']
        ]
      });
      
      results.reactCompilation = true;
      console.log('✅ React compilation: SUCCESS');
      console.log('Compiled code preview:', reactCompiled.code.substring(0, 300) + '...');
      
      // Step 3: Test React Execution
      console.log('\n📋 Step 3: Testing React Execution');
      try {
        const mockConsole = {
          log: (...args) => console.log('📝 REACT CONSOLE:', ...args)
        };
        
        const fn = new Function('console', 'React', reactCompiled.code);
        fn(mockConsole, React);
        
        results.reactExecution = true;
        console.log('✅ React execution: SUCCESS');
      } catch (execError) {
        console.log('❌ React execution: FAILED');
        console.log('Execution error:', execError.message);
        results.errors.push(`React execution: ${execError.message}`);
      }
      
    } catch (compError) {
      console.log('❌ React compilation: FAILED');
      console.log('Compilation error:', compError.message);
      results.errors.push(`React compilation: ${compError.message}`);
    }
    
    // Step 4: Test TypeScript Compilation
    console.log('\n📋 Step 4: Testing TypeScript Compilation');
    const tsCode = `
function main(): string {
  console.log('Hello, TypeScript!');
  return 'Success';
}

const result: string = main();
console.log(result);
`;
    
    try {
      const tsCompiled = babel.transform(tsCode, {
        presets: [
          ['typescript', { isTSX: false }],
          ['env']
        ]
      });
      
      results.typescriptCompilation = true;
      console.log('✅ TypeScript compilation: SUCCESS');
      console.log('Compiled code preview:', tsCompiled.code.substring(0, 300) + '...');
      
      // Step 5: Test TypeScript Execution
      console.log('\n📋 Step 5: Testing TypeScript Execution');
      try {
        const mockConsole = {
          log: (...args) => console.log('📝 TS CONSOLE:', ...args)
        };
        
        const fn = new Function('console', tsCompiled.code);
        fn(mockConsole);
        
        results.typescriptExecution = true;
        console.log('✅ TypeScript execution: SUCCESS');
      } catch (execError) {
        console.log('❌ TypeScript execution: FAILED');
        console.log('Execution error:', execError.message);
        results.errors.push(`TypeScript execution: ${execError.message}`);
      }
      
    } catch (compError) {
      console.log('❌ TypeScript compilation: FAILED');
      console.log('Compilation error:', compError.message);
      results.errors.push(`TypeScript compilation: ${compError.message}`);
    }
    
    // Step 6: Test React.createElement directly
    console.log('\n📋 Step 6: Testing React.createElement');
    try {
      const element = React.createElement('div', { style: { padding: '20px' } }, 'Test Element');
      console.log('✅ React.createElement: SUCCESS');
      console.log('Created element:', element);
    } catch (error) {
      console.log('❌ React.createElement: FAILED');
      console.log('Error:', error.message);
      results.errors.push(`React.createElement: ${error.message}`);
    }
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📊 COMPLETE TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log(`Babel Loaded: ${results.babelLoaded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React Compilation: ${results.reactCompilation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`React Execution: ${results.reactExecution ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`TypeScript Compilation: ${results.typescriptCompilation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`TypeScript Execution: ${results.typescriptExecution ? '✅ PASS' : '❌ FAIL'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const allPassed = results.babelLoaded && results.reactCompilation && 
                     results.reactExecution && results.typescriptCompilation && 
                     results.typescriptExecution;
    
    console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🎉 SUCCESS! React and TypeScript execution should work in the notebook.');
    } else {
      console.log('\n⚠️ ISSUES FOUND! Check the errors above for details.');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Complete test suite failed:', error);
    results.errors.push(`Test suite: ${error.message}`);
    return results;
  }
}

// Export for browser console
(window as any).runCompleteTestSuite = runCompleteTestSuite;

console.log('🧪 Complete Test Suite loaded.');
console.log('Run runCompleteTestSuite() in the console to test everything.');
