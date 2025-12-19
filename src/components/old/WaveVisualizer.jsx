import { useRef, useEffect } from 'react'
import './WaveVisualizer.css'

// Waveform shapes for different instruments
const WAVEFORMS = {
  kick: (t, phase) => {
    // Punchy sine wave with decay
    const decay = Math.exp(-t * 3)
    return Math.sin(phase * 2 + t * 8) * decay
  },
  snare: (t, phase) => {
    // Noise-like with transient
    const noise = Math.sin(phase * 50) * Math.sin(phase * 33) * Math.sin(phase * 17)
    const decay = Math.exp(-t * 4)
    return noise * decay
  },
  hihat: (t, phase) => {
    // High frequency metallic
    const noise = Math.sin(phase * 80) * Math.sin(phase * 67) * Math.sin(phase * 41)
    return noise * 0.6
  },
  openhat: (t, phase) => {
    // Similar to hihat but with longer sustain
    const noise = Math.sin(phase * 60) * Math.sin(phase * 47)
    return noise * 0.5
  },
  bass: (t, phase) => {
    // Sawtooth-ish bass
    const saw = (phase % 1) * 2 - 1
    return saw * 0.7
  }
}

const WaveVisualizer = ({ type = 'kick', color, isActive, name, onClick }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const phaseRef = useRef(0)
  const activeTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerY = height / 2

    const getWaveform = WAVEFORMS[type] || WAVEFORMS.kick

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, width, height)

      // Update phase
      phaseRef.current += 0.08
      
      // Update active time
      if (isActive) {
        activeTimeRef.current = 0
      } else {
        activeTimeRef.current += 0.016
      }

      const t = activeTimeRef.current
      const intensity = isActive ? 1 : Math.max(0.15, Math.exp(-t * 2))
      
      // Draw waveform
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur = isActive ? 15 : 5

      const segments = 64
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width
        const phase = phaseRef.current + (i / segments) * Math.PI * 4
        const y = centerY + getWaveform(t, phase) * (height * 0.35) * intensity
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // Draw center line (faint)
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.shadowBlur = 0
      ctx.moveTo(0, centerY)
      ctx.lineTo(width, centerY)
      ctx.stroke()

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [type, color, isActive])

  return (
    <div className="wave-visualizer" onClick={onClick}>
      <canvas ref={canvasRef} className="wave-canvas" />
      <span className="wave-name">{name}</span>
      {isActive && <div className="wave-active-indicator" style={{ backgroundColor: color }} />}
    </div>
  )
}

export default WaveVisualizer
