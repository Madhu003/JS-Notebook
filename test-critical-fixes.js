/**
 * Quick Test to Verify Critical Fixes
 * Run this in browser console after refreshing the page
 */

console.log('🔧 Testing Critical Fixes...');
console.log('='.repeat(40));

// Test 1: React Global Availability
console.log('\n1️⃣ Testing React Global Availability:');
if (window.React) {
  console.log('✅ React is available globally');
  console.log('React.createElement:', typeof window.React.createElement);
  console.log('React.isValidElement:', typeof window.React.isValidElement);
} else {
  console.log('❌ React is NOT available globally');
}

// Test 2: ReactDOM Global Availability
console.log('\n2️⃣ Testing ReactDOM Global Availability:');
if (window.ReactDOM) {
  console.log('✅ ReactDOM is available globally');
  console.log('ReactDOM.render:', typeof window.ReactDOM.render);
  console.log('ReactDOM methods:', Object.keys(window.ReactDOM));
} else {
  console.log('❌ ReactDOM is NOT available globally');
}

// Test 3: Babel Global Availability
console.log('\n3️⃣ Testing Babel Global Availability:');
if (window.Babel) {
  console.log('✅ Babel is available globally');
} else {
  console.log('❌ Babel is NOT available globally');
}

// Test 4: React Component Creation Test
console.log('\n4️⃣ Testing React Component Creation:');
if (window.React && window.ReactDOM) {
  try {
    // Create a simple test component
    const TestComponent = () => {
      return window.React.createElement('div', {
        style: {
          padding: '20px',
          backgroundColor: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          margin: '10px 0',
          fontFamily: 'system-ui, sans-serif'
        }
      },
        window.React.createElement('h3', { 
          style: { margin: '0 0 10px 0', color: '#2e7d32' } 
        }, '✅ React Component Test'),
        window.React.createElement('p', { 
          style: { margin: 0, color: '#388e3c' } 
        }, 'React component creation and rendering works!'),
        window.React.createElement('button', {
          style: {
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          },
          onClick: () => {
            console.log('🎉 Button clicked! React event handling works!');
            alert('React event handling works perfectly!');
          }
        }, 'Test Event Handling')
      );
    };
    
    // Create container
    const container = document.createElement('div');
    container.id = 'react-test-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    
    // Render component
    window.ReactDOM.render(window.React.createElement(TestComponent), container);
    
    console.log('✅ React component created and rendered successfully!');
    console.log('Check the green box in the top-right corner.');
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (document.getElementById('react-test-container')) {
        document.body.removeChild(container);
        console.log('🧹 Test component cleaned up');
      }
    }, 15000);
    
  } catch (error) {
    console.log('❌ React component creation failed:', error.message);
  }
} else {
  console.log('❌ Cannot test React component creation - React or ReactDOM not available');
}

// Test 5: Babel Compilation Test
console.log('\n5️⃣ Testing Babel Compilation:');
if (window.Babel) {
  try {
    const reactCode = `
      function TestBabelComponent() {
        return React.createElement('div', null, 'Babel compilation works!');
      }
    `;
    
    const result = window.Babel.transform(reactCode, {
      presets: ['react', 'env']
    });
    
    if (result && result.code) {
      console.log('✅ Babel compilation successful');
      console.log('Compiled code preview:', result.code.substring(0, 100) + '...');
    } else {
      console.log('❌ Babel compilation failed');
    }
  } catch (error) {
    console.log('❌ Babel compilation error:', error.message);
  }
} else {
  console.log('❌ Cannot test Babel compilation - Babel not available');
}

console.log('\n' + '='.repeat(40));
console.log('🎯 Test Summary:');
console.log('• React Global: ' + (window.React ? '✅ Available' : '❌ Missing'));
console.log('• ReactDOM Global: ' + (window.ReactDOM ? '✅ Available' : '❌ Missing'));
console.log('• Babel Global: ' + (window.Babel ? '✅ Available' : '❌ Missing'));

if (window.React && window.ReactDOM && window.Babel) {
  console.log('\n🚀 ALL CRITICAL FIXES WORKING!');
  console.log('The React Live Preview should now work perfectly.');
  console.log('Try creating a React cell and running some JSX code.');
} else {
  console.log('\n⚠️ Some issues still remain. Check the errors above.');
}

// Export for external access
window.criticalFixTestResults = {
  react: !!window.React,
  reactdom: !!window.ReactDOM,
  babel: !!window.Babel,
  allWorking: !!(window.React && window.ReactDOM && window.Babel)
};
