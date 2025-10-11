// Polyfills for older browsers
import './polyfills'

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Check Babel availability on startup
console.log('🚀 Starting JS Notebook App...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, checking dependencies...');
  
  // Check Babel
  if ((window as any).Babel) {
    console.log('✅ Babel is available');
  } else {
    console.error('❌ Babel is NOT available - React/TypeScript compilation will fail');
  }
  
  // Check React
  if ((window as any).React) {
    console.log('✅ React is available');
  } else {
    console.error('❌ React is NOT available - React components will not work');
  }
  
  // Check ReactDOM
  const ReactDOM = (window as any).ReactDOM;
  if (ReactDOM) {
    console.log('✅ ReactDOM is available');
    console.log('ReactDOM methods:', Object.keys(ReactDOM));
    console.log('ReactDOM.render available:', typeof ReactDOM.render === 'function');
  } else {
    console.error('❌ ReactDOM is NOT available - React rendering will fail');
  }
  
  // Check ReactDOMClient
  const ReactDOMClient = (window as any).ReactDOMClient;
  if (ReactDOMClient) {
    console.log('✅ ReactDOMClient is available');
    console.log('ReactDOMClient.createRoot available:', typeof ReactDOMClient.createRoot === 'function');
  } else {
    console.log('ℹ️ ReactDOMClient is not available (this is normal for older React versions)');
  }
});

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
