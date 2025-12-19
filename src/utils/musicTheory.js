// Scale degrees to semitones
const SCALE_DEGREES_MAJOR = [0, 2, 4, 5, 7, 9, 11] // C D E F G A B
const SCALE_DEGREES_MINOR = [0, 2, 3, 5, 7, 8, 10] // C D Eb F G Ab Bb (natural minor)

// Get bass note for a given key, chord degree, note type, and mode
const getBassNote = (key, chordDegree, noteType, mode = 'Major', octave = 1) => {
  const keyIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key)
  const scaleDegrees = mode === 'Minor' ? SCALE_DEGREES_MINOR : SCALE_DEGREES_MAJOR
  const chordRoot = scaleDegrees[chordDegree % 7]
  const baseNote = (keyIndex + chordRoot) % 12

  let semitoneOffset = 0
  let noteOctave = octave

  switch (noteType) {
    case 1: // Root
      semitoneOffset = 0
      break
    case 2: // Fifth
      semitoneOffset = 7
      break
    case 3: // Octave
      semitoneOffset = 0
      noteOctave = octave + 1
      break
    default:
      return null
  }

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const finalNote = (baseNote + semitoneOffset) % 12
  const finalOctave = noteOctave + Math.floor((baseNote + semitoneOffset) / 12)

  return `${noteNames[finalNote]}${finalOctave}`
}

// Get chord notes for a given key, chord degree, chord type, and mode
const getChordNotes = (key, chordDegree, chordType, mode = 'Major', octave = 3) => {
  const keyIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key)
  const scaleDegrees = mode === 'Minor' ? SCALE_DEGREES_MINOR : SCALE_DEGREES_MAJOR
  const chordRoot = scaleDegrees[chordDegree % 7]
  const baseNote = (keyIndex + chordRoot) % 12

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  // Determine if this chord should be major or minor based on scale degree
  // Major scale: I=maj, ii=min, iii=min, IV=maj, V=maj, vi=min, vii°=dim
  // Minor scale: i=min, ii°=dim, III=maj, iv=min, v=min, VI=maj, VII=maj
  let thirdInterval = 4 // Major third by default
  let seventhInterval = 10 // Minor seventh by default (dominant 7th)

  if (mode === 'Major') {
    // Degrees that are minor in major scale: ii (1), iii (2), vi (5)
    if (chordDegree === 1 || chordDegree === 2 || chordDegree === 5) {
      thirdInterval = 3 // Minor third
      seventhInterval = 10 // Minor seventh
    } else if (chordDegree === 6) {
      // vii° is diminished - minor third and diminished fifth
      thirdInterval = 3 // Minor third
      seventhInterval = 9 // Diminished seventh
    } else {
      // I (0), IV (3), V (4) are major
      thirdInterval = 4 // Major third
      seventhInterval = 11 // Major seventh for I and IV, 10 (minor 7th) for V
      if (chordDegree === 4) {
        seventhInterval = 10 // V7 uses dominant (minor) seventh
      }
    }
  } else {
    // Minor scale
    // Degrees that are major in natural minor: III (2), VI (5), VII (6)
    if (chordDegree === 2 || chordDegree === 5 || chordDegree === 6) {
      thirdInterval = 4 // Major third
      seventhInterval = 11 // Major seventh
    } else if (chordDegree === 1) {
      // ii° is diminished
      thirdInterval = 3 // Minor third
      seventhInterval = 9 // Diminished seventh
    } else {
      // i (0), iv (3), v (4) are minor
      thirdInterval = 3 // Minor third
      seventhInterval = 10 // Minor seventh
    }
  }

  // Helper to create note name with octave
  const makeNote = (semitones, oct = octave) => {
    const note = (baseNote + semitones) % 12
    const actualOctave = oct + Math.floor((baseNote + semitones) / 12)
    return `${noteNames[note]}${actualOctave}`
  }

  switch (chordType) {
    case 1: // Basic triad (root, third, fifth)
      return [makeNote(0), makeNote(thirdInterval), makeNote(7)]
    case 2: // Seventh chord (root, third, fifth, seventh)
      return [makeNote(0), makeNote(thirdInterval), makeNote(7), makeNote(seventhInterval)]
    case 3: // Inversion (third, fifth, root octave up)
      return [makeNote(thirdInterval), makeNote(7), makeNote(12)]
    case 4: // Stab (all notes in tight voicing)
      return [makeNote(0), makeNote(thirdInterval), makeNote(7)]
    default:
      return null
  }
}

// Helper: get bass note directly from absolute root string and noteType (1 = root, 2 = fifth, 3 = octave)
const getBassNoteFromRoot = (root, noteType, octave = 1) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const rootIndex = noteNames.indexOf(root)
  if (rootIndex === -1) return null
  let semitone = rootIndex
  let oct = octave
  switch (noteType) {
    case 1:
      break
    case 2:
      semitone = (rootIndex + 7) % 12
      if (rootIndex + 7 >= 12) oct += 1
      break
    case 3:
      oct += 1
      break
    default:
      return null
  }
  const noteName = noteNames[semitone]
  return `${noteName}${oct}`
}

// Helper: get chord notes from absolute root and a pattern value (1..4) and mode string (major/minor)
const getChordNotesFromRoot = (root, patternValue, mode = 'Major', octave = 3) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const rootIndex = noteNames.indexOf(root)
  if (rootIndex === -1) return null
  const isMinor = (mode && mode.toLowerCase().includes('min'))
  const thirdInterval = isMinor ? 3 : 4
  const seventhInterval = 10 // use minor seventh by default
  const makeNote = (semitones, oct = octave) => {
    const note = (rootIndex + semitones) % 12
    const actualOctave = oct + Math.floor((rootIndex + semitones) / 12)
    return `${noteNames[note]}${actualOctave}`
  }
  switch (patternValue) {
    case 1:
      return [makeNote(0), makeNote(thirdInterval), makeNote(7)]
    case 2:
      return [makeNote(0), makeNote(thirdInterval), makeNote(7), makeNote(seventhInterval)]
    case 3:
      return [makeNote(thirdInterval), makeNote(7), makeNote(12)]
    case 4:
      return [makeNote(0), makeNote(thirdInterval), makeNote(7)]
    default:
      return null
  }
}

export {
  SCALE_DEGREES_MAJOR,
  SCALE_DEGREES_MINOR,
  getBassNote,
  getChordNotes,
  getBassNoteFromRoot,
  getChordNotesFromRoot
}
