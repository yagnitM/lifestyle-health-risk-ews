import React from 'react'
import { generateNarrative }  from '../utils/RiskNarrative'
import ScoreBreakdown         from './ScoreBreakdown'
import RiskWordHighlighter    from './RiskWordHighlighter'
import WhatIfSimulator        from './WhatIfSimulator'
import ProvenancePanel        from './ProvenancePanel'

const LEVEL_COLOR = {
  HIGH:     'var(--col-crimson)',
  MEDIUM:   '#c97a1a',
  LOW:      'var(--col-teal)',
  VERY_LOW: 'var(--col-teal)',
}

const LEVEL_BORDER = {
  HIGH:     'rgba(171,35,70,0.28)',
  MEDIUM:   'rgba(201,122,26,0.28)',
  LOW:      'rgba(0,178,149,0.25)',
  VERY_LOW: 'rgba(0,178,149,0.25)',
}

const LEVEL_BG = {
  HIGH:     'var(--col-crimson-dim)',
  MEDIUM:   'rgba(201,122,26,0.08)',
  LOW:      'var(--col-teal-dim)',
  VERY_LOW: 'var(--col-teal-dim)',
}

const PRIORITY_CONFIG = {
  high:    { label: 'Priority',  color: 'var(--col-crimson)', bg: 'var(--col-crimson-dim)', border: 'rgba(171,35,70,0.22)'  },
  medium:  { label: 'Suggested', color: '#c97a1a',            bg: 'rgba(201,122,26,0.10)',  border: 'rgba(201,122,26,0.22)' },
  monitor: { label: 'Monitor',   color: 'var(--col-teal)',    bg: 'var(--col-teal-dim)',    border: 'rgba(0,178,149,0.20)'  },
}

function ScoreBar({ score, color }) {
  return (
    <div style={{
      height:        '5px',
      background:    'var(--col-mist-ghost)',
      borderRadius:  '99px',
      overflow:      'hidden',
      marginTop:     '8px',
    }}>
      <div style={{
        width:         `${Math.round(score * 100)}%`,
        height:        '100%',
        background:    color,
        borderRadius:  '99px',
        transition:    'width 1s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

export default function NarrativeReport({ result }) {
  const narrative  = generateNarrative(result)
  const levelColor = LEVEL_COLOR[result.risk_level]  || '#c97a1a'
  const levelBorder= LEVEL_BORDER[result.risk_level] || 'rgba(201,122,26,0.28)'
  const levelBg    = LEVEL_BG[result.risk_level]     || 'rgba(201,122,26,0.08)'
  const pct  = Math.round(result.ensemble_probability * 100)
  const conf = Math.round(result.confidence * 100)
  const circ = 2 * Math.PI * 46
  const dash = circ * (1 - result.ensemble_probability)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── SECTION 1: Risk gauge + headline ── */}
      <div className="card" style={{ border: `1px solid ${levelBorder}`, background: levelBg }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>

          {/* Gauge */}
          <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
            <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="46" fill="none" stroke="var(--col-mist-ghost)" strokeWidth="8" />
              <circle cx="55" cy="55" r="46" fill="none"
                stroke={levelColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={dash}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </svg>
            <div style={{
              position:       'absolute', inset: 0,
              display:        'flex', flexDirection: 'column',
              alignItems:     'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize:      '24px',
                fontWeight:    '500',
                fontFamily:    'var(--font-mono)',
                color:         levelColor,
                letterSpacing: '-1.5px',
              }}>
                {pct}%
              </span>
              <span style={{ fontSize: '8px', color: 'var(--col-mist-dim)', letterSpacing: '2px', marginTop: '2px' }}>RISK</span>
            </div>
          </div>

          {/* Headline block */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              display:       'inline-flex',
              alignItems:    'center',
              background:    levelBg,
              border:        `1px solid ${levelBorder}`,
              borderRadius:  '7px',
              padding:       '6px 14px',
              marginBottom:  '12px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: levelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {result.risk_label}
              </span>
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--col-mist-dim)', marginBottom: '14px' }}>
              {narrative.headline}
            </p>

            {/* Stats row */}
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
                  padding:       '7px 12px',
                  textAlign:     'center',
                }}>
                  <div style={{
                    fontSize:      '15px',
                    fontWeight:    '500',
                    fontFamily:    'var(--font-mono)',
                    color:         'var(--col-mist)',
                    letterSpacing: '-0.5px',
                  }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--col-mist-dim)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {s.key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: What this means ── */}
      <div className="card">
        <div className="card-label">What This Means For You</div>
        <p style={{
          fontSize:    '14px',
          lineHeight:  '1.9',
          color:       'var(--col-mist-dim)',
          borderLeft:  `2px solid ${levelColor}`,
          paddingLeft: '16px',
        }}>
          {narrative.narrative}
        </p>
      </div>

          {/* ── SECTION 2.5: LLM Narrative ── */}
{result.llm_narrative && result.llm_narrative !== "Personalized explanation unavailable." && (
  <div className="card" style={{
    border:     '1px solid rgba(99,102,241,0.22)',
    background: 'rgba(99,102,241,0.06)',
  }}>
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '20px', flexShrink: 0 }}>🤖</span>
      <div>
        <div style={{
          fontSize:      '10px',
          fontWeight:    '700',
          color:         '#6366f1',
          marginBottom:  '6px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
        }}>
          AI Health Assistant
        </div>
        <p style={{ fontSize: '14px', lineHeight: '1.9', color: 'var(--col-mist-dim)' }}>
          {result.llm_narrative}
        </p>
      </div>
    </div>
  </div>
)}

      {/* ── SECTION 3: Risk dimensions ── */}
      {narrative.risk_dimensions.length > 0 && (
        <div className="card">
          <div className="card-label">Risk Dimension Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {narrative.risk_dimensions.map((dim, i) => (
              <div key={i} style={{
                background:    `${dim.color}08`,
                border:        `1px solid ${dim.color}22`,
                borderRadius:  '10px',
                padding:       '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--col-mist)' }}>
                    {dim.condition}
                  </span>
                  <span style={{
                    fontSize:      '10px',
                    fontWeight:    '700',
                    color:         dim.color,
                    background:    `${dim.color}14`,
                    padding:       '3px 9px',
                    borderRadius:  '5px',
                    border:        `1px solid ${dim.color}28`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {dim.level}
                  </span>
                </div>
                <ScoreBar score={dim.score} color={dim.color} />
                <p style={{ fontSize: '11px', color: 'var(--col-mist-dim)', marginTop: '8px', lineHeight: '1.6', opacity: 0.65 }}>
                  {dim.why}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 4: Detected signals ── */}
      <div className="card">
        <div className="card-label">Detected Signals</div>
        <DetectedSignals ef={result.extracted_features} />
      </div>

      {/* ── SECTION 5: Key insight ── */}
      {narrative.insight && (
        <div className="card" style={{
          border:     '1px solid rgba(0,178,149,0.22)',
          background: 'var(--col-teal-dim)',
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{narrative.insight.icon}</span>
            <div>
              <div style={{
                fontSize:      '10px',
                fontWeight:    '700',
                color:         'var(--col-spark)',
                marginBottom:  '6px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}>
                {narrative.insight.title}
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--col-mist-dim)' }}>
                {narrative.insight.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 6: Smart recommendations ── */}
      {narrative.smart_recs.length > 0 && (
        <div className="card">
          <div className="card-label">What To Do About It</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {narrative.smart_recs.map((rec, i) => {
              const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.monitor
              return (
                <div key={i} style={{
                  background:    cfg.bg,
                  border:        `1px solid ${cfg.border}`,
                  borderRadius:  '10px',
                  padding:       '12px 16px',
                  display:       'flex',
                  gap:           '12px',
                  alignItems:    'flex-start',
                }}>
                  <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                    <span style={{
                      fontSize:      '9px',
                      fontWeight:    '700',
                      color:         cfg.color,
                      background:    `${cfg.color}18`,
                      padding:       '3px 8px',
                      borderRadius:  '4px',
                      border:        `1px solid ${cfg.border}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      display:       'inline-block',
                      whiteSpace:    'nowrap',
                    }}>
                      {cfg.label}
                    </span>
                    <div style={{ fontSize: '9px', color: 'var(--col-mist-dim)', marginTop: '4px', textAlign: 'center', opacity: 0.6 }}>
                      {rec.category}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--col-mist-dim)', flex: 1 }}>
                    {rec.action}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── SECTION 7: Score breakdown ── */}
      <ScoreBreakdown result={result} />

      {/* ── SECTION 8: Risk word highlighter ── */}
      <RiskWordHighlighter
        originalText={result._original_text}
        result={result}
      />

      {/* ── SECTION 9: What-if simulator ── */}
      <WhatIfSimulator result={result} />

      {/* ── SECTION 10: Provenance panel ── */}
      <ProvenancePanel provenance={result.provenance} />

      {/* ── Disclaimer ── */}
      <p className="disclaimer">
        ⚕️ {result.disclaimer}
      </p>

    </div>
  )
}

// ── Detected signals sub-component ───────────────────────────────────────────

function DetectedSignals({ ef }) {
  const features = [
    {
      icon: '😴', label: 'Sleep',
      val:  `${ef.sleep_hours}h`,
      sub:  ef.sleep_hours >= 7 ? 'Healthy range' : ef.sleep_hours < 5 ? 'Severely low' : 'Below optimal',
      flag: ef.sleep_hours < 6,
    },
    {
      icon: '🚬', label: 'Smoking',
      val:  ef.smoking_detected ? 'Detected' : 'None',
      sub:  ef.smoking_detected ? 'Risk signal present' : 'No signals',
      flag: ef.smoking_detected,
    },
    {
      icon: '🍺', label: 'Alcohol',
      val:  ef.alcohol_detected ? 'Detected' : 'None',
      sub:  ef.alcohol_detected ? 'Risk signal present' : 'No signals',
      flag: ef.alcohol_detected,
    },
    {
      icon: '🧠', label: 'Stress',
      val:  `${Math.round(ef.stress_score * 100)}%`,
      sub:  ef.stress_score > 0.6 ? 'High load' : ef.stress_score > 0.35 ? 'Moderate' : 'Low',
      flag: ef.stress_score > 0.45,
    },
    {
      icon: '🥗', label: 'Diet',
      val:  ef.diet_label?.replace(/_/g, ' ') || '—',
      sub:  'Dietary pattern',
      flag: ef.diet_label?.includes('poor'),
    },
    {
      icon: '🏃', label: 'Exercise',
      val:  ef.exercise_label || '—',
      sub:  'Activity level',
      flag: ef.exercise_label === 'none' || ef.exercise_label === 'sedentary',
    },
    {
      icon: '💭', label: 'Sentiment',
      val:  ef.sentiment_label || '—',
      sub:  'Emotional tone',
      flag: ef.sentiment_label === 'negative',
    },
  ]

  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap:                 '8px',
    }}>
      {features.map(f => (
        <div key={f.label} style={{
          background:    f.flag ? 'var(--col-crimson-dim)' : 'var(--col-base-deep)',
          border:        `1px solid ${f.flag ? 'rgba(171,35,70,0.22)' : 'var(--col-base-border)'}`,
          borderRadius:  '10px',
          padding:       '12px 8px',
          textAlign:     'center',
          transition:    'border-color 0.2s',
        }}>
          <div style={{ fontSize: '18px', marginBottom: '5px' }}>{f.icon}</div>
          <div style={{
            fontSize:   '13px',
            fontWeight: '600',
            color:      f.flag ? 'var(--col-crimson)' : 'var(--col-mist)',
          }}>
            {f.val}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--col-mist-dim)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {f.label}
          </div>
          <div style={{
            fontSize:  '9px',
            color:     f.flag ? 'var(--col-crimson)' : 'var(--col-mist-dim)',
            marginTop: '2px',
            opacity:   0.5,
          }}>
            {f.sub}
          </div>
        </div>
      ))}
    </div>
  )
}