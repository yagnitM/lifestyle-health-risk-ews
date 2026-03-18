import React from 'react'
import ModelScores from './ModelScores'

const HOW_STEPS = [
  { n: '01', title: 'Text Input',        desc: 'Free-text lifestyle description in natural language' },
  { n: '02', title: 'NLP Preprocessing', desc: 'Cleaning, lemmatisation, 7-feature extraction' },
  { n: '03', title: '3-Model Ensemble',  desc: 'TF-IDF LR + RF + SBERT SVM weighted prediction' },
  { n: '04', title: 'Risk Screening',    desc: 'Score + confidence + behavioural override layer' },
]

const BADGES = [
  '19,080 Reddit posts',
  '7 risk categories',
  'SHAP + LIME explainability',
  'Kaggle validated',
]

const VALIDATION_FEATURES = [
  { name: 'BMI',             confirmed: true  },
  { name: 'Sleep Quality',   confirmed: true  },
  { name: 'Substance Use',   confirmed: true  },
  { name: 'Lifestyle Score', confirmed: true  },
  { name: 'Exercise',        confirmed: true  },
  { name: 'Sugar Intake',    confirmed: true  },
  { name: 'Age Group',       confirmed: true  },
  { name: 'Alcohol',         confirmed: false },
]

export default function SidePanel({ result }) {
  return (
    <>
      {result && (
        <ModelScores
          modelScores={result.model_scores}
          ensembleProb={result.ensemble_probability}
        />
      )}

      {/* How It Works */}
      <div className="card">
        <div className="card-label">How It Works</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {HOW_STEPS.map(s => (
            <div key={s.n} style={{
              background:   'var(--col-base-deep)',
              border:       '1px solid var(--col-base-border)',
              borderRadius: '10px',
              padding:      '12px',
            }}>
              <div style={{
                fontSize:   '18px',
                fontWeight: '500',
                fontFamily: 'var(--font-mono)',
                color:      'var(--col-teal)',
                opacity:    0.5,
                lineHeight: 1,
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--col-mist)', marginTop: '6px', letterSpacing: '0.3px' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--col-mist-dim)', marginTop: '3px', lineHeight: '1.5', opacity: 0.65 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {BADGES.map(b => (
            <span key={b} style={{
              fontSize:     '10px',
              fontWeight:   '500',
              background:   'var(--col-teal-dim)',
              color:        'var(--col-teal)',
              padding:      '4px 10px',
              borderRadius: '6px',
              border:       '1px solid rgba(0,178,149,0.18)',
            }}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Kaggle Validation Layer */}
      <div className="card">
        <div className="card-label">Kaggle Validation Layer</div>

        <p style={{ fontSize: '11px', color: 'var(--col-mist-dim)', lineHeight: '1.7', marginBottom: '14px', opacity: 0.65 }}>
          Structured health dataset confirming that features our NLP pipeline extracts
          are genuinely predictive of health risk — cross-modal validation.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          {[
            { val: '7/8',   label: 'Features confirmed' },
            { val: '0.998', label: 'XGBoost AUC'        },
          ].map(s => (
            <div key={s.label} style={{
              background:   'var(--col-base-deep)',
              border:       '1px solid var(--col-base-border)',
              borderRadius: '8px',
              padding:      '10px',
              textAlign:    'center',
            }}>
              <div style={{
                fontSize:     '20px',
                fontWeight:   '500',
                fontFamily:   'var(--font-mono)',
                color:        'var(--col-spark)',
                letterSpacing:'-0.5px',
              }}>
                {s.val}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--col-mist-dim)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {VALIDATION_FEATURES.map(f => (
            <div key={f.name} style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '6px 10px',
              background:     f.confirmed ? 'var(--col-teal-dim)' : 'var(--col-mist-ghost)',
              border:         `1px solid ${f.confirmed ? 'rgba(0,178,149,0.15)' : 'var(--col-base-border)'}`,
              borderRadius:   '6px',
            }}>
              <span style={{ fontSize: '11px', color: 'var(--col-mist-dim)' }}>{f.name}</span>
              <span style={{
                fontSize:   '10px',
                fontWeight: '600',
                color:      f.confirmed ? 'var(--col-teal)' : 'var(--col-mist-dim)',
                fontFamily: 'var(--font-mono)',
                opacity:    f.confirmed ? 1 : 0.45,
              }}>
                {f.confirmed ? '✓ confirmed' : '~ partial'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--col-mist-dim)', fontStyle: 'italic', opacity: 0.45, fontFamily: 'var(--font-mono)' }}>
          Top predictors: BMI · Age · Lifestyle Score · Sleep · Substance Use
        </div>
      </div>
    </>
  )
}