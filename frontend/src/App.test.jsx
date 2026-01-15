// Simple test component to verify React is working
import React from 'react';

export function TestApp() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)',
      color: '#ff79c6',
      fontFamily: 'system-ui',
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🔬 MediOracle AI</h1>
      <p style={{ fontSize: '18px', color: '#ffffff', marginBottom: '40px' }}>
        If you see this, React is working!
      </p>
      <div style={{
        padding: '20px',
        background: 'rgba(255, 121, 198, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 121, 198, 0.3)',
      }}>
        <p style={{ color: '#ffffff' }}>3D Scene is loading...</p>
        <p style={{ color: '#6b5b7a', fontSize: '14px', marginTop: '10px' }}>
          Check browser console (F12) for any errors
        </p>
      </div>
    </div>
  );
}

