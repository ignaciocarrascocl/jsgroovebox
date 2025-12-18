import NoteBlock from './NoteBlock'

const StepCell = ({ bar, barIndex, stepIndex, dragOverCell, handleStepDragOver, handleStepDragEnter, handleStepDragLeave, handleStepDrop, handleMoveNoteDragStart, updateNote, removeNote, setIsResizing, setResizingData }) => {
  const note = bar.notes.find(n => n.start <= stepIndex && stepIndex < n.start + n.duration)
  if (note) {
    if (note.start === stepIndex) {
      const noteIndex = bar.notes.findIndex(n => n.id === note.id)
      return (
        <NoteBlock
          note={note}
          barIndex={barIndex}
          noteIndex={noteIndex}
          updateNote={updateNote}
          removeNote={removeNote}
          handleMoveNoteDragStart={handleMoveNoteDragStart}
          setIsResizing={setIsResizing}
          setResizingData={setResizingData}
        />
      )
    }
    return null
  }

  return (
    <div
      className={`step empty ${dragOverCell.valid && dragOverCell.barIndex === barIndex && dragOverCell.stepIndex === stepIndex ? 'drop-target' : ''}`}
      onDragOver={handleStepDragOver}
      onDragEnter={(e) => handleStepDragEnter(e, barIndex, stepIndex)}
      onDragLeave={(e) => handleStepDragLeave(e, barIndex, stepIndex)}
      onDrop={(e) => handleStepDrop(e, barIndex, stepIndex)}
    >
      +
    </div>
  )
}

export default StepCell
