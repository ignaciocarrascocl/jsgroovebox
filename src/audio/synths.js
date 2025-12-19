import * as Tone from 'tone'

// Create drum synths
const createDrumSynths = () => {
  const synths = {}

  // Kick
  synths.kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
  })

  // Snare
  synths.snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
  })

  // HiHat
  synths.hihat = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  })
  synths.hihat.volume.value = -10

  // Open HiHat
  synths.openHH = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.5, release: 0.1 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  })
  synths.openHH.volume.value = -10

  // Tom
  synths.tom = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.5 }
  })
  synths.tom.volume.value = -5

  // Clap
  synths.clap = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.003, decay: 0.15, sustain: 0, release: 0.15 }
  })
  synths.clap.volume.value = -6

  return synths
}

// Create melodic synths
const createMelodicSynths = () => {
  const synths = {}

  // Bass Synth
  synths.bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.1 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2, baseFrequency: 200, octaves: 2 }
  })
  synths.bass.volume.value = -6

  // Chord Synth - PolySynth for playing multiple notes
  synths.chords = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.05, decay: 0.4, sustain: 0.2, release: 0.3 },
  })
  synths.chords.volume.value = -10

  // Arpeggio Synth
  synths.arp = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.005, decay: 0.08, sustain: 0.1, release: 0.1 },
    filterEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.3, release: 0.05, baseFrequency: 400, octaves: 2 }
  })
  synths.arp.volume.value = -6

  return synths
}

export { createDrumSynths, createMelodicSynths }
