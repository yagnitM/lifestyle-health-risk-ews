import React, { useState } from 'react'

const HIGH_RISK_WORDS = new Set([
  'smoking', 'smoke', 'smokes', 'smoker', 'cigarette', 'cigarettes',
  'nicotine', 'vape', 'vaping', 'tobacco', 'pack', 'packs',
  'alcohol', 'alcoholic', 'drinking', 'drunk', 'drink', 'drinks',
  'beer', 'wine', 'whiskey', 'vodka', 'sober', 'sobriety', 'relapse',
  'weed', 'cannabis', 'marijuana', 'drug', 'drugs', 'addiction',
  'craving', 'cravings', 'withdrawal',
  'diabetes', 'diabetic', 'insulin', 'glucose', 'a1c', 'hba1c',
  'blood sugar', 'metformin', 'diagnosed', 'diagnosis',
  'anxiety', 'anxious', 'depressed', 'depression', 'panic',
  'stressed', 'overwhelmed', 'hopeless', 'suicidal', 'therapy',
  'insomnia', 'sleepless', 'sleeplessness', 'cpap', 'apnea',
  'pain', 'chronic', 'fatigue', 'exhausted', 'tired', 'migraine',
])

const LOW_RISK_WORDS = new Set([
  'running', 'run', 'gym', 'workout', 'exercise', 'training',
  'lifting', 'cycling', 'swimming', 'yoga', 'meditation',
  'fitness', 'active', 'walk', 'walking', 'jogging',
  'keto', 'vegetables', 'vegetable', 'protein', 'healthy',
  'salad', 'fruits', 'fruit', 'nutritious', 'clean',
  'fasting', 'intermittent',
  'sleep', 'sleeping', 'slept', 'hours', 'rested', 'rest',
  'sober', 'quit', 'quitting', 'stopped', 'clean',
  'meditation', 'mindfulness', 'hydrated', 'water',
])

function classifyWord(word) {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '')
  if (HIGH_RISK_WORDS.has(lower)) return 'high'
  if (LOW_RISK_WORDS.has(lower))  return 'low'
  return 'neutral'
}

function tokenize(text) {
  return text.split(/(\s+|[.,!?;:])/).filter(t => t.length > 0)
}

export default function RiskWordHighlighter({ originalText, result }) {
  const [showLegend, setShowLegend] = useState(false)

  if (!originalText) return null

  const tokens    = tokenize(originalText)
  const highCount = tokens.filter(t => classifyWord(t) === 'high').length
  const lowCount  = tokens.filter(t => classifyWord(t) === 'low').length

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div className="card-label" style={{ margin: 0 }}>Risk Signal Highlighter</div>
        <button
          onClick={() => setShowLegend(v => !v)}
          style={{
            background:    'transparent',
            border:        '1px solid var(--col-base-border)',
            color:         'var(--col-mist-dim)',
            fontSize:      '10px',
            padding:       '4px 10px',
            borderRadius:  '6px',
            cursor:        'pointer',
            fontFamily:    'var(--font-ui)',
            letterSpacing: '0.5px',
            transition:    'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--col-mist-dim)'; e.currentTarget.style.color = 'var(--col-mist)' }}
          onMouseOut={e  => { e.currentTarget.style.borderColor = 'var(--col-base-border)'; e.currentTarget.style.color = 'var(--col-mist-dim)' }}
        >
          {showLegend ? 'Hide' : 'Show'} legend
        </button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(171,35,70,0.22)',  border: 'rgba(171,35,70,0.35)',  text: 'var(--col-crimson)', label: 'Risk-increasing signal' },
            { color: 'rgba(0,178,149,0.15)',   border: 'rgba(0,178,149,0.30)', text: 'var(--col-teal)',    label: 'Protective signal'       },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display:      'inline-block',
                width:        '24px',
                height:       '12px',
                background:   l.color,
                border:       `1px solid ${l.border}`,
                borderRadius: '3px',
              }} />
              <span style={{ fontSize: '10px', color: 'var(--col-mist-dim)', opacity: 0.7 }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Signal counts */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize:      '11px',
          fontWeight:    '600',
          background:    'var(--col-crimson-dim)',
          color:         'var(--col-crimson)',
          padding:       '4px 10px',
          borderRadius:  '5px',
          border:        '1px solid rgba(171,35,70,0.22)',
        }}>
          {highCount} risk signal{highCount !== 1 ? 's' : ''} detected
        </span>
        {lowCount > 0 && (
          <span style={{
            fontSize:      '11px',
            fontWeight:    '600',
            background:    'var(--col-teal-dim)',
            color:         'var(--col-teal)',
            padding:       '4px 10px',
            borderRadius:  '5px',
            border:        '1px solid rgba(0,178,149,0.20)',
          }}>
            {lowCount} protective signal{lowCount !== 1 ? 's' : ''} detected
          </span>
        )}
      </div>

      {/* Highlighted text */}
      <div style={{
        background:    'var(--col-base-deep)',
        border:        '1px solid var(--col-base-border)',
        borderRadius:  '10px',
        padding:       '16px',
        fontSize:      '14px',
        lineHeight:    '2.1',
        color:         'var(--col-mist-dim)',
        fontFamily:    'var(--font-ui)',
      }}>
        {tokens.map((token, i) => {
          const type = classifyWord(token)

          if (type === 'high') {
            return (
              <mark key={i} style={{
                background:    'rgba(171,35,70,0.20)',
                color:         '#e87a96',
                borderRadius:  '3px',
                padding:       '1px 3px',
                border:        '1px solid rgba(171,35,70,0.30)',
                fontWeight:    '600',
              }}>
                {token}
              </mark>
            )
          }

          if (type === 'low') {
            return (
              <mark key={i} style={{
                background:    'rgba(0,178,149,0.14)',
                color:         '#5ecfbc',
                borderRadius:  '3px',
                padding:       '1px 3px',
                border:        '1px solid rgba(0,178,149,0.25)',
                fontWeight:    '600',
              }}>
                {token}
              </mark>
            )
          }

          return <span key={i}>{token}</span>
        })}
      </div>

      <p style={{
        fontSize:   '10px',
        color:      '#ffffff',
        marginTop:  '10px',
        lineHeight: '1.5',
        opacity:    0.4,
        fontFamily: 'var(--font-mono)',
      }}>
        Highlights based on TF-IDF coefficient analysis
      </p>
    </div>
  )
}