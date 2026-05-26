import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'monospace' }}>
          <div>
            <p style={{ color: '#C8F135', marginBottom: '1rem', fontSize: '12px', letterSpacing: '0.2em' }}>RUNTIME ERROR</p>
            <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '0.5rem' }}>{this.state.error?.message}</p>
            <p style={{ color: '#666', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
