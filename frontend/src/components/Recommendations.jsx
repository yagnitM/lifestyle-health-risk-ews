import React from 'react'

export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div className="card">
      <div className="card-label">Personalised Recommendations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.map((rec, i) => (
          <div key={i} style={{
            display:      'flex',
            gap:          '12px',
            background:   'var(--col-base-deep)',
            border:       '1px solid var(--col-base-border)',
            borderRadius: '10px',
            padding:      '12px 14px',
            alignItems:   'flex-start',
            transition:   'border-color 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(0,178,149,0.25)'}
          onMouseOut={e  => e.currentTarget.style.borderColor = 'var(--col-base-border)'}
          >
            <div style={{
              width:           '22px',
              height:          '22px',
              borderRadius:    '50%',
              background:      'var(--col-teal)',
              color:           'var(--col-base)',
              fontSize:        '10px',
              fontWeight:      '700',
              fontFamily:      'var(--font-mono)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              flexShrink:      0,
              marginTop:       '1px',
            }}>
              {i + 1}
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--col-mist-dim)' }}>{rec}</p>
          </div>
        ))}
      </div>
    </div>
  )
}