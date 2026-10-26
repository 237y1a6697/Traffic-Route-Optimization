import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060913',
          color: '#f8fafc',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{ color: '#ef4444', fontSize: '1.35rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ Application Interface Notice
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              A runtime component exception occurred. The system safely intercepted it:
            </p>
            <pre style={{
              background: '#090e1a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '1rem',
              color: '#f87171',
              fontSize: '0.8rem',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-wrap',
              maxHeight: '260px'
            }}>
              {this.state.error?.message || 'Unknown error'}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
}
