import { dbFromRms } from '../utils/audioUtils.js'

// Metering and waveform analysis
const createMetering = (mixerRef, isPlaying, setMasterMeter, leftPowerRef, rightPowerRef) => {
  // Only animate meter when transport is running.
  // This freezes *all* UI elements driven by `masterMeter` (waveform + readouts + bars)
  // when audio isn't actively playing.
  if (!isPlaying) return () => {}

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
}

export { createMetering }
