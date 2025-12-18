import { useState } from 'react'

const BarHeader = ({ bar, barIndex, barsLength, updateBarName, updateRepeat, updateCurrent, moveBar, cloneBar, deleteBar, handleDragOver, handleDrop, handleDragEnd, clearBar, progressions = [], applyProgressionToBar }) => {
  const [selectedProg, setSelectedProg] = useState(progressions && progressions.length ? 0 : -1)
  return (
    <div
      className="bar-header"
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
          value={bar.name || `Parte ${barIndex + 1}`}
          onChange={(e) => updateBarName(barIndex, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
        />
        <div className="bar-settings">
          <select
            value={selectedProg}
            onChange={(e) => setSelectedProg(Number(e.target.value))}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label={`Seleccionar progresión para ${bar.name || `Parte ${barIndex + 1}`}`}
          >
            <option value={-1}>Progresiones</option>
            {progressions.map((p, idx) => (
              <option key={p.name} value={idx}>{p.name}</option>
            ))}
          </select>
          <button
            className="apply-prog-btn"
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); if (selectedProg >= 0 && applyProgressionToBar) applyProgressionToBar(barIndex, selectedProg) }}
            disabled={selectedProg < 0}
            title="Agregar progresión"
            aria-label="Agregar progresión"
          >
            Agregar progresión
          </button>
        </div>
        <div className="repeat-input">
          <label>Repetir:</label>
          <input
            type="number"
            min="1"
            value={bar.repeat}
            onChange={(e) => updateRepeat(barIndex, e.target.value)}
          />
          <label>Actual:</label>
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
        <button className="btn-move" type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); moveBar(barIndex, -1); }} disabled={barIndex === 0} aria-label="Subir parte">↑</button>
        <button className="btn-move" type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); moveBar(barIndex, 1); }} disabled={barIndex === barsLength - 1} aria-label="Bajar parte">↓</button>
        <button className="btn-clone" type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); cloneBar(barIndex); }}>Clonar</button>
        <button className="btn-clear" type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); if (bar.notes && bar.notes.length > 0) { if (window.confirm('¿Limpiar todos los acordes de esta parte?')) clearBar(barIndex); } }} disabled={!(bar.notes && bar.notes.length > 0)} title="Limpiar todos los acordes de esta parte">Limpiar</button>
        <button className="btn-delete" type="button" draggable={false} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); if (barsLength === 1) return; if (window.confirm('¿Eliminar esta parte?')) deleteBar(barIndex); }} disabled={barsLength === 1} title="Eliminar parte">Eliminar</button>
      </div>
    </div>
  )
}

export default BarHeader
