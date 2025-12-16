import './TrackHead.css'

// Reusable track header component
const TrackHead = ({
  track,
  isActive,
  isMuted,
  isSoloed,
  onPlay,
  onMuteToggle,
  onSoloToggle,
  onReset,
  trackId
}) => {
  return (
    <div className="track-header">
      <button
        type="button"
        className={`track-title-btn ${isActive ? 'active' : ''}`}
        onClick={() => onPlay(trackId)}
        title="Trigger"
        style={{ '--track-color': track.color }}
      >
        <span className="track-title">{track.name}</span>
      </button>
      <div className="track-actions">
        <button
          className={`action-btn solo-btn ${isSoloed ? 'active' : ''}`}
          onClick={() => onSoloToggle(trackId)}
          title="Solo"
          aria-pressed={isSoloed}
          aria-label="Solo track"
        >
          S
        </button>
        <button
          className={`action-btn mute-btn ${isMuted ? 'active' : ''}`}
          onClick={() => onMuteToggle(trackId)}
          title="Mute (M)"
          aria-pressed={isMuted}
          aria-label="Mute track"
        >
          M
        </button>
        <button
          className="action-btn reset-btn"
          title="Reset track"
          onClick={() => onReset?.(trackId)}
          aria-label="Reset track"
        >
          ⟲
        </button>
      </div>
    </div>
  )
}

export default TrackHead
