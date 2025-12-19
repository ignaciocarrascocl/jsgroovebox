import * as Tone from 'tone'
import { PATTERNS } from '../constants/patterns'
import { MONO_SYNTH_PATTERNS, MONO_SYNTH_TOTAL_STEPS } from '../constants/monoSynth'
import { POLY_SYNTH_PATTERNS, POLY_SYNTH_TOTAL_STEPS } from '../constants/polySynth'
import { CHORD_PROGRESSIONS } from '../constants/song'
import { ARP_SYNTH_PATTERNS, ARP_SYNTH_TOTAL_STEPS } from '../constants/arpSynth'
import { getBassNote, getChordNotes, getBassNoteFromRoot, getChordNotesFromRoot } from '../utils/musicTheory.js'

// Helper to check if a track should play
const shouldTrackPlay = (trackId, mutedTracksRef, soloTracksRef) => {
  const hasSolo = Object.values(soloTracksRef.current).some(v => v)
  if (hasSolo) {
    return soloTracksRef.current[trackId] === true
  }
  return !mutedTracksRef.current[trackId]
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

    // Swing: apply to the off-beat 8ths within each beat in a 16-step grid (steps 2,6,10,14).
    // This makes swing affect common 8th patterns (0,2,4,6...) consistently.
    // swing=1 => triplet feel: delay by 1/6 beat = (2/3)*16n.
    const isSwingStep = step % 4 === 2
    const sixteenthNoteDuration = Tone.Time('16n').toSeconds()

    const getSwingOffset = (trackId) => {
      if (!isSwingStep) return 0
      const swing = currentTrackParams[trackId]?.swing ?? 0
      return swing * (sixteenthNoteDuration * (2 / 3))
    }

    // Track which tracks are active this step for visual feedback
    const activeThisStep = {}

    if (kickPattern[step] && shouldTrackPlay(1, mutedTracksRef, soloTracksRef)) {
      const freq = Tone.Frequency('C1').transpose(pitchOffset1).toFrequency()
      const swingOffset = getSwingOffset(1)
      synthsRef.current.kick?.triggerAttackRelease(freq, '8n', time + swingOffset)
      activeThisStep[1] = true
    }
    if (snarePattern[step] && shouldTrackPlay(2, mutedTracksRef, soloTracksRef)) {
      const swingOffset = getSwingOffset(2)
      synthsRef.current.snare?.triggerAttackRelease('8n', time + swingOffset)
      activeThisStep[2] = true
    }
    if (hihatPattern[step] && shouldTrackPlay(3, mutedTracksRef, soloTracksRef)) {
      const freq = Tone.Frequency('C6').transpose(pitchOffset3).toFrequency()
      const swingOffset = getSwingOffset(3)
      synthsRef.current.hihat?.triggerAttackRelease(freq, '32n', time + swingOffset)
      activeThisStep[3] = true
    }
    if (openHHPattern[step] && shouldTrackPlay(4, mutedTracksRef, soloTracksRef)) {
      const freq = Tone.Frequency('C6').transpose(pitchOffset4).toFrequency()
      const swingOffset = getSwingOffset(4)
      synthsRef.current.openHH?.triggerAttackRelease(freq, '8n', time + swingOffset)
      activeThisStep[4] = true
    }
    if (tomPattern[step] && shouldTrackPlay(5, mutedTracksRef, soloTracksRef)) {
      const freq = Tone.Frequency('C2').transpose(pitchOffset5).toFrequency()
      const swingOffset = getSwingOffset(5)
      synthsRef.current.tom?.triggerAttackRelease(freq, '8n', time + swingOffset)
      activeThisStep[5] = true
    }
    if (clapPattern[step] && shouldTrackPlay(9, mutedTracksRef, soloTracksRef)) {
      const swingOffset = getSwingOffset(9)
      synthsRef.current.clap?.triggerAttackRelease('8n', time + swingOffset)
      activeThisStep[9] = true
    }

    // Bass synth - 64-step progression (4 bars x 16 steps)
    const bassStep = bassStepRef.current
    bassStepRef.current = (bassStep + 1) % MONO_SYNTH_TOTAL_STEPS
    currentBassStepRef.current = bassStep

    // Determine which bar we're in (0-3) based on the 64-step cycle
    const barIndex = Math.floor(bassStep / 16)
    const chordDegree = bassProgression[barIndex]

    // Get pattern step (patterns are 16 steps, repeat each bar)
    const patternStep = bassStep % 16
    const bassNoteType = bassPattern[patternStep]

    // Determine if Secuenciador is present (explicit controller). When present, it is authoritative:
    const hasSecuenciadorControl = Array.isArray(chordStepsRef.current)
    if (hasSecuenciadorControl) {
      const absoluteStep = bassStep
      const stepChord = chordStepsRef.current?.[absoluteStep]
      if (stepChord && stepChord.root && !stepChord.silent) {
        if (!shouldTrackPlay(6, mutedTracksRef, soloTracksRef)) {
          // Skip logging for brevity
        } else {
          // Play bass according to the bass pattern at 16th-note ticks, but use the secuenciador root
          if (bassNoteType > 0) {
            const bassNote = getBassNoteFromRoot(stepChord.root, bassNoteType || 1, 1)
            if (bassNote) {
              synthsRef.current.bass?.triggerAttackRelease(bassNote, '8n', time)
              activeThisStep[6] = true
            }
          }
        }
      }
    } else {
      // No secuenciador control present: fallback to progression-based behavior
      if (bassNoteType > 0 && shouldTrackPlay(6, mutedTracksRef, soloTracksRef)) {
        const bassNote = getBassNote(bassKey, chordDegree, bassNoteType, bassMode, 1)
        if (bassNote) {
          synthsRef.current.bass?.triggerAttackRelease(bassNote, '8n', time)
          activeThisStep[6] = true
        }
      }
    }

    // Chord synth - similar logic for chords
    const chordPatternIndex = currentSelectedPatterns[7] ?? 0
    const chordPattern = currentCustomPatterns[7] || POLY_SYNTH_PATTERNS[chordPatternIndex]?.pattern || []

    const chordStep = chordStepRef.current
    chordStepRef.current = (chordStep + 1) % POLY_SYNTH_TOTAL_STEPS
    currentChordStepRef.current = chordStep

    const chordBarIndex = Math.floor(chordStep / 16)
    const chordChordDegree = bassProgression[chordBarIndex]
    const chordPatternStep = chordStep % 16
    const chordType = chordPattern[chordPatternStep]

    const hasSecuenciadorControlChords = Array.isArray(chordStepsRef.current)
    if (hasSecuenciadorControlChords) {
      const absoluteStep = chordStep
      const stepChord = chordStepsRef.current?.[absoluteStep]
      if (stepChord && stepChord.root && !stepChord.silent) {
        if (!shouldTrackPlay(7, mutedTracksRef, soloTracksRef)) {
          // Skip
        } else {
          const rawPatternVal = chordPattern[absoluteStep % 16]
          if (typeof rawPatternVal === 'number' && rawPatternVal > 0) {
            const patternVal = rawPatternVal
            const chordNotes = getChordNotesFromRoot(stepChord.root, patternVal, stepChord.type || bassMode, 3)
            if (chordNotes) {
              const finalDuration = Tone.Time('4n').toSeconds()
              synthsRef.current.chords?.triggerAttackRelease(chordNotes, finalDuration, time)
              activeThisStep[7] = true
            }
          }
        }
      }
    } else {
      if (chordType > 0 && shouldTrackPlay(7, mutedTracksRef, soloTracksRef)) {
        const chordNotes = getChordNotes(bassKey, chordChordDegree, chordType, bassMode, 3)
        if (chordNotes) {
          const duration = chordType === 4 ? '16n' : '4n'
          synthsRef.current.chords?.triggerAttackRelease(chordNotes, duration, time)
          activeThisStep[7] = true
        }
      }
    }

    // Arp synth - similar logic for arp
    const arpPatternIndex = currentSelectedPatterns[8] ?? 0
    const arpPattern = currentCustomPatterns[8] || ARP_SYNTH_PATTERNS[arpPatternIndex]?.pattern || []

    const arpStep = arpStepRef.current
    arpStepRef.current = (arpStep + 1) % ARP_SYNTH_TOTAL_STEPS
    currentArpStepRef.current = arpStep

    const arpBarIndex = Math.floor(arpStep / 16)
    const arpChordDegree = bassProgression[arpBarIndex]
    const arpPatternStep = arpStep % 16
    const arpNoteType = arpPattern[arpPatternStep]

    const hasSecuenciadorControlArp = Array.isArray(chordStepsRef.current)
    if (hasSecuenciadorControlArp) {
      const absoluteStep = arpStep
      const stepChord = chordStepsRef.current?.[absoluteStep]
      if (stepChord && stepChord.root && !stepChord.silent && shouldTrackPlay(8, mutedTracksRef, soloTracksRef)) {
        const rawArpVal = arpPattern[arpStep % 16]
        const effectiveArpType = (typeof rawArpVal === 'number' && rawArpVal > 0) ? rawArpVal : 1
        const arpNotes = getChordNotesFromRoot(stepChord.root, effectiveArpType, stepChord.type || bassMode, 4)
        if (arpNotes && rawArpVal > 0) {
          const note = arpNotes[0]
          synthsRef.current.arp?.triggerAttackRelease(note, '16n', time)
          activeThisStep[8] = true
        }
      }
    } else {
      if (arpNoteType > 0 && shouldTrackPlay(8, mutedTracksRef, soloTracksRef)) {
        const effectiveArpType = arpNoteType
        const arpNotes = getChordNotes(bassKey, arpChordDegree, effectiveArpType, bassMode, 4)
        if (arpNotes) {
          const note = arpNotes[0]
          synthsRef.current.arp?.triggerAttackRelease(note, '16n', time)
          activeThisStep[8] = true
        }
      }
    }

    // Update active tracks once per step with all active tracks
    if (Object.keys(activeThisStep).length > 0) {
      setActiveTracks(activeThisStep)

      // Cancel any previously scheduled clear to avoid building up a queue
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
  }
}

export { shouldTrackPlay, playTrackNote, createSequencerCallback }
