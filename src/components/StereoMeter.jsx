import React from 'react'
import './FilterViz.css'

// kept for historical compatibility; new code uses db->pixel mapping directly

const StereoMeter = ({ leftDb = -Infinity, rightDb = -Infinity, leftRmsDb = -Infinity, rightRmsDb = -Infinity }) => {
  // deprecated percent helpers (kept for compatibility if used elsewhere)
  // const l = Number.isFinite(leftDb) ? dbToPercent(leftDb) : 0
  // const r = Number.isFinite(rightDb) ? dbToPercent(rightDb) : 0

  const formatDb = (v) => (Number.isFinite(v) ? `${v.toFixed(1)} dB` : '--')
  const formatLufs = (v) => (Number.isFinite(v) ? `${v.toFixed(2)} LUFS` : '--')

  // SVG layout — make the mini-screen taller (2x again for clearer text)
  const width = 240
  const height = 256
  const padding = 18
  const barWidth = 80
  const gap = 24
  const barHeight = height - padding * 2
  const minDb = -60
  const maxDb = 12

  const dbToY = (db) => {
    const t = (db - minDb) / (maxDb - minDb)
    return padding + (1 - Math.max(0, Math.min(1, t))) * barHeight
  }

  const dbToHeight = (db) => {
    const t = (db - minDb) / (maxDb - minDb)
    return Math.max(1, Math.max(0, Math.min(1, t)) * barHeight)
  }

  const leftH = dbToHeight(leftDb)
  const rightH = dbToHeight(rightDb)

  // compute color zones (muted DAW style) and create gradient fills
  const dbToColor = (db) => {
    if (!Number.isFinite(db)) return '#6ee7b7' // muted green
    if (db >= -3) return '#c94b4b' // muted red
    if (db >= -12) return '#caa13f' // muted yellow
    return '#2f9a6b' // muted green
  }
  const leftColor = dbToColor(leftDb)
  const rightColor = dbToColor(rightDb)

  const clampHex = (v) => Math.max(0, Math.min(255, Math.round(v)))
  const hexToRgb = (h) => h.replace('#', '').match(/.{2}/g).map((b) => parseInt(b, 16))
  const rgbToHex = (r, g, b) => `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
  const blend = (hex, t) => {
    const [r, g, b] = hexToRgb(hex)
    return rgbToHex(clampHex(r * t), clampHex(g * t), clampHex(b * t))
  }
  // keep gradients subtle (avoid bright top edge)
  const leftDark = blend(leftColor, 0.6)
  const leftLight = blend(leftColor, 0.92)
  const rightDark = blend(rightColor, 0.6)
  const rightLight = blend(rightColor, 0.92)

  return (
    <div className="stereo-meter" aria-hidden="true">
      <svg className="stereo-meter-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Left bar */}
        <g>
          <defs>
            <linearGradient id="grad-l" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={leftDark} stopOpacity="0.98" />
              <stop offset="60%" stopColor={leftColor} stopOpacity="0.96" />
              <stop offset="100%" stopColor={leftLight} stopOpacity="0.92" />
            </linearGradient>
          </defs>
          <rect x={padding} y={padding} width={barWidth} height={barHeight} rx={8} fill="rgba(255,255,255,0.03)" />
          <rect x={padding} y={padding + (barHeight - leftH)} width={barWidth} height={Math.max(1, leftH)} rx={6} fill="url(#grad-l)" />
          {/* labels moved outside the SVG for space */}
        </g>

        {/* Right bar */}
        <g>
          <defs>
            <linearGradient id="grad-r" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={rightDark} stopOpacity="0.96" />
              <stop offset="70%" stopColor={rightColor} stopOpacity="0.94" />
              <stop offset="100%" stopColor={rightLight} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect x={padding + barWidth + gap} y={padding} width={barWidth} height={barHeight} rx={8} fill="rgba(255,255,255,0.03)" />
          <rect x={padding + barWidth + gap} y={padding + (barHeight - rightH)} width={barWidth} height={Math.max(1, rightH)} rx={6} fill="url(#grad-r)" />
          {/* labels moved outside the SVG */}
        </g>
        {/* Peak caps (subtle, centered over bar) */}
        {Number.isFinite(leftDb) && (
          <rect x={padding + barWidth * 0.15} y={dbToY(leftDb) - 3} width={barWidth * 0.6} height={3} rx={1.5} fill="rgba(0,0,0,0.45)" />
        )}
        {Number.isFinite(rightDb) && (
          <rect x={padding + barWidth + gap + barWidth * 0.15} y={dbToY(rightDb) - 3} width={barWidth * 0.6} height={3} rx={1.5} fill="rgba(0,0,0,0.45)" />
        )}

        {/* dB scale on the right */}
        {[-60, -24, -12, -6, -3, 0, 6, 12].map((db) => (
          <g key={db}>
            <line x1={width - 36} x2={width - 26} y1={dbToY(db)} y2={dbToY(db)} stroke="rgba(255,255,255,0.06)" />
            <text x={width - 8} y={dbToY(db) + 4} fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="end">{db}</text>
          </g>
        ))}
      </svg>

      <div className="stereo-meter-meta">
        <div className="meta-channel meta-left">
          <div className="meta-label">L</div>
          <div className="meta-db">{formatDb(leftDb)}</div>
          <div className="meta-lufs">{formatLufs(leftRmsDb)}</div>
        </div>
        <div className="meta-channel meta-right">
          <div className="meta-label">R</div>
          <div className="meta-db">{formatDb(rightDb)}</div>
          <div className="meta-lufs">{formatLufs(rightRmsDb)}</div>
        </div>
      </div>
    </div>
  )
}

export default StereoMeter
