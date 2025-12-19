import './HeaderRow.css'
import LeftControls from './LeftControls'
import { CHORD_PATTERNS } from '../constants/chords'

const HeaderRow = ({ isPlaying, onTogglePlay, perf, onResetDefaults, bpm, onBpmChange, chordSteps, getCurrentChordStep, selectedPatterns, customPatterns, songSettings, startTone, toneStarted }) => {
  const usedMb = perf?.usedJSHeapSizeMb
  const fps = perf?.fps

  return (
    <div className="header-row">
      {/* Fila inferior: transporte + stats + controles */}
      <div className="header-box header-bottom-box">
        <div className="header-bottom">
          <div className="header-center">
            <button
              className={`header-transport-btn ${isPlaying ? 'playing' : ''}`}
              onClick={async () => {
                // Ensure audio context started before toggling play
                if (!toneStarted && typeof startTone === 'function') {
                  try { await startTone() } catch { /* ignore */ }
                }
                onTogglePlay()
              }}
              title={isPlaying ? 'Stop' : 'Play'}
            >
              <span className="btn-icon">{isPlaying ? '■' : '▶'}</span>
            </button>

            <div className="header-stats" aria-label="Performance">
              <div className="stat">
                <span className="stat-label">FPS</span>
                <span className="stat-value">{Number.isFinite(fps) ? Math.round(fps) : '—'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">MEM</span>
                <span className="stat-value">{Number.isFinite(usedMb) ? `${usedMb.toFixed(0)} MB` : '—'}</span>
              </div>
            </div>

            {/* Debug: show current chord step + chordSteps info */}
            <div className="header-debug" aria-hidden>
              {typeof getCurrentChordStep === 'function' && (
                (() => {
                  const step = getCurrentChordStep()
                  const stepData = chordSteps?.[step]
                  const chordPatternIndex = selectedPatterns?.[7] ?? 0
                  const chordPattern = customPatterns?.[7] || CHORD_PATTERNS[chordPatternIndex]?.pattern || []
                  const patternVal = chordPattern[step % 16]
                  const nonNullCount = chordSteps ? chordSteps.filter(Boolean).length : 0
                  return (
                    <div className="debug-row">
                      <span className="debug-label">ChordStep:</span>
                      <span className="debug-value">{step}</span>
                      <span className="debug-label">StepData:</span>
                      <span className="debug-value">{stepData ? `${stepData.root}${stepData.type ? ' '+stepData.type : ''}` : 'null'}</span>
                      <span className="debug-label">PatternVal:</span>
                      <span className="debug-value">{String(patternVal ?? '—')}</span>
                      <span className="debug-label">SongKey:</span>
                      <span className="debug-value">{songSettings?.key ?? '—'}</span>
                      <span className="debug-label">Prog:</span>
                      <span className="debug-value">{songSettings?.progression ?? '—'}</span>
                      <span className="debug-label">ChordsDefined:</span>
                      <span className="debug-value">{nonNullCount}</span>
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="header-box header-top-box">
        <div className="header-top">
          <div className="header-left">
            <div className="logo" aria-label="jsgroovebox">
              <div className="logo-mark">JG</div>
              <div className="logo-word">
                <div className="logo-title">jsgroovebox</div>
                <div className="logo-sub">Caja de ritmos con Tone.js</div>
              </div>
            </div>
          </div>

          <div className="header-top-right">
            <button
              className="header-pill header-pill-reset"
              type="button"
              title="Restaurar valores predeterminados"
              aria-label="Restaurar valores predeterminados"
              onClick={onResetDefaults}
            >
              Restaurar
            </button>
            <button className="header-pill" type="button">Guardar</button>
            <button className="header-pill" type="button">Cargar</button>
            <button className="header-pill" type="button">Preferencias</button>
            <button className="header-pill" type="button">Ayuda</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderRow
