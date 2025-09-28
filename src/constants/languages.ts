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
    boilerplate: `// React JSX Boilerplate
import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Hello, React!</h1>
      <p>Start editing to see some magic happen!</p>
    </div>
  );
}

export default App;
`,
  },
  {
    id: "react-ts",
    name: "React (TypeScript)",
    extension: "tsx",
    monacoLanguage: "typescript",
    boilerplate: `// React TypeScript Boilerplate
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Hello, React with TypeScript!</h1>
      <p>Start editing to see some magic happen!</p>
    </div>
  );
};

export default App;
`,
  },
].slice(0, 2);

export const DEFAULT_LANGUAGE = "javascript";

export const getLanguageConfig = (id: string): LanguageConfig => {
  return LANGUAGES.find((lang) => lang.id === id) || LANGUAGES[0];
};
