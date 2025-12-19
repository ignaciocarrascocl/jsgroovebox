import * as Tone from 'tone'

// Create effects for each track
const createTrackEffects = () => {
  const effects = {
    kick: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(1000, 'lowpass'),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    snare: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(5000, 'lowpass'),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    hihat: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(8000, 'highpass'),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    openHH: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(8000, 'highpass'),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    tom: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(1200, 'lowpass'),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    clap: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(4000, 'bandpass'),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    bass: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(800, 'lowpass'),
      distortion: new Tone.Distortion(0),
      chorus: new Tone.Chorus(1.5, 3.5, 0.5),
      lfo: new Tone.LFO({ frequency: 0, min: 0, max: 0 }),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    chords: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(2500, 'lowpass'),
      distortion: new Tone.Distortion(0),
      chorus: new Tone.Chorus(1.5, 3.5, 0.5),
      lfo: new Tone.LFO({ frequency: 0, min: 0, max: 0 }),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
    arp: {
      compressor: new Tone.Compressor(-30, 3),
      filter: new Tone.Filter(1200, 'lowpass'),
      distortion: new Tone.Distortion(0),
      chorus: new Tone.Chorus(1.5, 3.5, 0.5),
      lfo: new Tone.LFO({ frequency: 0, min: 0, max: 0 }),
      delaySend: new Tone.Gain(0),
      reverbSend: new Tone.Gain(0),
    },
  }

  // Setup bass filter Q and LFO
  effects.bass.filter.Q.value = 2
  effects.bass.lfo.connect(effects.bass.filter.frequency)

  // Setup chords filter Q and LFO
  effects.chords.filter.Q.value = 2
  effects.chords.lfo.connect(effects.chords.filter.frequency)

  // Setup arp filter Q and LFO
  effects.arp.filter.Q.value = 2
  effects.arp.lfo.connect(effects.arp.filter.frequency)

  // Start chorus internal LFOs
  if (effects.bass.chorus && typeof effects.bass.chorus.start === 'function') {
    effects.bass.chorus.start()
  }
  if (effects.chords.chorus && typeof effects.chords.chorus.start === 'function') {
    effects.chords.chorus.start()
  }
  if (effects.arp.chorus && typeof effects.arp.chorus.start === 'function') {
    effects.arp.chorus.start()
  }

  return effects
}

export { createTrackEffects }
