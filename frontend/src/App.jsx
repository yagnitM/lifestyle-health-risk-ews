import React, { useState } from 'react'
import './App.css'
import TextInput       from './components/TextInput'
import RiskResult      from './components/RiskResult'
import ModelScores     from './components/ModelScores'
import FactorsPanel    from './components/FactorsPanel'
import Recommendations from './components/Recommendations'
import LoadingSpinner  from './components/LoadingSpinner'

const API_BASE = 'http://localhost:8000'

export default function App() {
  const [result,    setResult]    = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState(null)

  const handleSubmit = async (text) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({ text, use_sbert: false }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResult(data)

      // Scroll to results smoothly
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (err) {
      setError(err.message || 'Failed to connect to API. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-badge">B.Tech Capstone Project</div>
        <h1>Early Warning System<br />for Lifestyle Health Risks</h1>
        <p>
          Enter a description of your lifestyle or health situation.
          Our multi-model AI system will assess your risk level and
          provide personalised recommendations.
        </p>
      </header>

      <main className="main-container">

        {/* Input */}
        <TextInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <div style={{
            background   : 'rgba(231,76,60,0.1)',
            border       : '1px solid rgba(231,76,60,0.3)',
            borderRadius : '16px',
            padding      : '16px 20px',
            color        : '#e74c3c',
            fontSize     : '14px',
            marginBottom : '20px',
            display      : 'flex', gap: '10px', alignItems: 'center',
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <strong>Error: </strong>{error}
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#aa5555' }}>
                Make sure the backend is running: <code>uvicorn main:app --reload --port 8000</code>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="card">
            <LoadingSpinner message="Running multi-model analysis..." />
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div id="results">
            <RiskResult      result={result} />
            <ModelScores     modelScores={result.model_scores}
                             ensembleProb={result.ensemble_probability} />
            <FactorsPanel    factors={result.contributing_factors}
                             extractedFeatures={result.extracted_features} />
            <Recommendations recommendations={result.recommendations} />

            <div className="disclaimer">
              ⚕️ {result.disclaimer}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}