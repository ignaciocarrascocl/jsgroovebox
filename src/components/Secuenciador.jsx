import { useState, useEffect, useCallback, useRef } from 'react'
import './Secuenciador.css'

import { KEYS } from './secuenciadorHelpers'
import ScaleDisplay from './ScaleDisplay'
import Bar from './Bar'
import { CHORD_PROGRESSIONS } from '../constants/song'
import { getChordForDegree } from './secuenciadorHelpers'

const Secuenciador = ({ showToast }) => {
  const [bars, setBars] = useState([
    { id: 1, name: 'Parte 1', notes: [], repeat: 1, current: 1, key: 'C', mode: 'Major' } // notes: [{ start: 0, duration: 1, root: 'C', type: 'major' }]
  ])
  
  const [selectedKey, setSelectedKey] = useState('C')
  const [selectedMode, setSelectedMode] = useState('Major')
  const [isResizing, setIsResizing] = useState(false)
  const [resizingData, setResizingData] = useState({ barIndex: null, noteIndex: null, startX: 0, initialDuration: 0, initialStart: 0 })
  const [dragOverCell, setDragOverCell] = useState({ barIndex: null, stepIndex: null, valid: false })
  const [draggingType, setDraggingType] = useState(null)
  const nextNoteIdRef = useRef(1)

  const updateBarName = (barIndex, name) => {
    const newBars = [...bars]
    newBars[barIndex].name = name
    setBars(newBars)
  }

  const addBar = () => {
    const newBar = {
      id: bars.length + 1,
      name: `Parte ${bars.length + 1}`,
      notes: [],
      repeat: 1,
      current: 1,
      key: selectedKey,
      mode: selectedMode
    }
    setBars([...bars, newBar])
  }

  const addNote = (barIndex, start, root = 'C', type = 'major') => {
    const bar = bars[barIndex]
    const existing = bar.notes.find(n => n.start <= start && start < n.start + n.duration)
    if (!existing) {
      const newBars = [...bars]
      const id = nextNoteIdRef.current++
      newBars[barIndex].notes.push({ id, start, duration: 1, root, type })
      setBars(newBars)
    }
  }

  const updateNote = useCallback((barIndex, noteIndex, updates) => {
    const newBars = [...bars]
    const bar = newBars[barIndex]
    const origNote = bar.notes[noteIndex]
    if (!origNote) return

    const updatedNote = { ...origNote, ...updates }
    // Ensure bounds
    updatedNote.start = Math.max(0, Math.min(15, updatedNote.start))
    updatedNote.duration = Math.max(1, Math.min(16 - updatedNote.start, updatedNote.duration || origNote.duration))

    // Apply update
    bar.notes[noteIndex] = updatedNote

    // If start/duration changed, remove any other notes overlapping the updated range
    if ('duration' in updates || 'start' in updates) {
      const start = updatedNote.start
      const end = updatedNote.start + updatedNote.duration
      bar.notes = bar.notes.filter((n, idx) => {
        if (idx === noteIndex) return true
        // Keep notes that don't overlap
        return !(n.start < end && start < n.start + n.duration)
      })
    }

    setBars(newBars)
  }, [bars])

  const removeNote = (barIndex, noteIndex) => {
    const newBars = [...bars]
    newBars[barIndex].notes.splice(noteIndex, 1)
    setBars(newBars)
  }

  const updateRepeat = (barIndex, repeat) => {
    const newBars = [...bars]
    const bar = newBars[barIndex]
    bar.repeat = Math.max(1, parseInt(repeat) || 1)
    bar.current = Math.min(bar.current, bar.repeat)
    setBars(newBars)
  }

  const deleteBar = (barIndex) => {
    if (bars.length > 1) {
      const newBars = bars.filter((_, index) => index !== barIndex)
      setBars(newBars)
      showToast?.('Parte eliminada')
    }
  }

  // Clear all notes in a part (bar)
  const clearBar = (barIndex) => {
    const newBars = [...bars]
    if (!newBars[barIndex]) return
    if (!newBars[barIndex].notes || newBars[barIndex].notes.length === 0) return
    newBars[barIndex] = { ...newBars[barIndex], notes: [] }
    setBars(newBars)
    showToast?.('Acordes limpiados')
  }

  const cloneBar = (barIndex) => {
    const bar = bars[barIndex]
    const newBar = {
      id: bars.length + 1,
      notes: bar.notes.map(note => ({ ...note, id: nextNoteIdRef.current++ })), // deep copy with fresh ids
      repeat: bar.repeat,
      current: bar.current,
      key: bar.key,
      mode: bar.mode,
      name: `${bar.name} (copia)`
    }
    const newBars = [...bars]
    newBars.splice(barIndex + 1, 0, newBar) // insert after
    setBars(newBars)
  }

  // Apply a progression to a part (bar). Each chord will span 4 steps so a 16-step bar
  // will contain four chords at starts 0,4,8,12. Uses the selected key (or bar key)
  // and the progression's declared mode to compute actual chord roots/types.
  const applyProgressionToBar = (barIndex, progressionIndex) => {
    const prog = CHORD_PROGRESSIONS[progressionIndex]
    if (!prog) return

    const bar = bars[barIndex]
    if (!bar) return

    // Overwrite existing chords without confirmation
    // previously this asked the user to confirm

    // Use the song-level selected key and the progression's declared mode
    const keyToUse = selectedKey
    const modeToUse = prog.mode || selectedMode

    const chords = prog.chords || []
    const stepLength = 4
    const newNotes = []

    for (let i = 0; i < Math.min(4, chords.length); i++) {
      const degree = chords[i]
      const chord = getChordForDegree(keyToUse, degree, modeToUse)
      const start = i * stepLength
      const duration = stepLength
      const id = nextNoteIdRef.current++
      newNotes.push({ id, start, duration, root: chord.note, type: chord.type })
    }

    const newBars = [...bars]
    newBars[barIndex] = { ...newBars[barIndex], notes: newNotes, key: keyToUse, mode: modeToUse }
    setBars(newBars)
    // Notify user that a progression was applied (replaces any existing chords)
    showToast?.('Progresión aplicada')
  }

  const moveBar = (barIndex, direction) => {
    const newIndex = barIndex + direction
    if (newIndex < 0 || newIndex >= bars.length) return
    const newBars = [...bars]
    const [moved] = newBars.splice(barIndex, 1)
    newBars.splice(newIndex, 0, moved)
    setBars(newBars)
  }

  const updateCurrent = (barIndex, current) => {
    const newBars = [...bars]
    const bar = newBars[barIndex]
    const curr = Math.max(1, Math.min(bar.repeat, parseInt(current) || 1))
    bar.current = curr
    setBars(newBars)
  }

  const handleDragStart = (e, barIndex) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('type', 'bar')
    e.dataTransfer.setData('barIndex', barIndex)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragType = e.dataTransfer.getData('type')
    if (dragType === 'bar') {
      const dragIndex = parseInt(e.dataTransfer.getData('barIndex'))
      if (dragIndex === dropIndex) return
      const newBars = [...bars]
      const [draggedBar] = newBars.splice(dragIndex, 1)
      newBars.splice(dropIndex, 0, draggedBar)
      setBars(newBars)
    } else if (dragType === 'note') {
      const root = e.dataTransfer.getData('root')
      const barIndex = dropIndex
      const stepIndex = parseInt(e.dataTransfer.getData('stepIndex'))
      addNote(barIndex, stepIndex, root)
    }
  }

  const handleDragEnd = () => {
    // No-op
  }

  const handleNoteDragStart = (e, chord) => {
    console.debug('handleNoteDragStart', chord)
    e.dataTransfer.setData('type', 'chord')
    e.dataTransfer.setData('chord', JSON.stringify(chord))
    // also set a text/plain payload for browsers that require it
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify(chord))
    } catch {
      // ignore if browser rejects this type
    }
    setDraggingType('chord')
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleMoveNoteDragStart = (e, barIndex, noteId) => {
    e.dataTransfer.setData('type', 'move-note')
    e.dataTransfer.setData('barIndex', barIndex)
    e.dataTransfer.setData('noteId', noteId)
    // Some browsers expect a text/plain payload to consider the drag valid
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'move-note', barIndex, noteId }))
    e.dataTransfer.effectAllowed = 'move'
    setDraggingType('move-note')
  }

  const handleStepDragOver = (e) => {
    e.preventDefault()
    // Use the drag data/effectAllowed to decide whether this should be a move or copy.
    // When dragging an existing note we set effectAllowed = 'move', so ensure the
    // dropEffect matches that; otherwise default to 'copy' (for adding new chords).
    const dragType = e.dataTransfer.getData('type') || ''
    const allowed = e.dataTransfer.effectAllowed || ''
    console.debug('handleStepDragOver', { dragType, allowed })
    if (dragType === 'move-note' || allowed.indexOf('move') !== -1) {
      e.dataTransfer.dropEffect = 'move'
    } else {
      e.dataTransfer.dropEffect = 'copy'
    }
    // If a chord/move-note is being dragged, compute which step we're over and mark it
    const willAccept = dragType === 'chord' || dragType === 'move-note' || allowed.indexOf('copy') !== -1 || allowed.indexOf('move') !== -1 || draggingType !== null
    if (willAccept) {
      const stepsContainer = e.currentTarget.closest('.steps') || e.currentTarget
      const barElement = stepsContainer.closest('.bar')
      const barIndex = Array.from(document.querySelectorAll('.bar')).indexOf(barElement)
      const gap = parseFloat(getComputedStyle(stepsContainer).getPropertyValue('gap')) || 0
      const numSteps = 16
      const rect = stepsContainer.getBoundingClientRect()
      const totalGapWidth = (numSteps - 1) * gap
      const stepWidth = (rect.width - totalGapWidth) / numSteps
      const x = e.clientX - rect.left
      let cumulative = 0
      let stepIndex = 0
      for (let i = 0; i < numSteps; i++) {
        if (x >= cumulative && x < cumulative + stepWidth) {
          stepIndex = i
          break
        }
        cumulative += stepWidth + gap
      }
      const prev = dragOverCell
      if (!prev.valid || prev.barIndex !== barIndex || prev.stepIndex !== stepIndex) {
        setDragOverCell({ barIndex, stepIndex, valid: true })
      }
      e.preventDefault()
    }
  }

  const handleStepDragEnter = (e, barIndex, stepIndex) => {
    const dragType = e.dataTransfer.getData('type') || ''
    const allowed = e.dataTransfer.effectAllowed || ''
    // Some browsers don't expose custom data on dragenter; fall back to effectAllowed
    const valid = (dragType === 'chord' || dragType === 'move-note' || allowed.indexOf('copy') !== -1 || allowed.indexOf('move') !== -1)
    console.debug('handleStepDragEnter', { dragType, allowed, barIndex, stepIndex, valid })
    if (valid) {
      e.preventDefault()
      setDragOverCell({ barIndex, stepIndex, valid: true })
    }
  }

  const handleStepDragLeave = () => {
    setDragOverCell({ barIndex: null, stepIndex: null, valid: false })
  }

  // Clear dragging state on global dragend (source element fires dragend when the drag finishes)
  useEffect(() => {
    const onDragEnd = () => {
      setDraggingType(null)
      setDragOverCell({ barIndex: null, stepIndex: null, valid: false })
    }
    document.addEventListener('dragend', onDragEnd)
    return () => document.removeEventListener('dragend', onDragEnd)
  }, [])

  const handleStepsDrop = (e, barIndex) => {
    const barElement = e.currentTarget
    const rect = barElement.getBoundingClientRect()
    const gap = parseFloat(getComputedStyle(barElement).getPropertyValue('gap')) || 0
    const numSteps = 16
    const totalGapWidth = (numSteps - 1) * gap
    const stepWidth = (rect.width - totalGapWidth) / numSteps
    const x = e.clientX - rect.left
    let cumulative = 0
    let stepIndex = 0
    for (let i = 0; i < numSteps; i++) {
      if (x >= cumulative && x < cumulative + stepWidth) {
        stepIndex = i
        break
      }
      cumulative += stepWidth + gap
    }
    handleStepDrop(e, barIndex, stepIndex)
  }

  const handleStepDrop = (e, barIndex, stepIndex) => {
    e.preventDefault()
    // clear any drag-over highlight
    setDragOverCell({ barIndex: null, stepIndex: null, valid: false })
    const dragType = e.dataTransfer.getData('type')
    if (dragType === 'chord') {
      const chordData = JSON.parse(e.dataTransfer.getData('chord'))
      console.log('Dragged chord data:', chordData)
      const bar = bars[barIndex]
      const existing = bar.notes.find(n => n.start <= stepIndex && stepIndex < n.start + n.duration)
      if (!existing) {
        const newBars = [...bars]
        // New chords should start with duration 1 by default
        const id = nextNoteIdRef.current++
        newBars[barIndex].notes.push({ id, start: stepIndex, duration: 1, root: chordData.note, type: chordData.type })
        newBars[barIndex].key = chordData.note
        newBars[barIndex].mode = (chordData.type.includes('min') || chordData.type === 'dim') ? 'Minor' : 'Major'
        console.log('Setting bar mode to:', newBars[barIndex].mode)
        setBars(newBars)
      }
    } else if (dragType === 'move-note') {
      const dragBarIndex = parseInt(e.dataTransfer.getData('barIndex'))
      const dragNoteId = parseInt(e.dataTransfer.getData('noteId'))
      console.log(`Moving note id ${dragNoteId} from bar ${dragBarIndex} to ${barIndex}:${stepIndex}`)
      const newBars = [...bars]
      // Find and remove the dragged note from its origin
      const originBar = newBars[dragBarIndex]
      const draggedIndex = originBar.notes.findIndex(n => n.id === dragNoteId)
      if (draggedIndex === -1) return
      const draggedNote = originBar.notes.splice(draggedIndex, 1)[0]
      // Calculate new start and duration, ensuring it doesn't exceed 16 steps
      const newStart = stepIndex
      const newDuration = Math.min(draggedNote.duration, 16 - newStart)
      // Remove any overlapping notes in the target bar
      const targetBar = newBars[barIndex]
      targetBar.notes = targetBar.notes.filter(n => !(n.start < newStart + newDuration && newStart < n.start + n.duration))
      // Add dragged note to target
      targetBar.notes.push({ ...draggedNote, start: newStart, duration: newDuration })
      setBars(newBars)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      const { barIndex, noteIndex, startX, initialDuration, initialStart } = resizingData
      const barElement = document.querySelector(`.bar:nth-child(${barIndex + 1}) .steps`)
      if (!barElement) return
      const barRect = barElement.getBoundingClientRect()
      const gap = parseFloat(getComputedStyle(barElement).getPropertyValue('gap')) || 0
      const numSteps = 16
      const totalGapWidth = (numSteps - 1) * gap
      const stepWidth = (barRect.width - totalGapWidth) / numSteps
      const deltaX = e.clientX - startX
      const deltaSteps = Math.round(deltaX / (stepWidth + gap))
      const newDuration = Math.max(1, Math.min(16 - initialStart, initialDuration + deltaSteps))
      updateNote(barIndex, noteIndex, { duration: newDuration })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizingData({ barIndex: null, noteIndex: null, startX: 0, initialDuration: 0, initialStart: 0 })
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizingData, updateNote])

  return (
    <div className="grid-container">
      <h2>Partes de la canción</h2>
      <div className="top-row">
        <div className="song-settings">
          <div className="setting-group">
            <label>Tonalidad:</label>
            <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
              {KEYS.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <label>Modo:</label>
            <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
              <option value="Major">Mayor</option>
              <option value="Minor">Menor</option>
            </select>
          </div>
        </div>

        <ScaleDisplay selectedKey={selectedKey} selectedMode={selectedMode} onChordDragStart={handleNoteDragStart} onDragEnd={() => setDraggingType(null)} />
      </div>

      <div className="grid">
        {bars.map((bar, barIndex) => (
          <Bar
            key={bar.id}
            bar={bar}
            barIndex={barIndex}
            barsLength={bars.length}
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
            progressions={CHORD_PROGRESSIONS}
            applyProgressionToBar={applyProgressionToBar}
            handleStepDragOver={handleStepDragOver}
            handleStepDragEnter={handleStepDragEnter}
            handleStepDragLeave={handleStepDragLeave}
            handleStepDrop={handleStepDrop}
            handleStepsDrop={handleStepsDrop}
            dragOverCell={dragOverCell}
            updateNote={updateNote}
            removeNote={removeNote}
            clearBar={clearBar}
            handleMoveNoteDragStart={handleMoveNoteDragStart}
            setIsResizing={setIsResizing}
            setResizingData={setResizingData}
          />
        ))}
      </div>

    </div>
  )
}

export default Secuenciador
