// Keys available
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Chord patterns - 16 steps per bar, pattern repeats each bar
// Each step can be 0-4: 0=rest, 1=root triad, 2=seventh, 3=inversion, 4=stab
// The pattern is applied to each bar, chord changes every 16 steps
export const CHORD_PATTERNS = [
  // Basic patterns
  { name: 'Whole Notes', pattern: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  { name: 'Half Notes', pattern: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
  { name: 'Quarter Notes', pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
  { name: '8th Notes', pattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
  
  // Rhythmic patterns
  { name: 'Reggae Skank', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
  { name: 'Funk Stabs', pattern: [4,0,0,4, 0,0,4,0, 4,0,0,4, 0,4,0,0] },
  { name: 'Disco', pattern: [1,0,1,0, 1,0,1,0, 2,0,1,0, 1,0,2,0] },
  { name: 'House Piano', pattern: [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
  
  // Arpeggiated patterns
  { name: 'Arpeggio Up', pattern: [1,0,3,0, 1,0,3,0, 1,0,3,0, 1,0,3,0] },
  { name: 'Arpeggio Down', pattern: [3,0,1,0, 3,0,1,0, 3,0,1,0, 3,0,1,0] },
  { name: 'Bounce', pattern: [1,0,3,1, 0,3,1,0, 1,0,3,1, 0,3,0,0] },
  { name: 'Rolling', pattern: [1,3,1,3, 1,3,1,3, 2,3,2,3, 1,3,1,3] },
  
  // Syncopated patterns
  { name: 'Syncopated', pattern: [1,0,0,1, 0,0,0,1, 0,0,1,0, 0,1,0,0] },
  { name: 'Offbeat', pattern: [0,0,1,0, 0,0,2,0, 0,0,1,0, 0,0,3,0] },
  { name: 'Shuffle', pattern: [1,0,0,1, 0,1,0,0, 2,0,0,1, 0,2,0,0] },
  
  // Extended/jazzy
  { name: 'Seventh Emphasis', pattern: [2,0,0,0, 1,0,0,0, 2,0,0,0, 1,0,0,0] },
  { name: 'Jazz Comp', pattern: [2,0,0,2, 0,0,2,0, 2,0,0,2, 0,2,0,0] },
  { name: 'Ballad', pattern: [1,0,0,0, 2,0,0,0, 1,0,0,0, 3,0,0,0] },
  
  // Sustained
  { name: 'Pad Sustain', pattern: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  { name: 'Long Waves', pattern: [1,0,0,0, 0,0,0,0, 2,0,0,0, 0,0,0,0] },
]

// Wave types for synth
export const WAVE_TYPES = ['sine', 'triangle', 'sawtooth', 'square']

// Chord sound presets - combinations of synth parameters
export const CHORD_SOUND_PRESETS = [
  // 1) Soft EP - mellow FM keys
  {
    name: 'FM EP',
    waveType: 'sine',
    filter: 3600,
    resonance: 1.1,
    attack: 0.006,
    decay: 0.95,
    detune: 2,
    lfoRate: 0,
    lfoDepth: 0,
    compression: 0.2,
    fm: 0.22,
    fmHarmonicity: 2,
  },

  // 2) Glass bells - bright + chime
  {
    name: 'Glass',
    waveType: 'sine',
    filter: 7600,
    resonance: 2.6,
    attack: 0.001,
    decay: 1.6,
    detune: 4,
    lfoRate: 0.12,
    lfoDepth: 60,
    compression: 0.18,
    fm: 0.48,
    fmHarmonicity: 2,
  },

  // 3) Metallic organ - hollow + stable
  {
    name: 'Hollow Organ',
    waveType: 'triangle',
    filter: 5200,
    resonance: 1.0,
    attack: 0.001,
    decay: 0.8,
    detune: 0,
    lfoRate: 5.2,
    lfoDepth: 120,
    compression: 0.15,
    fm: 0.12,
    fmHarmonicity: 3,
  },

  // 4) Plucky digital - percussive, modern
  {
    name: 'Digital Pluck',
    waveType: 'triangle',
    filter: 6400,
    resonance: 1.2,
    attack: 0.002,
    decay: 0.35,
    detune: 0,
    lfoRate: 0,
    lfoDepth: 0,
    compression: 0.24,
    fm: 0.32,
    fmHarmonicity: 1,
  },

  // 5) Warm FM pad - smooth movement
  {
    name: 'FM Pad',
    waveType: 'sawtooth',
    filter: 1700,
    resonance: 1.6,
    attack: 1.0,
    decay: 1.3,
    detune: 10,
    lfoRate: 0.18,
    lfoDepth: 90,
    compression: 0.14,
    fm: 0.14,
    fmHarmonicity: 1,
  },

  // 6) Brass hit - punchy FM bite
  {
    name: 'FM Brass',
    waveType: 'sawtooth',
    filter: 3200,
    resonance: 3.2,
    attack: 0.02,
    decay: 0.5,
    detune: 6,
    lfoRate: 0.7,
    lfoDepth: 80,
    compression: 0.28,
    fm: 0.26,
    fmHarmonicity: 1,
  },

  // 7) Detuned shimmer - wide + airy
  {
    name: 'Shimmer',
    waveType: 'sawtooth',
    filter: 4200,
    resonance: 1.2,
    attack: 0.03,
    decay: 0.9,
    detune: 16,
    lfoRate: 0.25,
    lfoDepth: 140,
    compression: 0.18,
    fm: 0.1,
    fmHarmonicity: 1,
  },

  // 8) Dark sync - gritty, lower partials
  {
    name: 'Dark Sync',
    waveType: 'square',
    filter: 1400,
    resonance: 2.4,
    attack: 0.01,
    decay: 0.7,
    detune: 5,
    lfoRate: 0.35,
    lfoDepth: 120,
    compression: 0.24,
    fm: 0.3,
    fmHarmonicity: 0.5,
  },
]

// Total steps for full progression (4 bars x 16 steps)
export const CHORD_TOTAL_STEPS = 64
