import React from 'react'

export default function LoadingSpinner({ message = 'Analysing your text…' }) {
  return (
    <>
      <style>{`
        @keyframes hg-spin { to { transform: rotate(360deg); } }
        @keyframes hg-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1;   }
        }
      `}</style>
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '48px',
        gap:            '20px',
      }}>
        {/* Dual-ring spinner using palette colors */}
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <div style={{
            position:       'absolute',
            inset:          0,
            border:         '2px solid var(--col-teal-dim)',
            borderTopColor: 'var(--col-spark)',
            borderRadius:   '50%',
            animation:      'hg-spin 0.75s linear infinite',
          }} />
          <div style={{
            position:       'absolute',
            inset:          '8px',
            border:         '2px solid transparent',
            borderTopColor: 'var(--col-teal)',
            borderRadius:   '50%',
            animation:      'hg-spin 1.2s linear infinite reverse',
          }} />
        </div>

        <p style={{
          color:       'var(--col-mist-dim)',
          fontSize:    '12px',
          fontFamily:  'var(--font-mono)',
          letterSpacing: '0.5px',
          animation:   'hg-pulse 1.8s ease-in-out infinite',
        }}>
          {message}
        </p>
      </div>
    </>
  )
}