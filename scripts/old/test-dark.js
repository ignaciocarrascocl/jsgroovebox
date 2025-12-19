// Test Dark progression specifically

const SCALE_DEGREES_MINOR = [0, 2, 3, 5, 7, 8, 10] // C D Eb F G Ab Bb

const getBassNote = (key, chordDegree) => {
  const keyIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key)
  const chordRoot = SCALE_DEGREES_MINOR[chordDegree % 7]
  const baseNote = (keyIndex + chordRoot) % 12
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return noteNames[baseNote]
}

console.log('=== C Minor Scale ===')
for (let i = 0; i < 7; i++) {
  console.log(`Degree ${i}: ${getBassNote('C', i)} (${SCALE_DEGREES_MINOR[i]} semitones)`)
}

console.log('\n=== Dark i-iv-VI-V progression in C Minor ===')
const darkProgression = [0, 3, 5, 4]
darkProgression.forEach((degree, bar) => {
  const note = getBassNote('C', degree)
  console.log(`Bar ${bar + 1}: Degree ${degree} -> ${note}`)
})

console.log('\n=== Expected for i-iv-VI-V in C Minor ===')
console.log('Bar 1: i (Cm) -> C')
console.log('Bar 2: iv (Fm) -> F')  
console.log('Bar 3: VI (Ab) -> Ab')
console.log('Bar 4: V (G or Gm) -> G')
