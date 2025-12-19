import BarHeader from './BarHeader'
import StepCell from './StepCell'
import { formatChordLabel } from './secuenciadorHelpers'

const Bar = ({ bar, barIndex, barsLength, updateBarName, updateRepeat, updateCurrent, moveBar, cloneBar, deleteBar, addBar, handleDragStart, handleDragOver, handleDrop, handleDragEnd, handleStepDragOver, handleStepDragEnter, handleStepDragLeave, handleStepDrop, handleStepsDrop, dragOverCell, updateNote, removeNote, handleMoveNoteDragStart, setIsResizing, setResizingData, clearBar, progressions, applyProgressionToBar }) => {
  return (
    <div className="bar">
      <BarHeader
        bar={bar}
        barIndex={barIndex}
        barsLength={barsLength}
        updateBarName={updateBarName}
        updateRepeat={updateRepeat}
        updateCurrent={updateCurrent}
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
      />

      <div className="steps" onDragOver={handleStepDragOver} onDrop={(e) => handleStepsDrop(e, barIndex)}>
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
    </div>
  )
}

export default Bar
