import { useEffect, useState, useRef } from 'react'
import HeaderRow from './components/HeaderRow'
import Toast from './components/Toast'
import MasterFX from './components/MasterFX'
import Track from './components/Track'
import BassTrack from './components/BassTrack'
import ChordsTrack from './components/ChordsTrack'
import ArpTrack from './components/ArpTrack'
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

// Default bass parameters (sound only, key/progression are global)
const DEFAULT_BASS_PARAMS = {
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

// Default chord parameters (sound only, key/progression are global)
const DEFAULT_CHORD_PARAMS = {
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

// Default arpeggio/lead parameters (sound only)
const DEFAULT_ARP_PARAMS = {
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
  const [bassParams, setBassParams] = useState(DEFAULT_BASS_PARAMS)
  const [chordParams, setChordParams] = useState(DEFAULT_CHORD_PARAMS)
  const [arpParams, setArpParams] = useState(DEFAULT_ARP_PARAMS)
  const [songSettings, setSongSettings] = useState(DEFAULT_SONG_SETTINGS)
  const [mutedTracks, setMutedTracks] = useState({})
  const [soloTracks, setSoloTracks] = useState({})
  const [masterParams, setMasterParams] = useState(DEFAULT_MASTER_PARAMS)
  const [busParams, setBusParams] = useState(DEFAULT_BUS_PARAMS)
  
  const {
    toneStarted,
    isPlaying,
    uiStepPulse,
    getCurrentStep,
    getCurrentBassStep,
    getCurrentChordStep,
    getCurrentArpStep,
    bpm,
    setBpm,
    activeTracks,
    startTone,
    togglePlay,
    playTrack,
    masterMeter,
  getMasterNode,
    setMasterParams: setEngineMasterParams,
    setBusParams: setEngineBusParams,
  perfStats,
  } = useAudioEngine(selectedPatterns, customPatterns, trackParams, mutedTracks, soloTracks, bassParams, chordParams, arpParams, songSettings)

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

  const handleProgressionChange = (progression) => {
    setSongSettings(prev => ({ ...prev, progression }))
  }

  const handleKeyChange = (key) => {
    setSongSettings(prev => ({ ...prev, key }))
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
    setBassParams(DEFAULT_BASS_PARAMS)
    setChordParams(DEFAULT_CHORD_PARAMS)
    setArpParams(DEFAULT_ARP_PARAMS)
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
    setBassParams(DEFAULT_BASS_PARAMS)
    setMutedTracks(prev => ({ ...prev, 6: false }))
    setSoloTracks(prev => ({ ...prev, 6: false }))
    showUndoToast('Reset bass', snapshot)
  }

  const handleResetChords = () => {
    const snapshot = { selectedPatterns, customPatterns, trackParams, bassParams, chordParams, arpParams, songSettings, mutedTracks, soloTracks, masterParams, busParams }
    setSelectedPatterns(prev => ({ ...prev, 7: DEFAULT_PATTERNS[7] ?? 0 }))
    setCustomPatterns(prev => ({ ...prev, 7: null }))
    setChordParams(DEFAULT_CHORD_PARAMS)
    setMutedTracks(prev => ({ ...prev, 7: false }))
    setSoloTracks(prev => ({ ...prev, 7: false }))
    showUndoToast('Reset chords', snapshot)
  }

  const handleResetArp = () => {
    const snapshot = { selectedPatterns, customPatterns, trackParams, bassParams, chordParams, arpParams, songSettings, mutedTracks, soloTracks, masterParams, busParams }
    setSelectedPatterns(prev => ({ ...prev, 8: DEFAULT_PATTERNS[8] ?? 0 }))
    setCustomPatterns(prev => ({ ...prev, 8: null }))
    setArpParams(DEFAULT_ARP_PARAMS)
    setMutedTracks(prev => ({ ...prev, 8: false }))
    setSoloTracks(prev => ({ ...prev, 8: false }))
    showUndoToast('Reset arp', snapshot)
  }

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

  const handleResetVolume = () => {
    const snapshot = { masterParams }
    setMasterParams(prev => ({ ...prev, volume: DEFAULT_MASTER_PARAMS.volume ?? 0 }))
    showUndoToast('Reset output level', snapshot)
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

      <div className="tracks-container">
        {toneStarted ? (
          <>
            <HeaderRow
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              perf={perfStats}
              onResetDefaults={handleResetDefaults}
              bpm={bpm}
              onBpmChange={setBpm}
              progression={songSettings.progression}
              onProgressionChange={handleProgressionChange}
              songKey={songSettings.key}
              onKeyChange={handleKeyChange}
            />

            <div className="controls-row">
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
                  onResetVolume={handleResetVolume}
                  onResetFilter={handleResetFilter}
                  onResetReverb={handleResetReverb}
                  onResetDelay={handleResetDelay}
                  activeResetTarget={lastResetTarget}
                />
              </div>
            </div>
            <div className="tracks-grid">
              {visibleTracks.map((track) => (
                <Track
                  key={track.id}
                  track={track}
                  onReset={handleResetTrack}
                  activeResetTarget={lastResetTarget}
                  isActive={activeTracks[track.id] || false}
                  selectedPattern={selectedPatterns[track.id]}
                  customPattern={customPatterns[track.id]}
                  trackParams={trackParams[track.id]}
                  currentStep={getCurrentStep?.() ?? 0}
                  isPlaying={isPlaying}
                  isMuted={mutedTracks[track.id] || false}
                  isSoloed={soloTracks[track.id] || false}
                  isAudible={hasSolo ? soloTracks[track.id] : !mutedTracks[track.id]}
                  onPlay={playTrack}
                  onPatternChange={handlePatternChange}
                  onCustomPatternChange={handleCustomPatternChange}
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
                  selectedPattern={selectedPatterns[6] ?? 0}
                  customPattern={customPatterns[6]}
                  bassParams={bassParams[6]}
                  currentStep={getCurrentBassStep?.() ?? 0}
                  isPlaying={isPlaying}
                  isMuted={mutedTracks[6] || false}
                  isSoloed={soloTracks[6] || false}
                  isAudible={hasSolo ? soloTracks[6] : !mutedTracks[6]}
                  onPlay={playTrack}
                  onPatternChange={handlePatternChange}
                  onCustomPatternChange={handleCustomPatternChange}
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
                  selectedPattern={selectedPatterns[7] ?? 0}
                  customPattern={customPatterns[7]}
                  chordParams={chordParams[7]}
                  currentStep={getCurrentChordStep?.() ?? 0}
                  isPlaying={isPlaying}
                  isMuted={mutedTracks[7] || false}
                  isSoloed={soloTracks[7] || false}
                  isAudible={hasSolo ? soloTracks[7] : !mutedTracks[7]}
                  onPlay={playTrack}
                  onPatternChange={handlePatternChange}
                  onCustomPatternChange={handleCustomPatternChange}
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
                    selectedPattern={selectedPatterns[8] ?? 0}
                    customPattern={customPatterns[8]}
                    arpParams={arpParams[8]}
                    currentStep={getCurrentArpStep?.() ?? 0}
                    isPlaying={isPlaying}
                    isMuted={mutedTracks[8] || false}
                    isSoloed={soloTracks[8] || false}
                    isAudible={hasSolo ? soloTracks[8] : !mutedTracks[8]}
                    onPlay={playTrack}
                    onPatternChange={handlePatternChange}
                    onCustomPatternChange={handleCustomPatternChange}
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

