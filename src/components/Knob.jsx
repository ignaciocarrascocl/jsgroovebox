import { useRef, useEffect, useCallback } from 'react'
import './Knob.css'

const Knob = ({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  step,
  onChange, 
  color = '#667eea',
  size = 48,
  displayValue: customDisplayValue,
  unit, // optional unit label e.g. 'Hz', 'dB', 'ms'
  tooltip, // optional tooltip text
}) => {
  const canvasRef = useRef(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startValue = useRef(0)

  const normalizedValue = ((value - min) / (max - min))
  const rotation = normalizedValue * 270 - 135 // -135 to 135 degrees

  // Draw knob on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 4

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw outer ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw value arc
    const startAngle = -135 * Math.PI / 180
    const endAngle = (rotation) * Math.PI / 180
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    // Draw inner circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 8, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(20, 20, 35, 0.95)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw indicator line
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation * Math.PI / 180)
    ctx.beginPath()
    ctx.moveTo(0, -radius + 12)
    ctx.lineTo(0, -radius + 20)
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.restore()

  }, [size, rotation, color])

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true
    startY.current = e.clientY
    startValue.current = value
    document.body.style.cursor = 'ns-resize'
    e.preventDefault()
  }, [value])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    
    const deltaY = startY.current - e.clientY
    const range = max - min
    const sensitivity = range / 150
    let newValue = startValue.current + (deltaY * sensitivity)
    
    // Apply step if specified
    if (step !== undefined) {
      newValue = Math.round(newValue / step) * step
    }
    
    const clampedValue = Math.max(min, Math.min(max, newValue))
    
    onChange(clampedValue)
  }, [min, max, step, onChange])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
  }, [])

  const handleDoubleClick = useCallback(() => {
    const defaultValue = min < 0 ? 0 : (max + min) / 2
    onChange(defaultValue)
  }, [min, max, onChange])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Format display value
  const formatDisplayValue = () => {
    // Use custom display value if provided
    if (customDisplayValue !== undefined) {
      return customDisplayValue
    }
    
    if (max >= 1000) {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value)
    }
    if (max <= 1) {
      return value.toFixed(2)
    }
    if (max <= 10) {
      return value.toFixed(1)
    }
    return Math.round(value)
  }

  return (
    <div className="knob-wrapper" title={tooltip || (unit ? `${label} (${unit})` : undefined)}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="knob-canvas"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}> 
        <span className="knob-value">{formatDisplayValue()}</span>
        {unit ? <span className="knob-unit">{unit}</span> : null}
      </div>
      <span className="knob-label">{label}</span>
    </div>
  )
}

export default Knob
