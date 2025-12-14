import { useRef, useCallback } from 'react'
import './Fader.css'

const Fader = ({ label, value, min, max, onChange, color }) => {
  const faderRef = useRef(null)
  const isDragging = useRef(false)

  const calculateValue = useCallback((clientY) => {
    if (!faderRef.current) return value
    const rect = faderRef.current.getBoundingClientRect()
    const percentage = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    return min + percentage * (max - min)
  }, [min, max, value])

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true
    const newValue = calculateValue(e.clientY)
    onChange(newValue)

    const handleMouseMove = (e) => {
      if (isDragging.current) {
        const newValue = calculateValue(e.clientY)
        onChange(newValue)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [calculateValue, onChange])

  const percentage = ((value - min) / (max - min)) * 100

  // Convert dB value to display
  const displayValue = label === 'Vol' 
    ? (value <= -60 ? '-∞' : `${Math.round(value)}`) 
    : Math.round(value * 100) / 100

  return (
    <div className="fader-container">
      <span className="fader-label">{label}</span>
      <div 
        ref={faderRef}
        className="fader-track"
        onMouseDown={handleMouseDown}
      >
        <div 
          className="fader-fill"
          style={{ 
            height: `${percentage}%`,
            '--fader-color': color 
          }}
        />
        <div 
          className="fader-handle"
          style={{ 
            bottom: `${percentage}%`,
            '--fader-color': color 
          }}
        />
      </div>
      <span className="fader-value">{displayValue}</span>
    </div>
  )
}

export default Fader
