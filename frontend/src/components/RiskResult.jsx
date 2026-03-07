import React from 'react'

const LEVEL_CONFIG = {
  VERY_LOW : { emoji: '💚', gradient: 'linear-gradient(135deg, #27ae60, #2ecc71)', bg: 'rgba(46,204,113,0.1)',  border: 'rgba(46,204,113,0.3)'  },
  LOW      : { emoji: '🟢', gradient: 'linear-gradient(135deg, #27ae60, #58d68d)', bg: 'rgba(46,204,113,0.1)',  border: 'rgba(46,204,113,0.3)'  },
  MEDIUM   : { emoji: '🟡', gradient: 'linear-gradient(135deg, #d35400, #f39c12)', bg: 'rgba(243,156,18,0.1)',  border: 'rgba(243,156,18,0.3)'  },
  HIGH     : { emoji: '🔴', gradient: 'linear-gradient(135deg, #c0392b, #e74c3c)', bg: 'rgba(231,76,60,0.1)',   border: 'rgba(231,76,60,0.3)'   },
}

export default function RiskResult({ result }) {
  const cfg  = LEVEL_CONFIG[result.risk_level] || LEVEL_CONFIG.MEDIUM
  const pct  = Math.round(result.ensemble_probability * 100)
  const conf = Math.round(result.confidence * 100)

  return (
    <div className="card" style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}>
      <div className="card-title"><span>📊</span> Risk Assessment Result</div>

      {/* Main score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>

        {/* Circular gauge */}
        <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r="54"
              fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            <circle cx="65" cy="65" r="54"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - result.ensemble_probability)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#6c63ff" />
                <stop offset="100%" stopColor="#f093fb" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position  : 'absolute', inset: 0,
            display   : 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '26px', fontWeight: '800', color: '#fff' }}>{pct}%</span>
            <span style={{ fontSize: '10px', color: '#8888aa', letterSpacing: '1px' }}>RISK</span>
          </div>
        </div>

        {/* Labels */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{
            display     : 'inline-flex', alignItems: 'center', gap: '10px',
            background  : cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: '12px', padding: '10px 18px', marginBottom: '14px',
          }}>
            <span style={{ fontSize: '24px' }}>{cfg.emoji}</span>
            <span style={{
              fontSize  : '22px', fontWeight: '800',
              background: cfg.gradient,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {result.risk_label}
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Probability', value: `${pct}%`  },
              { label: 'Confidence',  value: `${conf}%` },
              { label: 'Time',        value: `${result.processing_time_ms}ms` },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
                padding: '10px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}