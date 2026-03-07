import React from 'react'

export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div className="card">
      <div className="card-title"><span>💡</span> Personalised Recommendations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recommendations.map((rec, i) => (
          <div key={i} style={{
            background   : 'rgba(108,99,255,0.08)',
            border       : '1px solid rgba(108,99,255,0.2)',
            borderRadius : '12px',
            padding      : '14px 16px',
            fontSize     : '14px',
            lineHeight   : '1.6',
            color        : '#cccce0',
            display      : 'flex',
            gap          : '10px',
            alignItems   : 'flex-start',
          }}>
            <span style={{
              background  : 'linear-gradient(135deg, #6c63ff, #f093fb)',
              color       : 'white',
              borderRadius: '50%',
              width       : '22px', height: '22px',
              display     : 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize    : '11px', fontWeight: '700', flexShrink: 0, marginTop: '1px',
            }}>
              {i + 1}
            </span>
            {rec}
          </div>
        ))}
      </div>
    </div>
  )
}