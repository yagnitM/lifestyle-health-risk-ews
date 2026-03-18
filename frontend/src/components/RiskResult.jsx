import React from 'react'

const LEVEL = {
  VERY_LOW: { color: 'var(--col-teal)',    bg: 'var(--col-teal-dim)',    border: 'rgba(0,178,149,0.25)',   label: 'VERY LOW RISK' },
  LOW:      { color: 'var(--col-teal)',    bg: 'var(--col-teal-dim)',    border: 'rgba(0,178,149,0.25)',   label: 'LOW RISK'      },
  MEDIUM:   { color: '#c97a1a',            bg: 'rgba(201,122,26,0.10)',  border: 'rgba(201,122,26,0.28)',  label: 'MEDIUM RISK'   },
  HIGH:     { color: 'var(--col-crimson)', bg: 'var(--col-crimson-dim)', border: 'rgba(171,35,70,0.30)',   label: 'HIGH RISK'     },
}

export default function RiskResult({ result }) {
  const cfg  = LEVEL[result.risk_level] || LEVEL.MEDIUM
  const pct  = Math.round(result.ensemble_probability * 100)
  const conf = Math.round(result.confidence * 100)
  const circ = 2 * Math.PI * 46
  const dash = circ * (1 - result.ensemble_probability)

  return (
    <div className="card" style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}>
      <div className="card-label">Risk Assessment Result</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>

        {/* Gauge */}
        <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r="46"
              fill="none" stroke="var(--col-mist-ghost)" strokeWidth="8" />
            <circle cx="55" cy="55" r="46"
              fill="none"
              stroke={cfg.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <div style={{
            position:       'absolute', inset: 0,
            display:        'flex', flexDirection: 'column',
            alignItems:     'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize:    '26px',
              fontWeight:  '500',
              fontFamily:  'var(--font-mono)',
              color:       cfg.color,
              letterSpacing: '-1.5px',
            }}>
              {pct}%
            </span>
            <span style={{ fontSize: '8px', color: 'var(--col-mist-dim)', letterSpacing: '2px', marginTop: '2px' }}>
              RISK
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{
            display:      'inline-flex',
            alignItems:   'center',
            background:   cfg.bg,
            border:       `1px solid ${cfg.border}`,
            borderRadius: '8px',
            padding:      '7px 16px',
            marginBottom: '14px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: cfg.color, letterSpacing: '1px' }}>
              {cfg.label}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'Probability', val: `${pct}%`  },
              { key: 'Confidence',  val: `${conf}%` },
              { key: 'Processed',   val: `${result.processing_time_ms}ms` },
            ].map(s => (
              <div key={s.key} style={{
                background:    'var(--col-base-deep)',
                border:        '1px solid var(--col-base-border)',
                borderRadius:  '8px',
                padding:       '8px 14px',
                textAlign:     'center',
              }}>
                <div style={{
                  fontSize:    '17px',
                  fontWeight:  '500',
                  fontFamily:  'var(--font-mono)',
                  color:       'var(--col-mist)',
                  letterSpacing: '-0.5px',
                }}>
                  {s.val}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--col-mist-dim)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {s.key}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}