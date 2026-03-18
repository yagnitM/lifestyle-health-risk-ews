import React from 'react'

const IMPACT = {
  high:   { color: 'var(--col-crimson)', bg: 'var(--col-crimson-dim)', border: 'rgba(171,35,70,0.22)'  },
  medium: { color: '#c97a1a',            bg: 'rgba(201,122,26,0.10)',  border: 'rgba(201,122,26,0.22)' },
  low:    { color: 'var(--col-teal)',    bg: 'var(--col-teal-dim)',    border: 'rgba(0,178,149,0.20)'  },
}

export default function FactorsPanel({ factors, extractedFeatures: ef }) {

  const features = [
    { icon: '😴', label: 'Sleep',     val: `${ef.sleep_hours}h`,                            flagRed: ef.sleep_hours < 6  },
    { icon: '🚬', label: 'Smoking',   val: ef.smoking_detected ? 'Detected' : 'None',        flagRed: ef.smoking_detected },
    { icon: '🍺', label: 'Alcohol',   val: ef.alcohol_detected ? 'Detected' : 'None',        flagRed: ef.alcohol_detected },
    { icon: '🧠', label: 'Stress',    val: `${Math.round(ef.stress_score * 100)}%`,          flagRed: ef.stress_score > 0.5 },
    { icon: '🥗', label: 'Diet',      val: ef.diet_label?.replace(/_/g, ' ') || '—',         flagRed: false },
    { icon: '🏃', label: 'Exercise',  val: ef.exercise_label || '—',                         flagRed: false },
    { icon: '💭', label: 'Sentiment', val: ef.sentiment_label || '—',                        flagRed: ef.sentiment_label === 'negative' },
  ]

  return (
    <>
      {/* Extracted Features */}
      <div className="card">
        <div className="card-label">Detected Signals</div>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap:                 '8px',
        }}>
          {features.map(f => (
            <div key={f.label} style={{
              background:   f.flagRed ? 'var(--col-crimson-dim)' : 'var(--col-base-deep)',
              border:       `1px solid ${f.flagRed ? 'rgba(171,35,70,0.22)' : 'var(--col-base-border)'}`,
              borderRadius: '10px',
              padding:      '12px',
              textAlign:    'center',
              transition:   'border-color 0.2s',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '5px' }}>{f.icon}</div>
              <div style={{
                fontSize:   '13px',
                fontWeight: '600',
                color:      f.flagRed ? 'var(--col-crimson)' : 'var(--col-mist)',
              }}>
                {f.val}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--col-mist-dim)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contributing Factors */}
      {factors && factors.length > 0 && (
        <div className="card">
          <div className="card-label">Contributing Factors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {factors.map((f, i) => {
              const isRisk = f.direction === 'risk_increasing'
              const imp    = IMPACT[f.impact] || IMPACT.medium
              return (
                <div key={i} style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '12px',
                  background:   isRisk ? 'var(--col-crimson-dim)' : 'var(--col-teal-dim)',
                  border:       `1px solid ${isRisk ? 'rgba(171,35,70,0.18)' : 'rgba(0,178,149,0.15)'}`,
                  borderRadius: '10px',
                  padding:      '12px 14px',
                }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, color: isRisk ? 'var(--col-crimson)' : 'var(--col-teal)' }}>
                    {isRisk ? '↑' : '↓'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--col-mist)' }}>{f.factor}</div>
                    <div style={{ fontSize: '11px', color: 'var(--col-mist-dim)', marginTop: '2px', opacity: 0.7 }}>{f.detail}</div>
                  </div>
                  <span style={{
                    fontSize:      '9px',
                    fontWeight:    '700',
                    background:    imp.bg,
                    color:         imp.color,
                    padding:       '3px 9px',
                    borderRadius:  '5px',
                    border:        `1px solid ${imp.border}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    flexShrink:    0,
                  }}>
                    {f.impact}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}