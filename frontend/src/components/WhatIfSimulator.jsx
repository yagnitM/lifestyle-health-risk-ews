import React, { useState } from 'react'

const CLINICAL_WEIGHTS = {
  smoking  : 0.28,
  sleep    : 0.24,
  stress   : 0.20,
  alcohol  : 0.14,
  diet     : 0.08,
  exercise : 0.06,
}

const TEXT_WEIGHT    = 0.50
const FEATURE_WEIGHT = 0.50

function computeFeatureScore(sim) {
  const sleepRisk    = Math.max(0, Math.min(1, (7.0 - sim.sleep) / 4.0))
  const smokingRisk  = sim.smoking  ? 0.90 : 0.0
  const alcoholRisk  = sim.alcohol  ? 0.60 : 0.0
  const stressRisk   = Math.min(1, sim.stress)
  const dietRisk     = [0.0, 0.20, 0.70][sim.diet] ?? 0.20
  const exerciseRisk = [0.60, 0.30, 0.10, 0.0][sim.exercise] ?? 0.30

  return (
    CLINICAL_WEIGHTS.smoking  * smokingRisk  +
    CLINICAL_WEIGHTS.sleep    * sleepRisk    +
    CLINICAL_WEIGHTS.stress   * stressRisk   +
    CLINICAL_WEIGHTS.alcohol  * alcoholRisk  +
    CLINICAL_WEIGHTS.diet     * dietRisk     +
    CLINICAL_WEIGHTS.exercise * exerciseRisk
  )
}

function applyOverride(score, sim) {
  let signals = 0
  if (sim.smoking)            signals += 1
  if (sim.alcohol)            signals += 1
  if (sim.sleep < 5)          signals += 1
  else if (sim.sleep < 6)     signals += 0.5
  if (sim.stress > 0.60)      signals += 1
  else if (sim.stress > 0.40) signals += 0.5
  signals = Math.round(signals)

  if (signals >= 3 && score < 0.75) return 0.75
  if (signals >= 2 && score < 0.55) return 0.55
  return score
}

function getRiskLevel(score) {
  if (score >= 0.75) return { level: 'HIGH',     color: 'var(--col-crimson)' }
  if (score >= 0.50) return { level: 'MEDIUM',   color: '#c97a1a'            }
  if (score >= 0.25) return { level: 'LOW',       color: 'var(--col-teal)'   }
  return               { level: 'VERY LOW',   color: 'var(--col-teal)'   }
}

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--col-mist-dim)' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--col-mist)' }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--col-teal)', cursor: 'pointer' }}
      />
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   '14px',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--col-mist-dim)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width:         '44px',
          height:        '22px',
          borderRadius:  '99px',
          border:        'none',
          background:    value ? 'var(--col-teal)' : 'var(--col-mist-ghost)',
          cursor:        'pointer',
          position:      'relative',
          transition:    'background 0.2s',
          flexShrink:    0,
        }}
      >
        <span style={{
          position:      'absolute',
          top:           '3px',
          left:          value ? '25px' : '3px',
          width:         '16px',
          height:        '16px',
          borderRadius:  '50%',
          background:    '#fff',
          transition:    'left 0.2s',
        }} />
      </button>
    </div>
  )
}

export default function WhatIfSimulator({ result }) {
  if (!result) return null

  const ef = result.extracted_features

  const [sim, setSim] = useState({
    sleep   : ef.sleep_hours     ?? 7,
    smoking : ef.smoking_detected ?? false,
    alcohol : ef.alcohol_detected ?? false,
    stress  : ef.stress_score    ?? 0.3,
    diet    : ef.diet_quality    ?? 1,
    exercise: ef.exercise_level  ?? 1,
  })

  const [originalFeatureScore] = useState(() => {
    const fs = computeFeatureScore({
      sleep   : ef.sleep_hours     ?? 7,
      smoking : ef.smoking_detected ?? false,
      alcohol : ef.alcohol_detected ?? false,
      stress  : ef.stress_score    ?? 0.3,
      diet    : ef.diet_quality    ?? 1,
      exercise: ef.exercise_level  ?? 1,
    })
    return applyOverride(fs, {
      sleep   : ef.sleep_hours     ?? 7,
      smoking : ef.smoking_detected ?? false,
      alcohol : ef.alcohol_detected ?? false,
      stress  : ef.stress_score    ?? 0.3,
    })
  })

  const textScore              = result.text_score ?? result.ensemble_probability
  const simFeatureScore        = computeFeatureScore(sim)
  const simFeatureWithOverride = applyOverride(simFeatureScore, sim)
  const simFinalScore          = Math.round(
    (TEXT_WEIGHT * textScore + FEATURE_WEIGHT * simFeatureWithOverride) * 100
  )
  const originalFinal = Math.round(result.ensemble_probability * 100)
  const delta         = simFinalScore - originalFinal
  const riskInfo      = getRiskLevel(simFinalScore / 100)

  const update = (key) => (val) => setSim(prev => ({ ...prev, [key]: val }))

  const reset = () => setSim({
    sleep   : ef.sleep_hours     ?? 7,
    smoking : ef.smoking_detected ?? false,
    alcohol : ef.alcohol_detected ?? false,
    stress  : ef.stress_score    ?? 0.3,
    diet    : ef.diet_quality    ?? 1,
    exercise: ef.exercise_level  ?? 1,
  })

  return (
    <div className="card" style={{
      border:     '1px solid rgba(0,178,149,0.20)',
      background: 'var(--col-teal-dim)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="card-label" style={{ margin: 0 }}>What-If Simulator</div>
        <button
          onClick={reset}
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
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* LEFT — Controls */}
        <div>
          <p style={{ fontSize: '11px', color: 'var(--col-mist-dim)', marginBottom: '16px', lineHeight: '1.6', opacity: 0.7 }}>
            Adjust lifestyle factors to see how your risk score would change.
          </p>

          <Slider
            label="Sleep Hours"
            value={sim.sleep}
            min={3} max={10} step={0.5}
            onChange={update('sleep')}
            format={v => `${v}h`}
          />

          <Slider
            label="Stress Level"
            value={sim.stress}
            min={0} max={1} step={0.05}
            onChange={update('stress')}
            format={v => `${Math.round(v * 100)}%`}
          />

          <Toggle label="Smoking"     value={sim.smoking} onChange={update('smoking')} />
          <Toggle label="Alcohol Use" value={sim.alcohol} onChange={update('alcohol')} />

          {/* Diet selector */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--col-mist-dim)', marginBottom: '6px' }}>Diet Quality</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Healthy', 'Neutral', 'Poor'].map((label, i) => {
                const val      = i === 0 ? 0 : i === 1 ? 1 : 2
                const isActive = sim.diet === val
                return (
                  <button
                    key={label}
                    onClick={() => update('diet')(val)}
                    style={{
                      flex:          1,
                      padding:       '6px 4px',
                      borderRadius:  '6px',
                      border:        `1px solid ${isActive ? 'var(--col-teal)' : 'var(--col-base-border)'}`,
                      background:    isActive ? 'var(--col-teal-dim)' : 'transparent',
                      color:         isActive ? 'var(--col-teal)' : 'var(--col-mist-dim)',
                      fontSize:      '11px',
                      cursor:        'pointer',
                      fontFamily:    'var(--font-ui)',
                      fontWeight:    isActive ? '700' : '400',
                      transition:    'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Exercise selector */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--col-mist-dim)', marginBottom: '6px' }}>Exercise Level</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['None', 'Low', 'Medium', 'High'].map((label, i) => {
                const isActive = sim.exercise === i
                return (
                  <button
                    key={label}
                    onClick={() => update('exercise')(i)}
                    style={{
                      flex:          1,
                      padding:       '6px 2px',
                      borderRadius:  '6px',
                      border:        `1px solid ${isActive ? 'var(--col-teal)' : 'var(--col-base-border)'}`,
                      background:    isActive ? 'var(--col-teal-dim)' : 'transparent',
                      color:         isActive ? 'var(--col-teal)' : 'var(--col-mist-dim)',
                      fontSize:      '10px',
                      cursor:        'pointer',
                      fontFamily:    'var(--font-ui)',
                      fontWeight:    isActive ? '700' : '400',
                      transition:    'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — Live score */}
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'var(--col-base-deep)',
          border:         '1px solid var(--col-base-border)',
          borderRadius:   '12px',
          padding:        '24px 16px',
          gap:            '12px',
        }}>
          {/* Live gauge */}
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg width="120" height="120" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="46"
                fill="none" stroke="var(--col-mist-ghost)" strokeWidth="8" />
              <circle cx="55" cy="55" r="46"
                fill="none"
                stroke={riskInfo.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - simFinalScore / 100)}
                style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
              />
            </svg>
            <div style={{
              position:   'absolute', inset: 0,
              display:    'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize:      '26px',
                fontWeight:    '500',
                fontFamily:    'var(--font-mono)',
                color:         riskInfo.color,
                letterSpacing: '-1.5px',
                transition:    'color 0.3s',
              }}>
                {simFinalScore}%
              </span>
              <span style={{ fontSize: '8px', color: 'var(--col-mist-dim)', letterSpacing: '2px' }}>RISK</span>
            </div>
          </div>

          {/* Risk badge */}
          <span style={{
            fontSize:      '12px',
            fontWeight:    '700',
            color:         riskInfo.color,
            background:    `${riskInfo.color}14`,
            padding:       '5px 14px',
            borderRadius:  '6px',
            border:        `1px solid ${riskInfo.color}28`,
            letterSpacing: '0.5px',
          }}>
            {riskInfo.level}
          </span>

          {/* Delta */}
          <div style={{
            fontSize:   '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: '600',
            color:      delta === 0 ? 'var(--col-mist-dim)'
                      : delta > 0  ? 'var(--col-crimson)'
                      :               'var(--col-teal)',
          }}>
            {delta === 0 ? 'No change'
             : delta > 0 ? `▲ +${delta}% from original`
             :             `▼ ${delta}% from original`}
          </div>

          <div style={{ fontSize: '10px', color: 'var(--col-mist-dim)', textAlign: 'center', opacity: 0.45, fontFamily: 'var(--font-mono)' }}>
            Original score: {originalFinal}%
          </div>
        </div>
      </div>

      <p style={{
        fontSize:   '10px',
        color:      'var(--col-mist-dim)',
        marginTop:  '16px',
        lineHeight: '1.6',
        borderTop:  '1px solid var(--col-base-border)',
        paddingTop: '12px',
        opacity:    0.5,
        fontFamily: 'var(--font-mono)',
      }}>
        Text model score ({Math.round(textScore * 100)}%) remains fixed — it reflects
        your original submission. Only the clinical feature score updates as you adjust
        lifestyle factors. This is one-way sensitivity analysis on the feature-based
        scoring layer.
      </p>
    </div>
  )
}