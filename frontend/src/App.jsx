import React, { useState } from 'react'
import './App.css'
import TextInput        from './components/TextInput'
import NarrativeReport  from './components/NarrativeReport'
import LoadingSpinner   from './components/LoadingSpinner'
import SidePanel        from './components/SidePanel'

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
      data._original_text = text
      setResult(data)
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
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">🛡️</div>
            <span className="logo-text">RiskAware</span>
          </div>
          <div className="header-sub">
            Early Warning System for Lifestyle Health Risks
          </div>
        </div>
        <div className="header-stats">
          {[
            { val: '19,080', label: 'Training Posts' },
            { val: '94.9%',  label: 'Model Accuracy' },
            { val: '3',      label: 'Model Ensemble' },
          ].map(s => (
            <div className="stat" key={s.label}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <main className="main-layout">
        <div className="left-col">
          <TextInput onSubmit={handleSubmit} isLoading={isLoading} />

          {error && (
            <div className="error-box">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Connection Error: </strong>{error}
                <div className="error-hint">
                  Start the backend: <code>uvicorn main:app --reload --port 8000</code>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="card">
              <LoadingSpinner message="Running multi-model analysis…" />
            </div>
          )}

          {result && !isLoading && (
            <div id="results">
              <NarrativeReport result={result} />
            </div>
          )}
        </div>

        <aside className="right-col">
          <SidePanel result={result} />
        </aside>
      </main>
    </div>
  )
}