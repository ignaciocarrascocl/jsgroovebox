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
  // 1) Warm Piano - mellow, rich
  {
    name: 'Warm Piano',
    waveType: 'sine',
    filter: 3200,
    resonance: 1.2,
    attack: 0.005,
    decay: 0.8,
    release: 0.8,
    detune: 3,
    lfoRate: 0,
    lfoDepth: 0,
    lfoWave: 'sine',
    compression: 0.25,
    drive: 0,
    chorus: 0.1,
  },

  // 2) Bright EP - clear, sparkling
  {
    name: 'Bright EP',
    waveType: 'triangle',
    filter: 4800,
    resonance: 2.1,
    attack: 0.001,
    decay: 0.6,
    release: 0.6,
    detune: 5,
    lfoRate: 0.15,
    lfoDepth: 80,
    lfoWave: 'sine',
    compression: 0.2,
    drive: 0.02,
    chorus: 0.05,
  },

  // 3) Organ Pad - rich, sustained
  {
    name: 'Organ Pad',
    waveType: 'square',
    filter: 2200,
    resonance: 1.8,
    attack: 0.02,
    decay: 1.5,
    release: 1.5,
    detune: 8,
    lfoRate: 0.08,
    lfoDepth: 120,
    lfoWave: 'sine',
    compression: 0.3,
    drive: 0.05,
    chorus: 0.15,
  },

  // 4) Synth Brass - punchy, bright
  {
    name: 'Synth Brass',
    waveType: 'sawtooth',
    filter: 3600,
    resonance: 3.2,
    attack: 0.01,
    decay: 0.4,
    release: 0.4,
    detune: 6,
    lfoRate: 0.2,
    lfoDepth: 100,
    lfoWave: 'sine',
    compression: 0.35,
    drive: 0.08,
    chorus: 0.1,
  },

  // 5) String Ensemble - lush, detuned
  {
    name: 'Strings',
    waveType: 'sawtooth',
    filter: 1800,
    resonance: 1.5,
    attack: 0.8,
    decay: 2.0,
    release: 2.0,
    detune: 15,
    lfoRate: 0.05,
    lfoDepth: 60,
    lfoWave: 'sine',
    compression: 0.2,
    drive: 0,
    chorus: 0.2,
  },

  // 6) Electric Piano - percussive, bright
  {
    name: 'Electric Piano',
    waveType: 'triangle',
    filter: 5200,
    resonance: 2.5,
    attack: 0.001,
    decay: 0.3,
    release: 0.3,
    detune: 4,
    lfoRate: 0.25,
    lfoDepth: 150,
    lfoWave: 'sine',
    compression: 0.25,
    drive: 0.03,
    chorus: 0.08,
  },

  // 7) Choir Pad - ethereal, wide
  {
    name: 'Choir',
    waveType: 'sine',
    filter: 1400,
    resonance: 1.0,
    attack: 1.2,
    decay: 3.0,
    release: 3.0,
    detune: 20,
    lfoRate: 0.1,
    lfoDepth: 90,
    lfoWave: 'sine',
    compression: 0.15,
    drive: 0,
    chorus: 0.3,
  },

  // 8) FM Lead - metallic, evolving
  {
    name: 'FM Lead',
    waveType: 'sawtooth',
    filter: 2800,
    resonance: 4.0,
    attack: 0.02,
    decay: 0.8,
    release: 0.8,
    detune: 12,
    lfoRate: 0.3,
    lfoDepth: 200,
    lfoWave: 'sawtooth',
    compression: 0.3,
    drive: 0.1,
    chorus: 0.05,
  },

  // 9) Wurlitzer - vintage, tremolo
  {
    name: 'Wurlitzer',
    waveType: 'triangle',
    filter: 4000,
    resonance: 2.8,
    attack: 0.003,
    decay: 0.5,
    release: 0.5,
    detune: 7,
    lfoRate: 4.0,
    lfoDepth: 180,
    lfoWave: 'sine',
    compression: 0.25,
    drive: 0.04,
    chorus: 0.12,
  },

  // 10) Rhodes - mellow, chorus
  {
    name: 'Rhodes',
    waveType: 'sine',
    filter: 2600,
    resonance: 1.8,
    attack: 0.01,
    decay: 0.7,
    release: 0.7,
    detune: 9,
    lfoRate: 0.12,
    lfoDepth: 110,
    lfoWave: 'sine',
    compression: 0.2,
    drive: 0.02,
    chorus: 0.25,
  },

  // 11) Harpsichord - plucky, bright
  {
    name: 'Harpsichord',
    waveType: 'square',
    filter: 6000,
    resonance: 3.5,
    attack: 0.001,
    decay: 0.2,
    release: 0.2,
    detune: 2,
    lfoRate: 0,
    lfoDepth: 0,
    lfoWave: 'sine',
    compression: 0.3,
    drive: 0.06,
    chorus: 0,
  },

  // 12) Synth Wave - modern, filtered
  {
    name: 'Synth Wave',
    waveType: 'sawtooth',
    filter: 800,
    resonance: 6.0,
    attack: 0.05,
    decay: 1.2,
    release: 1.2,
    detune: 18,
    lfoRate: 0.5,
    lfoDepth: 250,
    lfoWave: 'sine',
    compression: 0.4,
    drive: 0.12,
    chorus: 0.18,
  },
]

// Total steps for full progression (4 bars x 16 steps)
export const CHORD_TOTAL_STEPS = 64
