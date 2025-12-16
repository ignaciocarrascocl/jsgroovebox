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
  onReset,
  activeResetTarget,
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
      compression: preset.compression,
      drive: preset.drive ?? 0,
      chorus: preset.chorus ?? 0
    })
  }

  return (
    <div
      className={`bass-track ${!isAudible ? 'muted' : ''} ${activeResetTarget === `track-${track.id}` ? 'just-reset' : ''}`}
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
            className={`action-btn solo-btn ${isSoloed ? 'active' : ''}`}
            onClick={() => onSoloToggle(track.id)}
            title="Solo"
            aria-pressed={isSoloed}
            aria-label="Solo track"
          >
            S
          </button>
          <button 
            className={`action-btn mute-btn ${isMuted ? 'active' : ''}`}
            onClick={() => onMuteToggle(track.id)}
            title="Mute (M)"
            aria-pressed={isMuted}
            aria-label="Mute track"
          >
            M
          </button>
          <button
            className="action-btn reset-btn"
            title="Reset bass"
            onClick={() => onReset?.()}
            aria-label="Reset bass"
          >
            ⟲
          </button>
        </div>
      {/* header end */}
      </div>
      {/* Presets row (separate from header) */}
      <div className="bass-presets-row">
        <SoundPresetSelector
          onApplyPreset={handleSoundPreset}
          color={track.color}
        />
      </div>

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
          {/* Drive (Distortion) */}
          <Knob
            label="Drive"
            value={bassParams?.drive ?? 0}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => handleParamChange('drive', v)}
            color={track.color}
          />
          {/* Chorus (wet send) */}
          <Knob
            label="Chorus"
            value={bassParams?.chorus ?? 0}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => handleParamChange('chorus', v)}
            color={track.color}
          />
        </div>
        {/* Buses Section */}
        <div className="buses-section">
          <div className="buses-header">Buses</div>
          <div className="buses-knobs">
            <div className="bus-knob-item">
              <Knob
                label="Reverb"
                value={bassParams?.reverb ?? 0}
                min={0}
                max={0.8}
                onChange={(v) => handleParamChange('reverb', v)}
                tooltip="Send to Reverb bus"
                color={track.color}
                size={44}
              />
              <div className={`led ${((bassParams?.reverb ?? 0) > 0) ? 'on' : ''}`} />
            </div>
            <div className="bus-knob-item">
              <Knob
                label="Delay"
                value={bassParams?.delay ?? 0}
                min={0}
                max={0.8}
                onChange={(v) => handleParamChange('delay', v)}
                tooltip="Send to Delay bus"
                color={track.color}
                size={44}
              />
              <div className={`led ${((bassParams?.delay ?? 0) > 0) ? 'on' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* end - pattern moved above, controls follow */}
    </div>
  )
}

export default BassTrack
