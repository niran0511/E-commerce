import React from 'react';

const Loader = ({ fullPage = true, size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: { spinner: 30, border: 3, fontSize: '0.8rem' },
    md: { spinner: 48, border: 4, fontSize: '0.9rem' },
    lg: { spinner: 64, border: 5, fontSize: '1rem' }
  };

  const s = sizes[size] || sizes.md;

  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3">
      <div
        style={{
          width: s.spinner,
          height: s.spinner,
          border: `${s.border}px solid var(--border-color)`,
          borderTop: `${s.border}px solid var(--primary)`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && (
        <p style={{ color: 'var(--text-secondary)', fontSize: s.fontSize, fontWeight: 500, margin: 0 }}>
          {text}
        </p>
      )}
    </div>
  );

  if (!fullPage) return spinner;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.1)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999
      }}
    >
      <div
        className="bounce-in"
        style={{
          background: 'var(--surface)',
          padding: '40px 48px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)'
        }}
      >
        {spinner}
      </div>
    </div>
  );
};

export default Loader;
