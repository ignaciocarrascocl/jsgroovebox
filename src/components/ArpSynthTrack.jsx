import { useState } from 'react'
import { ARP_SYNTH_PATTERNS, WAVE_TYPES, ARP_SYNTH_SOUND_PRESETS } from '../constants/arpSynth'
import Knob from './Knob'
import TrackHead from './TrackHead'
import SoundPresets from './SoundPresets'
import PatternSelector from './PatternSelector'
import './MonoSynthTrack.css' // reuse mono synth styles for consistency

// Pattern step editor for arp (16 steps per bar, repeats each bar)
const ArpPatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
  const cycleStep = (index) => {
    const newPattern = [...pattern]
    newPattern[index] = (newPattern[index] + 1) % 4 // 0,1,2,3
    onChange(newPattern)
  }

  const getStepLabel = (value) => {
    switch (value) {
      case 1: return '1'
      case 2: return '2'
      case 3: return '3'
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

// Arp pattern accordion selector - like chord/bass
const ArpPatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)

  // currentStep is 0-63, pattern step is 0-15 (repeats each bar)
  const patternStep = currentStep % 16

  const selectedPattern = patterns[selectedIndex]

  const handleSelect = (idx) => {
    onSelect(idx)
    setIsOpen(false)
  }

  // Get step type class for patterns (0-3)
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

const ArpTrack = ({
  track,
  isActive,
  selectedPattern,
  customPattern,
  arpParams,
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
    onParamChange(track.id, { ...arpParams, [param]: value })
  }

  const handleSoundPreset = (preset) => {
    onParamChange(track.id, { 
      ...arpParams, 
      waveType: preset.waveType,
      waveShape: preset.waveShape ?? arpParams?.waveShape ?? 0,
      detune: preset.detune ?? arpParams?.detune ?? 0,
      volume: preset.volume ?? arpParams?.volume ?? -6,
      filter: preset.filter ?? arpParams?.filter ?? 1200,
      resonance: preset.resonance ?? arpParams?.resonance ?? 1,
      attack: preset.attack ?? arpParams?.attack ?? 0.005,
      decay: preset.decay ?? arpParams?.decay ?? 0.08,
      release: preset.release ?? arpParams?.release ?? 0.1,
      lfoRate: preset.lfoRate ?? arpParams?.lfoRate ?? 0,
      lfoDepth: preset.lfoDepth ?? arpParams?.lfoDepth ?? 0,
      compression: preset.compression ?? arpParams?.compression ?? 0,
      drive: preset.drive ?? arpParams?.drive ?? 0,
      chorus: preset.chorus ?? arpParams?.chorus ?? 0,
      reverb: preset.reverb ?? arpParams?.reverb ?? 0,
      delay: preset.delay ?? arpParams?.delay ?? 0,
    })
  }

  return (
    <div
      className={`bass-track ${!isAudible ? 'muted' : ''} ${activeResetTarget === `track-${track.id}` ? 'just-reset' : ''}`}
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
        presets={ARP_SYNTH_SOUND_PRESETS}
        onApplyPreset={handleSoundPreset}
        color={track.color}
      />

      {/* Pattern Section */}
      <PatternSelector
        patterns={ARP_SYNTH_PATTERNS}
        selectedIndex={selectedPattern}
        customPattern={customPattern}
        onPatternChange={(idx) => onPatternChange(track.id, idx)}
        onCustomPatternChange={(p) => onCustomPatternChange(track.id, p)}
        currentStep={currentStep}
        isPlaying={isPlaying}
        color={track.color}
        PatternAccordionComponent={ArpPatternAccordion}
        PatternEditorComponent={ArpPatternEditor}
      />

      {/* Controls Section - All Knobs */}
      <div className="bass-track-controls">
        <div className="bass-knobs-section">
          <div style={{ width: '100%' }} />
          <div style={{ width: '100%' }} />
          <div style={{ width: '100%' }} />
        </div>

        {/* Wave section */}
        <div className="wave-section">
          <div className="wave-header">Wave</div>
          <div className="wave-knobs">
            <Knob 
              label="Wave" 
              value={WAVE_TYPES.indexOf(arpParams?.waveType || 'sawtooth')} 
              min={0} 
              max={WAVE_TYPES.length - 1} 
              step={1}
              onChange={(v) => handleParamChange('waveType', WAVE_TYPES[Math.round(v)])}
              displayValue={WAVE_TYPES[Math.round(WAVE_TYPES.indexOf(arpParams?.waveType || 'sawtooth'))].slice(0, 3).toUpperCase()}
              color={track.color}
            />
            <Knob
              label="Shape"
              value={arpParams?.waveShape ?? 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => handleParamChange('waveShape', v)}
              color={track.color}
            />
            <Knob 
              label="Detune" 
              value={arpParams?.detune ?? 5} 
              min={0} 
              max={30} 
              onChange={(v) => handleParamChange('detune', v)}
              color={track.color}
            />
            {/* Volume moved to Mixer */}
            <div style={{ width: '100%' }} />
          </div>
        </div>

        {/* Filter section */}
        <div className="filter-section">
          <div className="filter-header">Filter</div>
          <div className="filter-knobs">
            <Knob 
              label="Filter" 
              value={arpParams?.filter ?? 1200} 
              min={60} 
              max={12000} 
              onChange={(v) => handleParamChange('filter', v)}
              color={track.color}
            />
            <Knob 
              label="Reso" 
              value={arpParams?.resonance ?? 1} 
              min={0.5} 
              max={15} 
              onChange={(v) => handleParamChange('resonance', v)}
              color={track.color}
            />
          </div>
        </div>

        <div className="lfo-section">
          <div className="lfo-header">LFO</div>
          <div className="lfo-knobs">
            <Knob 
              label="LFO Rate" 
              value={arpParams?.lfoRate ?? 0} 
              min={0} 
              max={10} 
              onChange={(v) => handleParamChange('lfoRate', v)}
              color={track.color}
              size={44}
            />
            <Knob 
              label="LFO Depth" 
              value={arpParams?.lfoDepth ?? 0} 
              min={0} 
              max={500} 
              onChange={(v) => handleParamChange('lfoDepth', v)}
              color={track.color}
              size={44}
            />
          </div>
        </div>

        {/* FX section */}
        <div className="fx-section">
          <div className="fx-header">FX</div>
          <div className="fx-knobs">
            <Knob 
              label="Comp" 
              value={arpParams?.compression ?? 0} 
              min={0} 
              max={1} 
              onChange={(v) => handleParamChange('compression', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Drive"
              value={arpParams?.drive ?? 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => handleParamChange('drive', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Chorus"
              value={arpParams?.chorus ?? 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => handleParamChange('chorus', v)}
              color={track.color}
              size={44}
            />
          </div>
        </div>

        {/* ADSR section */}
        <div className="adsr-section">
          <div className="adsr-header">ADSR</div>
          <div className="adsr-knobs">
            <Knob
              label="Attack"
              value={arpParams?.attack ?? 0.005}
              min={0.001}
              max={0.3}
              onChange={(v) => handleParamChange('attack', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Decay"
              value={arpParams?.decay ?? 0.08}
              min={0.01}
              max={1}
              onChange={(v) => handleParamChange('decay', v)}
              color={track.color}
              size={44}
            />
            <Knob
              label="Release"
              value={arpParams?.release ?? 0.1}
              min={0.01}
              max={4}
              step={0.01}
              onChange={(v) => handleParamChange('release', v)}
              color={track.color}
              size={44}
            />
          </div>
        </div>

        {/* Buses Section */}
        <div className="buses-section">
          <div className="buses-header">Buses</div>
          <div className="buses-knobs">
            <div className="bus-knob-item">
              <Knob
                label="Reverb"
                value={arpParams?.reverb ?? 0}
                min={0}
                max={0.8}
                onChange={(v) => handleParamChange('reverb', v)}
                tooltip="Send to Reverb bus"
                color={track.color}
                size={44}
              />
              <div className={`led ${((arpParams?.reverb ?? 0) > 0) ? 'on' : ''}`} />
            </div>
            <div className="bus-knob-item">
              <Knob
                label="Delay"
                value={arpParams?.delay ?? 0}
                min={0}
                max={0.8}
                onChange={(v) => handleParamChange('delay', v)}
                tooltip="Send to Delay bus"
                color={track.color}
                size={44}
              />
              <div className={`led ${((arpParams?.delay ?? 0) > 0) ? 'on' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* end - pattern moved above, controls follow */}
    </div>
  )
}

export default ArpTrack
