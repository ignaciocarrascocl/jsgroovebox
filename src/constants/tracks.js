// Track configuration
export const TRACKS = [
  { id: 1, name: 'Kick', color: '#e74c3c', shape: 'sphere' },
  { id: 2, name: 'Snare', color: '#f39c12', shape: 'box' },
  { id: 3, name: 'HiHat', color: '#2ecc71', shape: 'cone' },
  { id: 4, name: 'Open HH', color: '#3498db', shape: 'torus' },
  { id: 5, name: 'Tom', color: '#9b59b6', shape: 'cylinder' },
  { id: 9, name: 'Clap', color: '#ff6b6b', shape: 'tetrahedron' },
  { id: 6, name: 'Mono Synth', color: '#1abc9c', shape: 'octahedron' },
  { id: 7, name: 'Poly Synth', color: '#e91e63', shape: 'dodecahedron' },
  { id: 8, name: 'Arp Synth', color: '#00bcd4', shape: 'icosahedron' },
]

// Default pattern selections
export const DEFAULT_PATTERNS = {
  1: 0, // Kick - Four on Floor
  2: 0, // Snare - Backbeat
  3: 0, // HiHat - 8ths
  4: 0, // Open HH - Offbeat
  5: 15, // Tom - Off
  9: 15, // Clap - Off
  6: 0, // Bass - Straight
  7: 0, // Chords - Whole Notes
  8: 0, // Lead/Arp - default
}
