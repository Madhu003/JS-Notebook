// Test React component for live preview
function TestComponent() {
  const [count, setCount] = React.useState(0);
  
  return React.createElement('div', {
    style: {
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      fontFamily: 'system-ui, sans-serif',
      color: '#212529'
    }
  }, 
    React.createElement('h2', { 
      style: { 
        color: '#61dafb', 
        marginTop: 0,
        marginBottom: '16px'
      } 
    }, 'React Live Preview Test'),
    
    React.createElement('p', { 
      style: { marginBottom: '16px' } 
    }, `Count: ${count}`),
    
    React.createElement('button', {
      style: {
        backgroundColor: '#61dafb',
        border: 'none',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '8px'
      },
      onClick: () => setCount(count + 1)
    }, 'Increment'),
    
    React.createElement('button', {
      style: {
        backgroundColor: '#6c757d',
        border: 'none',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer'
      },
      onClick: () => setCount(0)
    }, 'Reset')
  );
}

// Export the component
window.TestComponent = TestComponent;
