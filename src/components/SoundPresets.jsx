import './SoundPresets.css'

// Reusable sound preset selector component
const SoundPresets = ({ presets, onApplyPreset, color }) => {
  if (!presets || presets.length === 0) return null

  return (
    <div className="sound-preset-selector">
      <span className="selector-label">Sound Presets</span>
      <select
        className="sound-preset-select"
        style={{ '--preset-color': color }}
        onChange={(e) => onApplyPreset(presets[parseInt(e.target.value)])}
      >
        {presets.map((preset, idx) => (
          <option key={idx} value={idx}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SoundPresets
