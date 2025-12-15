import { CHORD_PROGRESSIONS } from '../constants/song'
import './LeftControls.css'

const LeftControls = ({ bpm, onBpmChange, progression, onProgressionChange }) => {
  return (
    <div className="left-controls">
      <div className="lc-block">
        <div className="lc-label">BPM</div>
        <div className="lc-bpm">
          <div className="lc-bpm-value">{bpm}</div>
          <input
            type="range"
            min="60"
            max="180"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="lc-slider"
          />
        </div>
      </div>

      <div className="lc-block">
        <div className="lc-label">PROGRESSION</div>
        <div className="lc-prog">
          {CHORD_PROGRESSIONS.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              className={`lc-prog-btn ${progression === idx ? 'active' : ''}`}
              onClick={() => onProgressionChange(idx)}
              title={p.name}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeftControls
