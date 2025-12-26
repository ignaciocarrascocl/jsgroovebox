import BarHeader from './BarHeader'
import StepCell from './StepCell'
import { formatChordLabel } from './secuenciadorHelpers'
import { useState } from 'react'
import PatternSelector from './PatternSelector'
import { getPatternOptions } from '../constants/patterns'
import { MONO_SYNTH_PATTERNS } from '../constants/monoSynth'
import { POLY_SYNTH_PATTERNS } from '../constants/polySynth'
import { ARP_SYNTH_PATTERNS } from '../constants/arpSynth'
import { TRACKS } from '../constants/tracks'

// Simple binary pattern editor (used for drum tracks)
const DrumPatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
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

// Simple accordion for drum patterns
const DrumPatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedPattern = patterns[selectedIndex]
  const handleSelect = (idx) => { onSelect(idx); setIsOpen(false) }

  return (
    <div className="pattern-accordion" style={{ '--accordion-color': color }}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-pattern">
          {selectedPattern?.pattern.map((step, idx) => (
            <div key={idx} className={`header-step ${step ? 'active' : ''} ${isPlaying && currentStep === idx ? 'current' : ''}`} />
          ))}
        </div>
        <span className="header-name">{selectedPattern?.name || 'Select'}</span>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {patterns.map((pattern, idx) => (
            <div key={idx} className={`pattern-option ${selectedIndex === idx ? 'selected' : ''}`} onClick={() => handleSelect(idx)}>
              <div className="option-pattern">
                {pattern.pattern.map((step, stepIdx) => (
                  <div key={stepIdx} className={`option-step ${step ? 'active' : ''}`} />
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

// Bass (mono) editor/accordion
const BassPatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
  const cycleStep = (index) => {
    const newPattern = [...pattern]
    newPattern[index] = (newPattern[index] + 1) % 4 // 0..3
    onChange(newPattern)
  }
  const getStepLabel = (value) => {
    switch (value) { case 1: return 'R'; case 2: return '5'; case 3: return 'O'; default: return '' }
  }
  const patternLen = (pattern && pattern.length) || 16
  const patternStep = currentStep % patternLen
  return (
    <div className="bass-pattern-editor">
      {pattern.map((step, idx) => (
        <div key={idx} className={`bass-pattern-step step-type-${step} ${isPlaying && patternStep === idx ? 'current' : ''} ${idx % 4 === 0 ? 'beat-start' : ''}`} style={{ '--step-color': color }} onClick={() => cycleStep(idx)}>
          {getStepLabel(step)}
        </div>
      ))}
    </div>
  )
}

const BassPatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedPattern = patterns[selectedIndex]
  const patternLen = (selectedPattern?.pattern?.length) || 16
  const patternStep = currentStep % patternLen
  const handleSelect = (idx) => { onSelect(idx); setIsOpen(false) }
  const getStepClass = (step) => (step === 0 ? '' : `step-type-${step}`)
  return (
    <div className="bass-pattern-accordion" style={{ '--accordion-color': color }}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-pattern">
          {selectedPattern?.pattern.map((step, idx) => (
            <div key={idx} className={`header-step ${getStepClass(step)} ${isPlaying && patternStep === idx ? 'current' : ''}`} />
          ))}
        </div>
        <span className="header-name">{selectedPattern?.name || 'Select'}</span>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {patterns.map((pattern, idx) => (
            <div key={idx} className={`pattern-option ${selectedIndex === idx ? 'selected' : ''}`} onClick={() => handleSelect(idx)}>
              <div className="option-pattern">{pattern.pattern.map((step, stepIdx) => (
                <div key={stepIdx} className={`option-step ${getStepClass(step)}`} />
              ))}</div>
              <span className="option-name">{pattern.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Chord (poly) editor/accordion
const ChordPatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
  const cycleStep = (index) => {
    const newPattern = [...pattern]
    newPattern[index] = (newPattern[index] + 1) % 5
    onChange(newPattern)
  }
  const getStepLabel = (value) => { switch (value) { case 1: return 'T'; case 2: return '7'; case 3: return 'I'; case 4: return 'S'; default: return '' } }
  const patternLen = (pattern && pattern.length) || 16
  const patternStep = currentStep % patternLen
  return (
    <div className="chord-pattern-editor">
      {pattern.map((step, idx) => (
        <div key={idx} className={`chord-pattern-step step-type-${step} ${isPlaying && patternStep === idx ? 'current' : ''} ${idx % 4 === 0 ? 'beat-start' : ''}`} style={{ '--step-color': color }} onClick={() => cycleStep(idx)}>
          {getStepLabel(step)}
        </div>
      ))}
    </div>
  )
}

const ChordPatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedPattern = patterns[selectedIndex]
  const patternLen = (selectedPattern?.pattern?.length) || 16
  const patternStep = currentStep % patternLen
  const handleSelect = (idx) => { onSelect(idx); setIsOpen(false) }
  const getStepClass = (step) => (step === 0 ? '' : `step-type-${step}`)
  return (
    <div className="chord-pattern-accordion" style={{ '--accordion-color': color }}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-pattern">
          {selectedPattern?.pattern.map((step, idx) => (
            <div key={idx} className={`header-step ${getStepClass(step)} ${isPlaying && patternStep === idx ? 'current' : ''}`} />
          ))}
        </div>
        <span className="header-name">{selectedPattern?.name || 'Select'}</span>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {patterns.map((pattern, idx) => (
            <div key={idx} className={`pattern-option ${selectedIndex === idx ? 'selected' : ''}`} onClick={() => handleSelect(idx)}>
              <div className="option-pattern">{pattern.pattern.map((step, stepIdx) => (
                <div key={stepIdx} className={`option-step ${getStepClass(step)}`} />
              ))}</div>
              <span className="option-name">{pattern.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Arp editor/accordion
const ArpPatternEditor = ({ pattern, onChange, currentStep, isPlaying, color }) => {
  const cycleStep = (index) => { const newPattern = [...pattern]; newPattern[index] = (newPattern[index] + 1) % 4; onChange(newPattern) }
  const getStepLabel = (value) => { switch (value) { case 1: return '1'; case 2: return '2'; case 3: return '3'; default: return '' } }
  const patternLen = (pattern && pattern.length) || 16
  const patternStep = currentStep % patternLen
  return (
    <div className="bass-pattern-editor">
      {pattern.map((step, idx) => (
        <div key={idx} className={`bass-pattern-step step-type-${step} ${isPlaying && patternStep === idx ? 'current' : ''} ${idx % 4 === 0 ? 'beat-start' : ''}`} style={{ '--step-color': color }} onClick={() => cycleStep(idx)}>
          {getStepLabel(step)}
        </div>
      ))}
    </div>
  )
}

const ArpPatternAccordion = ({ patterns, selectedIndex, onSelect, currentStep, isPlaying, color }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedPattern = patterns[selectedIndex]
  const patternLen = (selectedPattern?.pattern?.length) || 16
  const patternStep = currentStep % patternLen
  const handleSelect = (idx) => { onSelect(idx); setIsOpen(false) }
  const getStepClass = (step) => (step === 0 ? '' : `step-type-${step}`)
  return (
    <div className="bass-pattern-accordion" style={{ '--accordion-color': color }}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-pattern">
          {selectedPattern?.pattern.map((step, idx) => (
            <div key={idx} className={`header-step ${getStepClass(step)} ${isPlaying && patternStep === idx ? 'current' : ''}`} />
          ))}
        </div>
        <span className="header-name">{selectedPattern?.name || 'Select'}</span>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {patterns.map((pattern, idx) => (
            <div key={idx} className={`pattern-option ${selectedIndex === idx ? 'selected' : ''}`} onClick={() => handleSelect(idx)}>
              <div className="option-pattern">{pattern.pattern.map((step, stepIdx) => (
                <div key={stepIdx} className={`option-step ${getStepClass(step)}`} />
              ))}</div>
              <span className="option-name">{pattern.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const getPatternsForTrack = (trackId) => {
  if (trackId === 6) return MONO_SYNTH_PATTERNS
  if (trackId === 7) return POLY_SYNTH_PATTERNS
  if (trackId === 8) return ARP_SYNTH_PATTERNS
  return getPatternOptions(trackId)
}

const getAccordionForTrack = (trackId) => {
  if (trackId === 6) return BassPatternAccordion
  if (trackId === 7) return ChordPatternAccordion
  if (trackId === 8) return ArpPatternAccordion
  return DrumPatternAccordion
}

const getEditorForTrack = (trackId) => {
  if (trackId === 6) return BassPatternEditor
  if (trackId === 7) return ChordPatternEditor
  if (trackId === 8) return ArpPatternEditor
  return DrumPatternEditor
}

const Bar = ({ bar, barIndex, barsLength, updateBarName, updateRepeat, moveBar, cloneBar, deleteBar, addBar, handleDragStart, handleDragOver, handleDrop, handleDragEnd, handleStepDragOver, handleStepDragEnter, handleStepDragLeave, handleStepDrop, handleMovesDrop, dragOverCell, updateNote, removeNote, handleMoveNoteDragStart, setIsResizing, setResizingData, clearBar, progressions, applyProgressionToBar, currentStep = 0, isPlaying = false, selectedPatterns = {}, customPatterns = {}, onPatternChange, onCustomPatternChange, isSelected = false, isActive = false, onSelect = () => {} }) => {
  return (
    <div className={`bar ${isActive ? 'playing' : ''} ${isSelected ? 'selected' : ''}`}>
      <BarHeader
        bar={bar}
        barIndex={barIndex}
        barsLength={barsLength}
        updateBarName={updateBarName}
        updateRepeat={updateRepeat}
        moveBar={moveBar}
        cloneBar={cloneBar}
        addBar={addBar}
        deleteBar={deleteBar}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleDragEnd={handleDragEnd}
        clearBar={clearBar}
        progressions={progressions}
        applyProgressionToBar={applyProgressionToBar}
        isSelected={isSelected}
        isActive={isActive}
        onSelect={onSelect}
      />

      {/* Debug: lista compacta de acordes colocados en esta parte */}
      <div className="part-chord-list">
        {bar.notes.length === 0 ? (
          <div className="part-chord-empty">Sin acordes</div>
        ) : (
          [...bar.notes].slice().sort((a,b) => a.start - b.start).map((n, idx) => (
            <div key={idx} className="part-chord-item">
              <span className="part-chord-start">inicio: {n.start}</span>
              <span className="part-chord-name">{formatChordLabel(n.root, n.type)}</span>
              <span className="part-chord-duration">duración: {n.duration}</span>
            </div>
          ))
        )}
      </div>

      <div className="steps" onDragOver={handleStepDragOver} onDrop={(e) => handleMovesDrop(e, barIndex)}>
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(stepIndex => (
          <StepCell
            key={stepIndex}
            bar={bar}
            barIndex={barIndex}
            stepIndex={stepIndex}
            dragOverCell={dragOverCell}
            handleStepDragOver={handleStepDragOver}
            handleStepDragEnter={handleStepDragEnter}
            handleStepDragLeave={handleStepDragLeave}
            handleStepDrop={handleStepDrop}
            handleMoveNoteDragStart={handleMoveNoteDragStart}
            updateNote={updateNote}
            removeNote={removeNote}
            setIsResizing={setIsResizing}
            setResizingData={setResizingData}
          />
        ))}
      </div>

      {/* LED indicators row: continuous 64 subdivisions (one LED per subdivision) */}
      <div className="step-leds step-leds-64" aria-hidden="true">
        {Array.from({ length: 64 }).map((_, idx) => {
          const isCurrent = isPlaying && (idx === currentStep)
          return <div key={idx} className={`led step-sub-led ${isCurrent ? 'current' : ''}`} />
        })}
      </div>

      {/* Pattern selectors arranged in 3 rows x 3 columns (moved below step LEDs) */}
      {(() => {
        const patternTracks = TRACKS.filter(t => {
          const p = getPatternsForTrack(t.id)
          return p && p.length > 0
        })
        const rows = []
        for (let i = 0; i < 3; i++) rows.push(patternTracks.slice(i * 3, i * 3 + 3))

        return (
          <div className="bar-pattern-selectors">
            {rows.map((row, rowIdx) => (
              <div className="pattern-row" key={rowIdx}>
                {row.map(track => {
                  const patterns = getPatternsForTrack(track.id)
                  const Accordion = getAccordionForTrack(track.id)
                  const Editor = getEditorForTrack(track.id)
                  return (
                    <div key={track.id} className="bar-pattern-item" style={{ '--track-color': track.color }}>
                      <button type="button" className="track-title-btn" title={track.name} style={{ '--track-color': track.color }}>
                        <span className="track-title">{track.name}</span>
                      </button>
                      <PatternSelector
                        patterns={patterns}
                        selectedIndex={selectedPatterns?.[track.id]}
                        customPattern={customPatterns?.[track.id]}
                        onPatternChange={(idx) => onPatternChange?.(track.id, idx)}
                        onCustomPatternChange={(p) => onCustomPatternChange?.(track.id, p)}
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        color={track.color}
                        PatternAccordionComponent={Accordion}
                        PatternEditorComponent={Editor}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

export default Bar
