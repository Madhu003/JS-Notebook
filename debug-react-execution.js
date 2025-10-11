/**
 * Debug Test for React Execution
 * This will help us understand what's happening with the React code execution
 */

async function debugReactExecution() {
  console.log('🔍 Debugging React Execution...');
  
  try {
    // Load Babel if not already loaded
    if (!(window as any).Babel) {
      console.log('Loading Babel...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@babel/standalone@7.25.2/babel.min.js';
      
      await new Promise((resolve, reject) => {
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Babel'));
        document.head.appendChild(script);
      });
    }
    
    const babel = (window as any).Babel;
    if (!babel) {
      throw new Error('Babel not available');
    }
    
    // Test the exact code from the image
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
    
    console.log('📝 Original React Code:');
    console.log(reactCode);
    
    // Step 1: Compile with Babel
    console.log('\n🔧 Step 1: Compiling with Babel...');
    const compiledResult = babel.transform(reactCode, {
      presets: [
        ['react', { runtime: 'classic' }],
        ['env']
      ]
    });
    
    console.log('✅ Compilation successful');
    console.log('📄 Compiled code:');
    console.log(compiledResult.code);
    
    // Step 2: Try to execute the compiled code
    console.log('\n🎯 Step 2: Testing execution...');
    
    // Create a mock console
    const mockConsole = {
      log: (...args) => {
        console.log('📝 CONSOLE OUTPUT:', ...args);
      }
    };
    
    try {
      // Method 1: Direct execution
      console.log('Method 1: Direct execution');
      const fn1 = new Function('console', 'React', compiledResult.code);
      fn1(mockConsole, React);
      console.log('✅ Direct execution successful');
    } catch (error) {
      console.log('❌ Direct execution failed:', error.message);
    }
    
    try {
      // Method 2: With eval (for debugging)
      console.log('Method 2: Eval execution');
      const evalCode = `
        (function(console, React) {
          ${compiledResult.code}
        })(console, React);
      `;
      eval(evalCode);
      console.log('✅ Eval execution successful');
    } catch (error) {
      console.log('❌ Eval execution failed:', error.message);
    }
    
    // Step 3: Test with a simpler React component
    console.log('\n🧪 Step 3: Testing with simpler component...');
    const simpleReactCode = `
function SimpleApp() {
  console.log('Simple app loaded');
  return React.createElement('div', null, 'Hello World');
}
`;
    
    const simpleCompiled = babel.transform(simpleReactCode, {
      presets: [
        ['react', { runtime: 'classic' }],
        ['env']
      ]
    });
    
    console.log('Simple compiled code:', simpleCompiled.code);
    
    try {
      const simpleFn = new Function('console', 'React', simpleCompiled.code);
      simpleFn(mockConsole, React);
      console.log('✅ Simple component execution successful');
    } catch (error) {
      console.log('❌ Simple component execution failed:', error.message);
    }
    
    // Step 4: Test React.createElement directly
    console.log('\n🎨 Step 4: Testing React.createElement...');
    try {
      const element = React.createElement('div', { style: { padding: '20px' } }, 'Test Element');
      console.log('✅ React.createElement successful:', element);
    } catch (error) {
      console.log('❌ React.createElement failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Export for browser console
(window as any).debugReactExecution = debugReactExecution;

console.log('🔍 React Execution Debug Test loaded.');
console.log('Run debugReactExecution() in the console to debug React execution.');
