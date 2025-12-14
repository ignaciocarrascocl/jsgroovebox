// 16 patterns for each track type (16 steps, 1 = hit, 0 = rest)
export const PATTERNS = {
  kick: [
    { name: 'Four on Floor', pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
    { name: 'Backbeat', pattern: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: 'Boom Bap', pattern: [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0] },
    { name: 'Disco', pattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    { name: 'Reggaeton', pattern: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0] },
    { name: 'House', pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,1,0] },
    { name: 'Trap', pattern: [1,0,0,0, 0,0,0,1, 0,1,0,0, 0,0,0,0] },
    { name: 'Funk', pattern: [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0] },
    { name: 'Rock', pattern: [1,0,0,0, 0,0,0,0, 1,0,1,0, 0,0,0,0] },
    { name: 'Breakbeat', pattern: [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0] },
    { name: 'DnB', pattern: [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0] },
    { name: 'Techno', pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,1] },
    { name: 'Minimal', pattern: [1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Shuffle', pattern: [1,0,0,1, 0,0,0,0, 1,0,0,1, 0,0,0,0] },
    { name: 'Half Time', pattern: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
    { name: 'Off', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  ],
  snare: [
    { name: 'Backbeat', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Boom Bap', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1] },
    { name: 'Trap', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0] },
    { name: 'Funk', pattern: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1] },
    { name: 'Disco', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Rock', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Reggae', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0] },
    { name: 'DnB', pattern: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: 'Breakbeat', pattern: [0,0,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,0] },
    { name: 'House', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Techno', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1] },
    { name: 'Roll', pattern: [0,0,0,0, 1,1,0,0, 0,0,0,0, 1,1,1,1] },
    { name: 'Shuffle', pattern: [0,0,0,0, 1,0,0,0, 0,1,0,0, 1,0,0,0] },
    { name: 'Double', pattern: [0,0,0,0, 1,0,1,0, 0,0,0,0, 1,0,1,0] },
    { name: 'Ghost', pattern: [0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0] },
    { name: 'Off', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  ],
  hihat: [
    { name: '8ths', pattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    { name: '16ths', pattern: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    { name: 'Offbeat', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
    { name: 'Disco', pattern: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
    { name: 'Funk', pattern: [1,0,1,1, 1,0,1,1, 1,0,1,1, 1,0,1,1] },
    { name: 'Trap', pattern: [1,0,1,0, 1,1,1,0, 1,0,1,0, 1,1,1,1] },
    { name: 'House', pattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    { name: 'DnB', pattern: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    { name: 'Reggae', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
    { name: 'Rock', pattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    { name: 'Shuffle', pattern: [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0] },
    { name: 'Sparse', pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
    { name: 'Syncopated', pattern: [1,0,1,1, 0,1,1,0, 1,0,1,1, 0,1,1,0] },
    { name: 'Triplet Feel', pattern: [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1] },
    { name: 'Minimal', pattern: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0] },
    { name: 'Off', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  ],
  openHH: [
    { name: 'Offbeat', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
    { name: 'Disco', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
    { name: 'House', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0] },
    { name: 'Funk', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0] },
    { name: 'Accent', pattern: [0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0] },
    { name: 'Rock', pattern: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: 'Sparse', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0] },
    { name: 'Double', pattern: [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0] },
    { name: 'Reggae', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0] },
    { name: 'DnB', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0] },
    { name: 'Syncopated', pattern: [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0] },
    { name: 'Heavy', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
    { name: 'Fills', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,1,0] },
    { name: 'Groove', pattern: [0,0,1,0, 0,0,0,0, 0,1,0,0, 0,0,1,0] },
    { name: 'Minimal', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0] },
    { name: 'Off', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  ],
  clap: [
    { name: 'Backbeat', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Double', pattern: [0,0,0,0, 1,1,0,0, 0,0,0,0, 1,1,0,0] },
    { name: 'Offbeat', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0] },
    { name: 'Trap', pattern: [0,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,1,0] },
    { name: 'House', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Roll', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,1,1,1] },
    { name: 'Syncopated', pattern: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1] },
    { name: 'Minimal', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0] },
    { name: 'Funk', pattern: [0,0,0,0, 1,0,0,1, 0,0,0,1, 1,0,0,0] },
    { name: 'Latin', pattern: [0,0,1,0, 1,0,0,0, 0,0,1,0, 1,0,0,0] },
    { name: 'Shuffle', pattern: [0,0,0,0, 1,0,0,0, 0,1,0,0, 1,0,0,0] },
    { name: 'Build', pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,1] },
    { name: 'Triplet', pattern: [0,0,0,0, 1,0,0,1, 0,0,1,0, 1,0,0,0] },
    { name: 'Sparse', pattern: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: 'Accent', pattern: [0,0,0,1, 1,0,0,0, 0,0,0,1, 1,0,0,0] },
    { name: 'Off', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  ],
  tom: [
    { name: 'Fill', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,1,1] },
    { name: 'Roll', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,1,1,1] },
    { name: 'Triplet', pattern: [0,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1] },
    { name: 'Rock Fill', pattern: [0,0,0,0, 0,0,0,0, 0,0,1,0, 1,0,1,0] },
    { name: 'Funk', pattern: [0,1,0,0, 0,1,0,0, 0,1,0,0, 0,1,0,0] },
    { name: 'DnB', pattern: [0,0,0,0, 0,0,1,0, 0,0,0,1, 0,0,0,0] },
    { name: 'Build', pattern: [0,0,0,0, 0,0,0,0, 1,0,1,0, 1,1,1,1] },
    { name: 'Tribal', pattern: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0] },
    { name: 'Double', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,1,0,0] },
    { name: 'Accent', pattern: [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0] },
    { name: 'Minimal', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0] },
    { name: 'Latin', pattern: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,0,0] },
    { name: 'Shuffle', pattern: [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,1,0] },
    { name: 'Crescendo', pattern: [0,0,0,0, 0,0,0,1, 0,0,1,0, 1,1,1,1] },
    { name: 'Sparse', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0] },
    { name: 'Off', pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
  ],
}

// Get pattern options for a specific track
export const getPatternOptions = (trackId) => {
  switch (trackId) {
    case 1: return PATTERNS.kick
    case 2: return PATTERNS.snare
    case 3: return PATTERNS.hihat
    case 4: return PATTERNS.openHH
    case 5: return PATTERNS.tom
    case 9: return PATTERNS.clap
    default: return []
  }
}

// Sound presets for drum tracks - 8 presets per track with all parameters
export const DRUM_SOUND_PRESETS = {
  // Kick presets (8)
  1: [
    { name: '808', params: { pitch: -12, attack: 0.001, release: 0.8, filter: 200, reverb: 0, delay: 0, compression: 0.1, swing: 0 } },
    { name: 'Punchy', params: { pitch: 0, attack: 0.001, release: 0.3, filter: 600, reverb: 0, delay: 0, compression: 0.25, swing: 0 } },
    { name: 'Sub', params: { pitch: -24, attack: 0.001, release: 1.2, filter: 100, reverb: 0, delay: 0, compression: 0.05, swing: 0 } },
    { name: 'Tight', params: { pitch: 6, attack: 0.001, release: 0.15, filter: 1000, reverb: 0, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Boom', params: { pitch: -6, attack: 0.002, release: 0.6, filter: 400, reverb: 0.1, delay: 0, compression: 0.15, swing: 0 } },
    { name: 'Deep', params: { pitch: -18, attack: 0.001, release: 1.0, filter: 150, reverb: 0.05, delay: 0, compression: 0.1, swing: 0 } },
    { name: 'Snap', params: { pitch: 3, attack: 0.001, release: 0.2, filter: 800, reverb: 0, delay: 0, compression: 0.3, swing: 0 } },
    { name: 'Room', params: { pitch: 0, attack: 0.001, release: 0.5, filter: 500, reverb: 0.25, delay: 0.1, compression: 0.15, swing: 0 } },
  ],
  // Snare presets (8)
  2: [
    { name: 'Crack', params: { pitch: 7, attack: 0.001, release: 0.07, filter: 6000, reverb: 0, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Fat', params: { pitch: -5, attack: 0.001, release: 0.22, filter: 3000, reverb: 0.1, delay: 0, compression: 0.25, swing: 0 } },
    { name: 'Rim', params: { pitch: 10, attack: 0.001, release: 0.05, filter: 8000, reverb: 0, delay: 0, compression: 0.15, swing: 0 } },
    { name: 'Room', params: { pitch: 0, attack: 0.001, release: 0.18, filter: 4000, reverb: 0.4, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Clap', params: { pitch: 3, attack: 0.003, release: 0.14, filter: 5000, reverb: 0.2, delay: 0, compression: 0.3, swing: 0 } },
    { name: 'Tight', params: { pitch: 6, attack: 0.001, release: 0.09, filter: 7000, reverb: 0.05, delay: 0, compression: 0.25, swing: 0 } },
    { name: 'Echo', params: { pitch: 0, attack: 0.001, release: 0.16, filter: 4500, reverb: 0.15, delay: 0.3, compression: 0.2, swing: 0 } },
    { name: 'Big', params: { pitch: -2, attack: 0.002, release: 0.26, filter: 3500, reverb: 0.35, delay: 0.05, compression: 0.15, swing: 0 } },
  ],
  // HiHat presets (8)
  3: [
    { name: 'Tight', params: { pitch: 12, attack: 0.001, release: 0.02, filter: 10000, reverb: 0, delay: 0, compression: 0.1, swing: 0 } },
    { name: 'Open', params: { pitch: 0, attack: 0.001, release: 0.1, filter: 8000, reverb: 0.05, delay: 0, compression: 0.05, swing: 0 } },
    { name: 'Dark', params: { pitch: -6, attack: 0.001, release: 0.05, filter: 4000, reverb: 0, delay: 0, compression: 0.15, swing: 0 } },
    { name: 'Bright', params: { pitch: 18, attack: 0.001, release: 0.03, filter: 12000, reverb: 0, delay: 0, compression: 0.1, swing: 0 } },
    { name: 'Crisp', params: { pitch: 6, attack: 0.001, release: 0.04, filter: 9000, reverb: 0, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Soft', params: { pitch: -3, attack: 0.002, release: 0.06, filter: 6000, reverb: 0.1, delay: 0, compression: 0.05, swing: 0 } },
    { name: 'Echo', params: { pitch: 3, attack: 0.001, release: 0.05, filter: 8500, reverb: 0.1, delay: 0.25, compression: 0.1, swing: 0 } },
    { name: 'Wide', params: { pitch: 0, attack: 0.001, release: 0.08, filter: 7500, reverb: 0.15, delay: 0.1, compression: 0.08, swing: 0 } },
  ],
  // Open HH presets (8)
  4: [
    { name: 'Splash', params: { pitch: 0, attack: 0.001, release: 0.5, filter: 6000, reverb: 0.1, delay: 0, compression: 0.1, swing: 0 } },
    { name: 'Ride', params: { pitch: 6, attack: 0.001, release: 0.4, filter: 8000, reverb: 0.05, delay: 0, compression: 0.15, swing: 0 } },
    { name: 'Crash', params: { pitch: -6, attack: 0.001, release: 0.7, filter: 5000, reverb: 0.2, delay: 0, compression: 0.1, swing: 0 } },
    { name: 'Short', params: { pitch: 0, attack: 0.001, release: 0.2, filter: 7000, reverb: 0, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Big', params: { pitch: -3, attack: 0.002, release: 0.6, filter: 5500, reverb: 0.25, delay: 0.05, compression: 0.13, swing: 0 } },
    { name: 'Sizzle', params: { pitch: 9, attack: 0.001, release: 0.35, filter: 9000, reverb: 0.1, delay: 0, compression: 0.15, swing: 0 } },
    { name: 'Echo', params: { pitch: 3, attack: 0.001, release: 0.45, filter: 7000, reverb: 0.15, delay: 0.3, compression: 0.1, swing: 0 } },
    { name: 'Ambient', params: { pitch: 0, attack: 0.003, release: 0.8, filter: 6500, reverb: 0.4, delay: 0.15, compression: 0.08, swing: 0 } },
  ],
  // Tom presets (8)
  5: [
    { name: 'Floor', params: { pitch: -12, attack: 0.001, release: 0.4, filter: 800, reverb: 0.1, delay: 0, compression: 0.15, swing: 0 } },
    { name: 'Mid', params: { pitch: 0, attack: 0.001, release: 0.3, filter: 1200, reverb: 0.05, delay: 0, compression: 0.15, swing: 0 } },
    { name: 'High', params: { pitch: 12, attack: 0.001, release: 0.25, filter: 1800, reverb: 0, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Deep', params: { pitch: -18, attack: 0.001, release: 0.6, filter: 600, reverb: 0.15, delay: 0, compression: 0.1, swing: 0 } },
    { name: 'Tight', params: { pitch: 6, attack: 0.001, release: 0.2, filter: 1500, reverb: 0, delay: 0, compression: 0.25, swing: 0 } },
    { name: 'Room', params: { pitch: 0, attack: 0.001, release: 0.5, filter: 1000, reverb: 0.3, delay: 0.1, compression: 0.15, swing: 0 } },
    { name: 'Roto', params: { pitch: -6, attack: 0.001, release: 0.35, filter: 900, reverb: 0.1, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Echo', params: { pitch: 3, attack: 0.001, release: 0.4, filter: 1300, reverb: 0.2, delay: 0.25, compression: 0.15, swing: 0 } },
  ],
  // Clap presets (8)
  9: [
    { name: 'Tight', params: { pitch: 4, attack: 0.002, release: 0.09, filter: 4000, reverb: 0.1, delay: 0, compression: 0.25, swing: 0 } },
    { name: 'Room', params: { pitch: 0, attack: 0.003, release: 0.18, filter: 3500, reverb: 0.3, delay: 0, compression: 0.2, swing: 0 } },
    { name: 'Big', params: { pitch: -4, attack: 0.004, release: 0.26, filter: 3000, reverb: 0.4, delay: 0.05, compression: 0.15, swing: 0 } },
    { name: 'Snap', params: { pitch: 8, attack: 0.001, release: 0.08, filter: 5000, reverb: 0.05, delay: 0, compression: 0.3, swing: 0 } },
    { name: 'Fat', params: { pitch: -6, attack: 0.005, release: 0.22, filter: 2800, reverb: 0.2, delay: 0, compression: 0.25, swing: 0 } },
    { name: 'Echo', params: { pitch: 0, attack: 0.003, release: 0.14, filter: 3800, reverb: 0.15, delay: 0.3, compression: 0.2, swing: 0 } },
    { name: 'Bright', params: { pitch: 10, attack: 0.002, release: 0.11, filter: 6000, reverb: 0.1, delay: 0, compression: 0.25, swing: 0 } },
    { name: 'Vintage', params: { pitch: -10, attack: 0.004, release: 0.16, filter: 2500, reverb: 0.25, delay: 0.1, compression: 0.2, swing: 0 } },
  ],
}
