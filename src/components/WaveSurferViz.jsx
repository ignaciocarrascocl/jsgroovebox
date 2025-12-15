import { useEffect, useMemo, useRef } from 'react'
import './WaveSurferViz.css'

// Live waveform visualizer for a WebAudio node.
// Contract:
// - inputNode: WebAudio AudioNode (e.g. Tone.Destination.input)
// - isActive: boolean (adds a subtle glow)
// - color: string (wave + progress)
// - name/onClick: used by the track header UI
// Notes:
// Note:
// wavesurfer.js is great for file-backed waveforms, but its core path decodes audio data.
// For a live node (no URL / no finite buffer), decodeAudioData can throw EncodingError.
// So this component uses an AnalyserNode + canvas to render in real-time.

const makeSafeColor = (c) => (typeof c === 'string' && c.trim() ? c : '#ffffff')

const WaveSurferViz = ({ inputNode, isActive = false, color, name, onClick, height = 46 }) => {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)

  const waveColor = useMemo(() => {
    const col = makeSafeColor(color)
    // Slightly more transparent when inactive.
    return isActive ? col : col
  }, [color, isActive])

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    if (!inputNode) return

    const canvas = canvasRef.current
    if (!canvas) return

    // teardown previous wiring
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (sourceRef.current && analyserRef.current) {
      try {
        sourceRef.current.disconnect(analyserRef.current)
      } catch {
        // ignore
      }
    }
    sourceRef.current = null
    analyserRef.current = null

    const audioContext = inputNode.context
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.85
    analyserRef.current = analyser

    try {
      inputNode.connect(analyser)
      sourceRef.current = inputNode
    } catch {
      return
    }

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const buf = new Uint8Array(analyser.fftSize)
    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (!w || !h) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      analyser.getByteTimeDomainData(buf)

      // background
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(0,0,0,0.20)'
      ctx.fillRect(0, 0, w, h)

      const cy = h / 2
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(w, cy)
      ctx.stroke()

      // waveform
      ctx.strokeStyle = waveColor
      ctx.lineWidth = 2
      ctx.shadowColor = waveColor
      ctx.shadowBlur = isActive ? 12 : 4

      ctx.beginPath()
      const step = Math.max(1, Math.floor(buf.length / w))
      for (let i = 0, x = 0; i < buf.length; i += step, x++) {
        const v = (buf[i] - 128) / 128
        const y = cy + v * (h * 0.38)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      if (sourceRef.current && analyserRef.current) {
        try {
          sourceRef.current.disconnect(analyserRef.current)
        } catch {
          // ignore
        }
      }
      sourceRef.current = null
      analyserRef.current = null
    }
  }, [inputNode, height, waveColor, isActive])

  return (
    <div className={`ws-viz ${isActive ? 'active' : ''}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div ref={hostRef} className="ws-viz-wave">
        <canvas ref={canvasRef} className="ws-viz-canvas" style={{ height, width: '100%' }} />
      </div>
      {name ? <span className="ws-viz-name">{name}</span> : null}
      {isActive ? <div className="ws-viz-active-indicator" style={{ backgroundColor: makeSafeColor(color) }} /> : null}
    </div>
  )
}

export default WaveSurferViz
