import './HeaderRow.css'
import LeftControls from './LeftControls'

const HeaderRow = ({ isPlaying, onTogglePlay, perf, onResetDefaults, bpm, onBpmChange, progression, onProgressionChange, songKey, onKeyChange }) => {
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
              onClick={onTogglePlay}
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

          <div className="header-right">
            <div className="header-controls">
              <LeftControls
                compact
                bpm={bpm}
                onBpmChange={onBpmChange}
                progression={progression}
                onProgressionChange={onProgressionChange}
                songKey={songKey}
                onKeyChange={onKeyChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fila superior: logo + botones tipo pill */}
      <div className="header-box header-top-box">
        <div className="header-top">
          <div className="header-left">
            <div className="logo" aria-label="JSGrooveBox">
              <div className="logo-mark">JG</div>
              <div className="logo-word">
                <div className="logo-title">JS Groovebox</div>
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
