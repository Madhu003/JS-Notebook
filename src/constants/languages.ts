export interface LanguageConfig {
  id: string;
  name: string;
  extension: string;
  monacoLanguage: string;
  boilerplate: string;
}

export const LANGUAGES: LanguageConfig[] = [
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
    monacoLanguage: "javascript",
    boilerplate: `// JavaScript Boilerplate
function main() {
  // Your code here
  console.log('Hello, JavaScript!');
  
  return 'Execution completed';
}

// Call main function and log the result
const result = main();
console.log(result);
`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: "ts",
    monacoLanguage: "typescript",
    boilerplate: `// TypeScript Boilerplate
function main(): string {
  // Your code here
  console.log('Hello, TypeScript!');
  
  return 'Execution completed';
}

// Call main function and log the result
const result = main();
console.log(result);
`,
  },
  {
    id: "react",
    name: "React (JavaScript)",
    extension: "jsx",
    monacoLanguage: "javascript",
    boilerplate: `// React JSX Boilerplate (React is provided for you; no imports needed)
function App() {
  console.log('🚀 React App is loading...');
  
  const handleClick = () => {
    console.log('🎉 Button was clicked!');
  };
  
  return (
    <div className="app" style={{
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{color: '#61dafb', marginTop: '0'}}>
        Hello, React! ✨
      </h1>
      <p style={{color: '#6c757d', fontSize: '16px'}}>
        Start editing to see some magic happen!
      </p>
      <button 
        style={{
          backgroundColor: '#61dafb',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          marginTop: '10px',
          transition: 'all 0.2s'
        }}
        onClick={handleClick}
      >
        Click Me! 🚀
      </button>
    </div>
  );
}

console.log('✅ App component created successfully');

export default App;
`,
  },
];

export const DEFAULT_LANGUAGE = "javascript";

export const getLanguageConfig = (id: string): LanguageConfig => {
  return LANGUAGES.find((lang) => lang.id === id) || LANGUAGES[0];
};
