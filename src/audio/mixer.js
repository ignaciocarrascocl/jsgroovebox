import * as Tone from 'tone'
import { createFilterStages } from '../utils/audioUtils.js'

// Create the master mixer and buses
const createMixer = (masterParamsRef, busParamsRef) => {
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
  const reverb = new Tone.Reverb({ decay: busParamsRef.current.reverb?.decay ?? 1.8, wet: 1 })
  const reverbReturn = new Tone.Gain(1)
  const reverbFilter = new Tone.Filter(busParamsRef.current.reverb?.tone ?? 8000, 'lowpass')

  // Create both delay types and a filter for repeats; we'll switch between them when params change.
  const feedbackDelay = new Tone.FeedbackDelay(busParamsRef.current.delay?.time ?? 0.25, busParamsRef.current.delay?.feedback ?? 0.25)
  const pingPongDelay = new Tone.PingPongDelay(busParamsRef.current.delay?.time ?? 0.25, 0.5)
  const delayFilter = new Tone.Filter(busParamsRef.current.delay?.filter ?? 8000, 'lowpass')
  // Active delay node defaults to requested type (or feedback)
  const delay = busParamsRef.current.delay?.type === 'pingpong' ? pingPongDelay : feedbackDelay
  if (feedbackDelay?.wet?.rampTo) feedbackDelay.wet.rampTo(1, 0)
  if (pingPongDelay?.wet?.rampTo) pingPongDelay.wet.rampTo(1, 0)
  const delayReturn = new Tone.Gain(1)

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
  reverb.chain(reverbFilter, reverbReturn, masterInput)
  delay.chain(delayFilter, delayReturn, masterInput)

  // Tap FX returns to meters for debugging/visualization (non-critical)
  try {
    reverbReturn.connect(reverbMeter)
    delayReturn.connect(delayMeter)
  } catch {
    // ignore
  }

  const mixer = {
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
    reverbFilter,
    reverbReturn,
    feedbackDelay,
    pingPongDelay,
    delayFilter,
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

  return mixer
}

// Wire synths and effects to mixer
const wireAudioGraph = (synths, effects, mixer) => {
  // Wire drum synths
  synths.kick.chain(
    effects.kick.compressor,
    effects.kick.filter,
    mixer.masterInput
  )
  // Post-fader sends: connect the final stage (filter) to the send gains so send follows track level
  if (effects.kick?.filter) {
    effects.kick.filter.connect(effects.kick.delaySend)
    effects.kick.filter.connect(effects.kick.reverbSend)
    if (effects.kick?.meter) effects.kick.filter.connect(effects.kick.meter)
  }

  synths.snare.chain(
    effects.snare.compressor,
    effects.snare.filter,
    mixer.masterInput
  )
  if (effects.snare?.filter) {
    effects.snare.filter.connect(effects.snare.delaySend)
    effects.snare.filter.connect(effects.snare.reverbSend)
    if (effects.snare?.meter) effects.snare.filter.connect(effects.snare.meter)
  }

  synths.hihat.chain(
    effects.hihat.compressor,
    effects.hihat.filter,
    mixer.masterInput
  )
  if (effects.hihat?.filter) {
    effects.hihat.filter.connect(effects.hihat.delaySend)
    effects.hihat.filter.connect(effects.hihat.reverbSend)
    if (effects.hihat?.meter) effects.hihat.filter.connect(effects.hihat.meter)
  }

  synths.openHH.chain(
    effects.openHH.compressor,
    effects.openHH.filter,
    mixer.masterInput
  )
  if (effects.openHH?.filter) {
    effects.openHH.filter.connect(effects.openHH.delaySend)
    effects.openHH.filter.connect(effects.openHH.reverbSend)
    if (effects.openHH?.meter) effects.openHH.filter.connect(effects.openHH.meter)
  }

  synths.tom.chain(
    effects.tom.compressor,
    effects.tom.filter,
    mixer.masterInput
  )
  if (effects.tom?.filter) {
    effects.tom.filter.connect(effects.tom.delaySend)
    effects.tom.filter.connect(effects.tom.reverbSend)
    if (effects.tom?.meter) effects.tom.filter.connect(effects.tom.meter)
  }

  synths.clap.chain(
    effects.clap.compressor,
    effects.clap.filter,
    mixer.masterInput
  )
  if (effects.clap?.filter) {
    effects.clap.filter.connect(effects.clap.delaySend)
    effects.clap.filter.connect(effects.clap.reverbSend)
    if (effects.clap?.meter) effects.clap.filter.connect(effects.clap.meter)
  }

  // Wire melodic synths
  synths.bass.chain(
    effects.bass.compressor,
    effects.bass.distortion,
    effects.bass.filter,
    effects.bass.chorus,
    mixer.masterInput
  )
  if (effects.bass?.filter) {
    effects.bass.filter.connect(effects.bass.delaySend)
    effects.bass.filter.connect(effects.bass.reverbSend)
    if (effects.bass?.meter) effects.bass.filter.connect(effects.bass.meter)
  }

  synths.chords.chain(
    effects.chords.compressor,
    effects.chords.distortion,
    effects.chords.filter,
    effects.chords.chorus,
    mixer.masterInput
  )
  if (effects.chords?.filter) {
    effects.chords.filter.connect(effects.chords.delaySend)
    effects.chords.filter.connect(effects.chords.reverbSend)
    if (effects.chords?.meter) effects.chords.filter.connect(effects.chords.meter)
  }

  synths.arp.chain(
    effects.arp.compressor,
    effects.arp.distortion,
    effects.arp.filter,
    effects.arp.chorus,
    mixer.masterInput
  )
  if (effects.arp?.filter) {
    effects.arp.filter.connect(effects.arp.delaySend)
    effects.arp.filter.connect(effects.arp.reverbSend)
    if (effects.arp?.meter) effects.arp.filter.connect(effects.arp.meter)
  }

  // Wire track sends to shared buses
  Object.values(effects).forEach((fx) => {
    if (mixer?.delay && fx?.delaySend) fx.delaySend.connect(mixer.delay)
    if (mixer?.reverb && fx?.reverbSend) fx.reverbSend.connect(mixer.reverb)
  })
}

export { createMixer, wireAudioGraph }
