import React, { useState } from 'react'

const PLACEHOLDER = `Describe your lifestyle or health situation in your own words...

Examples:
- "I've been smoking for 5 years, sleep around 4 hours a night and feel stressed constantly."
- "I run 5k every morning, eat clean and sleep 8 hours. Recently diagnosed with pre-diabetes."
- "Started keto diet last month, hitting the gym 4x a week, feeling great overall."`

const EXAMPLE_TEXTS = [
  {
    label : '🔴 High Risk Example',
    color : '#e74c3c',
    text  : "I've been struggling with severe anxiety and depression for months. I smoke a pack a day and drink heavily every weekend to cope with stress. Only getting 3-4 hours of sleep because of chronic insomnia. My doctor said my blood sugar is dangerously high.",
  },
  {
    label : '🟢 Low Risk Example',
    color : '#2ecc71',
    text  : "Just finished training for a 10K race! I run every morning, eat a clean keto diet with lots of vegetables and protein. Sleep is great — about 8 hours every night. I meditate daily to manage stress and haven't touched alcohol in two years.",
  },
  {
    label : '🟡 Mixed Example',
    color : '#f39c12',
    text  : "I work out 3 times a week and try to eat healthy but I do drink on weekends and my sleep schedule is pretty irregular, usually around 5-6 hours. Work stress has been really bad lately and I've been feeling overwhelmed most days.",
  },
]

export default function TextInput({ onSubmit, isLoading }) {
  const [text, setText] = useState('')
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = () => {
    if (text.trim().length >= 10 && !isLoading) {
      onSubmit(text.trim())
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>✍️</span> Describe Your Lifestyle
      </div>

      {/* Example buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {EXAMPLE_TEXTS.map((ex) => (
          <button
            key={ex.label}
            onClick={() => setText(ex.text)}
            style={{
              background : 'rgba(255,255,255,0.05)',
              border     : `1px solid ${ex.color}44`,
              color      : ex.color,
              padding    : '6px 14px',
              borderRadius: '20px',
              fontSize   : '12px',
              cursor     : 'pointer',
              fontWeight : '600',
              transition : 'all 0.2s',
            }}
            onMouseOver={e => e.target.style.background = `${ex.color}22`}
            onMouseOut={e  => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            {ex.label}
          </button>
        ))}
        {text && (
          <button
            onClick={() => setText('')}
            style={{
              background : 'transparent',
              border     : '1px solid rgba(255,255,255,0.1)',
              color      : '#666688',
              padding    : '6px 14px',
              borderRadius: '20px',
              fontSize   : '12px',
              cursor     : 'pointer',
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
          width        : '100%',
          background   : 'rgba(0,0,0,0.3)',
          border       : '1px solid rgba(255,255,255,0.1)',
          borderRadius : '12px',
          padding      : '16px',
          color        : '#e0e0e0',
          fontSize     : '14px',
          lineHeight   : '1.7',
          resize       : 'vertical',
          outline      : 'none',
          fontFamily   : 'inherit',
          transition   : 'border-color 0.2s',
        }}
        onFocus={e  => e.target.style.borderColor = '#6c63ff'}
        onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />

      {/* Footer row */}
      <div style={{
        display        : 'flex',
        justifyContent : 'space-between',
        alignItems     : 'center',
        marginTop      : '14px',
        flexWrap       : 'wrap',
        gap            : '10px',
      }}>
        <span style={{ color: '#555577', fontSize: '12px' }}>
          {wordCount} words &nbsp;·&nbsp; Ctrl+Enter to submit
        </span>

        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 10 || isLoading}
          style={{
            background   : text.trim().length >= 10 && !isLoading
                           ? 'linear-gradient(90deg, #6c63ff, #f093fb)'
                           : 'rgba(255,255,255,0.06)',
            border       : 'none',
            color        : text.trim().length >= 10 && !isLoading ? 'white' : '#444466',
            padding      : '12px 32px',
            borderRadius : '50px',
            fontSize     : '14px',
            fontWeight   : '700',
            cursor       : text.trim().length >= 10 && !isLoading ? 'pointer' : 'not-allowed',
            transition   : 'all 0.2s',
            letterSpacing: '0.5px',
          }}
        >
          {isLoading ? 'Analysing...' : 'Analyse Risk →'}
        </button>
      </div>
    </div>
  )
}