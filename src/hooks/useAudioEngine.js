import { useRef, useState, useEffect, useCallback } from 'react'
import * as Tone from 'tone'
import { PATTERNS } from '../constants/patterns'
import { BASS_PATTERNS, BASS_TOTAL_STEPS } from '../constants/bass'
import { CHORD_PATTERNS, CHORD_TOTAL_STEPS } from '../constants/chords'
import { CHORD_PROGRESSIONS } from '../constants/song'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const dbFromRms = (rms) => {
  const v = Math.max(1e-8, rms ?? 0)
  return 20 * Math.log10(v)
}

const applyCompressionAmount = (compressor, amount01) => {
  if (!compressor) return

  const a = clamp(amount01 ?? 0, 0, 1)
  // Keep parameters in stable ranges for DynamicsCompressorNode.
  // amount=0 => light compression, amount=1 => strong compression.
  const threshold = -6 + (-30) * a // -6dB .. -36dB
  const ratio = 1.5 + 18.5 * a // 1.5:1 .. 20:1

  compressor.threshold.rampTo(threshold, 0.1)
  compressor.ratio.rampTo(ratio, 0.1)
}

const pitchToMultiplier = (semitones) => Math.pow(2, (semitones ?? 0) / 12)

const applyPercEnvelope = (envelope, attack, release) => {
  if (!envelope) return
  const a = Math.max(0.0005, attack ?? 0.001)
  const r = Math.max(0.005, release ?? 0.1)

  if (typeof envelope.attack === 'number') envelope.attack = a
  if (typeof envelope.decay === 'number') envelope.decay = r
  if (typeof envelope.release === 'number') envelope.release = r
}

// Create N filter stages (one Biquad per stage) to emulate steeper filter slopes
const createFilterStages = (count, freq, type, q) => {
  const stages = []
  for (let i = 0; i < count; i++) {
    const f = new Tone.Filter(freq, type)
    if (f.Q) f.Q.value = q
    stages.push(f)
  }
  return stages
}

// Scale degrees to semitones
const SCALE_DEGREES_MAJOR = [0, 2, 4, 5, 7, 9, 11] // C D E F G A B
const SCALE_DEGREES_MINOR = [0, 2, 3, 5, 7, 8, 10] // C D Eb F G Ab Bb (natural minor)

// Get bass note for a given key, chord degree, note type, and mode
const getBassNote = (key, chordDegree, noteType, mode = 'Major', octave = 1) => {
  const keyIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key)
  const scaleDegrees = mode === 'Minor' ? SCALE_DEGREES_MINOR : SCALE_DEGREES_MAJOR
  const chordRoot = scaleDegrees[chordDegree % 7]
  const baseNote = (keyIndex + chordRoot) % 12
  
  let semitoneOffset = 0
  let noteOctave = octave
  
  switch (noteType) {
    case 1: // Root
      semitoneOffset = 0
      break
    case 2: // Fifth
      semitoneOffset = 7
      break
    case 3: // Octave
      semitoneOffset = 0
      noteOctave = octave + 1
      break
    default:
      return null
  }
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const finalNote = (baseNote + semitoneOffset) % 12
  const finalOctave = noteOctave + Math.floor((baseNote + semitoneOffset) / 12)
  
  return `${noteNames[finalNote]}${finalOctave}`
}

// Get chord notes for a given key, chord degree, chord type, and mode
const getChordNotes = (key, chordDegree, chordType, mode = 'Major', octave = 3) => {
  const keyIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key)
  const scaleDegrees = mode === 'Minor' ? SCALE_DEGREES_MINOR : SCALE_DEGREES_MAJOR
  const chordRoot = scaleDegrees[chordDegree % 7]
  const baseNote = (keyIndex + chordRoot) % 12
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  // Determine if this chord should be major or minor based on scale degree
  // Major scale: I=maj, ii=min, iii=min, IV=maj, V=maj, vi=min, vii°=dim
  // Minor scale: i=min, ii°=dim, III=maj, iv=min, v=min, VI=maj, VII=maj
  let thirdInterval = 4 // Major third by default
  let seventhInterval = 10 // Minor seventh by default (dominant 7th)
  
  if (mode === 'Major') {
    // Degrees that are minor in major scale: ii (1), iii (2), vi (5)
    if (chordDegree === 1 || chordDegree === 2 || chordDegree === 5) {
      thirdInterval = 3 // Minor third
      seventhInterval = 10 // Minor seventh
    } else if (chordDegree === 6) {
      // vii° is diminished - minor third and diminished fifth
      thirdInterval = 3 // Minor third
      seventhInterval = 9 // Diminished seventh
    } else {
      // I (0), IV (3), V (4) are major
      thirdInterval = 4 // Major third
      seventhInterval = 11 // Major seventh for I and IV, 10 (minor 7th) for V
      if (chordDegree === 4) {
        seventhInterval = 10 // V7 uses dominant (minor) seventh
      }
    }
  } else {
    // Minor scale
    // Degrees that are major in natural minor: III (2), VI (5), VII (6)
    if (chordDegree === 2 || chordDegree === 5 || chordDegree === 6) {
      thirdInterval = 4 // Major third
      seventhInterval = 11 // Major seventh
    } else if (chordDegree === 1) {
      // ii° is diminished
      thirdInterval = 3 // Minor third
      seventhInterval = 9 // Diminished seventh
    } else {
      // i (0), iv (3), v (4) are minor
      thirdInterval = 3 // Minor third
      seventhInterval = 10 // Minor seventh
    }
  }
  
  // Helper to create note name with octave
  const makeNote = (semitones, oct = octave) => {
    const note = (baseNote + semitones) % 12
    const actualOctave = oct + Math.floor((baseNote + semitones) / 12)
    return `${noteNames[note]}${actualOctave}`
  }
  
  switch (chordType) {
    case 1: // Basic triad (root, third, fifth)
      return [makeNote(0), makeNote(thirdInterval), makeNote(7)]
    case 2: // Seventh chord (root, third, fifth, seventh)
      return [makeNote(0), makeNote(thirdInterval), makeNote(7), makeNote(seventhInterval)]
    case 3: // Inversion (third, fifth, root octave up)
      return [makeNote(thirdInterval), makeNote(7), makeNote(12)]
    case 4: // Stab (all notes in tight voicing)
      return [makeNote(0), makeNote(thirdInterval), makeNote(7)]
    default:
      return null
  }
}

// Default track parameters - tuned per instrument type
const DEFAULT_TRACK_PARAMS = {
  1: { volume: 0, pitch: 0, attack: 0.001, release: 0.4, filter: 800, reverb: 0, delay: 0, compression: 0, swing: 0 },
  2: { volume: -3, pitch: 0, attack: 0.001, release: 0.15, filter: 4000, reverb: 0.15, delay: 0, compression: 0.3, swing: 0 },
  3: { volume: -8, pitch: 0, attack: 0.001, release: 0.05, filter: 6000, reverb: 0, delay: 0, compression: 0, swing: 0 },
  4: { volume: -10, pitch: 0, attack: 0.001, release: 0.3, filter: 5000, reverb: 0.1, delay: 0, compression: 0, swing: 0 },
  5: { volume: -5, pitch: 0, attack: 0.001, release: 0.3, filter: 1200, reverb: 0.1, delay: 0, compression: 0.3, swing: 0 },
  9: { volume: -6, pitch: 0, attack: 0.003, release: 0.15, filter: 4000, reverb: 0.2, delay: 0, compression: 0.5, swing: 0 },
}

export const useAudioEngine = (selectedPatterns, customPatterns, trackParams = DEFAULT_TRACK_PARAMS, mutedTracks = {}, soloTracks = {}, bassParams = {}, chordParams = {}, songSettings = {}) => {
  const [toneStarted, setToneStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  // Steps update at 16n. Keeping them in React state forces a full App re-render
  // every tick, which can break interactions with native controls while playing.
  // Use refs for the live value + a low-rate state "pulse" for UI.
  const currentStepRef = useRef(0)
  const currentBassStepRef = useRef(0)
  const currentChordStepRef = useRef(0)
  const [uiStepPulse, setUiStepPulse] = useState(0)
  const [bpm, setBpm] = useState(120)
  const [activeTracks, setActiveTracks] = useState({})
  const [masterMeter, setMasterMeter] = useState({ waveform: [], peakDb: -Infinity, rmsDb: -Infinity })
  const masterNodeRef = useRef(null)
  const [perfStats, setPerfStats] = useState({ fps: undefined, usedJSHeapSizeMb: undefined })
  const transportClearEventIdRef = useRef(null)
  
  const synthsRef = useRef({})
  const effectsRef = useRef({})
  const mixerRef = useRef({})
  const leftPowerRef = useRef(1e-8)
  const rightPowerRef = useRef(1e-8)
  const sequencerRef = useRef(null)
  const bassStepRef = useRef(0) // Track 64-step bass progression
  const chordStepRef = useRef(0) // Track 64-step chord progression

  // publish step refs to UI at a lower cadence (keeps UI responsive)
  useEffect(() => {
    if (!toneStarted) return
    if (!isPlaying) return
    let raf = 0
    let last = 0
    const tick = (t) => {
      if (t - last > 50) {
        last = t
        setUiStepPulse((p) => (p + 1) % 1000000)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [toneStarted, isPlaying])

  // Lightweight performance stats (FPS + JS heap when available)
  useEffect(() => {
    let raf = 0
    let frames = 0
    let lastEmit = performance.now()

    const loop = (t) => {
      frames += 1
  // Emit at ~2Hz to reduce re-renders.
  if (t - lastEmit > 1000) {
        const fps = frames / ((t - lastEmit) / 1000)
        frames = 0
        lastEmit = t

        const mem = performance?.memory
        const usedJSHeapSizeMb = mem?.usedJSHeapSize ? mem.usedJSHeapSize / (1024 * 1024) : undefined
        setPerfStats({ fps, usedJSHeapSizeMb })
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  
  // Use refs to store current values without triggering re-renders
  const selectedPatternsRef = useRef(selectedPatterns)
  const customPatternsRef = useRef(customPatterns)
  const trackParamsRef = useRef(trackParams)
  const mutedTracksRef = useRef(mutedTracks)
  const soloTracksRef = useRef(soloTracks)
  const bassParamsRef = useRef(bassParams)
  const chordParamsRef = useRef(chordParams)
  const songSettingsRef = useRef(songSettings)

  // Master + bus params (controlled from App, stored in refs here)
  // Note: master params include some UI-only fields (e.g. pan/outGain/filterDrive) that are applied only if the node exists.
  const masterParamsRef = useRef({
    compression: 0,
    // Compressor explicit parameters (preferred): threshold (dB), ratio, attack (ms), release (ms)
    compThreshold: -24,
    compRatio: 4,
    compAttack: 10,
    compRelease: 200,
    compMakeup: 0,
    compMix: 1,
    // EQ (3-band): each band has Freq (Hz), Gain (dB), Q
    eqLowFreq: 100,
    eqLowGain: 0,
    eqLowQ: 1,
    eqMidFreq: 1000,
    eqMidGain: 0,
    eqMidQ: 1,
    eqHighFreq: 8000,
    eqHighGain: 0,
    eqHighQ: 1,
    // Backwards-compatible single-band gains
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    filterCutoff: 20000,
    filterReso: 0.7,
  // When filterType is bandpass/notch, filterBandwidth (Hz) controls the absolute width of the band.
  filterBandwidth: 1000,
  // Slope in dB/octave equivalent (12 dB per stage approximated)
  filterSlope: 24,
    filterType: 0,
    filterDrive: 0,
    volume: 0,
    outGain: 0,
    pan: 0,
  })
  const busParamsRef = useRef({ reverb: { wet: 0.2, decay: 1.8, preDelay: 0.01 }, delay: { wet: 0.15, feedback: 0.25, time: 0.25 } })

  // Keep refs in sync with props
  useEffect(() => {
    selectedPatternsRef.current = selectedPatterns
  }, [selectedPatterns])

  useEffect(() => {
    customPatternsRef.current = customPatterns
  }, [customPatterns])

  useEffect(() => {
    trackParamsRef.current = trackParams
  }, [trackParams])

  useEffect(() => {
    mutedTracksRef.current = mutedTracks
  }, [mutedTracks])

  useEffect(() => {
    soloTracksRef.current = soloTracks
  }, [soloTracks])

  useEffect(() => {
    bassParamsRef.current = bassParams
  }, [bassParams])

  useEffect(() => {
    chordParamsRef.current = chordParams
  }, [chordParams])

  useEffect(() => {
    songSettingsRef.current = songSettings
  }, [songSettings])

  // Helper to apply master params to live mixer nodes
  const applyMasterParamsToMixer = (mixer, params) => {
    if (!mixer?.masterCompressor) return

    // Compression: prefer explicit params if present, otherwise support legacy `compression` scalar
    if (typeof params.compThreshold === 'number' || typeof params.compRatio === 'number') {
      if (typeof params.compThreshold === 'number') mixer.masterCompressor.threshold.rampTo(clamp(params.compThreshold ?? -24, -60, 0), 0.05)
      if (typeof params.compRatio === 'number') mixer.masterCompressor.ratio.rampTo(clamp(params.compRatio ?? 4, 1, 20), 0.05)
      // attack/release are in ms in UI — convert to seconds for Tone.Compressor
      if (typeof params.compAttack === 'number') mixer.masterCompressor.attack = Math.max(0.0001, (params.compAttack ?? 10) / 1000)
      if (typeof params.compRelease === 'number') mixer.masterCompressor.release = Math.max(0.001, (params.compRelease ?? 200) / 1000)
    } else {
      applyCompressionAmount(mixer.masterCompressor, params.compression)
    }

    // Parallel mix + makeup
    if (mixer.masterDry && mixer.masterWet) {
      const mix = clamp(params.compMix ?? 1, 0, 1)
      // constant power-ish crossfade
      const dry = Math.cos((mix * Math.PI) / 2)
      const wet = Math.sin((mix * Math.PI) / 2)
      mixer.masterDry.gain.rampTo(dry, 0.05)
      mixer.masterWet.gain.rampTo(wet, 0.05)
    }
    if (mixer.masterMakeup) {
      const makeupDb = clamp(params.compMakeup ?? 0, -24, 24)
      mixer.masterMakeup.gain.rampTo(Tone.dbToGain(makeupDb), 0.05)
    }

    if (mixer.masterEQLow && mixer.masterEQMid && mixer.masterEQHigh) {
      // Apply per-band frequency / Q / gain
      mixer.masterEQLow.frequency.rampTo(clamp(params.eqLowFreq ?? 100, 20, 1000), 0.1)
      if (mixer.masterEQLow.Q) mixer.masterEQLow.Q.rampTo(clamp(params.eqLowQ ?? 1, 0.1, 20), 0.1)
      if (mixer.masterEQLow.gain) mixer.masterEQLow.gain.rampTo(clamp(params.eqLowGain ?? params.eqLow ?? 0, -18, 18), 0.1)

      mixer.masterEQMid.frequency.rampTo(clamp(params.eqMidFreq ?? 1000, 200, 5000), 0.1)
      if (mixer.masterEQMid.Q) mixer.masterEQMid.Q.rampTo(clamp(params.eqMidQ ?? 1, 0.1, 20), 0.1)
      if (mixer.masterEQMid.gain) mixer.masterEQMid.gain.rampTo(clamp(params.eqMidGain ?? params.eqMid ?? 0, -18, 18), 0.1)

      mixer.masterEQHigh.frequency.rampTo(clamp(params.eqHighFreq ?? 8000, 2000, 20000), 0.1)
      if (mixer.masterEQHigh.Q) mixer.masterEQHigh.Q.rampTo(clamp(params.eqHighQ ?? 1, 0.1, 20), 0.1)
      if (mixer.masterEQHigh.gain) mixer.masterEQHigh.gain.rampTo(clamp(params.eqHighGain ?? params.eqHigh ?? 0, -18, 18), 0.1)
    }

    if (mixer.masterFilterStages) {
      // Map numeric type to string (0=lowpass,1=highpass,2=bandpass,3=notch)
      const types = ['lowpass', 'highpass', 'bandpass', 'notch']
      const idx = clamp(Math.round(params.filterType ?? 0), 0, types.length - 1)
      const t = types[idx]

      const desiredStages = Math.max(1, Math.round((params.filterSlope ?? 24) / 12))
      if (mixer.masterFilterStages.length !== desiredStages) {
        // Rebuild stages to match desired slope
        mixer.masterFilterStages.forEach(f => f?.dispose && f.dispose())
        const newStages = createFilterStages(desiredStages, clamp(params.filterCutoff ?? 20000, 20, 20000), t, clamp(params.filterReso ?? 0.7, 0.1, 20))
        mixer.masterFilterStages = newStages
        // Reconnect dry/wet chains through new stages
        if (mixer.masterDry && mixer.masterWet && mixer.masterEQLow && mixer.masterEQMid && mixer.masterEQHigh && mixer.masterGain) {
          try {
            mixer.masterDry.disconnect()
            mixer.masterWet.disconnect()
          } catch {
            // ignore
          }
          mixer.masterDry.chain(mixer.masterEQLow, mixer.masterEQMid, mixer.masterEQHigh, ...newStages, mixer.masterGain)
          mixer.masterWet.chain(mixer.masterEQLow, mixer.masterEQMid, mixer.masterEQHigh, ...newStages, mixer.masterGain)
        }
      }

      // Apply frequency/Q/type to each stage
      mixer.masterFilterStages.forEach((stage) => {
        try {
          const fc = clamp(params.filterCutoff ?? 20000, 20, 20000)
          stage.frequency.rampTo(fc, 0.1)
          // If type is bandpass/notch and bandwidth is provided, compute Q = f0 / bandwidth
          let q = clamp(params.filterReso ?? 0.7, 0.1, 50)
          if ((t === 'bandpass' || t === 'notch') && typeof params.filterBandwidth === 'number' && params.filterBandwidth > 0) {
            const bw = clamp(params.filterBandwidth, 1, Math.max(1, fc - 1))
            q = clamp(fc / bw, 0.1, 50)
          }
          if (stage.Q) stage.Q.rampTo(q, 0.1)
          stage.type = t
        } catch {
          // ignore per-stage assignment errors
        }
      })

      // If switching to bandpass/notch from an extreme cutoff, nudge cutoff to a sensible midrange for audibility
      if ((t === 'bandpass' || t === 'notch') && (params.filterCutoff ?? 20000) > 12000) {
        mixer.masterFilterStages.forEach((stage) => {
          try {
            stage.frequency.rampTo(1000, 0.05)
          } catch {
            // ignore
          }
        })
      }
    }

    if (mixer.masterGain) {
      const db = clamp((params.volume ?? 0) + (params.outGain ?? 0), -60, 18)
      mixer.masterGain.gain.rampTo(Tone.dbToGain(db), 0.1)
    }
  }

  const setMasterParams = useCallback((params) => {
    masterParamsRef.current = params
    // If mixer is initialized and audio is running, apply changes immediately
    try {
      applyMasterParamsToMixer(mixerRef.current, params)
    } catch {
      // swallow — applying is best-effort (mixer may not be ready yet)
    }
  }, [])

  const setBusParams = useCallback((params) => {
    busParamsRef.current = params
    // Apply immediately if mixer is ready so UI controls take effect in real-time
    try {
      const mixer = mixerRef.current
      if (!mixer?.reverb || !mixer?.delay) return

      mixer.reverb.decay = clamp(params?.reverb?.decay ?? 1.8, 0.2, 12)
      if (mixer.reverb.preDelay !== undefined) {
        mixer.reverb.preDelay = clamp(params?.reverb?.preDelay ?? 0.01, 0, 1)
      }
      try {
        if (typeof mixer.reverb.generate === 'function') mixer.reverb.generate()
      } catch {
        // ignore
      }
      mixer.reverbReturn.gain.rampTo(clamp(params?.reverb?.wet ?? 0.2, 0, 1), 0.1)

      mixer.delay.delayTime.rampTo(clamp(params?.delay?.time ?? 0.25, 0.01, 2), 0.1)
      mixer.delay.feedback.rampTo(clamp(params?.delay?.feedback ?? 0.25, 0, 0.95), 0.1)
      mixer.delayReturn.gain.rampTo(clamp(params?.delay?.wet ?? 0.15, 0, 1), 0.1)
    } catch {
      // best-effort; ignore if mixer not ready
    }
  }, [])

  // Helper function to check if a track should play
  const shouldTrackPlay = (trackId) => {
    const hasSolo = Object.values(soloTracksRef.current).some(v => v)
    if (hasSolo) {
      return soloTracksRef.current[trackId] === true
    }
    return !mutedTracksRef.current[trackId]
  }

  

  useEffect(() => {
    if (!toneStarted) return

    // Master / buses / meters
    const masterInput = new Tone.Gain(1)
    const masterCompressor = new Tone.Compressor(-24, 2)
  // Replace Tone.EQ3 with three configurable biquad filters so each band can have its own freq/Q/gain
  const masterEQLow = new Tone.Filter(masterParamsRef.current.eqLowFreq ?? 100, 'lowshelf')
  const masterEQMid = new Tone.Filter(masterParamsRef.current.eqMidFreq ?? 1000, 'peaking')
  const masterEQHigh = new Tone.Filter(masterParamsRef.current.eqHighFreq ?? 8000, 'highshelf')
    const initialSlope = (masterParamsRef.current.filterSlope ?? 24)
    const initialStagesCount = Math.max(1, Math.round(initialSlope / 12))
    const masterFilterStages = createFilterStages(initialStagesCount, masterParamsRef.current.filterCutoff ?? 20000, 'lowpass', masterParamsRef.current.filterReso ?? 0.7)
    // Parallel comp mix: dry + wet summed into masterGain
    const masterDry = new Tone.Gain(1)
    const masterWet = new Tone.Gain(0)
    const masterMakeup = new Tone.Gain(1)

    const masterGain = new Tone.Gain(1)

  // Shared FX buses (send/return)
  // If the mixer already has buses (e.g. re-initialization), reuse them instead of creating duplicates.
  const existingMixer = mixerRef.current || {}
  const reverb = existingMixer.reverb || new Tone.Reverb({ decay: busParamsRef.current.reverb?.decay ?? 1.8, wet: 1 })
  const reverbReturn = existingMixer.reverbReturn || new Tone.Gain(1)
  const delay = existingMixer.delay || new Tone.FeedbackDelay(busParamsRef.current.delay?.time ?? 0.25, busParamsRef.current.delay?.feedback ?? 0.25)
  if (!existingMixer.delay && delay?.wet?.rampTo) delay.wet.rampTo(1, 0)
  const delayReturn = existingMixer.delayReturn || new Tone.Gain(1)

    // Analyzer + meter
    const waveformAnalyser = new Tone.Waveform(256)
  const meter = new Tone.Meter({ channels: 1, normalRange: false })
  // Debug meters for FX buses so we can detect whether sends/buses carry signal
  const reverbMeter = new Tone.Meter({ channels: 1, normalRange: false })
  const delayMeter = new Tone.Meter({ channels: 1, normalRange: false })
  // Stereo peak meters (left/right) using a Split node so UI can display separate channel levels
  const splitStereo = new Tone.Split()
  const meterL = new Tone.Meter({ channels: 1, normalRange: false })
  const meterR = new Tone.Meter({ channels: 1, normalRange: false })

    // Routing:
    // masterInput -> dry -> masterGain
    // masterInput -> compressor -> makeup -> wet -> masterGain
    // masterGain -> meter -> destination
    masterInput.fan(masterDry, masterCompressor)
    masterCompressor.chain(masterMakeup, masterWet)
  masterDry.chain(masterEQLow, masterEQMid, masterEQHigh, ...masterFilterStages, masterGain)
  masterWet.chain(masterEQLow, masterEQMid, masterEQHigh, ...masterFilterStages, masterGain)
  masterGain.chain(meter, Tone.Destination)
  masterGain.connect(waveformAnalyser)
  // connect stereo meters (doesn't affect audio routing)
  masterGain.connect(splitStereo)
  // Tone.Split may not expose left/right in all versions; connect by channel index for robustness
  try {
    splitStereo.connect(meterL, 0, 0)
    splitStereo.connect(meterR, 1, 0)
  } catch {
    // Fallback: try property-assisted connection if available
    if (splitStereo.left && splitStereo.left.connect) splitStereo.left.connect(meterL)
    if (splitStereo.right && splitStereo.right.connect) splitStereo.right.connect(meterR)
  }

  // Returns feed into master input (post-track FX)
  // Only chain if we're using a newly created bus. If reusing, assume it's already wired.
  if (!existingMixer.reverb) reverb.chain(reverbReturn, masterInput)
  if (!existingMixer.delay) delay.chain(delayReturn, masterInput)

  // Tap FX returns to meters for debugging/visualization (non-critical)
  try {
    reverbReturn.connect(reverbMeter)
    delayReturn.connect(delayMeter)
  } catch {
    // ignore
  }

    mixerRef.current = {
      masterInput,
      masterCompressor,
      masterDry,
      masterWet,
      masterMakeup,
  masterEQLow,
  masterEQMid,
  masterEQHigh,
  masterFilterStages,
      masterGain,
      reverb,
      reverbReturn,
      delay,
      delayReturn,
  waveformAnalyser,
  reverbMeter,
  delayMeter,
  meter,
      splitStereo,
      meterL,
      meterR,
    }

    // Expose masterGain so UI components can tap into the live master output.
    masterNodeRef.current = masterGain

    // Create effects for each track
    effectsRef.current = {
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
        lfo: new Tone.LFO({ frequency: 0, min: 0, max: 0 }),
        delaySend: new Tone.Gain(0),
        reverbSend: new Tone.Gain(0),
      },
    }

    // Wire track sends to shared buses (guarding in case buses are missing)
    Object.values(effectsRef.current).forEach((fx) => {
      if (mixerRef.current?.delay && fx?.delaySend) fx.delaySend.connect(mixerRef.current.delay)
      if (mixerRef.current?.reverb && fx?.reverbSend) fx.reverbSend.connect(mixerRef.current.reverb)
    })

    // Kick
    synthsRef.current.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    })
    synthsRef.current.kick.chain(
      effectsRef.current.kick.compressor,
      effectsRef.current.kick.filter,
      mixerRef.current.masterInput
    )
    // Post-fader sends: connect the final stage (filter) to the send gains so send follows track level
    if (effectsRef.current.kick?.filter) {
      effectsRef.current.kick.filter.connect(effectsRef.current.kick.delaySend)
      effectsRef.current.kick.filter.connect(effectsRef.current.kick.reverbSend)
    }

    // Snare
    synthsRef.current.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
    })
    synthsRef.current.snare.chain(
      effectsRef.current.snare.compressor,
      effectsRef.current.snare.filter,
      mixerRef.current.masterInput
    )
    if (effectsRef.current.snare?.filter) {
      effectsRef.current.snare.filter.connect(effectsRef.current.snare.delaySend)
      effectsRef.current.snare.filter.connect(effectsRef.current.snare.reverbSend)
    }

    // HiHat
    synthsRef.current.hihat = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    })
    synthsRef.current.hihat.chain(
      effectsRef.current.hihat.compressor,
      effectsRef.current.hihat.filter,
      mixerRef.current.masterInput
    )
    if (effectsRef.current.hihat?.filter) {
      effectsRef.current.hihat.filter.connect(effectsRef.current.hihat.delaySend)
      effectsRef.current.hihat.filter.connect(effectsRef.current.hihat.reverbSend)
    }
    synthsRef.current.hihat.volume.value = -10

    // Open HiHat
    synthsRef.current.openHH = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.5, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    })
    synthsRef.current.openHH.chain(
      effectsRef.current.openHH.compressor,
      effectsRef.current.openHH.filter,
      mixerRef.current.masterInput
    )
    if (effectsRef.current.openHH?.filter) {
      effectsRef.current.openHH.filter.connect(effectsRef.current.openHH.delaySend)
      effectsRef.current.openHH.filter.connect(effectsRef.current.openHH.reverbSend)
    }
    synthsRef.current.openHH.volume.value = -10

    // Tom
    synthsRef.current.tom = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.5 }
    })
    synthsRef.current.tom.chain(
      effectsRef.current.tom.compressor,
      effectsRef.current.tom.filter,
      mixerRef.current.masterInput
    )
    if (effectsRef.current.tom?.filter) {
      effectsRef.current.tom.filter.connect(effectsRef.current.tom.delaySend)
      effectsRef.current.tom.filter.connect(effectsRef.current.tom.reverbSend)
    }
    synthsRef.current.tom.volume.value = -5

    // Clap
    synthsRef.current.clap = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.003, decay: 0.15, sustain: 0, release: 0.15 }
    })
    synthsRef.current.clap.chain(
      effectsRef.current.clap.compressor,
      effectsRef.current.clap.filter,
      mixerRef.current.masterInput
    )
    if (effectsRef.current.clap?.filter) {
      effectsRef.current.clap.filter.connect(effectsRef.current.clap.delaySend)
      effectsRef.current.clap.filter.connect(effectsRef.current.clap.reverbSend)
    }
    synthsRef.current.clap.volume.value = -6

    // Bass Synth
    effectsRef.current.bass.filter.Q.value = 2
    // Connect LFO to filter frequency
    effectsRef.current.bass.lfo.connect(effectsRef.current.bass.filter.frequency)
    effectsRef.current.bass.lfo.start()
    // Start chorus internal LFO if available
    if (effectsRef.current.bass.chorus && typeof effectsRef.current.bass.chorus.start === 'function') {
      effectsRef.current.bass.chorus.start()
    }

    synthsRef.current.bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.1 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2, baseFrequency: 200, octaves: 2 }
    })
    synthsRef.current.bass.chain(
      effectsRef.current.bass.compressor,
      effectsRef.current.bass.distortion,
      effectsRef.current.bass.filter,
      effectsRef.current.bass.chorus,
      mixerRef.current.masterInput
    )
    if (effectsRef.current.bass?.filter) {
      effectsRef.current.bass.filter.connect(effectsRef.current.bass.delaySend)
      effectsRef.current.bass.filter.connect(effectsRef.current.bass.reverbSend)
    }
    synthsRef.current.bass.volume.value = -6

    // Chord Synth - PolySynth for playing multiple notes
    effectsRef.current.chords.filter.Q.value = 2
    // Connect LFO to filter frequency
    effectsRef.current.chords.lfo.connect(effectsRef.current.chords.filter.frequency)
    effectsRef.current.chords.lfo.start()

    synthsRef.current.chords = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.4, sustain: 0.2, release: 0.3 },
    })
    synthsRef.current.chords.chain(
      effectsRef.current.chords.compressor,
      effectsRef.current.chords.filter,
      mixerRef.current.masterInput
    )
    if (effectsRef.current.chords?.filter) {
      effectsRef.current.chords.filter.connect(effectsRef.current.chords.delaySend)
      effectsRef.current.chords.filter.connect(effectsRef.current.chords.reverbSend)
    }
    synthsRef.current.chords.volume.value = -10

    // Capture refs for cleanup
    const synths = synthsRef.current
    const effects = effectsRef.current
    const mixer = mixerRef.current

    return () => {
      Object.values(synths).forEach(synth => synth?.dispose())
      Object.values(effects).forEach(fx => {
        fx?.compressor?.dispose()
        fx?.filter?.dispose()
        fx?.lfo?.dispose()
        fx?.distortion?.dispose()
        fx?.chorus?.dispose()
        fx?.delaySend?.dispose()
        fx?.reverbSend?.dispose()
      })

      mixer?.reverb?.dispose()
      mixer?.reverbReturn?.dispose()
      mixer?.delay?.dispose()
      mixer?.delayReturn?.dispose()
      mixer?.masterCompressor?.dispose()
    mixer?.masterEQLow?.dispose()
  mixer?.masterEQMid?.dispose()
  mixer?.masterEQHigh?.dispose()
    if (mixer?.masterFilterStages) mixer.masterFilterStages.forEach(f => f?.dispose && f.dispose())
      mixer?.masterGain?.dispose()
      mixer?.masterInput?.dispose()
      mixer?.waveformAnalyser?.dispose()
      mixer?.meter?.dispose()
  mixer?.splitStereo?.dispose()
  mixer?.meterL?.dispose()
  mixer?.meterR?.dispose()
    }
  }, [toneStarted])

    

  // Update master + bus params
  useEffect(() => {
    if (!toneStarted) return
    const params = masterParamsRef.current
    const mixer = mixerRef.current
    if (!mixer?.masterCompressor) return

    applyCompressionAmount(mixer.masterCompressor, params.compression)

    // Parallel mix + makeup
    if (mixer.masterDry && mixer.masterWet) {
      const mix = clamp(params.compMix ?? 1, 0, 1)
      // constant power-ish crossfade
      const dry = Math.cos((mix * Math.PI) / 2)
      const wet = Math.sin((mix * Math.PI) / 2)
      mixer.masterDry.gain.rampTo(dry, 0.05)
      mixer.masterWet.gain.rampTo(wet, 0.05)
    }
    if (mixer.masterMakeup) {
      const makeupDb = clamp(params.compMakeup ?? 0, -24, 24)
      mixer.masterMakeup.gain.rampTo(Tone.dbToGain(makeupDb), 0.05)
    }

    if (mixer.masterEQ) {
      mixer.masterEQ.low.rampTo(clamp(params.eqLow ?? 0, -12, 12), 0.1)
      mixer.masterEQ.mid.rampTo(clamp(params.eqMid ?? 0, -12, 12), 0.1)
      mixer.masterEQ.high.rampTo(clamp(params.eqHigh ?? 0, -12, 12), 0.1)
    }

    if (mixer.masterFilter) {
      mixer.masterFilter.frequency.rampTo(clamp(params.filterCutoff ?? 20000, 20, 20000), 0.1)
      mixer.masterFilter.Q.rampTo(clamp(params.filterReso ?? 0.7, 0.1, 20), 0.1)
    }

    if (mixer.masterGain) {
  const db = clamp((params.volume ?? 0) + (params.outGain ?? 0), -60, 18)
      mixer.masterGain.gain.rampTo(Tone.dbToGain(db), 0.1)
    }
  }, [toneStarted])

  useEffect(() => {
    if (!toneStarted) return
    const params = busParamsRef.current
    const mixer = mixerRef.current
    if (!mixer?.reverb || !mixer?.delay) return

    mixer.reverb.decay = clamp(params?.reverb?.decay ?? 1.8, 0.2, 12)
    if (mixer.reverb.preDelay !== undefined) {
      mixer.reverb.preDelay = clamp(params?.reverb?.preDelay ?? 0.01, 0, 1)
    }
    // Some Reverb implementations regenerate their IR when decay changes.
    // Call generate() if available so the tail updates immediately.
    try {
      if (typeof mixer.reverb.generate === 'function') mixer.reverb.generate()
    } catch {
      // ignore
    }
    mixer.reverbReturn.gain.rampTo(clamp(params?.reverb?.wet ?? 0.2, 0, 1), 0.1)

    mixer.delay.delayTime.rampTo(clamp(params?.delay?.time ?? 0.25, 0.01, 2), 0.1)
    mixer.delay.feedback.rampTo(clamp(params?.delay?.feedback ?? 0.25, 0, 0.95), 0.1)
    mixer.delayReturn.gain.rampTo(clamp(params?.delay?.wet ?? 0.15, 0, 1), 0.1)
  }, [toneStarted])

  // Meter + waveform polling
  useEffect(() => {
    if (!toneStarted) return
    // Only animate meter when transport is running.
    // This freezes *all* UI elements driven by `masterMeter` (waveform + readouts + bars)
    // when audio isn't actively playing.
  if (!isPlaying) return
    let raf = 0
    let last = 0

  // Reuse a single array to avoid allocating/copying 1024 samples every frame.
    // We'll only publish to React state at a lower rate (see below).
    let wfOut = []

    const tick = () => {
      const now = performance.now()
      const mixer = mixerRef.current
      const wf = mixer?.waveformAnalyser?.getValue?.() || []
  const val = mixer?.meter?.getValue?.() ?? 0
  const reverbVal = mixer?.reverbMeter?.getValue?.() ?? 0
  const delayVal = mixer?.delayMeter?.getValue?.() ?? 0
    const peak = Math.max(1e-8, Math.abs(val))
    const peakDb = dbFromRms(peak)
      // Meter may be peak-like. We'll approximate RMS from waveform.
      let rms = 0
      if (wf?.length) {
        let s = 0
        for (let i = 0; i < wf.length; i++) s += wf[i] * wf[i]
        rms = Math.sqrt(s / wf.length)
      }

      // Publish ~30fps max. (Visuals will still look smooth, but CPU/GC drops a lot.)
      if (now - last > 33) {
        last = now

        // Ensure we store a plain array. Prefer reusing the previous buffer when possible.
        if (Array.isArray(wf)) {
          wfOut = wf
        } else {
          const len = wf.length ?? 0
          if (!wfOut || wfOut.length !== len) wfOut = Array.from({ length: len })
          for (let i = 0; i < len; i++) wfOut[i] = wf[i]
        }

        const leftVal = mixer?.meterL?.getValue?.() ?? 0
        const rightVal = mixer?.meterR?.getValue?.() ?? 0
        const alpha = 0.75 // smoothing coefficient (higher = smoother)

        const meterValueToDb = (v) => {
          // Heuristic: if value looks like linear amplitude (<= 2), convert to dB; else assume it's already dB and clamp
          if (Math.abs(v) <= 2) return dbFromRms(Math.max(1e-8, Math.abs(v)))
          return Math.max(-120, Math.min(12, v))
        }

        // If inputs are linear amplitude values, update RMS smoothing; otherwise skip smoothing and use value directly
        let leftRmsDb, rightRmsDb
        if (Math.abs(leftVal) <= 2) {
          leftPowerRef.current = alpha * leftPowerRef.current + (1 - alpha) * (leftVal * leftVal)
          leftRmsDb = dbFromRms(Math.sqrt(Math.max(1e-12, leftPowerRef.current)))
        } else {
          leftRmsDb = meterValueToDb(leftVal)
        }
        if (Math.abs(rightVal) <= 2) {
          rightPowerRef.current = alpha * rightPowerRef.current + (1 - alpha) * (rightVal * rightVal)
          rightRmsDb = dbFromRms(Math.sqrt(Math.max(1e-12, rightPowerRef.current)))
        } else {
          rightRmsDb = meterValueToDb(rightVal)
        }

        const leftPeakDb = meterValueToDb(leftVal)
        const rightPeakDb = meterValueToDb(rightVal)
        const leftLufs = leftRmsDb // approximate
        const rightLufs = rightRmsDb

        setMasterMeter({
          waveform: wfOut,
          peakDb,
          rmsDb: dbFromRms(rms),
          leftPeakDb,
          rightPeakDb,
          leftRmsDb,
          rightRmsDb,
          leftLufs,
          rightLufs,
          reverbVal,
          delayVal,
        })
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [toneStarted, isPlaying])

  // Update track parameters in real-time (without recreating synths)
  useEffect(() => {
    if (!toneStarted) return

    // Update kick
    if (synthsRef.current.kick) {
      synthsRef.current.kick.volume.rampTo(trackParams[1]?.volume ?? 0, 0.1)
      applyPercEnvelope(synthsRef.current.kick.envelope, trackParams[1]?.attack, trackParams[1]?.release)
    }
    applyCompressionAmount(effectsRef.current.kick?.compressor, trackParams[1]?.compression)
    if (effectsRef.current.kick?.filter) {
  effectsRef.current.kick.filter.frequency.linearRampTo(trackParams[1]?.filter ?? 800, 0.1)
    }
    if (effectsRef.current.kick?.delay) {
      // (deprecated)
    }
  if (effectsRef.current.kick?.delaySend) effectsRef.current.kick.delaySend.gain.rampTo(clamp(trackParams[1]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.kick?.reverbSend) effectsRef.current.kick.reverbSend.gain.rampTo(clamp(trackParams[1]?.reverb ?? 0, 0, 1), 0.1)

    // Update snare
    if (synthsRef.current.snare) {
      synthsRef.current.snare.volume.rampTo(trackParams[2]?.volume ?? -3, 0.1)
      applyPercEnvelope(synthsRef.current.snare.envelope, trackParams[2]?.attack, trackParams[2]?.release)
    }
    applyCompressionAmount(effectsRef.current.snare?.compressor, trackParams[2]?.compression)
    if (effectsRef.current.snare?.filter) {
    const base = trackParams[2]?.filter ?? 4000
    const mult = pitchToMultiplier(trackParams[2]?.pitch ?? 0)
      effectsRef.current.snare.filter.frequency.linearRampTo(clamp(base * mult, 20, 20000), 0.1)
    }
  if (effectsRef.current.snare?.delaySend) effectsRef.current.snare.delaySend.gain.rampTo(clamp(trackParams[2]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.snare?.reverbSend) effectsRef.current.snare.reverbSend.gain.rampTo(clamp(trackParams[2]?.reverb ?? 0.15, 0, 1), 0.1)

    // Update hihat
    if (synthsRef.current.hihat) {
      synthsRef.current.hihat.volume.rampTo((trackParams[3]?.volume ?? -8) - 10, 0.1)
      applyPercEnvelope(synthsRef.current.hihat.envelope, trackParams[3]?.attack, trackParams[3]?.release)
    }
    applyCompressionAmount(effectsRef.current.hihat?.compressor, trackParams[3]?.compression)
    if (effectsRef.current.hihat?.filter) {
    effectsRef.current.hihat.filter.frequency.linearRampTo(trackParams[3]?.filter ?? 6000, 0.1)
    }
  if (effectsRef.current.hihat?.delaySend) effectsRef.current.hihat.delaySend.gain.rampTo(clamp(trackParams[3]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.hihat?.reverbSend) effectsRef.current.hihat.reverbSend.gain.rampTo(clamp(trackParams[3]?.reverb ?? 0, 0, 1), 0.1)

    // Update openHH
    if (synthsRef.current.openHH) {
      synthsRef.current.openHH.volume.rampTo((trackParams[4]?.volume ?? -10) - 10, 0.1)
      applyPercEnvelope(synthsRef.current.openHH.envelope, trackParams[4]?.attack, trackParams[4]?.release)
    }
    applyCompressionAmount(effectsRef.current.openHH?.compressor, trackParams[4]?.compression)
    if (effectsRef.current.openHH?.filter) {
    effectsRef.current.openHH.filter.frequency.linearRampTo(trackParams[4]?.filter ?? 5000, 0.1)
    }
  if (effectsRef.current.openHH?.delaySend) effectsRef.current.openHH.delaySend.gain.rampTo(clamp(trackParams[4]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.openHH?.reverbSend) effectsRef.current.openHH.reverbSend.gain.rampTo(clamp(trackParams[4]?.reverb ?? 0.1, 0, 1), 0.1)

    // Update tom
    if (synthsRef.current.tom) {
      synthsRef.current.tom.volume.rampTo(trackParams[5]?.volume ?? -5, 0.1)
      applyPercEnvelope(synthsRef.current.tom.envelope, trackParams[5]?.attack, trackParams[5]?.release)
    }
    applyCompressionAmount(effectsRef.current.tom?.compressor, trackParams[5]?.compression)
    if (effectsRef.current.tom?.filter) {
    effectsRef.current.tom.filter.frequency.linearRampTo(trackParams[5]?.filter ?? 1200, 0.1)
    }
  if (effectsRef.current.tom?.delaySend) effectsRef.current.tom.delaySend.gain.rampTo(clamp(trackParams[5]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.tom?.reverbSend) effectsRef.current.tom.reverbSend.gain.rampTo(clamp(trackParams[5]?.reverb ?? 0.1, 0, 1), 0.1)

    // Update clap
    if (synthsRef.current.clap) {
      synthsRef.current.clap.volume.rampTo(trackParams[9]?.volume ?? -6, 0.1)
      applyPercEnvelope(synthsRef.current.clap.envelope, trackParams[9]?.attack, trackParams[9]?.release)
    }
    applyCompressionAmount(effectsRef.current.clap?.compressor, trackParams[9]?.compression)
    if (effectsRef.current.clap?.filter) {
    const base = trackParams[9]?.filter ?? 4000
    const mult = pitchToMultiplier(trackParams[9]?.pitch ?? 0)
      effectsRef.current.clap.filter.frequency.linearRampTo(clamp(base * mult, 20, 20000), 0.1)
    }
  if (effectsRef.current.clap?.delaySend) effectsRef.current.clap.delaySend.gain.rampTo(clamp(trackParams[9]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.clap?.reverbSend) effectsRef.current.clap.reverbSend.gain.rampTo(clamp(trackParams[9]?.reverb ?? 0.2, 0, 1), 0.1)
  }, [trackParams, toneStarted])

  // Update bass parameters in real-time
  useEffect(() => {
    if (!toneStarted) return

    if (synthsRef.current.bass) {
      synthsRef.current.bass.volume.rampTo(bassParams[6]?.volume ?? -6, 0.1)
      
      // Update oscillator type
    const waveType = bassParams[6]?.waveType ?? 'sawtooth'
      if (synthsRef.current.bass.oscillator.type !== waveType) {
        synthsRef.current.bass.oscillator.type = waveType
      }
      
      // Update detune
    synthsRef.current.bass.detune.linearRampTo(bassParams[6]?.detune ?? 0, 0.1)
      
      // Update envelope
    synthsRef.current.bass.envelope.attack = bassParams[6]?.attack ?? 0.01
    synthsRef.current.bass.envelope.decay = bassParams[6]?.decay ?? 0.3
      synthsRef.current.bass.envelope.sustain = 0.1
      synthsRef.current.bass.envelope.release = 0.1
    }
    
    if (effectsRef.current.bass?.filter) {
    effectsRef.current.bass.filter.frequency.linearRampTo(bassParams[6]?.filter ?? 800, 0.1)
    effectsRef.current.bass.filter.Q.linearRampTo(bassParams[6]?.resonance ?? 1, 0.1)
    }
    // Distortion (drive)
    if (effectsRef.current.bass?.distortion) {
      try {
        // Some versions expose a Param-like interface, others use plain numbers
        if (typeof effectsRef.current.bass.distortion.distortion?.rampTo === 'function') {
          effectsRef.current.bass.distortion.distortion.rampTo(bassParams[6]?.drive ?? 0, 0.1)
        } else {
          effectsRef.current.bass.distortion.distortion = bassParams[6]?.drive ?? 0
        }
      } catch {
        // ignore
      }
    }
    // Chorus wet amount
    if (effectsRef.current.bass?.chorus) {
      try {
        if (typeof effectsRef.current.bass.chorus.wet?.rampTo === 'function') {
          effectsRef.current.bass.chorus.wet.rampTo(clamp(bassParams[6]?.chorus ?? 0, 0, 1), 0.1)
        } else if (effectsRef.current.bass.chorus.wet) {
          effectsRef.current.bass.chorus.wet.value = clamp(bassParams[6]?.chorus ?? 0, 0, 1)
        }
      } catch {
        // ignore
      }
    }
    if (effectsRef.current.bass?.lfo) {
    const lfoRate = bassParams[6]?.lfoRate ?? 0
    const lfoDepth = bassParams[6]?.lfoDepth ?? 0
    const filterFreq = bassParams[6]?.filter ?? 800
      effectsRef.current.bass.lfo.frequency.linearRampTo(lfoRate, 0.1)
      effectsRef.current.bass.lfo.min = Math.max(20, filterFreq - lfoDepth)
      effectsRef.current.bass.lfo.max = Math.min(20000, filterFreq + lfoDepth)
    }
    applyCompressionAmount(effectsRef.current.bass?.compressor, bassParams[6]?.compression)
  if (effectsRef.current.bass?.delaySend) effectsRef.current.bass.delaySend.gain.rampTo(clamp(bassParams[6]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.bass?.reverbSend) effectsRef.current.bass.reverbSend.gain.rampTo(clamp(bassParams[6]?.reverb ?? 0, 0, 1), 0.1)
  }, [bassParams, toneStarted])

  // Update chord parameters in real-time
  useEffect(() => {
    if (!toneStarted) return

    if (synthsRef.current.chords) {
      synthsRef.current.chords.volume.rampTo(chordParams[7]?.volume ?? -10, 0.1)
      
      // Update oscillator / envelopes for PolySynth (no FM)
      const waveType = chordParams[7]?.waveType ?? 'sawtooth'

      synthsRef.current.chords.set({
        oscillator: { type: waveType },
        envelope: {
          attack: chordParams[7]?.attack ?? 0.05,
          decay: chordParams[7]?.decay ?? 0.4,
          sustain: 0.2,
          release: 0.3,
        },
        detune: chordParams[7]?.detune ?? 5,
      })
    }
    
    if (effectsRef.current.chords?.filter) {
      effectsRef.current.chords.filter.frequency.linearRampTo(chordParams[7]?.filter ?? 2500, 0.1)
      effectsRef.current.chords.filter.Q.linearRampTo(chordParams[7]?.resonance ?? 2, 0.1)
    }
    if (effectsRef.current.chords?.lfo) {
      const lfoRate = chordParams[7]?.lfoRate ?? 0
      const lfoDepth = chordParams[7]?.lfoDepth ?? 0
      const filterFreq = chordParams[7]?.filter ?? 2500
      effectsRef.current.chords.lfo.frequency.linearRampTo(lfoRate, 0.1)
      effectsRef.current.chords.lfo.min = Math.max(20, filterFreq - lfoDepth)
      effectsRef.current.chords.lfo.max = Math.min(20000, filterFreq + lfoDepth)
    }
    applyCompressionAmount(effectsRef.current.chords?.compressor, chordParams[7]?.compression)
  if (effectsRef.current.chords?.delaySend) effectsRef.current.chords.delaySend.gain.rampTo(clamp(chordParams[7]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.chords?.reverbSend) effectsRef.current.chords.reverbSend.gain.rampTo(clamp(chordParams[7]?.reverb ?? 0.2, 0, 1), 0.1)
  }, [chordParams, toneStarted])

  // Update BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm
  }, [bpm])

  // Setup sequencer - only recreate when tone starts, use refs for dynamic values
  useEffect(() => {
    if (!toneStarted) return

    if (sequencerRef.current) {
      sequencerRef.current.dispose()
    }

    const steps = Array.from({ length: 16 }, (_, i) => i)
    
    sequencerRef.current = new Tone.Sequence(
      (time, step) => {
  currentStepRef.current = step
        
        // Read from refs to get current values without triggering re-renders
        const currentSelectedPatterns = selectedPatternsRef.current
        const currentCustomPatterns = customPatternsRef.current
        const currentTrackParams = trackParamsRef.current
        const currentSongSettings = songSettingsRef.current
        
        // Use custom pattern if available, otherwise use preset
        const kickPattern = currentCustomPatterns[1] || PATTERNS.kick[currentSelectedPatterns[1]]?.pattern || []
        const snarePattern = currentCustomPatterns[2] || PATTERNS.snare[currentSelectedPatterns[2]]?.pattern || []
        const hihatPattern = currentCustomPatterns[3] || PATTERNS.hihat[currentSelectedPatterns[3]]?.pattern || []
        const openHHPattern = currentCustomPatterns[4] || PATTERNS.openHH[currentSelectedPatterns[4]]?.pattern || []
        const tomPattern = currentCustomPatterns[5] || PATTERNS.tom[currentSelectedPatterns[5]]?.pattern || []
        const clapPattern = currentCustomPatterns[9] || PATTERNS.clap[currentSelectedPatterns[9]]?.pattern || []
        
        // Bass pattern - uses global song settings for key/progression
        const bassPatternIndex = currentSelectedPatterns[6] ?? 0
        const bassPattern = currentCustomPatterns[6] || BASS_PATTERNS[bassPatternIndex]?.pattern || []
        const bassKey = currentSongSettings.key || 'C'
        const bassProgressionIndex = currentSongSettings.progression ?? 0
        const bassProgressionData = CHORD_PROGRESSIONS[bassProgressionIndex] || { chords: [0, 0, 0, 0], mode: 'Major' }
        const bassProgression = bassProgressionData.chords
        const bassMode = bassProgressionData.mode
        
        // Debug on first step
  // NOTE: avoid console.log in the audio callback; it can tank performance over time.

        const pitchOffset1 = currentTrackParams[1]?.pitch || 0
        const pitchOffset3 = currentTrackParams[3]?.pitch || 0
        const pitchOffset4 = currentTrackParams[4]?.pitch || 0
        const pitchOffset5 = currentTrackParams[5]?.pitch || 0

        // Swing: apply to the off-beat 8ths within each beat in a 16-step grid (steps 2,6,10,14).
        // This makes swing affect common 8th patterns (0,2,4,6...) consistently.
        // swing=1 => triplet feel: delay by 1/6 beat = (2/3)*16n.
        const isSwingStep = step % 4 === 2
        const sixteenthNoteDuration = Tone.Time('16n').toSeconds()

        const getSwingOffset = (trackId) => {
          if (!isSwingStep) return 0
          const swing = clamp(currentTrackParams[trackId]?.swing ?? 0, 0, 1)
          return swing * (sixteenthNoteDuration * (2 / 3))
        }

        // Track which tracks are active this step for visual feedback
        const activeThisStep = {}
        
        if (kickPattern[step] && shouldTrackPlay(1)) {
          const freq = Tone.Frequency('C1').transpose(pitchOffset1).toFrequency()
          const swingOffset = getSwingOffset(1)
          synthsRef.current.kick?.triggerAttackRelease(freq, '8n', time + swingOffset)
          activeThisStep[1] = true
        }
        if (snarePattern[step] && shouldTrackPlay(2)) {
          const swingOffset = getSwingOffset(2)
          synthsRef.current.snare?.triggerAttackRelease('8n', time + swingOffset)
          activeThisStep[2] = true
        }
        if (hihatPattern[step] && shouldTrackPlay(3)) {
          const freq = Tone.Frequency('C6').transpose(pitchOffset3).toFrequency()
          const swingOffset = getSwingOffset(3)
          synthsRef.current.hihat?.triggerAttackRelease(freq, '32n', time + swingOffset)
          activeThisStep[3] = true
        }
        if (openHHPattern[step] && shouldTrackPlay(4)) {
          const freq = Tone.Frequency('C6').transpose(pitchOffset4).toFrequency()
          const swingOffset = getSwingOffset(4)
          synthsRef.current.openHH?.triggerAttackRelease(freq, '8n', time + swingOffset)
          activeThisStep[4] = true
        }
        if (tomPattern[step] && shouldTrackPlay(5)) {
          const freq = Tone.Frequency('C2').transpose(pitchOffset5).toFrequency()
          const swingOffset = getSwingOffset(5)
          synthsRef.current.tom?.triggerAttackRelease(freq, '8n', time + swingOffset)
          activeThisStep[5] = true
        }
        if (clapPattern[step] && shouldTrackPlay(9)) {
          const swingOffset = getSwingOffset(9)
          synthsRef.current.clap?.triggerAttackRelease('8n', time + swingOffset)
          activeThisStep[9] = true
        }
        
        // Bass synth - 64-step progression (4 bars x 16 steps)
        // Each chord lasts 1 bar (16 steps)
        // Use ref for bass step to track position in 4-bar cycle
        const bassStep = bassStepRef.current
        bassStepRef.current = (bassStep + 1) % BASS_TOTAL_STEPS
  currentBassStepRef.current = bassStep
        
        // Determine which bar we're in (0-3) based on the 64-step cycle
        const barIndex = Math.floor(bassStep / 16)
        const chordDegree = bassProgression[barIndex]
        
        // Get pattern step (patterns are 16 steps, repeat each bar)
        const patternStep = bassStep % 16
        const bassNoteType = bassPattern[patternStep]
        
        if (bassNoteType > 0 && shouldTrackPlay(6)) {
          const bassNote = getBassNote(bassKey, chordDegree, bassNoteType, bassMode, 1)
          if (bassNote) {
            synthsRef.current.bass?.triggerAttackRelease(bassNote, '8n', time)
            activeThisStep[6] = true
          }
        }

        // Chord synth - 64-step progression (4 bars x 16 steps)
        // Each chord lasts 1 bar (16 steps), follows same progression as bass
        const chordPatternIndex = currentSelectedPatterns[7] ?? 0
        const chordPattern = currentCustomPatterns[7] || CHORD_PATTERNS[chordPatternIndex]?.pattern || []
        
        const chordStep = chordStepRef.current
        chordStepRef.current = (chordStep + 1) % CHORD_TOTAL_STEPS
  currentChordStepRef.current = chordStep
        
        // Determine which bar we're in (0-3) based on the 64-step cycle
        const chordBarIndex = Math.floor(chordStep / 16)
        const chordChordDegree = bassProgression[chordBarIndex]
        
        // Get pattern step (patterns are 16 steps, repeat each bar)
        const chordPatternStep = chordStep % 16
        const chordType = chordPattern[chordPatternStep]
        
        if (chordType > 0 && shouldTrackPlay(7)) {
          const chordNotes = getChordNotes(bassKey, chordChordDegree, chordType, bassMode, 3)
          if (chordNotes) {
            // Determine duration based on chord type
            const duration = chordType === 4 ? '16n' : '4n' // Stabs are short, others sustain
            synthsRef.current.chords?.triggerAttackRelease(chordNotes, duration, time)
            activeThisStep[7] = true
          }
        }
        
        // Update active tracks once per step with all active tracks
        if (Object.keys(activeThisStep).length > 0) {
          setActiveTracks(activeThisStep)

          // Cancel any previously scheduled clear to avoid building up a queue
          // when CPU is under pressure.
          if (transportClearEventIdRef.current != null) {
            try {
              Tone.getTransport().clear(transportClearEventIdRef.current)
            } catch {
              // ignore
            }
            transportClearEventIdRef.current = null
          }

          transportClearEventIdRef.current = Tone.getTransport().scheduleOnce(() => {
            setActiveTracks({})
            transportClearEventIdRef.current = null
          }, time + 0.1)
        }
      },
      steps,
      '16n'
    )

    return () => {
      sequencerRef.current?.dispose()
    }
  }, [toneStarted])

  const startTone = useCallback(async () => {
    await Tone.start()
    setToneStarted(true)
    console.log('Tone.js audio context started')
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      Tone.getTransport().stop()
      Tone.getTransport().cancel()
      if (transportClearEventIdRef.current != null) {
        try {
          Tone.getTransport().clear(transportClearEventIdRef.current)
        } catch {
          // ignore
        }
        transportClearEventIdRef.current = null
      }
      sequencerRef.current?.stop()
      setIsPlaying(false)
  currentStepRef.current = 0
  currentBassStepRef.current = 0
  currentChordStepRef.current = 0
  setUiStepPulse((p) => (p + 1) % 1000000)
      bassStepRef.current = 0
      chordStepRef.current = 0
    } else {
      const transport = Tone.getTransport()

      // If transport is paused, resume in place.
      if (transport.state === 'paused') {
        transport.start('+0.05')
        // Do NOT restart sequencer to avoid resetting position.
        setIsPlaying(true)
        return
      }

      // Fresh start from the beginning
      transport.position = 0
      bassStepRef.current = 0
      chordStepRef.current = 0
  currentStepRef.current = 0
  currentBassStepRef.current = 0
  currentChordStepRef.current = 0
  setUiStepPulse((p) => (p + 1) % 1000000)

      transport.start('+0.1')
      sequencerRef.current?.start('+0.1')
      setIsPlaying(true)
    }
  }, [isPlaying])

  const pause = useCallback(() => {
    if (!toneStarted) return
    if (!isPlaying) return
    // Pause keeps position so we can resume.
    Tone.getTransport().pause()
    // Keep the sequencer scheduled; it's driven by Transport time.
    setIsPlaying(false)
  }, [isPlaying, toneStarted])

  const playTrack = useCallback((trackId) => {
    if (!toneStarted) return
    
    setActiveTracks(prev => ({ ...prev, [trackId]: true }))
    setTimeout(() => setActiveTracks(prev => ({ ...prev, [trackId]: false })), 150)

    const currentTrackParams = trackParamsRef.current
    const pitchOffset = currentTrackParams[trackId]?.pitch || 0

    switch (trackId) {
      case 1: {
        const kickFreq = Tone.Frequency('C1').transpose(pitchOffset).toFrequency()
        synthsRef.current.kick?.triggerAttackRelease(kickFreq, '8n')
        break
      }
      case 2:
        synthsRef.current.snare?.triggerAttackRelease('8n')
        break
      case 3: {
        const hihatFreq = Tone.Frequency('C6').transpose(pitchOffset).toFrequency()
        synthsRef.current.hihat?.triggerAttackRelease(hihatFreq, '32n')
        break
      }
      case 4: {
        const openHHFreq = Tone.Frequency('C6').transpose(pitchOffset).toFrequency()
        synthsRef.current.openHH?.triggerAttackRelease(openHHFreq, '8n')
        break
      }
      case 5: {
        const tomFreq = Tone.Frequency('C2').transpose(pitchOffset).toFrequency()
        synthsRef.current.tom?.triggerAttackRelease(tomFreq, '8n')
        break
      }
      case 9:
        synthsRef.current.clap?.triggerAttackRelease('8n')
        break
      case 6: {
        // Play bass root note in current key
        const currentSongSettings = songSettingsRef.current
        const bassKey = currentSongSettings.key || 'C'
        const bassProgressionIndex = currentSongSettings.progression ?? 0
        const bassMode = CHORD_PROGRESSIONS[bassProgressionIndex]?.mode || 'Major'
        const bassNote = getBassNote(bassKey, 0, 1, bassMode, 1) // Root note
        if (bassNote) {
          synthsRef.current.bass?.triggerAttackRelease(bassNote, '8n')
        }
        break
      }
      case 7: {
        // Play chord triad in current key
        const currentSongSettings = songSettingsRef.current
        const chordKey = currentSongSettings.key || 'C'
        const chordProgressionIndex = currentSongSettings.progression ?? 0
        const chordMode = CHORD_PROGRESSIONS[chordProgressionIndex]?.mode || 'Major'
        const chordNotes = getChordNotes(chordKey, 0, 1, chordMode, 3) // Root triad
        if (chordNotes) {
          synthsRef.current.chords?.triggerAttackRelease(chordNotes, '4n')
        }
        break
      }
      default:
        break
    }
  }, [toneStarted])

  return {
    toneStarted,
    isPlaying,
  // Low-rate UI pulse: consumers can use this to re-render while reading getters.
  uiStepPulse,
  // Preferred: read latest values without forcing re-renders.
  getCurrentStep: () => currentStepRef.current,
  getCurrentBassStep: () => currentBassStepRef.current,
  getCurrentChordStep: () => currentChordStepRef.current,
    bpm,
    setBpm,
    activeTracks,
    startTone,
    togglePlay,
  pause,
    playTrack,
  masterMeter,
  getMasterNode: () => masterNodeRef.current,
  setMasterParams,
  setBusParams,
  perfStats,
  }
}
