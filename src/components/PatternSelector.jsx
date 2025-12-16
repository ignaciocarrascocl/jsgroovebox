import { useState } from 'react'
import './PatternSelector.css'

// Reusable pattern selector component
const PatternSelector = ({
  patterns,
  selectedIndex,
  customPattern,
  onPatternChange,
  onCustomPatternChange,
  currentStep,
  isPlaying,
  color,
  PatternAccordionComponent,
  PatternEditorComponent
}) => {
  const [useCustomPattern, setUseCustomPattern] = useState(false)

  return (
    <div className="pattern-section">
      {/* Pattern Accordion Selector */}
      {!useCustomPattern && (
        <PatternAccordionComponent
          patterns={patterns}
          selectedIndex={selectedIndex}
          onSelect={(idx) => onPatternChange(idx)}
          currentStep={currentStep}
          isPlaying={isPlaying}
          color={color}
        />
      )}

      {/* Custom Pattern Editor */}
      {useCustomPattern && (
        <PatternEditorComponent
          pattern={customPattern || Array(16).fill(0)}
          onChange={(p) => onCustomPatternChange(p)}
          currentStep={currentStep}
          isPlaying={isPlaying}
          color={color}
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
  )
}

export default PatternSelector
