import { CHORD_PROGRESSIONS } from '../src/constants/song.js'
import { getChordForDegree } from '../src/components/gridHelpers.js'

const prog = CHORD_PROGRESSIONS[0]
const key = 'C'
const mode = prog.mode

const notes = prog.chords.slice(0, 4).map((deg, i) => {
  const chord = getChordForDegree(key, deg, mode)
  return {
    degree: deg,
    note: chord.note,
    type: chord.type,
    start: i * 4,
    duration: 4
  }
})

console.log('Progression:', prog.name, '-', mode, 'in', key)
console.table(notes)
