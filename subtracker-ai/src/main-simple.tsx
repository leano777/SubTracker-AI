import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'

function SimpleApp() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      color: 'black', 
      minHeight: '100vh',
      fontSize: '16px'
    }}>
      <h1 style={{ color: 'blue' }}>SubTracker AI - Test</h1>
      <p>If you can see this, React is working!</p>
      <button 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
        onClick={() => alert('Button works!')}
      >
        Test Button
      </button>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SimpleApp />
  </StrictMode>
)