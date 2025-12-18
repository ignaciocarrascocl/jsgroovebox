import { KEYS, CHORD_PROGRESSIONS } from '../constants/song'
import './SongSettings.css'

const SongSettings = ({ songKey, progression, onKeyChange, onProgressionChange, currentBar, isPlaying }) => {
  const currentProgression = CHORD_PROGRESSIONS[progression]
  const currentMode = currentProgression?.mode || 'Major'
  const modeLabel = currentMode === 'Minor' ? 'Menor' : 'Mayor'
  
  return (
    <div className="song-settings">
      {/* Key Selector Dropdown */}
      <div className="setting-group">
        <span className="setting-label">Tonalidad</span>
        <div className="dropdown-selector">
          <button className="dropdown-btn-main">
            {songKey}
            <span className="arrow">▼</span>
          </button>
          <div className="dropdown-menu">
            {KEYS.map((key) => (
              <button
                key={key}
                className={`dropdown-option ${songKey === key ? 'active' : ''}`}
                onClick={() => onKeyChange(key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Display (read-only, from progression) */}
      <div className="setting-group">
        <span className="setting-label">Modo</span>
        <div className="mode-display">
          {modeLabel}
        </div>
      </div>

      {/* Progression Selector */}
      <div className="setting-group">
        <span className="setting-label">Progresión</span>
        <div className="dropdown-selector wide">
          <button className="dropdown-btn-main">
            {currentProgression?.name || 'Seleccionar'}
            <span className="arrow">▼</span>
          </button>
          <div className="dropdown-menu">
            {CHORD_PROGRESSIONS.map((prog, idx) => (
              <button
                key={idx}
                className={`dropdown-option ${progression === idx ? 'active' : ''}`}
                onClick={() => onProgressionChange(idx)}
              >
                {prog.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bar indicator */}
      <div className="bar-indicator">
        {[0, 1, 2, 3].map((bar) => (
          <div 
            key={bar} 
            className={`bar-dot ${isPlaying && currentBar === bar ? 'current' : ''}`}
          >
            {bar + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SongSettings
