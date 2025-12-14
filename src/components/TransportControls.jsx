import './TransportControls.css'

const TransportControls = ({ 
  isPlaying, 
  currentStep, 
  bpm, 
  onTogglePlay, 
  onBpmChange 
}) => {
  return (
    <div className="transport-controls">
      {/* Logo */}
      <div className="logo">
        <span className="logo-text">JS</span>
        <span className="logo-groove">GROOVE</span>
        <span className="logo-box">BOX</span>
      </div>

      <div className="transport-divider" />

      {/* Play/Stop Button */}
      <button className={`transport-btn ${isPlaying ? 'playing' : ''}`} onClick={onTogglePlay}>
        <span className="btn-icon">{isPlaying ? '■' : '▶'}</span>
      </button>

      {/* BPM Control */}
      <div className="bpm-control">
        <span className="bpm-value">{bpm}</span>
        <span className="bpm-label">BPM</span>
        <div className="bpm-slider-container">
          <input
            type="range"
            min="60"
            max="180"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="bpm-slider"
          />
          <div 
            className="bpm-slider-fill" 
            style={{ width: `${((bpm - 60) / 120) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicator - Horizontal */}
      <div className="step-indicator">
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className={`step ${currentStep === i ? 'active' : ''} ${i % 4 === 0 ? 'beat' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default TransportControls
