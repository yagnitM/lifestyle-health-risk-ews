import React, { useState } from 'react'

function Row({ label, value, mono, color }) {
  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'flex-start',
      padding:        '6px 0',
      borderBottom:   '1px solid var(--col-mist-ghost)',
      gap:            '12px',
    }}>
      <span style={{
        fontSize:   '11px',
        color:      'var(--col-mist-dim)',
        flexShrink: 0,
        minWidth:   '160px',
        opacity:    0.7,
      }}>
        {label}
      </span>
      <span style={{
        fontSize:   '11px',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        color:      color ?? 'var(--col-mist-dim)',
        textAlign:  'right',
        wordBreak:  'break-word',
      }}>
        {value}
      </span>
    </div>
  )
}

function CoverageGrid({ coverage }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap:                 '5px',
      marginTop:           '8px',
    }}>
      {Object.entries(coverage).map(([key, found]) => (
        <div key={key} style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '6px',
          background:   found ? 'var(--col-teal-dim)' : 'var(--col-mist-ghost)',
          border:       `1px solid ${found ? 'rgba(0,178,149,0.15)' : 'var(--col-base-border)'}`,
          borderRadius: '5px',
          padding:      '5px 8px',
        }}>
          <span style={{
            fontSize:   '11px',
            color:      found ? 'var(--col-teal)' : 'var(--col-mist-dim)',
            fontWeight: '600',
            opacity:    found ? 1 : 0.4,
          }}>
            {found ? '✓' : '–'}
          </span>
          <span style={{
            fontSize: '10px',
            color:    found ? 'var(--col-mist-dim)' : 'var(--col-mist-dim)',
            opacity:  found ? 0.8 : 0.35,
          }}>
            {key.replace(/_/g, ' ')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ProvenancePanel({ provenance }) {
  const [open, setOpen] = useState(false)

  if (!provenance) return null

  const sb = provenance.score_breakdown ?? {}
  const sm = provenance.scoring_method  ?? {}

  return (
    <div className="card" style={{ padding: '0' }}>

      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width:          '100%',
          background:     'transparent',
          border:         'none',
          padding:        '18px 24px',
          cursor:         'pointer',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          fontFamily:     'var(--font-ui)',
          borderRadius:   '16px',
          transition:     'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--col-mist-ghost)'}
        onMouseOut={e  => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize:      '10px',
            fontWeight:    '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color:         'var(--col-mist-dim)',
          }}>
            How Was This Calculated?
          </span>
          <span style={{
            fontSize:     '9px',
            background:   'var(--col-teal-dim)',
            color:        'var(--col-teal)',
            padding:      '2px 8px',
            borderRadius: '4px',
            border:       '1px solid rgba(0,178,149,0.18)',
            fontFamily:   'var(--font-mono)',
          }}>
            Provenance
          </span>
        </div>
        <span style={{ color: 'var(--col-mist-dim)', fontSize: '11px', opacity: 0.5 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Collapsible body */}
      {open && (
        <div style={{
          padding:   '0 24px 24px',
          borderTop: '1px solid var(--col-base-border)',
        }}>

          {/* Scoring method */}
          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <div style={{
              fontSize:      '9px',
              fontWeight:    '700',
              color:         'var(--col-teal)',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom:  '8px',
            }}>
              Scoring Method
            </div>
            <Row label="Text model"    value={sm.text_model    ?? '—'} />
            <Row label="Feature model" value={sm.feature_model ?? '—'} />
            <Row label="Final blend"   value={sm.final_blend   ?? '—'} mono />
          </div>

          {/* Score derivation */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize:      '9px',
              fontWeight:    '700',
              color:         'var(--col-teal)',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom:  '8px',
            }}>
              Score Derivation
            </div>
            <Row label="Text model score"       value={`${Math.round((sb.text_model_score    ?? 0) * 100)}%`} mono />
            <Row label="Feature model score"    value={`${Math.round((sb.feature_model_score ?? 0) * 100)}%`} mono />
            <Row label="Blended (pre-override)" value={`${Math.round((sb.pre_override        ?? 0) * 100)}%`} mono />
            {sb.overrides_applied?.length > 0 && (
              <Row
                label="Override applied"
                value={sb.overrides_applied.join('; ')}
                color="#c97a1a"
              />
            )}
            <Row
              label="Final score"
              value={`${Math.round((sb.final_score ?? 0) * 100)}%`}
              mono
              color="var(--col-mist)"
            />
          </div>

          {/* Rules fired */}
          {provenance.rules_fired?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize:      '9px',
                fontWeight:    '700',
                color:         'var(--col-teal)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom:  '8px',
              }}>
                Rules Fired
              </div>
              {provenance.rules_fired.map((r, i) => (
                <div key={i} style={{
                  background:   'var(--col-base-deep)',
                  borderRadius: '6px',
                  padding:      '8px 12px',
                  marginBottom: '5px',
                  display:      'flex',
                  gap:          '10px',
                  alignItems:   'flex-start',
                  border:       '1px solid var(--col-base-border)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize:   '12px',
                    color:      'var(--col-crimson)',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}>
                    {r.contribution}
                  </span>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--col-mist-dim)', fontFamily: 'var(--font-mono)' }}>
                      {r.rule}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--col-mist-dim)', marginTop: '2px', opacity: 0.6 }}>
                      {r.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Extraction coverage */}
          {provenance.extraction_coverage && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                marginBottom:   '4px',
              }}>
                <div style={{
                  fontSize:      '9px',
                  fontWeight:    '700',
                  color:         'var(--col-teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}>
                  Feature Extraction Coverage
                </div>
                <span style={{
                  fontSize:   '10px',
                  fontFamily: 'var(--font-mono)',
                  color:      provenance.extraction_confidence === 'high'   ? 'var(--col-teal)'
                            : provenance.extraction_confidence === 'medium' ? '#c97a1a'
                            :                                                  'var(--col-crimson)',
                }}>
                  {provenance.features_extracted} extracted
                  &nbsp;·&nbsp;
                  {provenance.extraction_confidence} confidence
                </span>
              </div>
              <CoverageGrid coverage={provenance.extraction_coverage} />
            </div>
          )}

          {/* Low confidence warning */}
          {provenance.low_confidence_reason && (
            <div style={{
              background:   'rgba(201,122,26,0.08)',
              border:       '1px solid rgba(201,122,26,0.22)',
              borderRadius: '8px',
              padding:      '10px 14px',
              marginBottom: '12px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#c97a1a', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Low Extraction Confidence
              </div>
              <p style={{ fontSize: '11px', color: 'var(--col-mist-dim)', lineHeight: '1.5' }}>
                {provenance.low_confidence_reason}
              </p>
            </div>
          )}

          {/* Source note */}
          <p style={{ fontSize: '9px', color: 'var(--col-mist-dim)', lineHeight: '1.5', opacity: 0.4, fontFamily: 'var(--font-mono)' }}>
            Clinical weights source: {provenance.clinical_weights_source}
          </p>
        </div>
      )}
    </div>
  )
}