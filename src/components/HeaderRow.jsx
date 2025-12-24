import './HeaderRow.css'

const HeaderRow = ({ isPlaying, onTogglePlay, perf, onResetDefaults, startTone, toneStarted }) => {
  const usedMb = perf?.usedJSHeapSizeMb
  const fps = perf?.fps

  return (
    <div className="header-row">
      {/* Fila inferior: transporte + stats + controles */}
      <div className="header-box groovebox-section">
        <div className="header-bottom">
          <div className="header-left">
            <div className="logo" aria-label="jsgroovebox">
              <div className="logo-mark">JG</div>
              <div className="logo-word">
                <div className="logo-title">jsgroovebox</div>
                <div className="logo-sub">Caja de ritmos con Tone.js</div>
              </div>
            </div>
          </div>

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

          </div>

          <div className="header-right header-top-right">
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
