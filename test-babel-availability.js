// Test Babel availability and compilation
console.log('🧪 Testing Babel availability...');

// Check if Babel is available
if (typeof window !== 'undefined' && (window as any).Babel) {
  console.log('✅ Babel is available globally');
  
  // Test simple JavaScript compilation
  try {
    const result = (window as any).Babel.transform('const x = 1;', {
      presets: ['env']
    });
    console.log('✅ Babel compilation test passed:', result.code);
  } catch (error) {
    console.error('❌ Babel compilation test failed:', error);
  }
  
  // Test React compilation
  try {
    const reactCode = `
      function TestComponent() {
        return React.createElement('div', null, 'Hello React!');
      }
    `;
    const result = (window as any).Babel.transform(reactCode, {
      presets: ['react', 'env']
    });
    console.log('✅ React compilation test passed:', result.code.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ React compilation test failed:', error);
  }
  
} else {
  console.error('❌ Babel is NOT available globally');
  console.log('Available globals:', Object.keys(window).filter(key => key.toLowerCase().includes('babel')));
}

// Test React availability
if (typeof window !== 'undefined' && (window as any).React) {
  console.log('✅ React is available globally');
} else {
  console.error('❌ React is NOT available globally');
}

// Test ReactDOM availability
if (typeof window !== 'undefined' && (window as any).ReactDOM) {
  console.log('✅ ReactDOM is available globally');
} else {
  console.error('❌ ReactDOM is NOT available globally');
}
