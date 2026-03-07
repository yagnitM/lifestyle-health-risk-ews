import React from 'react'

const style = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    gap: '16px',
  },
  ring: {
    width: '52px',
    height: '52px',
    border: '4px solid rgba(108,99,255,0.2)',
    borderTopColor: '#6c63ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    color: '#8888aa',
    fontSize: '14px',
    letterSpacing: '0.5px',
  },
}

export default function LoadingSpinner({ message = 'Analysing your text...' }) {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={style.wrapper}>
        <div style={style.ring} />
        <p style={style.text}>{message}</p>
      </div>
    </>
  )
}