/**
 * Simple Test Component for React Editor
 * This component should work without any compilation errors
 */

function TestComponent() {
  const handleClick = () => {
    console.log('Test button clicked!');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <h2>Test Component</h2>
      <p>This is a simple React component for testing.</p>
      <button 
        onClick={handleClick}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click Me
      </button>
    </div>
  );
}

// Log that the component was loaded
console.log('TestComponent loaded successfully');
