import { useState, useEffect, useCallback } from 'react'
import './Grid.css'

const CHORD_TYPES = [
  { label: '', value: '' },
  { label: 'maj', value: 'major' },
  { label: 'min', value: 'minor' },
  { label: '7', value: '7' },
  { label: 'maj7', value: 'maj7' },
  { label: 'min7', value: 'min7' },
  { label: 'dim', value: 'dim' },
  { label: 'aug', value: 'aug' },
  { label: 'sus4', value: 'sus4' },
  { label: 'sus2', value: 'sus2' },
]

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const MAJOR_SCALE = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const MINOR_SCALE = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']

const CHORD_NAMES_MAJOR = [
  'maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'
]

const CHORD_NAMES_MINOR = [
  'min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'
]

function getChordForDegree(key, degree, mode) {
  const keyIndex = NOTES.indexOf(key)
  const noteIndex = (keyIndex + degree) % 12
  const note = NOTES[noteIndex]
  
  const scale = mode === 'Major' ? MAJOR_SCALE : MINOR_SCALE
  const chordTypes = mode === 'Major' ? CHORD_NAMES_MAJOR : CHORD_NAMES_MINOR
  
  const roman = scale[degree]
  let type = chordTypes[degree]
  
  // Map short types to full values for consistency
  if (type === 'maj') type = 'major'
  else if (type === 'min') type = 'minor'
  else if (type === 'dim') type = 'dim'
  
  let displayType = ''
  if (type === 'minor') displayType = 'm'
  else if (type === 'dim') displayType = 'dim'
  else if (type === 'major') displayType = ''
  else displayType = type
  
  return { note, roman, type, displayType }
}

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const Grid = () => {
  const [bars, setBars] = useState([
    { id: 1, name: 'Part 1', notes: [], repeat: 1, current: 1, key: 'C', mode: 'Major' } // notes: [{ start: 0, duration: 1, root: 'C', type: 'major' }]
  ])
  
  const [selectedKey, setSelectedKey] = useState('C')
  const [selectedMode, setSelectedMode] = useState('Major')
  const [isResizing, setIsResizing] = useState(false)
  const [resizingData, setResizingData] = useState({ barIndex: null, noteIndex: null, startX: 0, initialDuration: 0, initialStart: 0 })

  const updateBarName = (barIndex, name) => {
    const newBars = [...bars]
    newBars[barIndex].name = name
    setBars(newBars)
  }

  const addBar = () => {
    const newBar = {
      id: bars.length + 1,
      name: `Part ${bars.length + 1}`,
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
      newBars[barIndex].notes.push({ start, duration: 1, root, type })
      setBars(newBars)
    }
  }

  const updateNote = useCallback((barIndex, noteIndex, updates) => {
    const newBars = [...bars]
    newBars[barIndex].notes[noteIndex] = { ...newBars[barIndex].notes[noteIndex], ...updates }
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
    }
  }

  const cloneBar = (barIndex) => {
    const bar = bars[barIndex]
    const newBar = {
      id: bars.length + 1,
      notes: bar.notes.map(note => ({ ...note })), // deep copy
      repeat: bar.repeat,
      current: bar.current,
      key: bar.key,
      mode: bar.mode,
      name: `${bar.name} (copy)`
    }
    const newBars = [...bars]
    newBars.splice(barIndex + 1, 0, newBar) // insert after
    setBars(newBars)
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
    e.dataTransfer.setData('type', 'chord')
    e.dataTransfer.setData('chord', JSON.stringify(chord))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleMoveNoteDragStart = (e, barIndex, noteIndex) => {
    e.dataTransfer.setData('type', 'move-note')
    e.dataTransfer.setData('barIndex', barIndex)
    e.dataTransfer.setData('noteIndex', noteIndex)
    // Some browsers expect a text/plain payload to consider the drag valid
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'move-note', barIndex, noteIndex }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleStepDragOver = (e) => {
    e.preventDefault()
    // Use the drag data/effectAllowed to decide whether this should be a move or copy.
    // When dragging an existing note we set effectAllowed = 'move', so ensure the
    // dropEffect matches that; otherwise default to 'copy' (for adding new chords).
    const dragType = e.dataTransfer.getData('type') || ''
    const allowed = e.dataTransfer.effectAllowed || ''
    if (dragType === 'move-note' || allowed.indexOf('move') !== -1) {
      e.dataTransfer.dropEffect = 'move'
    } else {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleStepsDrop = (e, barIndex) => {
    const barElement = e.currentTarget
    const rect = barElement.getBoundingClientRect()
    const gap = 5
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
    const dragType = e.dataTransfer.getData('type')
    if (dragType === 'chord') {
      const chordData = JSON.parse(e.dataTransfer.getData('chord'))
      console.log('Dragged chord data:', chordData)
      const bar = bars[barIndex]
      const existing = bar.notes.find(n => n.start <= stepIndex && stepIndex < n.start + n.duration)
      if (!existing) {
        const newBars = [...bars]
        // New chords should start with duration 1 by default
        newBars[barIndex].notes.push({ start: stepIndex, duration: 1, root: chordData.note, type: chordData.type })
        newBars[barIndex].key = chordData.note
        newBars[barIndex].mode = (chordData.type.includes('min') || chordData.type === 'dim') ? 'Minor' : 'Major'
        console.log('Setting bar mode to:', newBars[barIndex].mode)
        setBars(newBars)
      }
    } else if (dragType === 'move-note') {
      const dragBarIndex = parseInt(e.dataTransfer.getData('barIndex'))
      const dragNoteIndex = parseInt(e.dataTransfer.getData('noteIndex'))
      console.log(`Moving note from ${dragBarIndex}:${dragNoteIndex} to ${barIndex}:${stepIndex}`)
      const newBars = [...bars]
      const note = newBars[dragBarIndex].notes[dragNoteIndex]
      // Remove from old position
      newBars[dragBarIndex].notes.splice(dragNoteIndex, 1)
      // Calculate new start and duration, ensuring it doesn't exceed 16 steps
      const newStart = stepIndex
      const newDuration = Math.min(note.duration, 16 - newStart)
      // Remove any existing notes that overlap with the new position
      newBars[barIndex].notes = newBars[barIndex].notes.filter(n => !(n.start < newStart + newDuration && newStart < n.start + n.duration))
      // Add the note to the new position
      newBars[barIndex].notes.push({ ...note, start: newStart, duration: newDuration })
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
      const stepWidth = barRect.width / 16
      const deltaX = e.clientX - startX
      const deltaSteps = Math.round(deltaX / stepWidth)
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

  const renderStep = (barIndex, stepIndex) => {
    const bar = bars[barIndex]
    const note = bar.notes.find(n => n.start <= stepIndex && stepIndex < n.start + n.duration)
    if (note) {
      if (note.start === stepIndex) {
        return (
          <div className="step occupied start" style={{ gridColumn: `span ${note.duration}` }}>
            <div className="chord-display">
              <span className="chord-name">{note.root}{note.type === 'major' ? '' : note.type === 'minor' ? 'm' : note.type === 'dim' ? 'dim' : note.type}</span>
              <div className="chord-edits">
                <select
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  value={note.root}
                  onChange={(e) => updateNote(barIndex, bar.notes.indexOf(note), { root: e.target.value })}
                >
                  {NOTES.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <select
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  value={note.type}
                  onChange={(e) => updateNote(barIndex, bar.notes.indexOf(note), { type: e.target.value })}
                >
                  {CHORD_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="drag-indicator" draggable onDragStart={(e) => handleMoveNoteDragStart(e, barIndex, bar.notes.indexOf(note))}>⋮⋮</div>
              <button className="delete-btn" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removeNote(barIndex, bar.notes.indexOf(note)); }}>X</button>
            </div>
            <div 
              className="resize-handle"
              onMouseDown={(e) => {
                setIsResizing(true)
                setResizingData({ barIndex, noteIndex: bar.notes.indexOf(note), startX: e.clientX, initialDuration: note.duration, initialStart: note.start })
                e.preventDefault()
              }}
            ></div>
          </div>
        )
      } else {
        return null
      }
    } else {
      return (
        <div 
          className="step empty" 
          onDragOver={handleStepDragOver}
        >
          +
        </div>
      )
    }
  }

  return (
    <div className="grid-container">
      <h2>Song Parts Grid</h2>
      <div className="song-settings">
        <div className="setting-group">
          <label>Key:</label>
          <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
            {KEYS.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
        <div className="setting-group">
          <label>Mode:</label>
          <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>
      <div className="scale-display">
        <h3>Scale Chords ({selectedKey} {selectedMode}):</h3>
        <div className="chord-list">
          {[0,1,2,3,4,5,6].map((degree) => {
            const chord = getChordForDegree(selectedKey, degree, selectedMode)
            return (
              <div 
                key={degree} 
                className="chord-item draggable" 
                draggable
                onDragStart={(e) => handleNoteDragStart(e, chord)}
              >
                <div className="chord-name">{chord.note}{chord.displayType}</div>
                <div className="chord-roman">{chord.roman}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid">
        {bars.map((bar, barIndex) => (
          <div key={bar.id} className="bar">
            <div 
              className="bar-header"
              draggable
              onDragStart={(e) => handleDragStart(e, barIndex)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, barIndex)}
              onDragEnd={handleDragEnd}
            >
              <div className="bar-title">
                <input
                  className="part-name-input"
                  type="text"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  value={bar.name || `Part ${barIndex + 1}`}
                  onChange={(e) => updateBarName(barIndex, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
                />
                <div className="bar-settings">
                </div>
                <div className="repeat-input">
                  <label>Repeat:</label>
                  <input
                    type="number"
                    min="1"
                    value={bar.repeat}
                    onChange={(e) => updateRepeat(barIndex, e.target.value)}
                  />
                  <label>Current:</label>
                  <input
                    type="number"
                    min="1"
                    max={bar.repeat}
                    value={bar.current}
                    onChange={(e) => updateCurrent(barIndex, e.target.value)}
                  />
                </div>
              </div>
              <div className="bar-controls">
                <button type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); moveBar(barIndex, -1); }} disabled={barIndex === 0}>↑</button>
                <button type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); moveBar(barIndex, 1); }} disabled={barIndex === bars.length - 1}>↓</button>
                <button type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); cloneBar(barIndex); }}>Clone</button>
                <button type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); deleteBar(barIndex); }} disabled={bars.length === 1}>Delete</button>
              </div>
            </div>
            <div className="steps" onDragOver={handleStepDragOver} onDrop={(e) => handleStepsDrop(e, barIndex)}>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(stepIndex => renderStep(barIndex, stepIndex))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={addBar} className="add-bar-btn">Add Part</button>
    </div>
  )
}

export default Grid
