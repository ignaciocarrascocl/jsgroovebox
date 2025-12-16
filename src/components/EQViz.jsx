import { useMemo } from 'react'
import './FilterViz.css' // reuse styles

const dbToLinear = (db) => Math.pow(10, db / 20)

const computeBiquadCoeffs = (type, f0, Q, dbGain, fs) => {
  const omega = 2 * Math.PI * f0 / fs
  const sinw = Math.sin(omega)
  const cosw = Math.cos(omega)
  const A = dbToLinear(dbGain || 0)
  const alpha = sinw / (2 * (Q || 1))

  let b0, b1, b2, a0, a1, a2

  switch (type) {
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
    case 'peaking':
      b0 = 1 + alpha * A
      b1 = -2 * cosw
      b2 = 1 - alpha * A
      a0 = 1 + alpha / A
      a1 = -2 * cosw
      a2 = 1 - alpha / A
      break
    default:
      return null
  }

  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a0: 1, a1: a1 / a0, a2: a2 / a0 }
}

const biquadMagAt = (coeffs, freq, fs) => {
  if (!coeffs) return 1
  const w = 2 * Math.PI * freq / fs
  const cosw = Math.cos(w)
  const sinw = Math.sin(w)
  const realNum = coeffs.b0 + coeffs.b1 * cosw + coeffs.b2 * Math.cos(2 * w)
  const imagNum = 0 + coeffs.b1 * -sinw + coeffs.b2 * -Math.sin(2 * w)
  const realDen = 1 + coeffs.a1 * cosw + coeffs.a2 * Math.cos(2 * w)
  const imagDen = 0 + coeffs.a1 * -sinw + coeffs.a2 * -Math.sin(2 * w)
  const numMag = Math.sqrt(realNum * realNum + imagNum * imagNum)
  const denMag = Math.sqrt(realDen * realDen + imagDen * imagDen)
  return denMag === 0 ? 1 : numMag / denMag
}

const defaultFs = 48000

const EQViz = ({ low = { f: 100, g: 0, q: 1 }, mid = { f: 1000, g: 0, q: 1 }, high = { f: 8000, g: 0, q: 1 } }) => {
  const data = useMemo(() => {
    const fs = defaultFs
    const broad = 512
    const dense = 512
    const freqsBroad = Array.from({ length: broad }, (_, i) => {
      const t = i / (broad - 1)
      return 20 * Math.pow(20000 / 20, t)
    })
    const lowWin = Math.max(20, mid.f / 10)
    const highWin = Math.min(20000, mid.f * 10)
    const freqsDense = Array.from({ length: dense }, (_, i) => {
      const t = i / (dense - 1)
      return lowWin * Math.pow(highWin / lowWin, t)
    })
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
      if (Math.abs(f - last) / Math.max(1, f) > 1e-6) {
        dedup.push(f)
        last = f
      }
    }
    freqs = dedup

    // compute coeffs
    const lowC = computeBiquadCoeffs('lowshelf', low.f, low.q, low.g, fs)
    const midC = computeBiquadCoeffs('peaking', mid.f, mid.q, mid.g, fs)
    const highC = computeBiquadCoeffs('highshelf', high.f, high.q, high.g, fs)

    const mags = freqs.map((f) => {
      let mag = 1
      mag *= biquadMagAt(lowC, f, fs)
      mag *= biquadMagAt(midC, f, fs)
      mag *= biquadMagAt(highC, f, fs)
      return { f, mag }
    })

    return mags
  }, [low, mid, high])

  const width = 240
  const height = 96
  const dbs = data.map((p) => 20 * Math.log10(Math.max(1e-12, p.mag)))
  const maxDbFound = Math.max(...dbs)
  let displayMaxDb = Math.min(maxDbFound + 6, 12)
  let displayMinDb = Math.max(displayMaxDb - 72, Math.min(...dbs) - 6)
  if (displayMaxDb - displayMinDb < 6) displayMinDb = displayMaxDb - 6

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

  const candidateFreqs = [100, 1000, 10000]
  const freqTicks = candidateFreqs.filter((f) => f >= 20 && f <= 20000)
  const formatHz = (f) => (f >= 1000 ? `${Math.round(f / 1000)}k` : `${f}`)

  return (
    <div className="filter-viz" aria-hidden="true">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="url(#g2)" rx="6" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <path d={fillPath} fill="rgba(255,255,255,0.03)" stroke="none" />
        <path d={path} fill="none" stroke="rgba(99,255,191,0.95)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {freqTicks.map((f) => (
          <g key={f}>
            <line x1={toX(f)} x2={toX(f)} y1={height - 10} y2={height - 2} stroke="rgba(255,255,255,0.06)" />
            <text x={toX(f)} y={height - 12} fontSize="8" fill="rgba(255,255,255,0.65)" textAnchor="middle">{formatHz(f)}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default EQViz
