// Available keys
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Chord progressions - organized by mode
// Each progression includes mode (Major/Minor) and chord degrees
// Each chord lasts 1 bar (16 steps), total 4 bars = 64 steps
export const CHORD_PROGRESSIONS = [
  // ========== MAJOR PROGRESSIONS ==========
  { name: 'Pop I-V-vi-IV', mode: 'Major', chords: [0, 4, 5, 3] },
  { name: '50s I-vi-IV-V', mode: 'Major', chords: [0, 5, 3, 4] },
  { name: 'Rock I-IV-V-IV', mode: 'Major', chords: [0, 3, 4, 3] },
  { name: 'Punk I-V-IV-I', mode: 'Major', chords: [0, 4, 3, 0] },
  { name: 'Folk I-V-IV-IV', mode: 'Major', chords: [0, 4, 3, 3] },
  { name: 'Ballad I-iii-IV-V', mode: 'Major', chords: [0, 2, 3, 4] },
  
  { name: 'Jazz ii-V-I-I', mode: 'Major', chords: [1, 4, 0, 0] },
  { name: 'Soul I-IV-I-V', mode: 'Major', chords: [0, 3, 0, 4] },
  { name: 'Neo Soul ii-V-I-vi', mode: 'Major', chords: [1, 4, 0, 5] },
  { name: 'Smooth I-vi-ii-V', mode: 'Major', chords: [0, 5, 1, 4] },
  { name: 'Blues I-IV-V-IV', mode: 'Major', chords: [0, 3, 4, 3] },
  { name: 'Funk I-IV-ii-V', mode: 'Major', chords: [0, 3, 1, 4] },
  
  { name: 'House I-I-I-I', mode: 'Major', chords: [0, 0, 0, 0] },
  { name: 'Trance vi-IV-I-V', mode: 'Major', chords: [5, 3, 0, 4] },
  { name: 'EDM I-V-vi-IV', mode: 'Major', chords: [0, 4, 5, 3] },
  { name: 'Progressive I-iii-vi-IV', mode: 'Major', chords: [0, 2, 5, 3] },
  { name: 'Uplifting IV-I-V-vi', mode: 'Major', chords: [3, 0, 4, 5] },
  { name: 'Euphoric I-V-iii-IV', mode: 'Major', chords: [0, 4, 2, 3] },

  // ========== MINOR PROGRESSIONS ==========
  { name: 'Sad i-VI-III-VII', mode: 'Minor', chords: [0, 5, 2, 6] },
  { name: 'Dark i-iv-VI-V', mode: 'Minor', chords: [0, 3, 5, 4] },
  { name: 'Melancholic i-VI-VII-i', mode: 'Minor', chords: [0, 5, 6, 0] },
  { name: 'Epic i-VII-VI-VII', mode: 'Minor', chords: [0, 6, 5, 6] },
  { name: 'Emotional i-III-VII-VI', mode: 'Minor', chords: [0, 2, 6, 5] },
  { name: 'Tragic i-iv-i-V', mode: 'Minor', chords: [0, 3, 0, 4] },
  
  { name: 'Rock i-VII-VI-VII', mode: 'Minor', chords: [0, 6, 5, 6] },
  { name: 'Metal i-VI-III-VII', mode: 'Minor', chords: [0, 5, 2, 6] },
  { name: 'Alternative i-III-VII-VI', mode: 'Minor', chords: [0, 2, 6, 5] },
  { name: 'Grunge i-iv-VII-VI', mode: 'Minor', chords: [0, 3, 6, 5] },
  
  { name: 'Techno i-i-VI-VII', mode: 'Minor', chords: [0, 0, 5, 6] },
  { name: 'Dark Techno i-VII-i-VI', mode: 'Minor', chords: [0, 6, 0, 5] },
  { name: 'Industrial i-iv-i-VII', mode: 'Minor', chords: [0, 3, 0, 6] },
  { name: 'Minimal i-i-i-VII', mode: 'Minor', chords: [0, 0, 0, 6] },
  { name: 'Deep House i-VI-i-VII', mode: 'Minor', chords: [0, 5, 0, 6] },
  { name: 'Melodic Techno i-VII-VI-iv', mode: 'Minor', chords: [0, 6, 5, 3] },
]
