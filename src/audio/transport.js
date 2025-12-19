import * as Tone from 'tone'

// Transport controls
const startTone = async () => {
  await Tone.start()
  console.log('Tone.js audio context started')
}

const togglePlay = (isPlaying, setIsPlaying, currentStepRef, currentBassStepRef, currentChordStepRef, currentArpStepRef, setUiStepPulse, bassStepRef, chordStepRef, arpStepRef, transportClearEventIdRef, effectsRef) => {
  // Guard against rapid repeated clicks that can block the main thread
  // Note: This guard logic needs to be implemented externally with a ref

  if (isPlaying) {
    // Immediately update UI state so user sees feedback quickly
    setIsPlaying(false)
    currentStepRef.current = 0
    currentBassStepRef.current = 0
    currentChordStepRef.current = 0
    currentArpStepRef.current = 0
    setUiStepPulse((p) => (p + 1) % 1000000)
    bassStepRef.current = 0
    chordStepRef.current = 0
    arpStepRef.current = 0

    // Defer heavier transport/sequence operations to avoid blocking the click handler
    setTimeout(() => {
      try {
        // Stop the transport but do NOT cancel all scheduled transport events.
        // Calling `Tone.getTransport().cancel()` removes the sequencer repeat
        // event created on startup which prevents playback from starting again.
        Tone.getTransport().stop('+0.001')
      } catch {
        // ignore errors stopping the transport (best-effort)
      }

      if (transportClearEventIdRef.current != null) {
        try {
          Tone.getTransport().clear(transportClearEventIdRef.current)
        } catch {
          // ignore
        }
        transportClearEventIdRef.current = null
      }

      // Stop LFOs to save CPU when not playing
      try {
        effectsRef.current.bass?.lfo?.stop()
        effectsRef.current.chords?.lfo?.stop()
        effectsRef.current.arp?.lfo?.stop()
      } catch {
        // ignore LFO stop errors (best-effort)
      }
    }, 0)
  } else {
    const transport = Tone.getTransport()

    // If transport is paused, resume in place.
    if (transport.state === 'paused') {
      // Start LFOs when resuming
      try {
        effectsRef.current.bass?.lfo?.start()
        effectsRef.current.chords?.lfo?.start()
        effectsRef.current.arp?.lfo?.start()
      } catch {
        // ignore LFO start errors (best-effort)
      }
      transport.start('+0.05')
      // Do NOT restart sequencer to avoid resetting position.
      setIsPlaying(true)
      return
    }

    // Fresh start from the beginning
    transport.position = 0
    bassStepRef.current = 0
    chordStepRef.current = 0
    arpStepRef.current = 0
    currentStepRef.current = 0
    currentBassStepRef.current = 0
    currentChordStepRef.current = 0
    currentArpStepRef.current = 0
    setUiStepPulse((p) => (p + 1) % 1000000)

    // Start LFOs for modulation when playing
    try {
      effectsRef.current.bass?.lfo?.start()
      effectsRef.current.chords?.lfo?.start()
      effectsRef.current.arp?.lfo?.start()
    } catch {
      // ignore LFO start errors (best-effort)
    }

    transport.start('+0.1')
    setIsPlaying(true)
  }
}

const pause = (toneStarted, isPlaying, setIsPlaying, effectsRef) => {
  if (!toneStarted) return
  if (!isPlaying) return
  // Pause keeps position so we can resume.
  Tone.getTransport().pause()
  // Keep the sequencer scheduled; it's driven by Transport time.
  setIsPlaying(false)
  // Stop LFOs when paused
  try {
    effectsRef.current.bass?.lfo?.stop()
    effectsRef.current.chords?.lfo?.stop()
    effectsRef.current.arp?.lfo?.stop()
  } catch {
    // ignore LFO stop errors (best-effort)
  }
}

export { startTone, togglePlay, pause }
