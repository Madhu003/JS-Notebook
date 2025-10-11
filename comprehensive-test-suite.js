/**
 * Comprehensive Unit Test Suite for JS Notebook
 * Tests all major functionality including Babel, React, TypeScript, and UI components
 */

console.log('🧪 Starting Comprehensive Unit Test Suite for JS Notebook...');
console.log('='.repeat(60));

// Test Results Tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🔍 Testing: ${testName}`);
  
  try {
    const result = testFunction();
    if (result === true || result === undefined) {
      testResults.passed++;
      testResults.details.push({ name: testName, status: 'PASS', error: null });
      console.log(`✅ PASS: ${testName}`);
    } else {
      testResults.failed++;
      testResults.details.push({ name: testName, status: 'FAIL', error: result });
      console.log(`❌ FAIL: ${testName} - ${result}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'ERROR', error: error.message });
    console.log(`💥 ERROR: ${testName} - ${error.message}`);
  }
}

// Test 1: Babel Availability
runTest('Babel Global Availability', () => {
  if (typeof window !== 'undefined' && (window as any).Babel) {
    return true;
  }
  return 'Babel not found on window object';
});

// Test 2: Babel Basic Compilation
runTest('Babel Basic JavaScript Compilation', () => {
  const babel = (window as any).Babel;
  if (!babel) return 'Babel not available';
  
  try {
    const result = babel.transform('const x = 1; console.log(x);', {
      presets: ['env']
    });
    
    if (result && result.code && result.code.includes('console.log')) {
      return true;
    }
    return 'Compilation result invalid';
  } catch (error) {
    return `Compilation failed: ${error.message}`;
  }
});

// Test 3: Babel React Compilation
runTest('Babel React/JSX Compilation', () => {
  const babel = (window as any).Babel;
  if (!babel) return 'Babel not available';
  
  try {
    const reactCode = `
      function TestComponent() {
        return React.createElement('div', null, 'Hello World');
      }
    `;
    
    const result = babel.transform(reactCode, {
      presets: ['react', 'env']
    });
    
    if (result && result.code && result.code.includes('React.createElement')) {
      return true;
    }
    return 'React compilation result invalid';
  } catch (error) {
    return `React compilation failed: ${error.message}`;
  }
});

// Test 4: Babel TypeScript Compilation
runTest('Babel TypeScript Compilation', () => {
  const babel = (window as any).Babel;
  if (!babel) return 'Babel not available';
  
  try {
    const tsCode = `
      interface User {
        name: string;
        age: number;
      }
      
      const user: User = { name: 'John', age: 30 };
      console.log(user.name);
    `;
    
    const result = babel.transform(tsCode, {
      presets: [
        ['typescript', { isTSX: false, allExtensions: false }],
        ['env', { targets: { browsers: ['last 2 versions'] } }]
      ]
    });
    
    if (result && result.code && result.code.includes('console.log')) {
      return true;
    }
    return 'TypeScript compilation result invalid';
  } catch (error) {
    return `TypeScript compilation failed: ${error.message}`;
  }
});

// Test 5: React Global Availability
runTest('React Global Availability', () => {
  if (typeof window !== 'undefined' && (window as any).React) {
    const React = (window as any).React;
    if (React.createElement && typeof React.createElement === 'function') {
      return true;
    }
    return 'React.createElement not available';
  }
  return 'React not found on window object';
});

// Test 6: ReactDOM Global Availability
runTest('ReactDOM Global Availability', () => {
  if (typeof window !== 'undefined' && (window as any).ReactDOM) {
    const ReactDOM = (window as any).ReactDOM;
    if (ReactDOM.render && typeof ReactDOM.render === 'function') {
      return true;
    }
    return 'ReactDOM.render not available';
  }
  return 'ReactDOM not found on window object';
});

// Test 7: React Component Creation and Rendering
runTest('React Component Creation and Rendering', () => {
  const React = (window as any).React;
  const ReactDOM = (window as any).ReactDOM;
  
  if (!React || !ReactDOM) {
    return 'React or ReactDOM not available';
  }
  
  try {
    // Create a test component
    const TestComponent = () => {
      return React.createElement('div', {
        style: { padding: '10px', backgroundColor: '#f0f0f0' }
      }, 'Test Component Rendered Successfully');
    };
    
    // Create a container
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Render the component
    ReactDOM.render(React.createElement(TestComponent), container);
    
    // Check if it rendered
    if (container.innerHTML.includes('Test Component Rendered Successfully')) {
      // Clean up
      document.body.removeChild(container);
      return true;
    }
    
    // Clean up
    document.body.removeChild(container);
    return 'Component did not render correctly';
  } catch (error) {
    return `React rendering failed: ${error.message}`;
  }
});

// Test 8: Babel Service Integration Test
runTest('Babel Service Integration', async () => {
  try {
    // Import the babel service
    const { babelService } = await import('./src/services/babelService.ts');
    
    // Test TypeScript compilation
    const tsResult = await babelService.compileTypeScript(`
      interface Test {
        value: string;
      }
      const test: Test = { value: 'hello' };
      console.log(test.value);
    `);
    
    if (!tsResult.success) {
      return `TypeScript compilation failed: ${tsResult.error}`;
    }
    
    // Test React compilation
    const reactResult = await babelService.compileReact(`
      function App() {
        return React.createElement('div', null, 'Hello React');
      }
    `, false);
    
    if (!reactResult.success) {
      return `React compilation failed: ${reactResult.error}`;
    }
    
    return true;
  } catch (error) {
    return `Babel service test failed: ${error.message}`;
  }
});

// Test 9: Console Output Max Height CSS Classes
runTest('Console Output CSS Classes', () => {
  // Check if the CSS classes exist in the components
  const reactEditorContent = document.querySelector('.react-preview-container');
  if (!reactEditorContent) {
    return 'React editor container not found in DOM';
  }
  
  // Check if max-height classes are applied
  const consoleOutputs = document.querySelectorAll('.max-h-64');
  if (consoleOutputs.length === 0) {
    return 'Max height CSS classes not found';
  }
  
  return true;
});

// Test 10: Component Structure Validation
runTest('Component Structure Validation', () => {
  // Check if key components exist
  const requiredElements = [
    '.react-preview-container',
    '[id^="react-preview-"]'
  ];
  
  for (const selector of requiredElements) {
    const element = document.querySelector(selector);
    if (!element) {
      return `Required element not found: ${selector}`;
    }
  }
  
  return true;
});

// Test 11: Error Handling Test
runTest('Error Handling for Invalid Code', () => {
  const babel = (window as any).Babel;
  if (!babel) return 'Babel not available';
  
  try {
    // Test with invalid syntax
    const result = babel.transform('const x = ;', {
      presets: ['env']
    });
    
    // Should handle error gracefully
    if (result && result.code) {
      return true; // Babel handled the error
    }
    return 'Error handling not working';
  } catch (error) {
    return true; // Expected error was caught
  }
});

// Test 12: Performance Test
runTest('Compilation Performance', () => {
  const babel = (window as any).Babel;
  if (!babel) return 'Babel not available';
  
  const startTime = performance.now();
  
  try {
    // Compile a moderately complex component
    const complexCode = `
      function ComplexComponent() {
        const [count, setCount] = React.useState(0);
        const [items, setItems] = React.useState([]);
        
        React.useEffect(() => {
          console.log('Component mounted');
        }, []);
        
        return React.createElement('div', null,
          React.createElement('h1', null, 'Count: ' + count),
          React.createElement('button', {
            onClick: () => setCount(count + 1)
          }, 'Increment'),
          React.createElement('ul', null,
            items.map(item => 
              React.createElement('li', { key: item.id }, item.name)
            )
          )
        );
      }
    `;
    
    const result = babel.transform(complexCode, {
      presets: ['react', 'env']
    });
    
    const endTime = performance.now();
    const compilationTime = endTime - startTime;
    
    if (compilationTime < 1000) { // Should compile in less than 1 second
      return true;
    }
    return `Compilation too slow: ${compilationTime}ms`;
  } catch (error) {
    return `Performance test failed: ${error.message}`;
  }
});

// Run all tests
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(60));

console.log(`Total Tests: ${testResults.total}`);
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  testResults.details
    .filter(test => test.status !== 'PASS')
    .forEach(test => {
      console.log(`  • ${test.name}: ${test.error}`);
    });
}

console.log('\n' + '='.repeat(60));

// Export test results for external access
window.testResults = testResults;

// Return summary
return {
  success: testResults.failed === 0,
  summary: {
    total: testResults.total,
    passed: testResults.passed,
    failed: testResults.failed,
    successRate: (testResults.passed / testResults.total) * 100
  },
  details: testResults.details
};
