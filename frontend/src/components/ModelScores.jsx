import React from 'react'

const MODEL_META = {
  tfidf_lr : { name: 'TF-IDF + Logistic Regression', icon: '📝', acc: '93.8%' },
  tfidf_rf : { name: 'TF-IDF + Random Forest',       icon: '🌲', acc: '90.5%' },
  sbert    : { name: 'SBERT + SVM Tuned',             icon: '🧠', acc: '94.9%' },
}

export default function ModelScores({ modelScores, ensembleProb }) {
  return (
    <div className="card">
      <div className="card-title"><span>🤖</span> Individual Model Scores</div>

      {/* Ensemble */}
      <div style={{
        background   : 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(240,147,251,0.2))',
        border       : '1px solid rgba(108,99,255,0.4)',
        borderRadius : '12px',
        padding      : '14px 18px',
        marginBottom : '16px',
        display      : 'flex',
        justifyContent: 'space-between',
        alignItems   : 'center',
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>
            ⚡ Ensemble (Weighted Average)
          </div>
          <div style={{ fontSize: '12px', color: '#8888aa', marginTop: '2px' }}>
            Final prediction score
          </div>
        </div>
        <div style={{
          fontSize  : '22px', fontWeight: '800',
          background: 'linear-gradient(90deg, #6c63ff, #f093fb)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {Math.round(ensembleProb * 100)}%
        </div>
      </div>

      {/* Individual models */}
      {Object.entries(modelScores).map(([key, score]) => {
        const meta    = MODEL_META[key] || { name: key, icon: '📊', acc: 'N/A' }
        const highPct = Math.round(score.prob_high_risk * 100)
        const lowPct  = Math.round(score.prob_low_risk  * 100)
        const isHigh  = score.prob_high_risk >= 0.5

        return (
          <div key={key} style={{
            background   : 'rgba(255,255,255,0.03)',
            border       : '1px solid rgba(255,255,255,0.07)',
            borderRadius : '12px',
            padding      : '14px 18px',
            marginBottom : '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ marginRight: '8px' }}>{meta.icon}</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{meta.name}</span>
                <span style={{
                  marginLeft  : '8px', fontSize: '11px',
                  background  : 'rgba(255,255,255,0.08)',
                  padding     : '2px 8px', borderRadius: '10px', color: '#8888aa',
                }}>
                  acc {meta.acc}
                </span>
              </div>
              <span style={{
                fontWeight: '700', fontSize: '14px',
                color: isHigh ? '#e74c3c' : '#2ecc71',
              }}>
                {isHigh ? '🔴' : '🟢'} {highPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', height: '6px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
              <div style={{
                width     : `${lowPct}%`, background: '#2ecc71',
                borderRadius: '4px 0 0 4px', transition: 'width 0.8s ease',
              }} />
              <div style={{
                width     : `${highPct}%`, background: '#e74c3c',
                borderRadius: '0 4px 4px 0', transition: 'width 0.8s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span style={{ fontSize: '11px', color: '#2ecc71' }}>Low {lowPct}%</span>
              <span style={{ fontSize: '11px', color: '#e74c3c' }}>High {highPct}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}