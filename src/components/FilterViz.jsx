import { useMemo } from 'react'
import './FilterViz.css'

// Compute biquad coefficients and magnitude response (RBJ cookbook)
const dbToLinear = (db) => Math.pow(10, db / 20)

const computeBiquadCoeffs = (type, f0, Q, dbGain, fs) => {
  const omega = 2 * Math.PI * f0 / fs
  const sinw = Math.sin(omega)
  const cosw = Math.cos(omega)
  const A = dbToLinear(dbGain || 0)
  const alpha = sinw / (2 * (Q || 1))

  let b0, b1, b2, a0, a1, a2

  switch (type) {
    case 'lowpass':
      b0 = (1 - cosw) / 2
      b1 = 1 - cosw
      b2 = (1 - cosw) / 2
      a0 = 1 + alpha
      a1 = -2 * cosw
      a2 = 1 - alpha
      break
    case 'highpass':
      b0 = (1 + cosw) / 2
      b1 = -(1 + cosw)
      b2 = (1 + cosw) / 2
      a0 = 1 + alpha
      a1 = -2 * cosw
      a2 = 1 - alpha
      break
    case 'bandpass':
      b0 = alpha
      b1 = 0
      b2 = -alpha
      a0 = 1 + alpha
      a1 = -2 * cosw
      a2 = 1 - alpha
      break
    case 'notch':
      b0 = 1
      b1 = -2 * cosw
      b2 = 1
      a0 = 1 + alpha
      a1 = -2 * cosw
      a2 = 1 - alpha
      break
    case 'peaking':
      b0 = 1 + alpha * A
      b1 = -2 * cosw
      b2 = 1 - alpha * A
      a0 = 1 + alpha / A
      a1 = -2 * cosw
      a2 = 1 - alpha / A
      break
    case 'lowshelf': {
      const sqrtA = Math.sqrt(A)
      b0 = A * ((A + 1) - (A - 1) * cosw + 2 * sqrtA * alpha)
      b1 = 2 * A * ((A - 1) - (A + 1) * cosw)
      b2 = A * ((A + 1) - (A - 1) * cosw - 2 * sqrtA * alpha)
      a0 = (A + 1) + (A - 1) * cosw + 2 * sqrtA * alpha
      a1 = -2 * ((A - 1) + (A + 1) * cosw)
      a2 = (A + 1) + (A - 1) * cosw - 2 * sqrtA * alpha
      break
    }
    case 'highshelf': {
      const sqrtA = Math.sqrt(A)
      b0 = A * ((A + 1) + (A - 1) * cosw + 2 * sqrtA * alpha)
      b1 = -2 * A * ((A - 1) + (A + 1) * cosw)
      b2 = A * ((A + 1) + (A - 1) * cosw - 2 * sqrtA * alpha)
      a0 = (A + 1) - (A - 1) * cosw + 2 * sqrtA * alpha
      a1 = 2 * ((A - 1) - (A + 1) * cosw)
      a2 = (A + 1) - (A - 1) * cosw - 2 * sqrtA * alpha
      break
    }
    default:
      // passthrough
      return null
  }

  // normalize
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a0: 1, a1: a1 / a0, a2: a2 / a0 }
}

const biquadMagAt = (coeffs, freq, fs) => {
  if (!coeffs) return 1
  const w = 2 * Math.PI * freq / fs
  const cosw = Math.cos(w)
  const sinw = Math.sin(w)
  // Evaluate H(e^jw) = (b0 + b1 z^-1 + b2 z^-2) / (1 + a1 z^-1 + a2 z^-2)
  const realNum = coeffs.b0 + coeffs.b1 * cosw + coeffs.b2 * Math.cos(2 * w)
  const imagNum = 0 + coeffs.b1 * -sinw + coeffs.b2 * -Math.sin(2 * w)
  const realDen = 1 + coeffs.a1 * cosw + coeffs.a2 * Math.cos(2 * w)
  const imagDen = 0 + coeffs.a1 * -sinw + coeffs.a2 * -Math.sin(2 * w)
  const numMag = Math.sqrt(realNum * realNum + imagNum * imagNum)
  const denMag = Math.sqrt(realDen * realDen + imagDen * imagDen)
  return denMag === 0 ? 1 : numMag / denMag
}

const defaultFs = 48000

const FilterViz = ({ type = 'lowpass', cutoff = 20000, q = 0.7, bandwidth = 1000, slope = 24, gain = 0 }) => {
  const data = useMemo(() => {
    const fs = defaultFs
    // Use a two-tier sampling strategy: broad log-spaced samples + dense sampling around cutoff
    const broad = 512
    const dense = 512
    const freqsBroad = Array.from({ length: broad }, (_, i) => {
      const t = i / (broad - 1)
      return 20 * Math.pow(20000 / 20, t)
    })

    // dense window around cutoff (10x below .. 10x above), clamped to [20, 20k]
    const lowWin = Math.max(20, cutoff / 10)
    const highWin = Math.min(20000, cutoff * 10)
    const freqsDense = Array.from({ length: dense }, (_, i) => {
      const t = i / (dense - 1)
      return lowWin * Math.pow(highWin / lowWin, t)
    })

    // merge, sort and deduplicate (numeric tolerance) so the path doesn't jump backwards
    let freqs = [...freqsBroad, ...freqsDense]
    freqs.sort((a, b) => a - b)
    const dedup = []
    let last = -Infinity
    for (let f of freqs) {
      if (last === -Infinity) {
        dedup.push(f)
        last = f
        continue
      }
      // relative tolerance
      if (Math.abs(f - last) / Math.max(1, f) > 1e-6) {
        dedup.push(f)
        last = f
      }
    }
    freqs = dedup

    // compute Q: for band types, prefer bandwidth->Q
    let Q = q
    if ((type === 'bandpass' || type === 'notch') && bandwidth > 0) {
      Q = Math.max(0.1, cutoff / bandwidth)
    }

    // build per-stage coeffs
    const stageCount = Math.max(1, Math.round(slope / 12))
    const coeffs = []
    for (let s = 0; s < stageCount; s++) {
      coeffs.push(computeBiquadCoeffs(type, cutoff, Q, gain, fs))
    }

    const mags = freqs.map((f) => {
      let mag = 1
      for (let c of coeffs) {
        mag *= biquadMagAt(c, f, fs)
      }
      return { f, mag }
    })

    return mags
  }, [type, cutoff, q, bandwidth, slope, gain])

  // Create SVG path from data in dB with dynamic vertical scaling so narrow BP/Notch responses are visible
  const width = 240
  const height = 96
  const dbs = data.map((p) => 20 * Math.log10(Math.max(1e-12, p.mag)))
  const maxDbFound = Math.max(...dbs)
  // Display range: for narrow band types center around the peak to make the resonance/notch visible
  let displayMaxDb = Math.min(maxDbFound + 6, 12)
  let displayMinDb = Math.max(displayMaxDb - 72, Math.min(...dbs) - 6)
  if (type === 'bandpass' || type === 'notch') {
    // center around peak for BP/Notch so narrow peaks/dips are visible
    displayMaxDb = maxDbFound + 12
    displayMinDb = maxDbFound - 60
  }
  // Safety: ensure a non-zero range
  if (displayMaxDb - displayMinDb < 6) {
    displayMinDb = displayMaxDb - 6
  }

  const toX = (f) => {
    const t = Math.log10(f / 20) / Math.log10(20000 / 20)
    return Math.max(0, Math.min(1, t)) * width
  }
  const toYDb = (db) => {
    const t = (db - displayMinDb) / (displayMaxDb - displayMinDb)
    return height - Math.max(0, Math.min(1, t)) * height
  }

  const path = data.map((p, i) => {
    const db = 20 * Math.log10(Math.max(1e-12, p.mag))
    return `${i === 0 ? 'M' : 'L'} ${toX(p.f).toFixed(2)} ${toYDb(db).toFixed(2)}`
  }).join(' ')
  const baselineY = toYDb(displayMinDb)
  const fillPath = `${path} L ${width} ${baselineY.toFixed(2)} L 0 ${baselineY.toFixed(2)} Z`

  // Fewer, more useful frequency labels for the mini viz (less text)
  const candidateFreqs = [100, 1000, 10000]
  const freqTicks = candidateFreqs.filter((f) => f >= 20 && f <= 20000)
  const formatHz = (f) => (f >= 1000 ? `${Math.round(f / 1000)}k` : `${f}`)

  return (
    <div className="filter-viz" aria-hidden="true">
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>
      <rect x="0" y="0" width={width} height={height} fill="url(#g)" rx="6" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <g className="grid">
          {[20, 100, 1000, 10000].map((f) => (
            <line key={f} x1={toX(f)} x2={toX(f)} y1="0" y2={height} stroke="rgba(255,255,255,0.04)" />
          ))}
        </g>
  <path d={fillPath} fill="rgba(255,255,255,0.03)" stroke="none" />
  <path d={path} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Bandwidth highlight for BP/Notch */}
        {((type === 'bandpass' || type === 'notch') && bandwidth > 0) ? (() => {
          const fl = Math.max(20, cutoff - bandwidth / 2)
          const fh = Math.min(20000, cutoff + bandwidth / 2)
          const x1 = toX(fl)
          const x2 = toX(fh)
          return (
            <g>
              <rect x={x1} y={0} width={Math.max(1, x2 - x1)} height={height} fill="rgba(255,165,0,0.06)" />
              <line x1={x1} x2={x1} y1={0} y2={height} stroke="rgba(255,165,0,0.35)" strokeDasharray="3 3" />
              <line x1={x2} x2={x2} y1={0} y2={height} stroke="rgba(255,165,0,0.35)" strokeDasharray="3 3" />
            </g>
          )
        })() : null}

        {/* freq ticks + labels */}
        {freqTicks.map((f) => (
          <g key={f}>
            <line x1={toX(f)} x2={toX(f)} y1={height - 10} y2={height - 2} stroke="rgba(255,255,255,0.06)" />
            <text x={toX(f)} y={height - 12} fontSize="8" fill="rgba(255,255,255,0.65)" textAnchor="middle">{formatHz(f)}</text>
          </g>
        ))}

  {/* Minimal labels for compact UI: only freq ticks shown */}

        {/* cutoff marker */}
        <line x1={toX(cutoff)} x2={toX(cutoff)} y1="0" y2={height} stroke="rgba(255,165,0,0.6)" strokeDasharray="4 4" />
      </svg>
    </div>
  )
}

export default FilterViz
