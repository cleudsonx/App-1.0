import React, { useEffect } from 'react';

export default function Toast({ message, visible, onClose, duration = 3500 }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#222',
      color: '#fff',
      padding: '16px 32px',
      borderRadius: 8,
      boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      zIndex: 9999,
      fontSize: 18,
      opacity: 0.97,
      transition: 'opacity 0.3s',
      pointerEvents: 'auto',
      minWidth: 220,
      textAlign: 'center',
    }}>
      {message}
      <button onClick={onClose} style={{marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer'}}>✖</button>
    </div>
  );
}
