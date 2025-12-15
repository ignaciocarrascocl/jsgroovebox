import { useState } from 'react'
import { getPatternOptions, DRUM_SOUND_PRESETS } from '../constants/patterns'
import Knob from './Knob'
import './Track.css'

// Audio visualization: ver medidores en Master (MasterWaveMeter).

// Pattern step editor
const PatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
  const toggleStep = (index) => {
    const newPattern = [...pattern]
    newPattern[index] = newPattern[index] ? 0 : 1
    onChange(newPattern)
  }

  return (
    <div className="pattern-editor">
      {pattern.map((step, idx) => (
        <div
          key={idx}
          className={`pattern-step ${step ? 'active' : ''} ${isPlaying && currentStep === idx ? 'current' : ''} ${idx % 4 === 0 ? 'beat-start' : ''}`}
          style={{ '--step-color': color }}
          onClick={() => toggleStep(idx)}
        />
      ))}
    </div>
  )
}

// Pattern accordion selector - simple and functional
const PatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedPattern = patterns[selectedIndex]

  const handleSelect = (idx) => {
    onSelect(idx)
    setIsOpen(false)
  }

  return (
    <div className="pattern-accordion" style={{ '--accordion-color': color }}>
      {/* Header - Selected Pattern */}
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-pattern">
          {selectedPattern?.pattern.map((step, idx) => (
            <div
              key={idx}
              className={`header-step ${step ? 'active' : ''} ${isPlaying && currentStep === idx ? 'current' : ''}`}
            />
          ))}
        </div>
        <span className="header-name">{selectedPattern?.name || 'Select'}</span>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>

      {/* Content - All Patterns */}
      {isOpen && (
        <div className="accordion-content">
          {patterns.map((pattern, idx) => (
            <div
              key={idx}
              className={`pattern-option ${selectedIndex === idx ? 'selected' : ''}`}
              onClick={() => handleSelect(idx)}
            >
              <div className="option-pattern">
                {pattern.pattern.map((step, stepIdx) => (
                  <div
                    key={stepIdx}
                    className={`option-step ${step ? 'active' : ''}`}
                  />
                ))}
              </div>
              <span className="option-name">{pattern.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Sound preset selector (like bass)
const SoundPresetSelector = ({ trackId, onApplyPreset, color }) => {
  const presets = DRUM_SOUND_PRESETS[trackId] || []
  if (presets.length === 0) return null
  
  return (
    <div className="sound-preset-selector">
      <span className="selector-label">Sound</span>
      <div className="sound-preset-buttons">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            className="sound-preset-btn"
            style={{ '--preset-color': color }}
            onClick={() => onApplyPreset(preset)}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  )
}

const Track = ({ 
  track, 
  isActive, 
  selectedPattern,
  customPattern,
  trackParams,
  currentStep,
  isPlaying,
  isMuted,
  isSoloed,
  isAudible,
  onPlay, 
  onPatternChange,
  onCustomPatternChange,
  onParamChange,
  onMuteToggle,
  onSoloToggle,
}) => {
  const [useCustomPattern, setUseCustomPattern] = useState(false)
  const patternOptions = getPatternOptions(track.id)

  const handleParamChange = (param, value) => {
    onParamChange(track.id, { ...trackParams, [param]: value })
  }

  const handleSoundPreset = (preset) => {
    onParamChange(track.id, { ...trackParams, ...preset.params })
  }

  return (
    <div
      className={`track ${!isAudible ? 'muted' : ''}`}
      style={{ '--track-color': track.color }}
    >
      {/* Wave Visualizer Header */}
      <div className="track-header">
        <button
          type="button"
          className={`track-title-btn ${isActive ? 'active' : ''}`}
          onClick={() => onPlay(track.id)}
          title="Trigger"
        >
          <span className="track-title">{track.name}</span>
        </button>
        <div className="track-actions">
          <button 
            className={`action-btn mute-btn ${isMuted ? 'active' : ''}`}
            onClick={() => onMuteToggle(track.id)}
            title="Mute"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              {isMuted ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              )}
            </svg>
          </button>
          <button 
            className={`action-btn solo-btn ${isSoloed ? 'active' : ''}`}
            onClick={() => onSoloToggle(track.id)}
            title="Solo"
          >
            S
          </button>
        </div>
      </div>

      {/* Controls Section - All Knobs */}
      <div className="track-controls">
        <div className="knobs-section">
          {/* Volume */}
          <Knob 
            label="Volume" 
            value={trackParams?.volume ?? 0} 
            min={-60} 
            max={6} 
            onChange={(v) => handleParamChange('volume', v)}
            color={track.color}
          />
          {/* Pitch */}
          <Knob 
            label="Pitch" 
            value={trackParams?.pitch ?? 0} 
            min={track.id === 1 ? -24 : -12}
            max={track.id === 1 ? 12 : 24} 
            onChange={(v) => handleParamChange('pitch', Math.round(v))}
            color={track.color}
          />
          {/* Attack */}
          <Knob 
            label="Attack" 
            value={trackParams?.attack ?? 0.001} 
            min={0.001} 
            max={0.05} 
            onChange={(v) => handleParamChange('attack', v)}
            color={track.color}
          />
          {/* Release */}
          <Knob 
            label="Release" 
            value={trackParams?.release ?? 0.3} 
            min={track.id === 3 ? 0.01 : 0.05}
            max={track.id === 1 ? 1.5 : track.id === 4 ? 0.8 : 0.4} 
            onChange={(v) => handleParamChange('release', v)}
            color={track.color}
          />
          {/* Filter */}
          <Knob 
            label="Filter" 
            value={trackParams?.filter ?? 5000} 
            min={track.id === 1 ? 60 : 1000}
            max={track.id === 1 ? 2000 : 12000} 
            onChange={(v) => handleParamChange('filter', v)}
            color={track.color}
          />
          {/* Reverb */}
          <Knob 
            label="Reverb" 
            value={trackParams?.reverb ?? 0} 
            min={0} 
            max={0.8} 
            onChange={(v) => handleParamChange('reverb', v)}
            color={track.color}
          />
          {/* Delay */}
          <Knob 
            label="Delay" 
            value={trackParams?.delay ?? 0} 
            min={0} 
            max={0.8} 
            onChange={(v) => handleParamChange('delay', v)}
            color={track.color}
          />
          {/* Compression */}
          <Knob 
            label="Comp" 
            value={trackParams?.compression ?? 0} 
            min={0} 
            max={1} 
            onChange={(v) => handleParamChange('compression', v)}
            color={track.color}
          />
          {/* Swing */}
          <Knob 
            label="Swing" 
            value={trackParams?.swing ?? 0} 
            min={0} 
            max={1} 
            onChange={(v) => handleParamChange('swing', v)}
            color={track.color}
          />
        </div>
      </div>

      {/* Sound Presets */}
      <SoundPresetSelector 
        trackId={track.id}
        onApplyPreset={handleSoundPreset}
        color={track.color}
      />

      {/* Pattern Section */}
      <div className="pattern-section">
        {/* Pattern Accordion Selector */}
        {!useCustomPattern && (
          <PatternAccordion
            patterns={patternOptions}
            selectedIndex={selectedPattern}
            onSelect={(idx) => onPatternChange(track.id, idx)}
            currentStep={currentStep}
            isPlaying={isPlaying}
            color={track.color}
          />
        )}

        {/* Custom Pattern Editor */}
        {useCustomPattern && (
          <PatternEditor 
            pattern={customPattern || Array(16).fill(0)}
            onChange={(p) => onCustomPatternChange(track.id, p)}
            currentStep={currentStep}
            isPlaying={isPlaying}
            color={track.color}
          />
        )}

        {/* Toggle between preset and custom */}
        <div className="pattern-toggle">
          <button 
            className={`toggle-btn ${useCustomPattern ? 'active' : ''}`}
            onClick={() => setUseCustomPattern(!useCustomPattern)}
          >
            {useCustomPattern ? '← Presets' : 'Custom'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Track
