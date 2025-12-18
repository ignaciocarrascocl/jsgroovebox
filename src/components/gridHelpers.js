export const CHORD_TYPES = [
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

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const MAJOR_SCALE = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
export const MINOR_SCALE = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']

export const CHORD_NAMES_MAJOR = [
  'maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'
]

export const CHORD_NAMES_MINOR = [
  'min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'
]

export function getChordForDegree(key, degree, mode) {
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

// Helper para mostrar una etiqueta corta del acorde para debugging (ej: C, Cm, Cdim, C7)
export function formatChordLabel(root, type) {
  if (!type || type === 'major') return root
  if (type === 'minor') return `${root}m`
  if (type === 'dim') return `${root}dim`
  return `${root}${type}`
}

export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
