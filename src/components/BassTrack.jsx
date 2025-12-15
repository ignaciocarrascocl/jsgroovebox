import { useState } from 'react'
import { BASS_PATTERNS, WAVE_TYPES, BASS_SOUND_PRESETS } from '../constants/bass'
import Knob from './Knob'
import './BassTrack.css'

// Pattern step editor for bass (16 steps per bar, repeats each bar)
const BassPatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
  const cycleStep = (index) => {
    const newPattern = [...pattern]
    newPattern[index] = (newPattern[index] + 1) % 4 // 0, 1, 2, 3
    onChange(newPattern)
  }

  const getStepLabel = (value) => {
    switch (value) {
      case 1: return 'R'  // Root
      case 2: return '5'  // Fifth
      case 3: return 'O'  // Octave
      default: return ''
    }
  }

  // currentStep is 0-63, pattern step is 0-15 (repeats each bar)
  const patternStep = currentStep % 16

  return (
    <div className="bass-pattern-editor">
      {pattern.map((step, idx) => (
        <div
          key={idx}
          className={`bass-pattern-step step-type-${step} ${isPlaying && patternStep === idx ? 'current' : ''} ${idx % 4 === 0 ? 'beat-start' : ''}`}
          style={{ '--step-color': color }}
          onClick={() => cycleStep(idx)}
        >
          {getStepLabel(step)}
        </div>
      ))}
    </div>
  )
}

// Bass pattern accordion selector - like drum tracks
const BassPatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)

  // currentStep is 0-63, pattern step is 0-15 (repeats each bar)
  const patternStep = currentStep % 16

  const selectedPattern = patterns[selectedIndex]

  const handleSelect = (idx) => {
    onSelect(idx)
    setIsOpen(false)
  }

  // Get step type class for bass patterns (0, 1, 2, 3)
  const getStepClass = (step) => {
    if (step === 0) return ''
    return `step-type-${step}`
  }

  return (
    <div className="bass-pattern-accordion" style={{ '--accordion-color': color }}>
      {/* Header - Selected Pattern */}
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-pattern">
          {selectedPattern?.pattern.map((step, idx) => (
            <div
              key={idx}
              className={`header-step ${getStepClass(step)} ${isPlaying && patternStep === idx ? 'current' : ''}`}
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
                    className={`option-step ${getStepClass(step)}`}
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

// Sound preset selector
const SoundPresetSelector = ({ onApplyPreset, color }) => {
  return (
    <div className="sound-preset-selector">
      <span className="selector-label">Sound Presets</span>
      <div className="sound-preset-buttons">
        {BASS_SOUND_PRESETS.map((preset, idx) => (
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



const BassTrack = ({
  track,
  isActive,
  selectedPattern,
  customPattern,
  bassParams,
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

  const handleParamChange = (param, value) => {
    onParamChange(track.id, { ...bassParams, [param]: value })
  }

  const handleSoundPreset = (preset) => {
    onParamChange(track.id, { 
      ...bassParams, 
      waveType: preset.waveType,
      filter: preset.filter,
      resonance: preset.resonance,
      attack: preset.attack,
      decay: preset.decay,
      detune: preset.detune,
      lfoRate: preset.lfoRate,
      lfoDepth: preset.lfoDepth,
      compression: preset.compression
    })
  }

  return (
    <div
      className={`bass-track ${!isAudible ? 'muted' : ''}`}
      style={{ '--track-color': track.color }}
    >
      {/* Wave Visualizer Header */}
      <div className="bass-track-header">
        <button
          type="button"
          className={`track-title-btn ${isActive ? 'active' : ''}`}
          onClick={() => onPlay(track.id)}
          title="Trigger"
          style={{ '--track-color': track.color }}
        >
          <span className="track-title">{track.name}</span>
        </button>
        <div className="bass-track-actions">
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

      {/* Controls Section - All Knobs (8 total like percussion tracks) */}
      <div className="bass-track-controls">
        <div className="bass-knobs-section">
          {/* Volume */}
          <Knob 
            label="Volume" 
            value={bassParams?.volume ?? -6} 
            min={-60} 
            max={6} 
            onChange={(v) => handleParamChange('volume', v)}
            color={track.color}
          />
          {/* Wave Type - mapped to numeric value */}
          <Knob 
            label="Wave" 
            value={WAVE_TYPES.indexOf(bassParams?.waveType || 'sawtooth')} 
            min={0} 
            max={WAVE_TYPES.length - 1} 
            step={1}
            onChange={(v) => handleParamChange('waveType', WAVE_TYPES[Math.round(v)])}
            displayValue={WAVE_TYPES[Math.round(WAVE_TYPES.indexOf(bassParams?.waveType || 'sawtooth'))].slice(0, 3).toUpperCase()}
            color={track.color}
          />
          {/* Attack */}
          <Knob 
            label="Attack" 
            value={bassParams?.attack ?? 0.01} 
            min={0.001} 
            max={0.3} 
            onChange={(v) => handleParamChange('attack', v)}
            color={track.color}
          />
          {/* Decay */}
          <Knob 
            label="Decay" 
            value={bassParams?.decay ?? 0.3} 
            min={0.05} 
            max={1} 
            onChange={(v) => handleParamChange('decay', v)}
            color={track.color}
          />
          {/* Filter */}
          <Knob 
            label="Filter" 
            value={bassParams?.filter ?? 800} 
            min={60} 
            max={4000} 
            onChange={(v) => handleParamChange('filter', v)}
            color={track.color}
          />
          {/* Resonance */}
          <Knob 
            label="Reso" 
            value={bassParams?.resonance ?? 1} 
            min={0.5} 
            max={15} 
            onChange={(v) => handleParamChange('resonance', v)}
            color={track.color}
          />
          {/* Detune */}
          <Knob 
            label="Detune" 
            value={bassParams?.detune ?? 5} 
            min={0} 
            max={30} 
            onChange={(v) => handleParamChange('detune', v)}
            color={track.color}
          />
          {/* LFO Rate */}
          <Knob 
            label="LFO Rate" 
            value={bassParams?.lfoRate ?? 0} 
            min={0} 
            max={10} 
            onChange={(v) => handleParamChange('lfoRate', v)}
            color={track.color}
          />
          {/* LFO Depth */}
          <Knob 
            label="LFO Depth" 
            value={bassParams?.lfoDepth ?? 0} 
            min={0} 
            max={500} 
            onChange={(v) => handleParamChange('lfoDepth', v)}
            color={track.color}
          />
          {/* Compression */}
          <Knob 
            label="Comp" 
            value={bassParams?.compression ?? 0.4} 
            min={0} 
            max={1} 
            onChange={(v) => handleParamChange('compression', v)}
            color={track.color}
          />
          {/* Reverb */}
          <Knob 
            label="Reverb" 
            value={bassParams?.reverb ?? 0} 
            min={0} 
            max={0.8} 
            onChange={(v) => handleParamChange('reverb', v)}
            color={track.color}
          />
          {/* Delay */}
          <Knob 
            label="Delay" 
            value={bassParams?.delay ?? 0} 
            min={0} 
            max={0.8} 
            onChange={(v) => handleParamChange('delay', v)}
            color={track.color}
          />
        </div>
      </div>

      {/* Sound Presets */}
      <SoundPresetSelector 
        onApplyPreset={handleSoundPreset}
        color={track.color}
      />

      {/* Pattern Section */}
      <div className="bass-pattern-section">
        {/* Pattern Accordion Selector - like drum tracks */}
        {!useCustomPattern && (
          <BassPatternAccordion
            patterns={BASS_PATTERNS}
            selectedIndex={selectedPattern}
            onSelect={(idx) => onPatternChange(track.id, idx)}
            currentStep={currentStep}
            isPlaying={isPlaying}
            color={track.color}
          />
        )}
        
        {/* Custom Pattern Editor */}
        {useCustomPattern && (
          <BassPatternEditor 
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

export default BassTrack
