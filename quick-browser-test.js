/**
 * Quick Browser Console Test for JS Notebook
 * Run this in the browser console to test all functionality
 */

console.log('🧪 Quick JS Notebook Test Suite');
console.log('='.repeat(50));

// Test 1: Check Babel
console.log('\n1️⃣ Testing Babel...');
if (window.Babel) {
  console.log('✅ Babel is available');
  
  // Test basic compilation
  try {
    const result = window.Babel.transform('const x = 1; console.log(x);', {
      presets: ['env']
    });
    console.log('✅ Basic JavaScript compilation works');
  } catch (error) {
    console.log('❌ Basic JavaScript compilation failed:', error.message);
  }
  
  // Test React compilation
  try {
    const reactCode = `
      function TestComponent() {
        return React.createElement('div', null, 'Hello React');
      }
    `;
    const result = window.Babel.transform(reactCode, {
      presets: ['react', 'env']
    });
    console.log('✅ React compilation works');
  } catch (error) {
    console.log('❌ React compilation failed:', error.message);
  }
  
  // Test TypeScript compilation
  try {
    const tsCode = `
      interface User { name: string; }
      const user: User = { name: 'John' };
      console.log(user.name);
    `;
    const result = window.Babel.transform(tsCode, {
      presets: [
        ['typescript', { isTSX: false, allExtensions: false }],
        ['env', { targets: { browsers: ['last 2 versions'] } }]
      ]
    });
    console.log('✅ TypeScript compilation works');
  } catch (error) {
    console.log('❌ TypeScript compilation failed:', error.message);
  }
} else {
  console.log('❌ Babel is NOT available');
}

// Test 2: Check React
console.log('\n2️⃣ Testing React...');
if (window.React) {
  console.log('✅ React is available');
  console.log('React.createElement:', typeof window.React.createElement);
} else {
  console.log('❌ React is NOT available');
}

// Test 3: Check ReactDOM
console.log('\n3️⃣ Testing ReactDOM...');
if (window.ReactDOM) {
  console.log('✅ ReactDOM is available');
  console.log('ReactDOM.render:', typeof window.ReactDOM.render);
  console.log('ReactDOM methods:', Object.keys(window.ReactDOM));
} else {
  console.log('❌ ReactDOM is NOT available');
}

// Test 4: Test React Component Rendering
console.log('\n4️⃣ Testing React Component Rendering...');
if (window.React && window.ReactDOM) {
  try {
    // Create a test component
    const TestComponent = () => {
      return window.React.createElement('div', {
        style: { 
          padding: '20px', 
          backgroundColor: '#e3f2fd', 
          border: '2px solid #2196f3',
          borderRadius: '8px',
          margin: '10px 0'
        }
      }, 
        window.React.createElement('h3', { style: { margin: '0 0 10px 0', color: '#1976d2' } }, 'Test Component'),
        window.React.createElement('p', { style: { margin: 0 } }, 'This component was rendered successfully!'),
        window.React.createElement('button', {
          style: {
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          },
          onClick: () => alert('Button clicked! Test successful!')
        }, 'Click Me!')
      );
    };
    
    // Create container
    const container = document.createElement('div');
    container.id = 'test-component-container';
    document.body.appendChild(container);
    
    // Render component
    window.ReactDOM.render(window.React.createElement(TestComponent), container);
    
    console.log('✅ React component rendered successfully!');
    console.log('Check the blue box below for the rendered component.');
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.getElementById('test-component-container')) {
        document.body.removeChild(container);
        console.log('🧹 Test component cleaned up');
      }
    }, 10000);
    
  } catch (error) {
    console.log('❌ React component rendering failed:', error.message);
  }
} else {
  console.log('❌ Cannot test React rendering - React or ReactDOM not available');
}

// Test 5: Check Console Output Elements
console.log('\n5️⃣ Testing Console Output Elements...');
const consoleOutputs = document.querySelectorAll('.max-h-64');
if (consoleOutputs.length > 0) {
  console.log(`✅ Found ${consoleOutputs.length} console output elements with max-height`);
} else {
  console.log('❌ No console output elements with max-height found');
}

// Test 6: Check React Preview Containers
console.log('\n6️⃣ Testing React Preview Containers...');
const previewContainers = document.querySelectorAll('[id^="react-preview-"]');
if (previewContainers.length > 0) {
  console.log(`✅ Found ${previewContainers.length} React preview containers`);
} else {
  console.log('❌ No React preview containers found');
}

console.log('\n' + '='.repeat(50));
console.log('🎯 Test Summary:');
console.log('• Babel: ' + (window.Babel ? '✅ Available' : '❌ Missing'));
console.log('• React: ' + (window.React ? '✅ Available' : '❌ Missing'));
console.log('• ReactDOM: ' + (window.ReactDOM ? '✅ Available' : '❌ Missing'));
console.log('• Console Max Height: ' + (consoleOutputs.length > 0 ? '✅ Applied' : '❌ Not Applied'));
console.log('• Preview Containers: ' + (previewContainers.length > 0 ? '✅ Found' : '❌ Not Found'));

console.log('\n🚀 All core functionality should now be working!');
console.log('Try creating a React cell and running some JSX code.');
