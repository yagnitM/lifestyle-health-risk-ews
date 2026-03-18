import React from 'react'

const MODEL_META = {
  tfidf_lr: { name: 'TF-IDF + Logistic Regression', icon: '📝', acc: '93.8%', weight: '40%' },
  tfidf_rf: { name: 'TF-IDF + Random Forest',       icon: '🌲', acc: '90.5%', weight: '25%' },
  sbert:    { name: 'SBERT + SVM Tuned',             icon: '🧠', acc: '94.9%', weight: '35%' },
}

export default function ModelScores({ modelScores, ensembleProb }) {
  const ensemblePct = Math.round(ensembleProb * 100)

  return (
    <div className="card">
      <div className="card-label">Model Ensemble</div>

      {/* Ensemble banner */}
      <div style={{
        background:     'linear-gradient(135deg, var(--col-teal-dim), var(--col-spark-dim))',
        border:         '1px solid rgba(0,178,149,0.22)',
        borderRadius:   '10px',
        padding:        '12px 16px',
        marginBottom:   '14px',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--col-teal)', letterSpacing: '0.3px' }}>
            ⚡ Weighted Ensemble
          </div>
          <div style={{ fontSize: '10px', color: 'var(--col-mist-dim)', marginTop: '2px', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
            LR 40% · RF 25% · SBERT 35%
          </div>
        </div>
        <div style={{
          fontSize:     '22px',
          fontWeight:   '500',
          fontFamily:   'var(--font-mono)',
          color:        'var(--col-spark)',
          letterSpacing:'-1px',
        }}>
          {ensemblePct}%
        </div>
      </div>

      {/* Individual models */}
      {Object.entries(modelScores).map(([key, score]) => {
        const meta    = MODEL_META[key] || { name: key, icon: '📊', acc: 'N/A', weight: '—' }
        const highPct = Math.round(score.prob_high_risk * 100)
        const lowPct  = Math.round(score.prob_low_risk  * 100)
        const isHigh  = score.prob_high_risk >= 0.5
        const barColor= isHigh ? 'var(--col-crimson)' : 'var(--col-teal)'

        return (
          <div key={key} style={{
            background:   'var(--col-base-deep)',
            border:       '1px solid var(--col-base-border)',
            borderRadius: '10px',
            padding:      '12px 14px',
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--col-mist)' }}>{meta.name}</span>
                <span style={{
                  fontSize:     '9px',
                  background:   'var(--col-mist-ghost)',
                  padding:      '2px 6px',
                  borderRadius: '4px',
                  color:        'var(--col-mist-dim)',
                  fontFamily:   'var(--font-mono)',
                }}>
                  {meta.acc}
                </span>
              </div>
              <span style={{
                fontSize:   '13px',
                fontWeight: '600',
                fontFamily: 'var(--font-mono)',
                color:      isHigh ? 'var(--col-crimson)' : 'var(--col-teal)',
              }}>
                {isHigh ? '↑' : '↓'} {highPct}%
              </span>
            </div>

            {/* Bar */}
            <div style={{ height: '4px', background: 'var(--col-mist-ghost)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                width:        `${highPct}%`,
                height:       '100%',
                background:   barColor,
                borderRadius: '99px',
                transition:   'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                marginLeft:   `${lowPct}%`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span style={{ fontSize: '9px', color: 'var(--col-teal)',    fontFamily: 'var(--font-mono)' }}>Low {lowPct}%</span>
              <span style={{ fontSize: '9px', color: 'var(--col-crimson)', fontFamily: 'var(--font-mono)' }}>High {highPct}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}