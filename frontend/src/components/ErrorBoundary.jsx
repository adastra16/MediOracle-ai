import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          padding: '20px',
        }}>
          <h1 style={{ color: '#ff79c6', marginBottom: '20px' }}>⚠️ Error Loading 3D Scene</h1>
          <p style={{ marginBottom: '20px' }}>There was an error rendering the 3D interface.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#ff79c6',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Reload Page
          </button>
          <details style={{ marginTop: '20px', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Error Details</summary>
            <pre style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

