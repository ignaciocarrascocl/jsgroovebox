import { useEffect, useState, useRef, useCallback } from 'react'
import HeaderRow from './components/HeaderRow'
import Toast from './components/Toast'
import MasterFX from './components/MasterFX'
import Mixer from './components/Mixer'
import Track from './components/Track'
import BassTrack from './components/MonoSynthTrack'
import ChordsTrack from './components/PolySynthTrack'
import ArpTrack from './components/ArpSynthTrack'
import Secuenciador from './components/Secuenciador'
import { useAudioEngine } from './hooks/useAudioEngine'
import { TRACKS, DEFAULT_PATTERNS } from './constants/tracks'
import './App.css'

// Default track parameters - tuned per instrument type
const DEFAULT_TRACK_PARAMS = {
  // Kick: low pitch range, longer decay, low-pass filter
  1: { volume: 0, pitch: 0, attack: 0.001, release: 0.4, filter: 800, reverb: 0, delay: 0, compression: 0, swing: 0 },
  // Snare: no pitch control, medium decay, band-pass feel
  2: { volume: -3, pitch: 0, attack: 0.001, release: 0.15, filter: 4000, reverb: 0.15, delay: 0, compression: 0.3, swing: 0 },
  // HiHat: high pitch range, short decay, high-pass filter
  3: { volume: -8, pitch: 0, attack: 0.001, release: 0.05, filter: 6000, reverb: 0, delay: 0, compression: 0, swing: 0 },
  // Open HiHat: similar to hihat but longer decay
  4: { volume: -10, pitch: 0, attack: 0.001, release: 0.3, filter: 5000, reverb: 0.1, delay: 0, compression: 0, swing: 0 },
  // Tom: mid-range pitch, medium decay
  5: { volume: -5, pitch: 0, attack: 0.001, release: 0.3, filter: 1200, reverb: 0.1, delay: 0, compression: 0.3, swing: 0 },
  // Clap: medium decay, band-pass filter, more reverb
  9: { volume: -6, pitch: 0, attack: 0.003, release: 0.15, filter: 4000, reverb: 0.2, delay: 0, compression: 0.5, swing: 0 },
}

// Default mono synth parameters (sound only, key/progression are global)
const DEFAULT_MONO_SYNTH_PARAMS = {
  6: { 
    volume: -6, 
    waveType: 'sawtooth', 
    attack: 0.01, 
    decay: 0.3,
    filter: 800, 
    resonance: 2, 
    detune: 5,
    lfoRate: 0,
    lfoDepth: 0,
    compression: 0.4,
    reverb: 0,
    delay: 0
  },
}

// Default poly synth parameters (sound only, key/progression are global)
const DEFAULT_POLY_SYNTH_PARAMS = {
  7: { 
    volume: -10, 
    waveType: 'sawtooth', 
    attack: 0.05, 
    decay: 0.4,
    release: 0.3,
    filter: 2500, 
    resonance: 2, 
    detune: 5,
    lfoRate: 0,
    lfoDepth: 0,
    lfoWave: 'sine',
    compression: 0.3,
    drive: 0,
    chorus: 0,
    reverb: 0.2,
    delay: 0
  },
}

// Default arp synth parameters (sound only)
const DEFAULT_ARP_SYNTH_PARAMS = {
  8: {
    volume: -6,
    waveType: 'sawtooth',
    attack: 0.005,
    decay: 0.08,
    release: 0.1,
    filter: 1200,
    resonance: 1,
    detune: 5,
    lfoRate: 0,
    lfoDepth: 0,
    compression: 0,
    reverb: 0,
    delay: 0,
  }
}

// Default song settings (global for all melodic tracks)
const DEFAULT_SONG_SETTINGS = {
  key: 'C',
  progression: 0,
}

const DEFAULT_MASTER_PARAMS = {
  compression: 0,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  filterCutoff: 20000,
  filterReso: 0.7,
  volume: 0,
}

const DEFAULT_BUS_PARAMS = {
  reverb: {
    wet: 0.2,
    decay: 1.8,
    preDelay: 0.01,
    // type presets: 'hall' | 'plate' | 'room'
    type: 'hall',
    // tone shaping (lowpass cutoff applied to reverb output)
    tone: 8000,
  },
  delay: {
    wet: 0.15,
    feedback: 0.25,
    time: 0.25,
    // type: 'feedback' | 'pingpong'
    type: 'feedback',
    // if sync is true, `division` is used (e.g. '4n','8n','8n.')
    sync: false,
    division: '8n',
    // filter cutoff applied to delay repeats
    filter: 8000,
  },
}

function App() {
  const [showStartup, setShowStartup] = useState(true)
  const [startupPhase, setStartupPhase] = useState('idle') // idle | leaving
  const [selectedPatterns, setSelectedPatterns] = useState(DEFAULT_PATTERNS)
  const [customPatterns, setCustomPatterns] = useState({})
  const [trackParams, setTrackParams] = useState(DEFAULT_TRACK_PARAMS)
  const [bassParams, setBassParams] = useState(DEFAULT_MONO_SYNTH_PARAMS)
  const [chordParams, setChordParams] = useState(DEFAULT_POLY_SYNTH_PARAMS)
  const [arpParams, setArpParams] = useState(DEFAULT_ARP_SYNTH_PARAMS)
  const [songSettings, setSongSettings] = useState(DEFAULT_SONG_SETTINGS)
  const [chordSteps, setChordSteps] = useState(null)
  const [mutedTracks, setMutedTracks] = useState({})
  const [soloTracks, setSoloTracks] = useState({})
  const [masterParams, setMasterParams] = useState(DEFAULT_MASTER_PARAMS)
  const [busParams, setBusParams] = useState(DEFAULT_BUS_PARAMS)
  
  const {
    toneStarted,
    isPlaying,
    uiStepPulse,
    _getCurrentStep,
    _getCurrentBassStep,
    getCurrentChordStep,
    _getCurrentArpStep,
    activeTracks,
    startTone,
    togglePlay,
    playTrack,
    masterMeter,
    getMasterNode,
    setMasterParams: setEngineMasterParams,
    setBusParams: setEngineBusParams,
    perfStats,
    bpm,
    setBpm,
  } = useAudioEngine(selectedPatterns, customPatterns, trackParams, mutedTracks, soloTracks, bassParams, chordParams, arpParams, songSettings, chordSteps)

  // Drive step-based UI off a low-rate pulse to keep controls responsive while playing.
  // (Read the latest step values via the getters.)
  void uiStepPulse


  // Wire master/bus params into audio engine
  useEffect(() => {
    setEngineMasterParams?.(masterParams)
  }, [masterParams, setEngineMasterParams])

  useEffect(() => {
    setEngineBusParams?.(busParams)
  }, [busParams, setEngineBusParams])

  const handlePatternChange = (trackId, patternIndex) => {
    setSelectedPatterns(prev => ({
      ...prev,
      [trackId]: patternIndex
    }))
    // Clear custom pattern when selecting a preset
    setCustomPatterns(prev => ({
      ...prev,
      [trackId]: null
    }))
  }

  const handleCustomPatternChange = (trackId, pattern) => {
    setCustomPatterns(prev => ({
      ...prev,
      [trackId]: pattern
    }))
  }

  const handleParamChange = (trackId, params) => {
    setTrackParams(prev => ({
      ...prev,
      [trackId]: params
    }))
  }

  const handleBassParamChange = (trackId, params) => {
    setBassParams(prev => ({
      ...prev,
      [trackId]: params
    }))
  }

  const handleChordParamChange = (trackId, params) => {
    setChordParams(prev => ({
      ...prev,
      [trackId]: params
    }))
  }

  const handleArpParamChange = (trackId, params) => {
    setArpParams(prev => ({
      ...prev,
      [trackId]: params
    }))
  }

  const handleMuteToggle = (trackId) => {
    setMutedTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }))
  }

  const handleSoloToggle = (trackId) => {
    setSoloTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }))
  }



  const handleResetDefaults = () => {
    // Snapshot current state for undo
    const snapshot = {
      selectedPatterns,
      customPatterns,
      trackParams,
      bassParams,
      chordParams,
      arpParams,
      songSettings,
      mutedTracks,
      soloTracks,
      masterParams,
      busParams,
    }

    setSelectedPatterns(DEFAULT_PATTERNS)
    setCustomPatterns({})
    setTrackParams(DEFAULT_TRACK_PARAMS)
    setBassParams(DEFAULT_MONO_SYNTH_PARAMS)
    setChordParams(DEFAULT_POLY_SYNTH_PARAMS)
    setArpParams(DEFAULT_ARP_SYNTH_PARAMS)
    setSongSettings(DEFAULT_SONG_SETTINGS)
    setMutedTracks({})
    setSoloTracks({})
    setMasterParams(DEFAULT_MASTER_PARAMS)
    setBusParams(DEFAULT_BUS_PARAMS)

    showUndoToast('Reset all to defaults', snapshot)
  }

  // Undo toast handling
  const pendingResetRef = useRef(null)
  const toastTimerRef = useRef(null)
  const [toast, setToast] = useState(null)
  const [lastResetTarget, setLastResetTarget] = useState(null)

  const clearPending = () => {
    pendingResetRef.current = null
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    setToast(null)
  }

  const showUndoToast = (message, snapshot, duration = 5000, target = null) => {
    // clear previous
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    pendingResetRef.current = snapshot
    setToast({ message })
    // flash target (for UI feedback)
    if (target) {
      setLastResetTarget(target)
      window.setTimeout(() => setLastResetTarget(null), 1100)
    }
    toastTimerRef.current = window.setTimeout(() => {
      pendingResetRef.current = null
      toastTimerRef.current = null
      setToast(null)
    }, duration)
  }

  const handleUndo = () => {
    const snap = pendingResetRef.current
    if (!snap) return
    setSelectedPatterns(snap.selectedPatterns)
    setCustomPatterns(snap.customPatterns)
    setTrackParams(snap.trackParams)
    setBassParams(snap.bassParams)
    setChordParams(snap.chordParams)
    setArpParams(snap.arpParams)
    setSongSettings(snap.songSettings)
    setMutedTracks(snap.mutedTracks)
    setSoloTracks(snap.soloTracks)
    setMasterParams(snap.masterParams)
    setBusParams(snap.busParams)
    clearPending()
    // show brief confirmation
    setToast({ message: 'Restored' })
    window.setTimeout(() => setToast(null), 1200)
  }

  // Per-track resets
  const handleResetTrack = (trackId) => {
    const snapshot = {
      selectedPatterns,
      customPatterns,
      trackParams,
      bassParams,
      chordParams,
      arpParams,
      songSettings,
      mutedTracks,
      soloTracks,
      masterParams,
      busParams,
    }

    setSelectedPatterns(prev => ({ ...prev, [trackId]: DEFAULT_PATTERNS[trackId] ?? 0 }))
    setCustomPatterns(prev => ({ ...prev, [trackId]: null }))
    setTrackParams(prev => ({ ...prev, [trackId]: DEFAULT_TRACK_PARAMS[trackId] ?? prev[trackId] }))
    setMutedTracks(prev => ({ ...prev, [trackId]: false }))
    setSoloTracks(prev => ({ ...prev, [trackId]: false }))

    showUndoToast('Reset track', snapshot)
  }

  const handleResetBass = () => {
    const snapshot = { selectedPatterns, customPatterns, trackParams, bassParams, chordParams, arpParams, songSettings, mutedTracks, soloTracks, masterParams, busParams }
    setSelectedPatterns(prev => ({ ...prev, 6: DEFAULT_PATTERNS[6] ?? 0 }))
    setCustomPatterns(prev => ({ ...prev, 6: null }))
    setBassParams(DEFAULT_MONO_SYNTH_PARAMS)
    setMutedTracks(prev => ({ ...prev, 6: false }))
    setSoloTracks(prev => ({ ...prev, 6: false }))
    showUndoToast('Reset bass', snapshot)
  }

  const handleResetChords = () => {
    const snapshot = { selectedPatterns, customPatterns, trackParams, bassParams, chordParams, arpParams, songSettings, mutedTracks, soloTracks, masterParams, busParams }
    setSelectedPatterns(prev => ({ ...prev, 7: DEFAULT_PATTERNS[7] ?? 0 }))
    setCustomPatterns(prev => ({ ...prev, 7: null }))
    setChordParams(DEFAULT_POLY_SYNTH_PARAMS)
    setMutedTracks(prev => ({ ...prev, 7: false }))
    setSoloTracks(prev => ({ ...prev, 7: false }))
    showUndoToast('Reset chords', snapshot)
  }

  const handleResetArp = () => {
    const snapshot = { selectedPatterns, customPatterns, trackParams, bassParams, chordParams, arpParams, songSettings, mutedTracks, soloTracks, masterParams, busParams }
    setSelectedPatterns(prev => ({ ...prev, 8: DEFAULT_PATTERNS[8] ?? 0 }))
    setCustomPatterns(prev => ({ ...prev, 8: null }))
    setArpParams(DEFAULT_ARP_SYNTH_PARAMS)
    setMutedTracks(prev => ({ ...prev, 8: false }))
    setSoloTracks(prev => ({ ...prev, 8: false }))
    showUndoToast('Reset arp', snapshot)
  }

  // Accept songSettings updates only when they change to avoid update loops
  const handleSongSettingsChange = useCallback((s) => {
    setSongSettings(prev => {
      const merged = { ...prev, ...s }
      if (merged.key === prev.key && merged.progression === prev.progression) return prev
      return merged
    })
  }, [setSongSettings])

  const handleResetMaster = () => {
    const snapshot = { selectedPatterns, customPatterns, trackParams, bassParams, chordParams, arpParams, songSettings, mutedTracks, soloTracks, masterParams, busParams }
    setMasterParams(DEFAULT_MASTER_PARAMS)
    setBusParams(DEFAULT_BUS_PARAMS)
    showUndoToast('Reset master & FX', snapshot)
  }

  const handleResetComp = () => {
    const snapshot = { masterParams }
    setMasterParams(prev => ({ ...prev, compThreshold: -24, compRatio: 4, compAttack: 10, compRelease: 200 }))
    showUndoToast('Reset compressor', snapshot)
  }

  const handleResetEQ = () => {
    const snapshot = { masterParams }
    setMasterParams(prev => ({
      ...prev,
      eqLowFreq: 100, eqLowGain: 0, eqLowQ: 1,
      eqMidFreq: 1000, eqMidGain: 0, eqMidQ: 1,
      eqHighFreq: 8000, eqHighGain: 0, eqHighQ: 1,
    }))
    showUndoToast('Reset EQ', snapshot)
  }

  const handleResetFilter = () => {
    const snapshot = { masterParams }
    setMasterParams(prev => ({ ...prev, filterCutoff: 20000, filterReso: 0.7, filterBandwidth: undefined, filterSlope: 24, filterType: 0 }))
    showUndoToast('Reset filter', snapshot)
  }

  const handleResetReverb = () => {
    const snapshot = { busParams }
    setBusParams(prev => ({ ...prev, reverb: { ...DEFAULT_BUS_PARAMS.reverb } }))
    showUndoToast('Reset reverb', snapshot)
  }

  const handleResetDelay = () => {
    const snapshot = { busParams }
    setBusParams(prev => ({ ...prev, delay: { ...DEFAULT_BUS_PARAMS.delay } }))
    showUndoToast('Reset delay', snapshot)
  }

  // Show first 6 tracks (kick, snare, hihat, openHH, tom, clap)
  const visibleTracks = TRACKS.slice(0, 6)

  // Get bass track (id: 6)
  const bassTrack = TRACKS.find(t => t.id === 6)

  // Get chords track (id: 7)
  const chordsTrack = TRACKS.find(t => t.id === 7)

  // Check if any track is soloed
  const hasSolo = Object.values(soloTracks).some(v => v)

  // Track volumes aggregated for Mixer (per-track + melodic tracks)
  const trackVolumes = TRACKS.reduce((acc, t) => {
    if (t.id === 6) acc[6] = bassParams[6]?.volume ?? -6
    else if (t.id === 7) acc[7] = chordParams[7]?.volume ?? -10
    else if (t.id === 8) acc[8] = arpParams[8]?.volume ?? -6
    else acc[t.id] = trackParams[t.id]?.volume ?? 0
    return acc
  }, {})

  const handleMixerVolumeChange = (trackId, value) => {
    // Drums
    if ([1,2,3,4,5,9].includes(trackId)) {
      handleParamChange(trackId, { ...trackParams[trackId], volume: value })
      return
    }
    // Bass
    if (trackId === 6) {
      handleBassParamChange(6, { ...bassParams[6], volume: value })
      return
    }
    if (trackId === 7) {
      handleChordParamChange(7, { ...chordParams[7], volume: value })
      return
    }
    if (trackId === 8) {
      handleArpParamChange(8, { ...arpParams[8], volume: value })
      return
    }
  }

  const handleMasterVolumeChange = (value) => {
    setMasterParams(prev => ({ ...prev, volume: value }))
  }

  const handleEnterApp = async () => {
    // El primer gesto del usuario debe iniciar el audio en la mayoría de navegadores.
    try {
      await startTone?.()
    } finally {
      setStartupPhase('leaving')
      window.setTimeout(() => setShowStartup(false), 520)
    }
  }

  return (
  <div className={`app-container ${showStartup ? 'has-startup' : ''}`}>
      {showStartup && (
        <div className={`startup-screen ${startupPhase === 'leaving' ? 'is-leaving' : ''}`} role="dialog" aria-label="Pantalla de inicio">
          <div className="startup-card">
            <div className="startup-title">jsgroovebox</div>
            <div className="startup-subtitle">Una caja de ritmos en el navegador.</div>
            <div className="startup-hint">
              Para evitar bloqueos de audio, tocá “Entrar” para habilitar el sonido.
            </div>

            <button className="startup-cta" onClick={handleEnterApp}>
              Entrar
            </button>

            <div className="startup-footnote">Tip: usá audífonos o parlantes para una mejor experiencia.</div>
          </div>
        </div>
      )}

      {/* Moved HeaderRow to be a direct child of .app-container so it is not affected by .tracks-container blur */}
      {toneStarted && (
        <HeaderRow
          isPlaying={isPlaying}
          onTogglePlay={async () => {
            // Ensure audio context started before toggling play
            if (!toneStarted) await startTone()
            togglePlay()
          }}
          perf={perfStats}
          onResetDefaults={handleResetDefaults}
          startTone={startTone}
          toneStarted={toneStarted}
          bpm={bpm}
          onBpmChange={setBpm}
        />
      )}

      <div className="tracks-container">
        {toneStarted ? (
          <>
            {/* HeaderRow moved to app-container */}
            <div className="controls-row groovebox-section">
              <div className="controls-right">
                <MasterFX
                  masterParams={masterParams}
                  onMasterParamChange={setMasterParams}
                  busParams={busParams}
                  onBusParamChange={setBusParams}
                  meter={masterMeter}
                  masterNode={getMasterNode?.()}
                  onResetMaster={handleResetMaster}
                  onResetComp={handleResetComp}
                  onResetEQ={handleResetEQ}
                  onResetFilter={handleResetFilter}
                  onResetReverb={handleResetReverb}
                  onResetDelay={handleResetDelay}
                  activeResetTarget={lastResetTarget}
                />
              </div>
            </div>

            <Mixer
              trackVolumes={trackVolumes}
              mutedTracks={mutedTracks}
              soloTracks={soloTracks}
              onTrackVolumeChange={handleMixerVolumeChange}
              onMuteToggle={handleMuteToggle}
              onSoloToggle={handleSoloToggle}
              masterVolume={masterParams.volume ?? 0}
              onMasterVolumeChange={handleMasterVolumeChange}
              busParams={busParams}
              onBusParamChange={setBusParams}
              activeTracks={activeTracks}
              masterMeter={masterMeter}
            />

            <Secuenciador
              showToast={showUndoToast}
              onChordStepsChange={setChordSteps}
              onSongSettingsChange={handleSongSettingsChange}
              currentStep={getCurrentChordStep?.() ?? 0}
              isPlaying={isPlaying}
              selectedPatterns={selectedPatterns}
              customPatterns={customPatterns}
              onPatternChange={handlePatternChange}
              onCustomPatternChange={handleCustomPatternChange}
            />

            <div className="tracks-grid groovebox-section">
              {visibleTracks.map((track) => (
                <Track
                  key={track.id}
                  track={track}
                  onReset={handleResetTrack}
                  activeResetTarget={lastResetTarget}
                  isActive={activeTracks[track.id] || false}
                  trackParams={trackParams[track.id]}
                  isPlaying={isPlaying}
                  isMuted={mutedTracks[track.id] || false}
                  isSoloed={soloTracks[track.id] || false}
                  isAudible={hasSolo ? soloTracks[track.id] : !mutedTracks[track.id]}
                  onPlay={playTrack}
                  onParamChange={handleParamChange}
                  onMuteToggle={handleMuteToggle}
                  onSoloToggle={handleSoloToggle}
                  masterMeter={masterMeter}
                />
              ))}
              {/* Bass Synth Track */}
              {bassTrack && (
                <BassTrack
                  track={bassTrack}
                  onReset={handleResetBass}
                  activeResetTarget={lastResetTarget}
                  isActive={activeTracks[6] || false}
                  bassParams={bassParams[6]}
                  isPlaying={isPlaying}
                  isMuted={mutedTracks[6] || false}
                  isSoloed={soloTracks[6] || false}
                  isAudible={hasSolo ? soloTracks[6] : !mutedTracks[6]}
                  onPlay={playTrack}
                  onParamChange={handleBassParamChange}
                  onMuteToggle={handleMuteToggle}
                  onSoloToggle={handleSoloToggle}
                  masterMeter={masterMeter}
                />
              )}
              {/* Chord Synth Track */}
              {chordsTrack && (
                <ChordsTrack
                  track={chordsTrack}
                  onReset={handleResetChords}
                  activeResetTarget={lastResetTarget}
                  isActive={activeTracks[7] || false}
                  chordParams={chordParams[7]}
                  isPlaying={isPlaying}
                  isMuted={mutedTracks[7] || false}
                  isSoloed={soloTracks[7] || false}
                  isAudible={hasSolo ? soloTracks[7] : !mutedTracks[7]}
                  onPlay={playTrack}
                  onParamChange={handleChordParamChange}
                  onMuteToggle={handleMuteToggle}
                  onSoloToggle={handleSoloToggle}
                  masterMeter={masterMeter}
                />
              )}
              {/* Arp/Lead Synth Track */}
              {(() => {
                const arpTrack = TRACKS.find(t => t.id === 8)
                return arpTrack ? (
                  <ArpTrack
                    key={arpTrack.id}
                    track={arpTrack}
                    onReset={handleResetArp}
                    activeResetTarget={lastResetTarget}
                    isActive={activeTracks[8] || false}
                    arpParams={arpParams[8]}
                    isPlaying={isPlaying}
                    isMuted={mutedTracks[8] || false}
                    isSoloed={soloTracks[8] || false}
                    isAudible={hasSolo ? soloTracks[8] : !mutedTracks[8]}
                    onPlay={playTrack}
                    onParamChange={handleArpParamChange}
                    onMuteToggle={handleMuteToggle}
                    onSoloToggle={handleSoloToggle}
                    masterMeter={masterMeter}
                  />
                ) : null
              })()}
            </div>
            {toast && (
              <Toast
                message={toast.message}
                onUndo={handleUndo}
                onClose={clearPending}
              />
            )}
          </>
        ) : (
          <div className={`audio-fallback ${showStartup ? 'is-hidden' : ''}`}>
            <div className="audio-fallback-title">Audio bloqueado</div>
            <div className="audio-fallback-text">
              Tu navegador necesita un gesto para habilitar el sonido.
            </div>
            <button className="audio-fallback-button" onClick={startTone}>Habilitar audio</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

