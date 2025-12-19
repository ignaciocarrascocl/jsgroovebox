import * as Tone from 'tone'

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

export {
  clamp,
  dbFromRms,
  applyCompressionAmount,
  pitchToMultiplier,
  applyPercEnvelope,
  createFilterStages
}
