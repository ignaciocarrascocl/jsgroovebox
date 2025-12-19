// Keys available
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Mono Synth patterns - 16 steps per bar, pattern repeats each bar
// Each step can be 0-3: 0=rest, 1=root, 2=fifth, 3=octave
// The pattern is applied to each bar, chord changes every 16 steps
export const MONO_SYNTH_PATTERNS = [
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

// Mono Synth sound presets - combinations of synth parameters
export const MONO_SYNTH_SOUND_PRESETS = [
  { name: 'Sub Bass', waveType: 'sine', waveShape: 0, detune: 0, volume: -6, filter: 200, resonance: 1, attack: 0.01, decay: 0.5, release: 0.4, lfoRate: 0, lfoDepth: 0, compression: 0.3, drive: 0, chorus: 0, reverb: 0, delay: 0 },
  { name: 'Classic', waveType: 'sawtooth', waveShape: 0.5, detune: 5, volume: -6, filter: 800, resonance: 2, attack: 0.01, decay: 0.3, release: 0.3, lfoRate: 0, lfoDepth: 0, compression: 0.4, drive: 0.05, chorus: 0.05, reverb: 0.05, delay: 0 },
  { name: 'Acid', waveType: 'sawtooth', waveShape: 0.6, detune: 10, volume: -6, filter: 400, resonance: 12, attack: 0.001, decay: 0.2, release: 0.2, lfoRate: 4, lfoDepth: 300, compression: 0.5, drive: 0.1, chorus: 0, reverb: 0, delay: 0 },
  { name: '808', waveType: 'sine', waveShape: 0, detune: 0, volume: -4, filter: 300, resonance: 1, attack: 0.001, decay: 0.8, release: 0.7, lfoRate: 0, lfoDepth: 0, compression: 0.6, drive: 0.15, chorus: 0, reverb: 0, delay: 0 },
  { name: 'Reese', waveType: 'sawtooth', waveShape: 0.9, detune: 15, volume: -6, filter: 600, resonance: 4, attack: 0.02, decay: 0.4, release: 0.4, lfoRate: 0.5, lfoDepth: 100, compression: 0.4, drive: 0.12, chorus: 0.06, reverb: 0.03, delay: 0 },
  { name: 'Pluck', waveType: 'square', waveShape: 0.2, detune: 3, volume: -8, filter: 2000, resonance: 3, attack: 0.001, decay: 0.1, release: 0.15, lfoRate: 0, lfoDepth: 0, compression: 0.3, drive: 0, chorus: 0.08, reverb: 0.02, delay: 0 },
  { name: 'Wobble', waveType: 'sawtooth', waveShape: 0.8, detune: 8, volume: -5, filter: 500, resonance: 8, attack: 0.01, decay: 0.3, release: 0.3, lfoRate: 6, lfoDepth: 400, compression: 0.5, drive: 0.08, chorus: 0, reverb: 0.02, delay: 0 },
  { name: 'Fat', waveType: 'square', waveShape: 0.7, detune: 12, volume: -5, filter: 400, resonance: 2, attack: 0.01, decay: 0.5, release: 0.4, lfoRate: 0, lfoDepth: 0, compression: 0.4, drive: 0.12, chorus: 0.04, reverb: 0.03, delay: 0 },
  { name: 'Deep Growl', waveType: 'sawtooth', waveShape: 0.6, detune: 6, volume: -5, filter: 300, resonance: 6, attack: 0.01, decay: 0.6, release: 0.5, lfoRate: 2, lfoDepth: 150, compression: 0.45, drive: 0.14, chorus: 0.06, reverb: 0.02, delay: 0 },
  { name: 'FM Pulse', waveType: 'triangle', waveShape: 0.4, detune: 8, volume: -6, filter: 900, resonance: 3, attack: 0.005, decay: 0.25, release: 0.3, lfoRate: 5, lfoDepth: 60, compression: 0.4, drive: 0.06, chorus: 0.03, reverb: 0.02, delay: 0 },
  { name: 'Analog Pad', waveType: 'sawtooth', waveShape: 0.5, detune: 8, volume: -8, filter: 1500, resonance: 2, attack: 0.05, decay: 0.6, release: 0.6, lfoRate: 0.3, lfoDepth: 200, compression: 0.2, drive: 0.02, chorus: 0.2, reverb: 0.08, delay: 0 },
  { name: 'Sub Lead', waveType: 'square', waveShape: 0.5, detune: 10, volume: -5, filter: 350, resonance: 1.2, attack: 0.005, decay: 0.4, release: 0.4, lfoRate: 1, lfoDepth: 50, compression: 0.45, drive: 0.08, chorus: 0.04, reverb: 0.03, delay: 0 },

  // Additional presets to reach 16 total
  { name: 'Muted Thump', waveType: 'sine', waveShape: 0.05, detune: 0, volume: -7, filter: 250, resonance: 1.0, attack: 0.001, decay: 0.18, release: 0.25, lfoRate: 0, lfoDepth: 0, compression: 0.55, drive: 0, chorus: 0, reverb: 0.02, delay: 0 },
  { name: 'Gritty Bite', waveType: 'square', waveShape: 0.6, detune: 6, volume: -6, filter: 450, resonance: 8, attack: 0.005, decay: 0.25, release: 0.35, lfoRate: 3.5, lfoDepth: 120, compression: 0.45, drive: 0.35, chorus: 0.04, reverb: 0.02, delay: 0.01 },
  { name: 'Dub Mod', waveType: 'sawtooth', waveShape: 0.4, detune: 4, volume: -5, filter: 1200, resonance: 2.5, attack: 0.02, decay: 0.5, release: 0.6, lfoRate: 1.5, lfoDepth: 220, compression: 0.35, drive: 0.06, chorus: 0.1, reverb: 0.18, delay: 0.12 },
  { name: 'Glass Pluck', waveType: 'triangle', waveShape: 0.15, detune: 8, volume: -7, filter: 3000, resonance: 9, attack: 0.001, decay: 0.08, release: 0.12, lfoRate: 6, lfoDepth: 70, compression: 0.2, drive: 0.02, chorus: 0.05, reverb: 0.03, delay: 0 },
]

// Total steps for full progression (4 bars x 16 steps)
export const MONO_SYNTH_TOTAL_STEPS = 64
