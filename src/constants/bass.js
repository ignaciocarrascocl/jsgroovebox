// Keys available
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Bass patterns - 16 steps per bar, pattern repeats each bar
// Each step can be 0-3: 0=rest, 1=root, 2=fifth, 3=octave
// The pattern is applied to each bar, chord changes every 16 steps
export const BASS_PATTERNS = [
  // Basic patterns
  { name: 'Straight 4', pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
  { name: 'Octave Jump', pattern: [1,0,3,0, 1,0,3,0, 1,0,3,0, 1,0,3,0] },
  { name: 'Root-Fifth', pattern: [1,0,2,0, 1,0,2,0, 1,0,2,0, 1,0,2,0] },
  { name: '8ths Root', pattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
  
  // Groovy patterns  
  { name: 'Funky', pattern: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,1,0,0] },
  { name: 'Disco', pattern: [1,0,1,0, 1,0,1,0, 3,0,1,0, 1,0,2,0] },
  { name: 'House', pattern: [1,0,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0] },
  { name: 'Techno', pattern: [1,1,0,1, 1,0,0,1, 1,1,0,1, 1,0,0,0] },
  
  // Walking/melodic patterns
  { name: 'Walking', pattern: [1,0,2,0, 3,0,2,0, 1,0,2,0, 3,0,2,0] },
  { name: 'Climb', pattern: [1,0,0,0, 2,0,0,0, 3,0,0,0, 2,0,0,0] },
  { name: 'Bounce', pattern: [1,0,3,0, 1,0,3,0, 2,0,3,0, 2,0,1,0] },
  { name: 'Arpeggio', pattern: [1,0,2,0, 3,0,2,0, 1,0,3,0, 2,0,1,0] },
  
  // Syncopated patterns
  { name: 'Offbeat', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
  { name: 'Syncopated', pattern: [1,0,0,1, 0,0,0,1, 0,0,1,0, 0,1,0,0] },
  { name: 'Shuffle', pattern: [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0] },
  
  // Driving/aggressive
  { name: '16ths', pattern: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
]

// Wave types for synth
export const WAVE_TYPES = ['sine', 'triangle', 'sawtooth', 'square']

// Bass sound presets - combinations of synth parameters
export const BASS_SOUND_PRESETS = [
  { name: 'Sub Bass', waveType: 'sine', filter: 200, resonance: 1, attack: 0.01, decay: 0.5, detune: 0, lfoRate: 0, lfoDepth: 0, compression: 0.3 },
  { name: 'Classic', waveType: 'sawtooth', filter: 800, resonance: 2, attack: 0.01, decay: 0.3, detune: 5, lfoRate: 0, lfoDepth: 0, compression: 0.4 },
  { name: 'Acid', waveType: 'sawtooth', filter: 400, resonance: 12, attack: 0.001, decay: 0.2, detune: 10, lfoRate: 4, lfoDepth: 300, compression: 0.5 },
  { name: '808', waveType: 'sine', filter: 300, resonance: 1, attack: 0.001, decay: 0.8, detune: 0, lfoRate: 0, lfoDepth: 0, compression: 0.6 },
  { name: 'Reese', waveType: 'sawtooth', filter: 600, resonance: 4, attack: 0.02, decay: 0.4, detune: 15, lfoRate: 0.5, lfoDepth: 100, compression: 0.4 },
  { name: 'Pluck', waveType: 'square', filter: 2000, resonance: 3, attack: 0.001, decay: 0.1, detune: 3, lfoRate: 0, lfoDepth: 0, compression: 0.3 },
  { name: 'Wobble', waveType: 'sawtooth', filter: 500, resonance: 8, attack: 0.01, decay: 0.3, detune: 8, lfoRate: 6, lfoDepth: 400, compression: 0.5 },
  { name: 'Fat', waveType: 'square', filter: 400, resonance: 2, attack: 0.01, decay: 0.5, detune: 12, lfoRate: 0, lfoDepth: 0, compression: 0.4 },
]

// Total steps for full progression (4 bars x 16 steps)
export const BASS_TOTAL_STEPS = 64
