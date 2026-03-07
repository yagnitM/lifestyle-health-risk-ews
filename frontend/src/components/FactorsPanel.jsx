import React from 'react'

const IMPACT_COLOR = { high: '#e74c3c', medium: '#f39c12', low: '#3498db' }

export default function FactorsPanel({ factors, extractedFeatures }) {
  return (
    <div className="card">
      <div className="card-title"><span>🔍</span> Contributing Factors</div>

      {/* Factor chips */}
      {factors.length === 0 ? (
        <p style={{ color: '#8888aa', fontSize: '14px' }}>No significant factors detected.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {factors.map((f, i) => {
            const isRisk = f.direction === 'risk_increasing'
            return (
              <div key={i} style={{
                display      : 'flex', alignItems: 'center',
                gap          : '12px',
                background   : isRisk ? 'rgba(231,76,60,0.08)' : 'rgba(46,204,113,0.08)',
                border       : `1px solid ${isRisk ? 'rgba(231,76,60,0.2)' : 'rgba(46,204,113,0.2)'}`,
                borderRadius : '10px', padding: '12px 16px',
              }}>
                <span style={{ fontSize: '20px' }}>{isRisk ? '⬆️' : '⬇️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#fff' }}>
                    {f.factor}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8888aa', marginTop: '2px' }}>
                    {f.detail}
                  </div>
                </div>
                <span style={{
                  fontSize    : '11px', fontWeight: '700',
                  background  : `${IMPACT_COLOR[f.impact]}22`,
                  color       : IMPACT_COLOR[f.impact],
                  padding     : '3px 10px', borderRadius: '10px',
                  border      : `1px solid ${IMPACT_COLOR[f.impact]}44`,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {f.impact}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Extracted features grid */}
      <div className="card-title" style={{ marginTop: '4px' }}>
        <span>⚙️</span> Extracted Features
      </div>
      <div style={{
        display            : 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap                : '10px',
      }}>
        {[
          { label: 'Sleep',     value: `${extractedFeatures.sleep_hours}h`,                    icon: '😴' },
          { label: 'Smoking',   value: extractedFeatures.smoking_detected ? 'Detected' : 'None', icon: '🚬' },
          { label: 'Alcohol',   value: extractedFeatures.alcohol_detected ? 'Detected' : 'None', icon: '🍺' },
          { label: 'Stress',    value: `${Math.round(extractedFeatures.stress_score * 100)}%`,   icon: '🧠' },
          { label: 'Diet',      value: extractedFeatures.diet_label?.replace('_', ' '),          icon: '🥗' },
          { label: 'Exercise',  value: extractedFeatures.exercise_label,                         icon: '🏃' },
          { label: 'Sentiment', value: extractedFeatures.sentiment_label,                        icon: '💭' },
        ].map(feat => (
          <div key={feat.label} style={{
            background   : 'rgba(255,255,255,0.04)',
            border       : '1px solid rgba(255,255,255,0.07)',
            borderRadius : '10px', padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{feat.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{feat.value}</div>
            <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>{feat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}