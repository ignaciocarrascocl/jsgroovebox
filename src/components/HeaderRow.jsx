import './HeaderRow.css'

const HeaderRow = ({ isPlaying, onTogglePlay, perf, onResetDefaults }) => {
  const usedMb = perf?.usedJSHeapSizeMb
  const fps = perf?.fps

  return (
    <div className="header-row">
      <div className="header-left">
        <div className="logo" aria-label="JSGrooveBox">
          <div className="logo-mark">JG</div>
          <div className="logo-word">
              <div className="logo-title">JSGrooveBox</div>
            <button
              className="logo-reset"
              title="Reset to defaults"
              aria-label="Reset to defaults"
              onClick={onResetDefaults}
            >
              ⟲
            </button>
              <div className="logo-sub">Tone.js groovebox</div>
            </div>
        </div>
      </div>

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
        <button className="header-pill" type="button">Save</button>
        <button className="header-pill" type="button">Load</button>
        <button className="header-pill" type="button">Prefs</button>
        <button className="header-pill" type="button">Help</button>
      </div>
    </div>
  )
}

export default HeaderRow
