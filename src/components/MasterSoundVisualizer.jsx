import { useEffect, useMemo, useRef } from 'react'

const makeSafeColor = (c) => (typeof c === 'string' && c.trim() ? c : 'rgba(255,255,255,0.90)')

// Live master visualizer using AnalyserNode + canvas.
// Contract:
// - inputNode: WebAudio AudioNode (Tone node also works because it implements .connect())
// - height: number (px)
// - strokeColor: string
// This avoids MediaStream + state updates loops.

const MasterSoundVisualizer = ({
  inputNode,
  height = 80,
  strokeColor = 'rgba(255,255,255,0.90)',
  isActive = true,
}) => {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)

  const color = useMemo(() => makeSafeColor(strokeColor), [strokeColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!inputNode) return

    // Cleanup previous
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (sourceRef.current && analyserRef.current) {
      try {
        sourceRef.current.disconnect(analyserRef.current)
      } catch {
        // ignore
      }
    }

    const audioContext = inputNode.context
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048
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

      // bg
      ctx.clearRect(0, 0, w, h)
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, 'rgba(0,0,0,0.18)')
      bg.addColorStop(1, 'rgba(0,0,0,0.50)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // midline
      const cy = h / 2
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(w, cy)
      ctx.stroke()

      // waveform
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur = isActive ? 14 : 6

      ctx.beginPath()
      const step = Math.max(1, Math.floor(buf.length / w))
      for (let i = 0, x = 0; i < buf.length; i += step, x++) {
        const v = (buf[i] - 128) / 128
        const y = cy + v * (h * 0.42)
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
  }, [inputNode, color, isActive])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: `${height}px`,
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: isActive ? '0 0 18px rgba(255,255,255,0.10)' : 'none',
      }}
    />
  )
}

export default MasterSoundVisualizer
