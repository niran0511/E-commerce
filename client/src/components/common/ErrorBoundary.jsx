import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
          background: 'var(--bg-primary)',
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24, maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            className="btn btn-gradient"
            style={{ borderRadius: 10, padding: '12px 28px', fontWeight: 700 }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              // Route admin users back to admin panel, regular users to home
              try {
                const token = localStorage.getItem('shopsmart-token');
                if (token) {
                  // Decode JWT payload (base64) to check role
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  if (payload?.role === 'admin') {
                    window.location.href = '/admin';
                    return;
                  }
                }
              } catch (_) {}
              window.location.href = '/';
            }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
