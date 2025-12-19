import { useRef, useState, useEffect, useCallback } from 'react'
import * as Tone from 'tone'

// Import constants
import { PATTERNS } from '../constants/patterns'
import { MONO_SYNTH_PATTERNS, MONO_SYNTH_TOTAL_STEPS } from '../constants/monoSynth'
import { POLY_SYNTH_PATTERNS, POLY_SYNTH_TOTAL_STEPS } from '../constants/polySynth'
import { CHORD_PROGRESSIONS } from '../constants/song'
import { ARP_SYNTH_PATTERNS, ARP_SYNTH_TOTAL_STEPS } from '../constants/arpSynth'

// Import utilities
import {
  clamp,
  applyCompressionAmount,
  pitchToMultiplier,
  applyPercEnvelope,
  createFilterStages
} from '../utils/audioUtils.js'
import {
  getBassNote,
  getChordNotes,
  getBassNoteFromRoot,
  getChordNotesFromRoot
} from '../utils/musicTheory.js'

// Import audio modules
import { createDrumSynths, createMelodicSynths } from '../audio/synths.js'
import { createTrackEffects } from '../audio/effects.js'
import { createMixer, wireAudioGraph } from '../audio/mixer.js'
import { createMetering } from '../audio/metering.js'
import { startTone, togglePlay as modularTogglePlay, pause as modularPause } from '../audio/transport.js'
import { playTrackNote, createSequencerCallback } from '../audio/sequencer.js'

// Default track parameters - tuned per instrument type
const DEFAULT_TRACK_PARAMS = {
  1: { volume: 0, pitch: 0, attack: 0.001, release: 0.4, filter: 800, reverb: 0, delay: 0, compression: 0, swing: 0 },
  2: { volume: -3, pitch: 0, attack: 0.001, release: 0.15, filter: 4000, reverb: 0.15, delay: 0, compression: 0.3, swing: 0 },
  3: { volume: -8, pitch: 0, attack: 0.001, release: 0.05, filter: 6000, reverb: 0, delay: 0, compression: 0, swing: 0 },
  4: { volume: -10, pitch: 0, attack: 0.001, release: 0.3, filter: 5000, reverb: 0.1, delay: 0, compression: 0, swing: 0 },
  5: { volume: -5, pitch: 0, attack: 0.001, release: 0.3, filter: 1200, reverb: 0.1, delay: 0, compression: 0.3, swing: 0 },
  9: { volume: -6, pitch: 0, attack: 0.003, release: 0.15, filter: 4000, reverb: 0.2, delay: 0, compression: 0.5, swing: 0 },
}

// Debug flag to enable/disable audio engine debug logs
const DEBUG_AUDIO_LOGS = false

export const useAudioEngine = (selectedPatterns, customPatterns, trackParams = DEFAULT_TRACK_PARAMS, mutedTracks = {}, soloTracks = {}, bassParams = {}, chordParams = {}, arpParams = {}, songSettings = {}, chordSteps = null) => {
  const [toneStarted, setToneStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  // Steps update at 16n. Keeping them in React state forces a full App re-render
  // every tick, which can break interactions with native controls while playing.
  // Use refs for the live value + a low-rate state "pulse" for UI.
  const currentStepRef = useRef(0)
  const currentBassStepRef = useRef(0)
  const currentChordStepRef = useRef(0)
  const currentArpStepRef = useRef(0)
  const [uiStepPulse, setUiStepPulse] = useState(0)
  const [bpm, setBpm] = useState(120)
  const [activeTracks, setActiveTracks] = useState({})
  const [masterMeter, setMasterMeter] = useState({ waveform: [], peakDb: -Infinity, rmsDb: -Infinity })
  const masterNodeRef = useRef(null)
  const arpStepRef = useRef(0) // Track 64-step arp progression
  const [perfStats, setPerfStats] = useState({ fps: undefined, usedJSHeapSizeMb: undefined })
  const transportClearEventIdRef = useRef(null)
  // Guard to prevent rapid toggles from flooding the main thread
  const isTogglingRef = useRef(false)
  const bassStepRef = useRef(0) // Track 64-step bass progression
  const chordStepRef = useRef(0) // Track 64-step chord progression
  const chordStepsRef = useRef(chordSteps)

  // Internal refs for synths/effects/mixer
  const synthsRef = useRef({})
  const effectsRef = useRef({})
  const mixerRef = useRef({})
  const leftPowerRef = useRef(1e-8)
  const rightPowerRef = useRef(1e-8)
  const sequencerEventIdRef = useRef(null)

  useEffect(() => {
    try {
      if (Array.isArray(chordSteps)) {
        // Normalize 16-step emissions to 64 steps by repeating across 4 bars
        let normalized = chordSteps
        if (chordSteps.length === 16) {
          // Expand each 16-step UI step into 4 consecutive 16th-note ticks (p*4..p*4+3)
          normalized = Array.from({ length: 64 }, (_, i) => {
            const v = chordSteps[Math.floor(i / 4)]
            return v ? { root: v.root, type: v.type, duration: v.duration } : null
          })
          if (DEBUG_AUDIO_LOGS) console.debug('audio:chordStepsRef expanded 16->64 (blocks x4)')
        }
        chordStepsRef.current = normalized
        const nonNull = normalized.filter(Boolean).length
        const sample = normalized.map((s, i) => s ? `${i}:${s.root}${s.type ? ' '+s.type : ''}` : null).filter(Boolean).slice(0,6)
        if (DEBUG_AUDIO_LOGS) console.debug('audio:chordStepsRef updated', { nonNull, sample })
      } else {
        chordStepsRef.current = chordSteps
        if (DEBUG_AUDIO_LOGS) console.debug('audio:chordStepsRef updated', { value: chordSteps })
      }
    } catch {
      // ignore logging errors
      chordStepsRef.current = chordSteps
    }
  }, [chordSteps])

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
  const arpParamsRef = useRef(arpParams)
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
  const busParamsRef = useRef({
    reverb: { wet: 0.2, decay: 1.8, preDelay: 0.01, type: 'hall', tone: 8000 },
    delay: { wet: 0.15, feedback: 0.25, time: 0.25, type: 'feedback', sync: false, division: '8n', filter: 8000 },
  })

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
    arpParamsRef.current = arpParams
  }, [arpParams])

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

      // Reverb: decay, preDelay, tone (lowpass on reverb output) and wet
      mixer.reverb.decay = clamp(params?.reverb?.decay ?? 1.8, 0.2, 12)
      if (mixer.reverb.preDelay !== undefined) {
        mixer.reverb.preDelay = clamp(params?.reverb?.preDelay ?? 0.01, 0, 1)
      }
      // Tone/damping applied via lowpass filter after reverb
      if (mixer.reverbFilter && typeof mixer.reverbFilter.frequency?.rampTo === 'function') {
        const typeDefaultTone = (params?.reverb?.type === 'plate') ? 12000 : ((params?.reverb?.type === 'room') ? 6000 : 8000)
        const toneHz = clamp(params?.reverb?.tone ?? typeDefaultTone, 200, 20000)
        mixer.reverbFilter.frequency.rampTo(toneHz, 0.1)
      }
      try {
        if (typeof mixer.reverb.generate === 'function') mixer.reverb.generate()
      } catch {
        // ignore
      }
      mixer.reverbReturn.gain.rampTo(clamp(params?.reverb?.wet ?? 0.2, 0, 1), 0.1)

      // Delay: switch type if needed, apply time (sync/free), feedback, wet and filter
      const desiredType = params?.delay?.type ?? 'feedback'
      const chosenDelay = desiredType === 'pingpong' ? mixer.pingPongDelay : mixer.feedbackDelay
      if (mixer.delay !== chosenDelay) {
        try {
          if (mixer.delay && mixer.delay.disconnect) mixer.delay.disconnect()
        } catch {
          // ignore
        }
        mixer.delay = chosenDelay
        try {
          mixer.delay.chain(mixer.delayFilter, mixer.delayReturn)
        } catch {
          // ignore
        }
        // Reconnect track sends to new delay node
        Object.values(effectsRef.current).forEach((fx) => {
          try {
            if (fx?.delaySend && fx.delaySend.connect) fx.delaySend.connect(mixer.delay)
          } catch {
            // ignore
          }
        })
      }

      // Delay time: sync vs free
      if (params?.delay?.sync) {
        try {
          const secs = Tone.Time(params.delay.division ?? '8n').toSeconds()
          if (typeof mixer.delay.delayTime?.rampTo === 'function') mixer.delay.delayTime.rampTo(clamp(secs, 0.01, 4), 0.1)
        } catch {
          // ignore invalid division
        }
      } else {
        if (typeof mixer.delay.delayTime?.rampTo === 'function') mixer.delay.delayTime.rampTo(clamp(params?.delay?.time ?? 0.25, 0.01, 2), 0.1)
      }

      if (typeof mixer.delay.feedback?.rampTo === 'function') mixer.delay.feedback.rampTo(clamp(params?.delay?.feedback ?? 0.25, 0, 0.95), 0.1)
      mixer.delayReturn.gain.rampTo(clamp(params?.delay?.wet ?? 0.15, 0, 1), 0.1)
      if (mixer.delayFilter && typeof mixer.delayFilter.frequency?.rampTo === 'function') {
        mixer.delayFilter.frequency.rampTo(clamp(params?.delay?.filter ?? 8000, 200, 20000), 0.1)
      }
    } catch {
      // best-effort; ignore if mixer not ready
    }
  }, [])

  // Helper function to check if a track should play


  useEffect(() => {
    if (!toneStarted) return

    // Create mixer and audio graph
    const mixer = createMixer(masterParamsRef, busParamsRef)
    mixerRef.current = mixer
    masterNodeRef.current = mixer.masterGain

    // Create track effects
    effectsRef.current = createTrackEffects()

    // Create synths
    const drumSynths = createDrumSynths()
    const melodicSynths = createMelodicSynths()
    synthsRef.current = { ...drumSynths, ...melodicSynths }

    // Wire everything together
    wireAudioGraph(synthsRef.current, effectsRef.current, mixer)

    // Cleanup function
    return () => {
      Object.values(synthsRef.current).forEach(synth => synth?.dispose())
      Object.values(effectsRef.current).forEach(fx => {
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

    // Reverb: decay/preDelay and tone shaping
    mixer.reverb.decay = clamp(params?.reverb?.decay ?? 1.8, 0.2, 12)
    if (mixer.reverb.preDelay !== undefined) {
      mixer.reverb.preDelay = clamp(params?.reverb?.preDelay ?? 0.01, 0, 1)
    }
    try {
      if (typeof mixer.reverb.generate === 'function') mixer.reverb.generate()
    } catch {
      // ignore
    }
    // Tone/damping via lowpass after reverb
    if (mixer.reverbFilter && typeof mixer.reverbFilter.frequency?.rampTo === 'function') {
      const typeDefaultTone = (params?.reverb?.type === 'plate') ? 12000 : ((params?.reverb?.type === 'room') ? 6000 : 8000)
      const toneHz = clamp(params?.reverb?.tone ?? typeDefaultTone, 200, 20000)
      mixer.reverbFilter.frequency.rampTo(toneHz, 0.1)
    }
    mixer.reverbReturn.gain.rampTo(clamp(params?.reverb?.wet ?? 0.2, 0, 1), 0.1)

    // Delay: ensure correct type and apply time (sync/free), feedback, filter and wet
    const desiredType = params?.delay?.type ?? 'feedback'
    const chosenDelay = desiredType === 'pingpong' ? mixer.pingPongDelay : mixer.feedbackDelay
    if (mixer.delay !== chosenDelay) {
      try {
        if (mixer.delay && mixer.delay.disconnect) mixer.delay.disconnect()
      } catch {
        // ignore
      }
      mixer.delay = chosenDelay
      try {
        mixer.delay.chain(mixer.delayFilter, mixer.delayReturn)
      } catch {
        // ignore
      }
      Object.values(effectsRef.current).forEach((fx) => {
        try {
          if (fx?.delaySend && fx.delaySend.connect) fx.delaySend.connect(mixer.delay)
        } catch {
          // ignore
        }
      })
    }

    if (params?.delay?.sync) {
      try {
        const secs = Tone.Time(params.delay.division ?? '8n').toSeconds()
        if (typeof mixer.delay.delayTime?.rampTo === 'function') mixer.delay.delayTime.rampTo(clamp(secs, 0.01, 4), 0.1)
      } catch {
        // ignore
      }
    } else {
      if (typeof mixer.delay.delayTime?.rampTo === 'function') mixer.delay.delayTime.rampTo(clamp(params?.delay?.time ?? 0.25, 0.01, 2), 0.1)
    }
    if (typeof mixer.delay.feedback?.rampTo === 'function') mixer.delay.feedback.rampTo(clamp(params?.delay?.feedback ?? 0.25, 0, 0.95), 0.1)
    mixer.delayReturn.gain.rampTo(clamp(params?.delay?.wet ?? 0.15, 0, 1), 0.1)
    if (mixer.delayFilter && typeof mixer.delayFilter.frequency?.rampTo === 'function') mixer.delayFilter.frequency.rampTo(clamp(params?.delay?.filter ?? 8000, 200, 20000), 0.1)
  }, [toneStarted])

  // Meter + waveform polling
  useEffect(() => {
    return createMetering(mixerRef, isPlaying, setMasterMeter, leftPowerRef, rightPowerRef)
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
          release: chordParams[7]?.release ?? 0.3,
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
       // Set LFO waveform type (sine/triangle/sawtooth/square)
       const lfoWave = chordParams[7]?.lfoWave ?? 'sine'
      effectsRef.current.chords.lfo.type = lfoWave
      // Be defensive across Tone.js versions that store oscillator type under `.oscillator`
      if (effectsRef.current.chords.lfo.oscillator) effectsRef.current.chords.lfo.oscillator.type = lfoWave
      
      effectsRef.current.chords.lfo.frequency.linearRampTo(lfoRate, 0.1)
      effectsRef.current.chords.lfo.min = Math.max(20, filterFreq - lfoDepth)
      effectsRef.current.chords.lfo.max = Math.min(20000, filterFreq + lfoDepth)
    }
    if (effectsRef.current.chords?.distortion) {
      effectsRef.current.chords.distortion.set({distortion: chordParams[7]?.drive ?? 0})
    }
    if (effectsRef.current.chords?.chorus) {
      if (Tone.getContext().state === 'running') {
        effectsRef.current.chords.chorus.wet.rampTo(clamp(chordParams[7]?.chorus ?? 0, 0, 1), 0.1)
      } else {
        effectsRef.current.chords.chorus.wet.value = clamp(chordParams[7]?.chorus ?? 0, 0, 1)
      }
    }
    applyCompressionAmount(effectsRef.current.chords?.compressor, chordParams[7]?.compression)
  if (effectsRef.current.chords?.delaySend) effectsRef.current.chords.delaySend.gain.rampTo(clamp(chordParams[7]?.delay ?? 0, 0, 1), 0.1)
  if (effectsRef.current.chords?.reverbSend) effectsRef.current.chords.reverbSend.gain.rampTo(clamp(chordParams[7]?.reverb ?? 0.2, 0, 1), 0.1)
  }, [chordParams, toneStarted])

  // Update arp parameters in real-time
  useEffect(() => {
    if (!toneStarted) return

    if (synthsRef.current.arp) {
      synthsRef.current.arp.volume.rampTo(arpParams[8]?.volume ?? -6, 0.1)

      // Update oscillator type
      const waveType = arpParams[8]?.waveType ?? 'sawtooth'
      if (synthsRef.current.arp.oscillator.type !== waveType) {
        synthsRef.current.arp.oscillator.type = waveType
      }

      // Update detune
      synthsRef.current.arp.detune.linearRampTo(arpParams[8]?.detune ?? 0, 0.1)

      // Update envelope
      synthsRef.current.arp.envelope.attack = arpParams[8]?.attack ?? 0.005
      synthsRef.current.arp.envelope.decay = arpParams[8]?.decay ?? 0.08
      synthsRef.current.arp.envelope.sustain = 0.1
      synthsRef.current.arp.envelope.release = arpParams[8]?.release ?? 0.1
    }

    if (effectsRef.current.arp?.filter) {
      effectsRef.current.arp.filter.frequency.linearRampTo(arpParams[8]?.filter ?? 1200, 0.1)
      effectsRef.current.arp.filter.Q.linearRampTo(arpParams[8]?.resonance ?? 1, 0.1)
    }

    // Distortion (drive)
    if (effectsRef.current.arp?.distortion) {
      try {
        if (typeof effectsRef.current.arp.distortion.distortion?.rampTo === 'function') {
          effectsRef.current.arp.distortion.distortion.rampTo(arpParams[8]?.drive ?? 0, 0.1)
        } else {
          effectsRef.current.arp.distortion.distortion = arpParams[8]?.drive ?? 0
        }
      } catch {
        // ignore
      }
    }

    // Chorus wet amount
    if (effectsRef.current.arp?.chorus) {
      try {
        if (typeof effectsRef.current.arp.chorus.wet?.rampTo === 'function') {
          effectsRef.current.arp.chorus.wet.rampTo(clamp(arpParams[8]?.chorus ?? 0, 0, 1), 0.1)
        } else if (effectsRef.current.arp.chorus.wet) {
          effectsRef.current.arp.chorus.wet.value = clamp(arpParams[8]?.chorus ?? 0, 0, 1)
        }
      } catch {
        // ignore
      }
    }

    if (effectsRef.current.arp?.lfo) {
      const lfoRate = arpParams[8]?.lfoRate ?? 0
      const lfoDepth = arpParams[8]?.lfoDepth ?? 0
      const filterFreq = arpParams[8]?.filter ?? 1200
      effectsRef.current.arp.lfo.frequency.linearRampTo(lfoRate, 0.1)
      effectsRef.current.arp.lfo.min = Math.max(20, filterFreq - lfoDepth)
      effectsRef.current.arp.lfo.max = Math.min(20000, filterFreq + lfoDepth)
    }

    applyCompressionAmount(effectsRef.current.arp?.compressor, arpParams[8]?.compression)
    if (effectsRef.current.arp?.delaySend) effectsRef.current.arp.delaySend.gain.rampTo(clamp(arpParams[8]?.delay ?? 0, 0, 1), 0.1)
    if (effectsRef.current.arp?.reverbSend) effectsRef.current.arp.reverbSend.gain.rampTo(clamp(arpParams[8]?.reverb ?? 0, 0, 1), 0.1)
  }, [arpParams, toneStarted])

  // Update BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm
  }, [bpm])

  // Setup sequencer - only recreate when tone starts, use refs for dynamic values
  useEffect(() => {
    if (!toneStarted) return

    if (sequencerEventIdRef.current != null) {
      try { Tone.Transport.clear(sequencerEventIdRef.current) } catch (e) { void e }
      sequencerEventIdRef.current = null
    }


    const seqCallback = createSequencerCallback(
      selectedPatternsRef,
      customPatternsRef,
      trackParamsRef,
      songSettingsRef,
      mutedTracksRef,
      soloTracksRef,
      chordStepsRef,
      synthsRef,
      currentStepRef,
      currentBassStepRef,
      currentChordStepRef,
      currentArpStepRef,
      bassStepRef,
      chordStepRef,
      arpStepRef,
      setActiveTracks,
      transportClearEventIdRef
    )


    // Schedule transport repeat using seqCallback (16th notes)
    if (sequencerEventIdRef.current != null) {
      try { Tone.Transport.clear(sequencerEventIdRef.current) } catch (e) { void e }
      sequencerEventIdRef.current = null
    }

    sequencerEventIdRef.current = Tone.Transport.scheduleRepeat((time) => {
      const s = currentStepRef.current
      // call the callback with the current 16-step index
      seqCallback(time, s)
      // advance for next tick
      currentStepRef.current = (s + 1) % 16
    }, '16n')

    return () => {
      if (sequencerEventIdRef.current != null) {
        try { Tone.Transport.clear(sequencerEventIdRef.current) } catch (e) { void e }
        sequencerEventIdRef.current = null
      }
    }
  }, [toneStarted])

  const startTone = useCallback(async () => {
    await Tone.start()
    setToneStarted(true)
    console.log('Tone.js audio context started')
  }, [])

  const togglePlay = useCallback(() => {
    // Guard against rapid repeated clicks that can block the main thread
    if (isTogglingRef.current) return
    isTogglingRef.current = true
    window.setTimeout(() => { isTogglingRef.current = false }, 300)

    modularTogglePlay(isPlaying, setIsPlaying, currentStepRef, currentBassStepRef, currentChordStepRef, currentArpStepRef, setUiStepPulse, bassStepRef, chordStepRef, arpStepRef, transportClearEventIdRef, effectsRef)

    // Log secuenciador snapshot once when play is pressed (only when starting, not stopping)
    if (!isPlaying) {
      try {
        const arr = Array.isArray(chordStepsRef.current) ? chordStepsRef.current : null
        console.debug('audio:secuenciadorExportOnPlay', { length: arr?.length ?? null, sample: arr?.map((s, i) => s ? `${i}:${s.root}${s.type ? ' '+s.type : ''}` : null).filter(Boolean).slice(0,20) })
      } catch { /* ignore */ }
    }
  }, [isPlaying])

  const pause = useCallback(() => {
    modularPause(toneStarted, isPlaying, setIsPlaying, effectsRef)
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
      case 8: {
        // Play an arp note (first chord note up an octave)
        const currentSongSettings = songSettingsRef.current
        const arpKey = currentSongSettings.key || 'C'
        const arpProgressionIndex = currentSongSettings.progression ?? 0
        const arpMode = CHORD_PROGRESSIONS[arpProgressionIndex]?.mode || 'Major'
        const arpNotes = getChordNotes(arpKey, 0, 1, arpMode, 4) // Root triad up
        if (arpNotes) {
          const note = arpNotes[0]
          synthsRef.current.arp?.triggerAttackRelease(note, '16n')
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
  getCurrentArpStep: () => currentArpStepRef.current,
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
