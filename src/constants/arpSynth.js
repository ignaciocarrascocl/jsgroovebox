// Arp Synth patterns - 16 steps per bar, pattern repeats each bar
// Each step can be 0-3: 0=rest, 1=first chord note, 2=second chord note, 3=third chord note (or octave)
const R = (p) => (Array.isArray(p) ? Array.from({ length: 64 }, (_, i) => p[i % p.length]) : p)
export const ARP_SYNTH_PATTERNS = [
  { name: 'Off', pattern: R([0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]) },
  { name: 'Sparse', pattern: R([1,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0]) },
  { name: '8th Arp', pattern: R([1,0,2,0, 1,0,3,0, 1,0,2,0, 1,0,3,0]) },
  { name: 'Triplets', pattern: R([1,2,3, 0,1,2,3, 0,1,2,3, 0,1,2,3]) },
  { name: 'Up', pattern: R([1,0,2,0, 3,0,2,0, 1,0,2,0, 3,0,2,0]) },
  { name: 'Down', pattern: R([3,0,2,0, 1,0,2,0, 3,0,2,0, 1,0,2,0]) },
  { name: 'Rolling', pattern: R([1,2,3,2, 1,2,3,2, 1,2,3,2, 1,2,3,2]) },
  { name: 'Ping-Pong', pattern: R([1,2,3,2, 3,2,1,2, 1,2,3,2, 3,2,1,2]) },
  { name: 'Staccato', pattern: R([1,0,1,0, 2,0,2,0, 3,0,3,0, 1,0,1,0]) },
  { name: 'Dense', pattern: R([1,2,3,1, 2,3,1,2, 3,1,2,3, 1,2,3,1]) },
  { name: 'Syncopated', pattern: R([1,0,2,0, 0,3,0,2, 1,0,2,0, 0,3,0,2]) },
]

export const WAVE_TYPES = ['sine', 'triangle', 'sawtooth', 'square']

// Arp Synth sound presets - simple combinations of synth parameters
export const ARP_SYNTH_SOUND_PRESETS = [
  { name: 'Plucky Arp', waveType: 'triangle', waveShape: 0.1, detune: 0, volume: -6, filter: 1800, resonance: 1.2, attack: 0.005, decay: 0.08, release: 0.08, lfoRate: 0, lfoDepth: 0, compression: 0, drive: 0, chorus: 0, reverb: 0.05, delay: 0 },
  { name: 'Bright Arp', waveType: 'sawtooth', waveShape: 0.2, detune: 6, volume: -6, filter: 3200, resonance: 2, attack: 0.002, decay: 0.12, release: 0.12, lfoRate: 0.1, lfoDepth: 30, compression: 0.1, drive: 0.02, chorus: 0.05, reverb: 0.08, delay: 0.02 },
  { name: 'Bell Arp', waveType: 'triangle', waveShape: 0.4, detune: 12, volume: -8, filter: 6000, resonance: 3.5, attack: 0.001, decay: 1.2, release: 1.2, lfoRate: 0.3, lfoDepth: 60, compression: 0.15, drive: 0, chorus: 0.08, reverb: 0.2, delay: 0.03 },

  { name: 'Sub Pluck', waveType: 'sine', waveShape: 0.02, detune: 0, volume: -6, filter: 200, resonance: 1, attack: 0.001, decay: 0.5, release: 0.2, lfoRate: 0, lfoDepth: 0, compression: 0.1, drive: 0.05, chorus: 0, reverb: 0.05, delay: 0 },
  { name: 'Tape Lead', waveType: 'sawtooth', waveShape: 0.5, detune: 8, volume: -5, filter: 2800, resonance: 2.5, attack: 0.01, decay: 0.2, release: 0.3, lfoRate: 0.2, lfoDepth: 40, compression: 0.2, drive: 0.08, chorus: 0.08, reverb: 0.1, delay: 0.02 },
  { name: 'Glass', waveType: 'triangle', waveShape: 0.8, detune: 10, volume: -8, filter: 7000, resonance: 5, attack: 0.002, decay: 1.5, release: 1.5, lfoRate: 0.25, lfoDepth: 200, compression: 0.15, drive: 0, chorus: 0.05, reverb: 0.25, delay: 0.04 },
  { name: 'FM Bell', waveType: 'triangle', waveShape: 0.5, detune: 14, volume: -6, filter: 6200, resonance: 6, attack: 0.001, decay: 1.8, release: 2.0, lfoRate: 0.5, lfoDepth: 200, compression: 0.2, drive: 0.02, chorus: 0.02, reverb: 0.12, delay: 0.02 },
  { name: 'Analog Pluck', waveType: 'sawtooth', waveShape: 0.7, detune: 6, volume: -7, filter: 1100, resonance: 2.2, attack: 0.003, decay: 0.15, release: 0.12, lfoRate: 0.12, lfoDepth: 60, compression: 0.12, drive: 0.06, chorus: 0.04, reverb: 0.08, delay: 0.01 },

  { name: 'Evolving', waveType: 'sine', waveShape: 0.6, detune: 12, volume: -10, filter: 1500, resonance: 1.7, attack: 0.5, decay: 2.0, release: 2.0, lfoRate: 0.05, lfoDepth: 80, compression: 0.1, drive: 0, chorus: 0.1, reverb: 0.4, delay: 0.03 },
  { name: 'Wide Pad', waveType: 'sawtooth', waveShape: 0.9, detune: 20, volume: -14, filter: 1000, resonance: 1.5, attack: 0.8, decay: 1.5, release: 1.5, lfoRate: 0.08, lfoDepth: 120, compression: 0.15, drive: 0.05, chorus: 0.2, reverb: 0.5, delay: 0.05 },
  { name: 'Square Pulse', waveType: 'square', waveShape: 0.2, detune: 4, volume: -6, filter: 2200, resonance: 3, attack: 0.002, decay: 0.2, release: 0.2, lfoRate: 0.15, lfoDepth: 80, compression: 0.12, drive: 0.07, chorus: 0.05, reverb: 0.06, delay: 0.02 },

  { name: 'Vintage', waveType: 'triangle', waveShape: 0.3, detune: 8, volume: -9, filter: 1600, resonance: 1.8, attack: 0.02, decay: 0.6, release: 0.6, lfoRate: 0.12, lfoDepth: 70, compression: 0.18, drive: 0.04, chorus: 0.12, reverb: 0.15, delay: 0.02 },
  { name: 'Metallic', waveType: 'triangle', waveShape: 0.6, detune: 16, volume: -6, filter: 6000, resonance: 7, attack: 0.001, decay: 1.2, release: 1.2, lfoRate: 0.4, lfoDepth: 180, compression: 0.2, drive: 0.03, chorus: 0.02, reverb: 0.12, delay: 0.02 },
  { name: 'Pluck Bright', waveType: 'triangle', waveShape: 0.15, detune: 3, volume: -5, filter: 3400, resonance: 2.8, attack: 0.001, decay: 0.08, release: 0.1, lfoRate: 0.2, lfoDepth: 50, compression: 0.1, drive: 0.02, chorus: 0.06, reverb: 0.06, delay: 0.01 },
  { name: 'Soft Pad', waveType: 'sine', waveShape: 0.5, detune: 6, volume: -12, filter: 2400, resonance: 1.2, attack: 0.6, decay: 1.2, release: 1.2, lfoRate: 0.06, lfoDepth: 40, compression: 0.1, drive: 0, chorus: 0.12, reverb: 0.3, delay: 0.04 },
  { name: 'Chime', waveType: 'triangle', waveShape: 0.35, detune: 10, volume: -7, filter: 4800, resonance: 4, attack: 0.001, decay: 1.8, release: 1.8, lfoRate: 0.5, lfoDepth: 150, compression: 0.15, drive: 0, chorus: 0.05, reverb: 0.2, delay: 0.02 },
]

export const ARP_SYNTH_TOTAL_STEPS = 64
