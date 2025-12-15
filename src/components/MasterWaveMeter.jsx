import { useEffect, useRef } from 'react'
import './MasterWaveMeter.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

const dbToPercent = (db) => {
  // Map -60..0 dB => 0..100
  const d = Number.isFinite(db) ? db : -Infinity
  return clamp(((d + 60) / 60) * 100, 0, 100)
}

const MasterWaveMeter = ({ waveform, peakDb, rmsDb }) => {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const cy = h / 2

      // safety: if hidden (w/h=0) skip this frame
      if (!w || !h) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, w, h)

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, 'rgba(0,0,0,0.20)')
      bg.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // mid + rails
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(w, cy)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.beginPath()
      ctx.moveTo(0, cy - h * 0.25)
      ctx.lineTo(w, cy - h * 0.25)
      ctx.moveTo(0, cy + h * 0.25)
      ctx.lineTo(w, cy + h * 0.25)
      ctx.stroke()

      const data = Array.isArray(waveform) ? waveform : []
      if (data.length > 1) {
        // normalize local max to keep it readable even at low levels
        let maxAbs = 0
        for (let i = 0; i < data.length; i++) {
          const a = Math.abs(data[i])
          if (a > maxAbs) maxAbs = a
        }
        const norm = maxAbs > 1e-4 ? 1 / maxAbs : 1
        const amp = h * 0.42

        // glow
        ctx.save()
        ctx.shadowColor = 'rgba(255,255,255,0.20)'
        ctx.shadowBlur = 10
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 3
        ctx.beginPath()
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * w
          const y = cy + data[i] * norm * amp
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()

        // main line
        ctx.strokeStyle = 'rgba(255,255,255,0.90)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * w
          const y = cy + data[i] * norm * amp
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // clipping indicator
      if ((peakDb ?? -Infinity) >= -0.2) {
        ctx.fillStyle = 'rgba(239,68,68,0.85)'
        ctx.fillRect(w - 8, 0, 8, h)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [waveform, peakDb])

  return (
    <div className="master-wave-meter">
      <div className="mwm-top">
        <div className="mwm-title">OUTPUT</div>
        <div className="mwm-readouts">
          <div className={`mwm-readout ${peakDb > -0.2 ? 'hot' : ''}`}>
            <div className="mwm-readout-label">Peak</div>
            <div className="mwm-readout-value">{Number.isFinite(peakDb) ? `${peakDb.toFixed(1)} dB` : '—'}</div>
          </div>
          <div className="mwm-readout">
            <div className="mwm-readout-label">RMS</div>
            <div className="mwm-readout-value">{Number.isFinite(rmsDb) ? `${rmsDb.toFixed(1)} dB` : '—'}</div>
          </div>
        </div>
      </div>

      <div className="mwm-metrics">
        <div className="mwm-metric">
          <div className="mwm-metric-head">
            <div className="mwm-metric-name">Peak</div>
            <div className="mwm-metric-hint">Evitá clipping (bajo 0.0)</div>
          </div>
          <div className="mwm-bar" aria-label="Barra Peak">
            <div className="mwm-bar-markers" aria-hidden="true">
              {[-48, -24, -12, -6, -3, 0].map((db) => (
                <div key={db} className={`mwm-bar-marker ${db === 0 ? 'zero' : ''}`} style={{ left: `${dbToPercent(db)}%` }} />
              ))}
            </div>
            <div className="mwm-bar-fill mwm-bar-peak" style={{ width: `${dbToPercent(peakDb)}%` }} />
          </div>
        </div>

        <div className="mwm-metric">
          <div className="mwm-metric-head">
            <div className="mwm-metric-name">RMS</div>
            <div className="mwm-metric-hint">Densidad promedio</div>
          </div>
          <div className="mwm-bar" aria-label="Barra RMS">
            <div className="mwm-bar-markers" aria-hidden="true">
              {[-48, -24, -12, -6, -3, 0].map((db) => (
                <div key={db} className={`mwm-bar-marker ${db === 0 ? 'zero' : ''}`} style={{ left: `${dbToPercent(db)}%` }} />
              ))}
            </div>
            <div className="mwm-bar-fill mwm-bar-rms" style={{ width: `${dbToPercent(rmsDb)}%` }} />
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="mwm-canvas" />
    </div>
  )
}

export default MasterWaveMeter
