import React, { useState } from 'react'

const EXAMPLES = [
  {
    label: '🔴 High Risk',
    color: 'var(--col-crimson)',
    border: 'rgba(171,35,70,0.35)',
    bg:    'rgba(171,35,70,0.08)',
    text: "I've been struggling with severe anxiety and depression for months. I smoke a pack a day and drink heavily every weekend to cope with stress. Only getting 3-4 hours of sleep because of chronic insomnia. My doctor said my blood sugar is dangerously high.",
  },
  {
    label: '🟢 Healthy',
    color: 'var(--col-teal)',
    border: 'rgba(0,178,149,0.35)',
    bg:    'rgba(0,178,149,0.08)',
    text: "Just finished training for a 10K race! I run every morning, eat a clean diet with lots of vegetables and protein. Sleep is great — about 8 hours every night. I meditate daily to manage my mental health.",
  },
  {
    label: '🟡 Mixed',
    color: '#c97a1a',
    border: 'rgba(201,122,26,0.35)',
    bg:    'rgba(201,122,26,0.08)',
    text: "I sleep around 5 hours on weekdays, skip breakfast often, rely on coffee to stay active, and have mild but frequent work stress. I exercise only once a week. For bursting stress, I sometimes smoke too, like once a month.",
  },
]

const PLACEHOLDER = `Describe your lifestyle or health situation in your own words…

Example: "I've been smoking for 5 years, sleep around 4 hours a night and feel stressed constantly. My diet is mostly fast food and I don't exercise much."`

export default function TextInput({ onSubmit, isLoading }) {
  const [text, setText] = useState('')
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const canSubmit = text.trim().length >= 10 && !isLoading

  const handleSubmit = () => { if (canSubmit) onSubmit(text.trim()) }
  const handleKey    = (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit() }

  return (
    <div className="card">
      <div className="card-label">Describe Your Lifestyle</div>

      {/* Example buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setText(ex.text)}
            style={{
              background:   'transparent',
              border:       `1px solid ${ex.border}`,
              color:        ex.color,
              padding:      '5px 14px',
              borderRadius: '99px',
              fontSize:     '11px',
              fontWeight:   '700',
              cursor:       'pointer',
              fontFamily:   'var(--font-ui)',
              letterSpacing: '0.3px',
              transition:   'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = ex.bg}
            onMouseOut={e  => e.currentTarget.style.background = 'transparent'}
          >
            {ex.label}
          </button>
        ))}
        {text && (
          <button
            onClick={() => setText('')}
            style={{
              background:   'transparent',
              border:       '1px solid var(--col-base-border)',
              color:        'var(--col-mist-dim)',
              padding:      '5px 14px',
              borderRadius: '99px',
              fontSize:     '11px',
              cursor:       'pointer',
              fontFamily:   'var(--font-ui)',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={PLACEHOLDER}
        rows={7}
        style={{
          width:        '100%',
          background:   'var(--col-base-deep)',
          border:       '1px solid var(--col-base-border)',
          borderRadius: '10px',
          padding:      '16px',
          color:        'var(--col-mist)',
          fontSize:     '14px',
          lineHeight:   '1.8',
          resize:       'vertical',
          outline:      'none',
          fontFamily:   'var(--font-ui)',
          transition:   'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--col-teal)'
          e.target.style.boxShadow   = '0 0 0 3px var(--col-teal-dim)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--col-base-border)'
          e.target.style.boxShadow   = 'none'
        }}
      />

      {/* Footer */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginTop:      '14px',
        flexWrap:       'wrap',
        gap:            '10px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--col-mist-dim)', opacity: 0.6 }}>
          {wordCount} words &nbsp;·&nbsp; Ctrl+Enter to submit
        </span>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            background:    canSubmit ? 'var(--col-teal)' : 'var(--col-mist-ghost)',
            border:        'none',
            color:         canSubmit ? 'var(--col-base)' : 'var(--col-mist-dim)',
            padding:       '11px 32px',
            borderRadius:  '99px',
            fontSize:      '12px',
            fontWeight:    '700',
            cursor:        canSubmit ? 'pointer' : 'not-allowed',
            fontFamily:    'var(--font-ui)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            transition:    'all 0.2s',
            boxShadow:     canSubmit ? '0 0 20px rgba(0,178,149,0.25)' : 'none',
          }}
          onMouseOver={e => { if (canSubmit) { e.currentTarget.style.background = 'var(--col-spark)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(3,247,235,0.30)' }}}
          onMouseOut={e  => { if (canSubmit) { e.currentTarget.style.background = 'var(--col-teal)';  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,178,149,0.25)' }}}
        >
          {isLoading ? 'Analysing…' : 'Analyse Risk →'}
        </button>
      </div>
    </div>
  )
}