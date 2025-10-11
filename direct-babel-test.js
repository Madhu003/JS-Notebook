/**
 * Simple Babel Test - Direct Babel Usage
 * This tests Babel compilation without the service wrapper
 */

async function testDirectBabel() {
  console.log('🧪 Testing Direct Babel Usage...');
  
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
    
    console.log('✅ Babel loaded successfully');
    
    // Test 1: Simple JavaScript
    console.log('\n📋 Test 1: Simple JavaScript');
    const jsCode = `
function test() {
  console.log('Hello from JavaScript!');
  return 'success';
}

const result = test();
console.log(result);
`;
    
    try {
      const jsResult = babel.transform(jsCode, {
        presets: ['env']
      });
      console.log('✅ JavaScript compilation: SUCCESS');
      console.log('Compiled code:', jsResult.code.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ JavaScript compilation: FAILED');
      console.log('Error:', error.message);
    }
    
    // Test 2: TypeScript
    console.log('\n📋 Test 2: TypeScript');
    const tsCode = `
function test(): string {
  console.log('Hello from TypeScript!');
  return 'success';
}

const result: string = test();
console.log(result);
`;
    
    try {
      const tsResult = babel.transform(tsCode, {
        presets: [
          ['typescript', { isTSX: false }],
          ['env']
        ]
      });
      console.log('✅ TypeScript compilation: SUCCESS');
      console.log('Compiled code:', tsResult.code.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ TypeScript compilation: FAILED');
      console.log('Error:', error.message);
    }
    
    // Test 3: React JSX
    console.log('\n📋 Test 3: React JSX');
    const reactCode = `
function App() {
  return (
    <div>
      <h1>Hello React!</h1>
      <button onClick={() => console.log('clicked')}>Click</button>
    </div>
  );
}
`;
    
    try {
      const reactResult = babel.transform(reactCode, {
        presets: [
          ['react', { runtime: 'classic' }],
          ['env']
        ]
      });
      console.log('✅ React compilation: SUCCESS');
      console.log('Compiled code:', reactResult.code.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ React compilation: FAILED');
      console.log('Error:', error.message);
    }
    
    // Test 4: React TypeScript
    console.log('\n📋 Test 4: React TypeScript');
    const reactTSCode = `
interface Props {
  title: string;
}

function App({ title }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => console.log('clicked')}>Click</button>
    </div>
  );
}
`;
    
    try {
      const reactTSResult = babel.transform(reactTSCode, {
        presets: [
          ['typescript', { isTSX: true }],
          ['react', { runtime: 'classic' }],
          ['env']
        ]
      });
      console.log('✅ React TypeScript compilation: SUCCESS');
      console.log('Compiled code:', reactTSResult.code.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ React TypeScript compilation: FAILED');
      console.log('Error:', error.message);
    }
    
    // Test 5: Problematic code from image
    console.log('\n📋 Test 5: Problematic React Code (from image)');
    const problematicCode = `
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
      const problematicResult = babel.transform(problematicCode, {
        presets: [
          ['react', { runtime: 'classic' }],
          ['env']
        ]
      });
      console.log('✅ Problematic React compilation: SUCCESS');
      console.log('Compiled code:', problematicResult.code.substring(0, 200) + '...');
      
      // Try to execute the compiled code
      console.log('\n🎯 Testing execution...');
      try {
        const fn = new Function('console', 'React', problematicResult.code);
        const mockConsole = {
          log: (...args) => console.log('EXECUTED:', ...args)
        };
        fn(mockConsole, React);
        console.log('✅ Code execution: SUCCESS');
      } catch (execError) {
        console.log('❌ Code execution: FAILED');
        console.log('Execution error:', execError.message);
      }
      
    } catch (error) {
      console.log('❌ Problematic React compilation: FAILED');
      console.log('Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Direct Babel test failed:', error);
  }
}

// Export for browser console
(window as any).testDirectBabel = testDirectBabel;

console.log('🧪 Direct Babel Test loaded.');
console.log('Run testDirectBabel() in the console to test Babel directly.');
