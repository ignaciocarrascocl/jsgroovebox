import { getChordForDegree } from './gridHelpers'

const ScaleDisplay = ({ selectedKey, selectedMode, onChordDragStart, onDragEnd }) => {
  const modeLabel = selectedMode === 'Minor' ? 'Menor' : 'Mayor'
  return (
    <div className="scale-display">
      <h3>Acordes de la escala ({selectedKey} {modeLabel}):</h3>
      <div className="chord-list">
        {[0,1,2,3,4,5,6].map((degree) => {
          const chord = getChordForDegree(selectedKey, degree, selectedMode)
          return (
            <div 
              key={degree}
              className="chord-item draggable"
              draggable
              onDragStart={(e) => onChordDragStart(e, chord)}
              onDragEnd={onDragEnd}
            >
              <div className="chord-name">{chord.note}{chord.displayType}</div>
              <div className="chord-roman">{chord.roman}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScaleDisplay
