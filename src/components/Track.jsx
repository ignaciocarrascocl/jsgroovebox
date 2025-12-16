import { useState } from 'react'
import { getPatternOptions, DRUM_SOUND_PRESETS } from '../constants/patterns'
import Knob from './Knob'
import TrackHead from './TrackHead'
import SoundPresets from './SoundPresets'
import PatternSelector from './PatternSelector'
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
  onReset,
  masterMeter,
  activeResetTarget,
}) => {
  const patternOptions = getPatternOptions(track.id)

  const handleParamChange = (param, value) => {
    onParamChange(track.id, { ...trackParams, [param]: value })
  }

  const handleSoundPreset = (preset) => {
    onParamChange(track.id, { ...trackParams, ...preset.params })
  }

  const meterHasSignal = (v) => {
    if (v === undefined || v === null) return false
    if (Math.abs(v) <= 2) return Math.abs(v) > 1e-3
    return v > -60
  }

  return (
    <div
      className={`track ${!isAudible ? 'muted' : ''} ${activeResetTarget === `track-${track.id}` ? 'just-reset' : ''}`}
      style={{ '--track-color': track.color }}
    >
      {/* Wave Visualizer Header */}
      <TrackHead
        track={track}
        isActive={isActive}
        isMuted={isMuted}
        isSoloed={isSoloed}
        onPlay={onPlay}
        onMuteToggle={onMuteToggle}
        onSoloToggle={onSoloToggle}
        onReset={onReset}
        trackId={track.id}
      />

      {/* Sound Presets */}
      <SoundPresets
        presets={DRUM_SOUND_PRESETS[track.id] || []}
        onApplyPreset={handleSoundPreset}
        color={track.color}
      />

      {/* Pattern Section */}
      <PatternSelector
        patterns={patternOptions}
        selectedIndex={selectedPattern}
        customPattern={customPattern}
        onPatternChange={(idx) => onPatternChange(track.id, idx)}
        onCustomPatternChange={(p) => onCustomPatternChange(track.id, p)}
        currentStep={currentStep}
        isPlaying={isPlaying}
        color={track.color}
        PatternAccordionComponent={PatternAccordion}
        PatternEditorComponent={PatternEditor}
      />

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
                  {/* Buses Section - Reverb & Delay are buses (separate visual group) */}
                  <div className="buses-section">
                    <div className="buses-header">Buses</div>
                    <div className="buses-knobs">
                      <div className="bus-knob-item">
                        <Knob
                          label="Reverb"
                          value={trackParams?.reverb ?? 0}
                          min={0}
                          max={0.8}
                          onChange={(v) => handleParamChange('reverb', v)}
                          tooltip="Send to Reverb bus"
                          color={track.color}
                          size={44}
                        />
                        <div className={`led ${((trackParams?.reverb ?? 0) > 0 && meterHasSignal(masterMeter?.reverbVal)) ? 'on' : ''}`} />
                      </div>
                      <div className="bus-knob-item">
                        <Knob
                          label="Delay"
                          value={trackParams?.delay ?? 0}
                          min={0}
                          max={0.8}
                          onChange={(v) => handleParamChange('delay', v)}
                          tooltip="Send to Delay bus"
                          color={track.color}
                          size={44}
                        />
                        <div className={`led ${((trackParams?.delay ?? 0) > 0 && meterHasSignal(masterMeter?.delayVal)) ? 'on' : ''}`} />
                      </div>
                    </div>
                    
                  </div>
      </div>
    </div>
  )
}

export default Track
