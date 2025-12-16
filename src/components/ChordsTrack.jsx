import { useState } from 'react'
import { CHORD_PATTERNS, WAVE_TYPES, CHORD_SOUND_PRESETS } from '../constants/chords'
import Knob from './Knob'
import TrackHead from './TrackHead'
import SoundPresets from './SoundPresets'
import PatternSelector from './PatternSelector'
import './ChordsTrack.css'

// Pattern step editor for chords (16 steps per bar, repeats each bar)
const ChordPatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
  const cycleStep = (index) => {
    const newPattern = [...pattern]
    newPattern[index] = (newPattern[index] + 1) % 5 // 0, 1, 2, 3, 4
    onChange(newPattern)
  }

  const getStepLabel = (value) => {
    switch (value) {
      case 1: return 'T'  // Triad
      case 2: return '7'  // Seventh
      case 3: return 'I'  // Inversion
      case 4: return 'S'  // Stab
      default: return ''
    }
  }

  // currentStep is 0-63, pattern step is 0-15 (repeats each bar)
  const patternStep = currentStep % 16

  return (
    <div className="chord-pattern-editor">
      {pattern.map((step, idx) => (
        <div
          key={idx}
          className={`chord-pattern-step step-type-${step} ${isPlaying && patternStep === idx ? 'current' : ''} ${idx % 4 === 0 ? 'beat-start' : ''}`}
          style={{ '--step-color': color }}
          onClick={() => cycleStep(idx)}
        >
          {getStepLabel(step)}
        </div>
      ))}
    </div>
  )
}

// Chord pattern accordion selector
const ChordPatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)

  // currentStep is 0-63, pattern step is 0-15 (repeats each bar)
  const patternStep = currentStep % 16

  const selectedPattern = patterns[selectedIndex]

  const handleSelect = (idx) => {
    onSelect(idx)
    setIsOpen(false)
  }

  // Get step type class for chord patterns (0, 1, 2, 3, 4)
  const getStepClass = (step) => {
    if (step === 0) return ''
    return `step-type-${step}`
  }

  return (
    <div className="chord-pattern-accordion" style={{ '--accordion-color': color }}>
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

const ChordsTrack = ({
  track,
  isActive,
  selectedPattern,
  customPattern,
  chordParams,
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

  const handleParamChange = (param, value) => {
    onParamChange(track.id, { ...chordParams, [param]: value })
  }

  const handleSoundPreset = (preset) => {
    onParamChange(track.id, { 
      ...chordParams, 
      waveType: preset.waveType,
      filter: preset.filter,
      resonance: preset.resonance,
      attack: preset.attack,
      decay: preset.decay,
      release: preset.release ?? 0.3,
      detune: preset.detune,
      lfoRate: preset.lfoRate,
      lfoDepth: preset.lfoDepth,
      lfoWave: preset.lfoWave ?? 'sine',
      compression: preset.compression,
      drive: preset.drive ?? 0,
      chorus: preset.chorus ?? 0
    })
  }

  return (
    <div
      className={`chord-track ${!isAudible ? 'muted' : ''} ${activeResetTarget === `track-${track.id}` ? 'just-reset' : ''}`}
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
        presets={CHORD_SOUND_PRESETS}
        onApplyPreset={handleSoundPreset}
        color={track.color}
      />

      {/* Pattern Section */}
      <PatternSelector
        patterns={CHORD_PATTERNS}
        selectedIndex={selectedPattern}
        customPattern={customPattern}
        onPatternChange={(idx) => onPatternChange(track.id, idx)}
        onCustomPatternChange={(p) => onCustomPatternChange(track.id, p)}
        currentStep={currentStep}
        isPlaying={isPlaying}
        color={track.color}
        PatternAccordionComponent={ChordPatternAccordion}
        PatternEditorComponent={ChordPatternEditor}
      />

      {/* Controls Section - All Knobs */}
      <div className="chord-track-controls">
        <div className="chord-knobs-section">
          {/* Volume */}
          <Knob 
            label="Volume" 
            value={chordParams?.volume ?? -10} 
            min={-60} 
            max={6} 
            onChange={(v) => handleParamChange('volume', v)}
            color={track.color}
          />
          {/* Wave Type - mapped to numeric value */}
          <Knob 
            label="Wave" 
            value={WAVE_TYPES.indexOf(chordParams?.waveType || 'sawtooth')} 
            min={0} 
            max={WAVE_TYPES.length - 1} 
            step={1}
            onChange={(v) => handleParamChange('waveType', WAVE_TYPES[Math.round(v)])}
            displayValue={WAVE_TYPES[Math.round(WAVE_TYPES.indexOf(chordParams?.waveType || 'sawtooth'))].slice(0, 3).toUpperCase()}
            color={track.color}
          />
          {/* Filter */}
          <Knob 
            label="Filter" 
            value={chordParams?.filter ?? 2500} 
            min={200} 
            max={8000} 
            onChange={(v) => handleParamChange('filter', v)}
            color={track.color}
          />
          {/* Resonance */}
          <Knob 
            label="Reso" 
            value={chordParams?.resonance ?? 2} 
            min={0.5} 
            max={15} 
            onChange={(v) => handleParamChange('resonance', v)}
            color={track.color}
          />
          {/* Detune - for chord richness */}
          <Knob 
            label="Detune" 
            value={chordParams?.detune ?? 5} 
            min={0} 
            max={30} 
            onChange={(v) => handleParamChange('detune', v)}
            color={track.color}
          />
        </div>
        <div className="lfo-section">
          <div className="lfo-header">LFO</div>
          <div className="lfo-knobs">
            <Knob
              label="LFO Rate"
              value={chordParams?.lfoRate ?? 0}
              min={0}
              max={10}
              onChange={(v) => handleParamChange('lfoRate', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="LFO Depth"
              value={chordParams?.lfoDepth ?? 0}
              min={0}
              max={500}
              onChange={(v) => handleParamChange('lfoDepth', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="LFO Wave"
              value={WAVE_TYPES.indexOf(chordParams?.lfoWave || 'sine')}
              min={0}
              max={WAVE_TYPES.length - 1}
              step={1}
              onChange={(v) => handleParamChange('lfoWave', WAVE_TYPES[Math.round(v)])}
              displayValue={WAVE_TYPES[Math.round(WAVE_TYPES.indexOf(chordParams?.lfoWave || 'sine'))].slice(0, 3).toUpperCase()}
              color={track.color}
              size={44}
            />
          </div>
        </div>
        <div className="fx-section">
          <div className="fx-header">FX</div>
          <div className="fx-knobs">
            <Knob
              label="Comp"
              value={chordParams?.compression ?? 0.3}
              min={0}
              max={1}
              onChange={(v) => handleParamChange('compression', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Drive"
              value={chordParams?.drive ?? 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => handleParamChange('drive', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Chorus"
              value={chordParams?.chorus ?? 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => handleParamChange('chorus', v)}
              color={track.color}
              size={44}
            />
          </div>
        </div>
        <div className="adsr-section">
          <div className="adsr-header">ADSR</div>
          <div className="adsr-knobs">
            <Knob
              label="Attack"
              value={chordParams?.attack ?? 0.05}
              min={0.001}
              max={1.5}
              onChange={(v) => handleParamChange('attack', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Decay"
              value={chordParams?.decay ?? 0.4}
              min={0.05}
              max={2}
              onChange={(v) => handleParamChange('decay', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Release"
              value={chordParams?.release ?? 0.3}
              min={0.01}
              max={4}
              step={0.01}
              onChange={(v) => handleParamChange('release', v)}
              color={track.color}
              size={44}
            />
          </div>
        </div>
        <div className="buses-section">
          <div className="buses-header">Buses</div>
          <div className="buses-knobs">
            <div className="bus-knob-item">
              <Knob
                label="Reverb"
                value={chordParams?.reverb ?? 0.2}
                min={0}
                max={0.8}
                onChange={(v) => handleParamChange('reverb', v)}
                tooltip="Send to Reverb bus"
                color={track.color}
                size={44}
              />
              <div className={`led ${((chordParams?.reverb ?? 0) > 0) ? 'on' : ''}`} />
            </div>
            <div className="bus-knob-item">
              <Knob
                label="Delay"
                value={chordParams?.delay ?? 0}
                min={0}
                max={0.8}
                onChange={(v) => handleParamChange('delay', v)}
                tooltip="Send to Delay bus"
                color={track.color}
                size={44}
              />
              <div className={`led ${((chordParams?.delay ?? 0) > 0) ? 'on' : ''}`} />
            </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ChordsTrack
