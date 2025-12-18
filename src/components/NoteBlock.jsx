import { CHORD_TYPES, NOTES, formatChordLabel } from './gridHelpers'

const NoteBlock = ({ note, barIndex, noteIndex, updateNote, removeNote, handleMoveNoteDragStart, setIsResizing, setResizingData }) => {
  return (
    <div
      className="step occupied start"
      style={{ gridColumn: `${note.start + 1} / span ${note.duration}` }}
      draggable
      onDragStart={(e) => handleMoveNoteDragStart(e, barIndex, note.id)}
      onDragOver={(e) => { e.dataTransfer.dropEffect = 'none'; e.preventDefault(); }}
      onDrop={(e) => { e.stopPropagation(); e.preventDefault(); }}
    >
      <div className="chord-display">
        <span className="chord-name">{formatChordLabel(note.root, note.type)}</span>
        <div className="chord-edits">
          <select
            draggable={false}
            onMouseDown={(e) => e.stopPropagation()}
            value={note.root}
            onChange={(e) => updateNote(barIndex, noteIndex, { root: e.target.value })}
          >
            {NOTES.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select
            draggable={false}
            onMouseDown={(e) => e.stopPropagation()}
            value={note.type}
            onChange={(e) => updateNote(barIndex, noteIndex, { type: e.target.value })}
          >
            {CHORD_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="drag-indicator">⋮⋮</div>
        <button className="delete-btn" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removeNote(barIndex, noteIndex); }}>X</button>
      </div>
      <div
        className="resize-handle"
        draggable={false}
        onMouseDown={(e) => {
          setIsResizing(true)
          setResizingData({ barIndex, noteIndex, startX: e.clientX, initialDuration: note.duration, initialStart: note.start })
          e.preventDefault()
        }}
      ></div>
    </div>
  )
}

export default NoteBlock
