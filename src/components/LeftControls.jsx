import { useEffect, useRef, useState } from 'react'
import { CHORD_PROGRESSIONS, KEYS } from '../constants/song'
import './LeftControls.css'

const LeftControls = ({ bpm, onBpmChange, progression, onProgressionChange, songKey, onKeyChange, compact = false }) => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
  const BPM_MIN = 60
  const BPM_MAX = 180
  const BPM_STEP = 1

  const [bpmInput, setBpmInput] = useState(String(bpm))
  const lastTapRef = useRef(null)
  const tapHistoryRef = useRef([])

  // keep input in sync with external bpm
  useEffect(() => {
    setBpmInput(String(bpm))
  }, [bpm])

  const commitBpm = (next) => {
    if (!Number.isFinite(next)) return
    onBpmChange(clamp(Math.round(next), BPM_MIN, BPM_MAX))
  }

  const nudge = (dir) => commitBpm((bpm ?? 120) + dir * BPM_STEP)

  const handleTap = () => {
    const now = performance.now()
    const last = lastTapRef.current
    lastTapRef.current = now
    if (last == null) {
      tapHistoryRef.current = []
      return
    }

    const deltaMs = now - last
    // ignore accidental extremely short/long taps
    if (deltaMs < 180 || deltaMs > 2000) {
      tapHistoryRef.current = []
      return
    }

    tapHistoryRef.current.push(deltaMs)
    // keep last 6 intervals
    if (tapHistoryRef.current.length > 6) tapHistoryRef.current.shift()

    const avgMs = tapHistoryRef.current.reduce((a, b) => a + b, 0) / tapHistoryRef.current.length
    const tapped = 60000 / avgMs
    commitBpm(tapped)
  }

  const categorizeProgression = (name = '', mode = 'Major') => {
    const n = name.toLowerCase()
    if (n.includes('jazz') || n.includes('neo soul') || n.includes('smooth') || n.includes('soul')) return 'Jazz / Soul'
    if (n.includes('house') || n.includes('techno') || n.includes('trance') || n.includes('edm') || n.includes('progressive') || n.includes('uplifting') || n.includes('euphoric') || n.includes('industrial') || n.includes('minimal') || n.includes('deep')) {
      return 'Electrónica'
    }
    if (n.includes('rock') || n.includes('punk') || n.includes('metal') || n.includes('grunge') || n.includes('alternative')) return 'Rock'
    if (n.includes('blues') || n.includes('funk')) return 'Blues / Funk'
    if (n.includes('pop') || n.includes('50s') || n.includes('folk') || n.includes('ballad')) return 'Pop'
    return mode === 'Minor' ? 'Menor' : 'Mayor'
  }

  const groupedProgressions = CHORD_PROGRESSIONS.reduce((acc, p, idx) => {
    const modeLabel = p.mode === 'Minor' ? 'Menor' : 'Mayor'
    const cat = categorizeProgression(p.name, p.mode)
    const groupName = `${modeLabel} · ${cat}`
    if (!acc[groupName]) acc[groupName] = []
    acc[groupName].push({ ...p, idx })
    return acc
  }, {})

  return (
    <div className={`left-controls ${compact ? 'compact' : ''}`}>
      <div className="lc-block">
        <div className="lc-label">BPM</div>
        <div className="lc-bpm">
          <button type="button" className="lc-bpm-nudge" onClick={() => nudge(-1)} aria-label="Bajar BPM">−</button>

          <label className="lc-bpm-input-wrap" aria-label="BPM">
            <input
              className="lc-bpm-input"
              inputMode="numeric"
              pattern="[0-9]*"
              size={8}
              value={bpmInput}
              onChange={(e) => setBpmInput(e.target.value)}
              onBlur={() => commitBpm(Number(bpmInput))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                }
              }}
            />
            <span className="lc-bpm-unit">BPM</span>
          </label>

          <button type="button" className="lc-bpm-nudge" onClick={() => nudge(1)} aria-label="Subir BPM">+</button>
        </div>

        <div className="lc-bpm-actions">
          <button
            type="button"
            className="lc-bpm-action"
            onClick={handleTap}
            aria-label="Tap BPM"
            title="Tap tempo"
          >
            Tap tempo
          </button>
          <button
            type="button"
            className="lc-bpm-action"
            onClick={() => commitBpm(120)}
            aria-label="Reset BPM"
            title="Reset BPM"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div className="lc-block">
        <div className="lc-label">Tonalidad</div>
        <div className="lc-prog-select-wrap">
          <select
            className="lc-prog-select"
            value={songKey}
            onChange={(e) => onKeyChange(e.target.value)}
            aria-label="Selector de tonalidad"
            size={compact ? 1 : 4}
          >
            {KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="lc-block">
        <div className="lc-label">PROGRESIÓN</div>
        <div className="lc-prog-select-wrap">
          <select
            className="lc-prog-select"
            value={progression}
            onChange={(e) => onProgressionChange(Number(e.target.value))}
            aria-label="Selector de progresión"
            size={compact ? 1 : 6}
          >
            {Object.entries(groupedProgressions).map(([groupName, items]) => (
              <optgroup key={groupName} label={groupName}>
                {items.map((p) => (
                  <option key={p.name} value={p.idx}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default LeftControls
