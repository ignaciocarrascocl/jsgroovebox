import * as Tone from 'tone'
import { PATTERNS } from '../constants/patterns'
import { MONO_SYNTH_PATTERNS, MONO_SYNTH_TOTAL_STEPS } from '../constants/monoSynth'
import { POLY_SYNTH_PATTERNS, POLY_SYNTH_TOTAL_STEPS } from '../constants/polySynth'
import { CHORD_PROGRESSIONS } from '../constants/song'
import { ARP_SYNTH_PATTERNS, ARP_SYNTH_TOTAL_STEPS } from '../constants/arpSynth'
import { getBassNote, getChordNotes, getBassNoteFromRoot, getChordNotesFromRoot } from '../utils/musicTheory.js'

// Helper to check if a track should play
const shouldTrackPlay = (trackId, mutedTracksRef, soloTracksRef) => {
  const muted = mutedTracksRef?.current || {}
  const solo = soloTracksRef?.current || {}
  const hasSolo = Object.values(solo).some(Boolean)
  if (hasSolo) {
    return !!solo[trackId]
  }
  // Explicitly treat true as muted; undefined means not muted
  return muted[trackId] !== true
}

// Play a single track note
const playTrackNote = (trackId, synthsRef, songSettingsRef, trackParamsRef) => {
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
}

// Helper for pattern truthiness
const isValueActive = (v) => (typeof v === 'number' ? v > 0 : Boolean(v))

// Main sequencer callback
const createSequencerCallback = (
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
) => {
  // Cache transport & base frequencies to avoid per-tick allocation
  const transport = (typeof Tone.getTransport === 'function' ? Tone.getTransport() : Tone.Transport)
  const baseKickFreq = Tone.Frequency('C1').toFrequency()
  const baseHihatFreq = Tone.Frequency('C6').toFrequency()
  const baseTomFreq = Tone.Frequency('C2').toFrequency()

  return (time, step) => {
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

    // Absolute step across the full 64-step cycle (one step = 1 sixteenth note)
    // bassStepRef tracks the absolute 0..63 position and is authoritative for timing/alignment.
    const absoluteStep = bassStepRef.current

    // Bass pattern - uses global song settings for key/progression
    const bassPatternIndex = currentSelectedPatterns[6] ?? 0
    const bassPattern = currentCustomPatterns[6] || MONO_SYNTH_PATTERNS[bassPatternIndex]?.pattern || []
    const bassKey = currentSongSettings.key || 'C'
    const bassProgressionIndex = currentSongSettings.progression ?? 0
    const bassProgressionData = CHORD_PROGRESSIONS[bassProgressionIndex] || { chords: [0, 0, 0, 0], mode: 'Major' }
    const bassProgression = bassProgressionData.chords
    const bassMode = bassProgressionData.mode

    const pitchOffset1 = currentTrackParams[1]?.pitch || 0
    const pitchOffset3 = currentTrackParams[3]?.pitch || 0
    const pitchOffset4 = currentTrackParams[4]?.pitch || 0
    const pitchOffset5 = currentTrackParams[5]?.pitch || 0

    // Swing: apply to the off-beat 8ths within each beat in a 64-step (4-bar) grid.
    // In the original 16-step per-bar grid swing targeted indices 2,6,10,14 (step % 4 === 2).
    // In the 64-step absolute grid these map to indices 8,24,40,56 => absoluteStep % 16 === 8
    const isSwingStep = (absoluteStep % 16) === 8
    const sixteenthNoteDuration = Tone.Time('16n').toSeconds()

    const getSwingOffset = (trackId) => {
      if (!isSwingStep) return 0
      const swing = currentTrackParams[trackId]?.swing ?? 0
      return swing * (sixteenthNoteDuration * (2 / 3))
    }

    // Optimizations: cache synths and use shared helpers
    const synths = synthsRef.current || {}
    const hasSecuenciadorControl = Array.isArray(chordStepsRef?.current)

    // Track which tracks are active this step for visual feedback
    const activeThisStep = {}

    // Use absolute 64-step index for pattern lookup so patterns can be full 64-step arrays.
    const kickVal = (kickPattern.length) ? kickPattern[absoluteStep % kickPattern.length] : undefined
    if (isValueActive(kickVal) && shouldTrackPlay(1, mutedTracksRef, soloTracksRef)) {
      const freq = baseKickFreq * Math.pow(2, pitchOffset1 / 12)
      const swingOffset = getSwingOffset(1)
      synths.kick?.triggerAttackRelease(freq, '8n', time + swingOffset)
      activeThisStep[1] = true
    }
    const snareVal = (snarePattern.length) ? snarePattern[absoluteStep % snarePattern.length] : undefined
    if (isValueActive(snareVal) && shouldTrackPlay(2, mutedTracksRef, soloTracksRef)) {
      const swingOffset = getSwingOffset(2)
      synths.snare?.triggerAttackRelease('8n', time + swingOffset)
      activeThisStep[2] = true
    }
    const hihatVal = (hihatPattern.length) ? hihatPattern[absoluteStep % hihatPattern.length] : undefined
    if (isValueActive(hihatVal) && shouldTrackPlay(3, mutedTracksRef, soloTracksRef)) {
      const freq = baseHihatFreq * Math.pow(2, pitchOffset3 / 12)
      const swingOffset = getSwingOffset(3)
      synths.hihat?.triggerAttackRelease(freq, '32n', time + swingOffset)
      activeThisStep[3] = true
    }
    const openHHVal = (openHHPattern.length) ? openHHPattern[absoluteStep % openHHPattern.length] : undefined
    if (isValueActive(openHHVal) && shouldTrackPlay(4, mutedTracksRef, soloTracksRef)) {
      const freq = baseHihatFreq * Math.pow(2, pitchOffset4 / 12)
      const swingOffset = getSwingOffset(4)
      synths.openHH?.triggerAttackRelease(freq, '8n', time + swingOffset)
      activeThisStep[4] = true
    }
    const tomVal = (tomPattern.length) ? tomPattern[absoluteStep % tomPattern.length] : undefined
    if (isValueActive(tomVal) && shouldTrackPlay(5, mutedTracksRef, soloTracksRef)) {
      const freq = baseTomFreq * Math.pow(2, pitchOffset5 / 12)
      const swingOffset = getSwingOffset(5)
      synths.tom?.triggerAttackRelease(freq, '8n', time + swingOffset)
      activeThisStep[5] = true
    }
    const clapVal = (clapPattern.length) ? clapPattern[absoluteStep % clapPattern.length] : undefined
    if (isValueActive(clapVal) && shouldTrackPlay(9, mutedTracksRef, soloTracksRef)) {
      const swingOffset = getSwingOffset(9)
      synths.clap?.triggerAttackRelease('8n', time + swingOffset)
      activeThisStep[9] = true
    }

    // Bass synth - 64-step progression (4 bars x 16 steps)
    // Increment bassStepRef for the next callback; currentBassStepRef stores the step that was just processed (pre-increment)
    const bassStep = bassStepRef.current
    bassStepRef.current = (bassStep + 1) % MONO_SYNTH_TOTAL_STEPS
    currentBassStepRef.current = bassStep

    // Determine which bar we're in (0-3) based on the 64-step cycle
    const barIndex = Math.floor(bassStep / 16)
    const chordDegree = bassProgression[barIndex]

    // Get pattern step (supports both legacy 16-step presets or new 64-step presets)
    const patternStep = bassPattern.length ? (bassStep % bassPattern.length) : (bassStep % 16)
    const bassNoteType = bassPattern[patternStep]

    // Determine if Secuenciador is present (explicit controller). When present, it is authoritative:
    if (hasSecuenciadorControl) {
      const absoluteStep = bassStep
      const stepChord = chordStepsRef.current?.[absoluteStep]
      if (stepChord && stepChord.root != null && !stepChord.silent) {
        if (!shouldTrackPlay(6, mutedTracksRef, soloTracksRef)) {
          // Skip logging for brevity
        } else {
          // Play bass according to the bass pattern at 16th-note ticks, but use the secuenciador root
          if (isValueActive(bassNoteType)) {
            const bassNote = getBassNoteFromRoot(stepChord.root, bassNoteType || 1, 1)
            if (bassNote) {
              synths.bass?.triggerAttackRelease(bassNote, '8n', time)
              activeThisStep[6] = true
            }
          }
        }
      }
    } else {
      // No secuenciador control present: fallback to progression-based behavior
      if (isValueActive(bassNoteType) && shouldTrackPlay(6, mutedTracksRef, soloTracksRef)) {
        const bassNote = getBassNote(bassKey, chordDegree, bassNoteType, bassMode, 1)
        if (bassNote) {
          synths.bass?.triggerAttackRelease(bassNote, '8n', time)
          activeThisStep[6] = true
        }
      }
    }

    // Chord synth - similar logic for chords
    const chordPatternIndex = currentSelectedPatterns[7] ?? 0
    const chordPattern = currentCustomPatterns[7] || POLY_SYNTH_PATTERNS[chordPatternIndex]?.pattern || []

    const chordStep = chordStepRef.current
    // Increment chordStepRef for the next callback; currentChordStepRef stores the step that was just processed (pre-increment)
    chordStepRef.current = (chordStep + 1) % POLY_SYNTH_TOTAL_STEPS
    currentChordStepRef.current = chordStep

    const chordBarIndex = Math.floor(chordStep / 16)
    const chordChordDegree = bassProgression[chordBarIndex]
    const chordPatternStep = chordPattern.length ? (chordStep % chordPattern.length) : (chordStep % 16)
    const chordType = chordPattern[chordPatternStep]

    if (hasSecuenciadorControl) {
      const absoluteStep = chordStep
      const stepChord = chordStepsRef.current?.[absoluteStep]
      if (stepChord && stepChord.root != null && !stepChord.silent) {
        if (!shouldTrackPlay(7, mutedTracksRef, soloTracksRef)) {
          // Skip
        } else {
          const rawPatternVal = chordPattern.length ? chordPattern[absoluteStep % chordPattern.length] : chordPattern[absoluteStep % 16]
          if (isValueActive(rawPatternVal)) {
            const patternVal = typeof rawPatternVal === 'number' ? rawPatternVal : 1
            const chordNotes = getChordNotesFromRoot(stepChord.root, patternVal, stepChord.type || bassMode, 3)
            if (chordNotes) {
              const finalDuration = '4n'
              synths.chords?.triggerAttackRelease(chordNotes, finalDuration, time)
              activeThisStep[7] = true
            }
          }
        }
      }
    } else {
      if (isValueActive(chordType) && shouldTrackPlay(7, mutedTracksRef, soloTracksRef)) {
        const chordNotes = getChordNotes(bassKey, chordChordDegree, chordType, bassMode, 3)
        if (chordNotes) {
          const duration = chordType === 4 ? '16n' : '4n'
          synths.chords?.triggerAttackRelease(chordNotes, duration, time)
          activeThisStep[7] = true
        }
      }
    }

    // Arp synth - similar logic for arp
    const arpPatternIndex = currentSelectedPatterns[8] ?? 0
    const arpPattern = currentCustomPatterns[8] || ARP_SYNTH_PATTERNS[arpPatternIndex]?.pattern || []

    const arpStep = arpStepRef.current
    // Increment arpStepRef for the next callback; currentArpStepRef stores the step that was just processed (pre-increment)
    arpStepRef.current = (arpStep + 1) % ARP_SYNTH_TOTAL_STEPS
    currentArpStepRef.current = arpStep

    const arpBarIndex = Math.floor(arpStep / 16)
    const arpChordDegree = bassProgression[arpBarIndex]
    const arpPatternStep = arpPattern.length ? (arpStep % arpPattern.length) : (arpStep % 16)
    const arpNoteType = arpPattern[arpPatternStep]

    if (hasSecuenciadorControl) {
      const absoluteStep = arpStep
      const stepChord = chordStepsRef.current?.[absoluteStep]
      if (stepChord && stepChord.root != null && !stepChord.silent && shouldTrackPlay(8, mutedTracksRef, soloTracksRef)) {
        const rawArpVal = arpPattern.length ? arpPattern[arpStep % arpPattern.length] : arpPattern[arpStep % 16]
        if (isValueActive(rawArpVal)) {
          const effectiveArpType = typeof rawArpVal === 'number' ? rawArpVal : 1
          const arpNotes = getChordNotesFromRoot(stepChord.root, effectiveArpType, stepChord.type || bassMode, 4)
          if (arpNotes) {
            const note = arpNotes[0]
            synths.arp?.triggerAttackRelease(note, '16n', time)
            activeThisStep[8] = true
          }
        }
      }
    } else {
      if (isValueActive(arpNoteType) && shouldTrackPlay(8, mutedTracksRef, soloTracksRef)) {
        const effectiveArpType = arpNoteType
        const arpNotes = getChordNotes(bassKey, arpChordDegree, effectiveArpType, bassMode, 4)
        if (arpNotes) {
          const note = arpNotes[0]
          synths.arp?.triggerAttackRelease(note, '16n', time)
          activeThisStep[8] = true
        }
      }
    }

    // Update active tracks once per step with all active tracks
    if (Object.keys(activeThisStep).length > 0) {
      setActiveTracks(activeThisStep)

      // Cancel any previously scheduled clear to avoid building up a queue
      if (transportClearEventIdRef.current != null && transport && typeof transport.clear === 'function') {
        try {
          transport.clear(transportClearEventIdRef.current)
        } catch {
          // ignore
        }
        transportClearEventIdRef.current = null
      }

      const scheduleTime = typeof time === 'number' ? time + 0.1 : Tone.Time(time).toSeconds() + 0.1
      transportClearEventIdRef.current = transport && typeof transport.scheduleOnce === 'function'
        ? transport.scheduleOnce(() => {
            setActiveTracks({})
            transportClearEventIdRef.current = null
          }, scheduleTime)
        : null
    }
  }
}

export { shouldTrackPlay, playTrackNote, createSequencerCallback }
