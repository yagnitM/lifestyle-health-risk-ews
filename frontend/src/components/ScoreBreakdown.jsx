import React from 'react'

function MiniBar({ label, score, color, weight, description }) {
  const pct = Math.round(score * 100)
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'baseline',
        marginBottom:   '6px',
      }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--col-mist)' }}>
            {label}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--col-mist-dim)', marginLeft: '8px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
            weight {Math.round(weight * 100)}%
          </span>
        </div>
        <span style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'var(--font-mono)', color, letterSpacing: '-0.5px' }}>
          {pct}%
        </span>
      </div>

      <div style={{ height: '6px', background: 'var(--col-mist-ghost)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px' }}>
        <div style={{
          width:        `${pct}%`,
          height:       '100%',
          background:   color,
          borderRadius: '99px',
          transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>

      <p style={{ fontSize: '11px', color: 'var(--col-mist-dim)', lineHeight: '1.6', opacity: 0.65 }}>
        {description}
      </p>
    </div>
  )
}

export default function ScoreBreakdown({ result }) {
  const textScore    = result.text_score    ?? result.ensemble_probability
  const featureScore = result.feature_score ?? result.ensemble_probability
  const finalScore   = result.ensemble_probability
  const finalPct     = Math.round(finalScore * 100)

  const finalColor = finalScore >= 0.75 ? 'var(--col-crimson)'
                   : finalScore >= 0.50 ? '#c97a1a'
                   : 'var(--col-teal)'

  const overrides = result.provenance?.score_breakdown?.overrides_applied ?? []

  return (
    <div className="card">
      <div className="card-label">Score Breakdown</div>

      <MiniBar
        label       ="Text Model Score"
        score       ={textScore}
        color       ="var(--col-spark)"
        weight      ={0.50}
        description ="Linguistic risk signature — how closely your text resembles language patterns from high-risk health communities (19,080 Reddit posts, 7 categories)."
      />

      <MiniBar
        label       ="Clinical Feature Score"
        score       ={featureScore}
        color       ="var(--col-teal)"
        weight      ={0.50}
        description ="Feature-based clinical score — derived from extracted lifestyle signals (sleep, smoking, alcohol, stress, diet, exercise) weighted by SHAP importance from Kaggle validation dataset."
      />

      {/* Blend row */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        margin:       '4px 0 16px',
        padding:      '10px 14px',
        background:   'var(--col-base-deep)',
        borderRadius: '8px',
        border:       '1px solid var(--col-base-border)',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--col-mist-dim)', flex: 1, opacity: 0.65 }}>
          Text (50%) + Clinical Features (50%) = Blended Score
        </span>
        <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'var(--font-mono)', color: finalColor, letterSpacing: '-0.5px' }}>
          {finalPct}%
        </span>
      </div>

      {/* Override notice */}
      {overrides.length > 0 && (
        <div style={{
          background:   'rgba(201,122,26,0.08)',
          border:       '1px solid rgba(201,122,26,0.25)',
          borderRadius: '8px',
          padding:      '10px 14px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#c97a1a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Behavioral Override Applied
          </div>
          {overrides.map((o, i) => (
            <p key={i} style={{ fontSize: '12px', color: 'var(--col-mist-dim)', lineHeight: '1.6' }}>
              {o}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}