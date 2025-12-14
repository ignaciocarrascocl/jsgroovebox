import { useState } from 'react'
import TransportControls from './components/TransportControls'
import SongSettings from './components/SongSettings'
import Track from './components/Track'
import BassTrack from './components/BassTrack'
import ChordsTrack from './components/ChordsTrack'
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
    filter: 2500, 
    resonance: 2, 
    detune: 5,
    lfoRate: 0,
    lfoDepth: 0,
    compression: 0.3,
    fm: 0,
    fmHarmonicity: 1,
    reverb: 0.2,
    delay: 0
  },
}

// Default song settings (global for all melodic tracks)
const DEFAULT_SONG_SETTINGS = {
  key: 'C',
  progression: 0,
}

function App() {
  const [selectedPatterns, setSelectedPatterns] = useState(DEFAULT_PATTERNS)
  const [customPatterns, setCustomPatterns] = useState({})
  const [trackParams, setTrackParams] = useState(DEFAULT_TRACK_PARAMS)
  const [bassParams, setBassParams] = useState(DEFAULT_BASS_PARAMS)
  const [chordParams, setChordParams] = useState(DEFAULT_CHORD_PARAMS)
  const [songSettings, setSongSettings] = useState(DEFAULT_SONG_SETTINGS)
  const [mutedTracks, setMutedTracks] = useState({})
  const [soloTracks, setSoloTracks] = useState({})
  
  const {
    toneStarted,
    isPlaying,
    currentStep,
    currentBassStep,
    currentChordStep,
    bpm,
    setBpm,
    activeTracks,
    startTone,
    togglePlay,
    playTrack,
  } = useAudioEngine(selectedPatterns, customPatterns, trackParams, mutedTracks, soloTracks, bassParams, chordParams, songSettings)

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

  const handleKeyChange = (key) => {
    setSongSettings(prev => ({ ...prev, key }))
  }

  const handleProgressionChange = (progression) => {
    setSongSettings(prev => ({ ...prev, progression }))
  }

  // Calculate current bar (0-3) from bass step
  const currentBar = Math.floor(currentBassStep / 16)

  // Show first 6 tracks (kick, snare, hihat, openHH, tom, clap)
  const visibleTracks = TRACKS.slice(0, 6)
  
  // Get bass track (id: 6)
  const bassTrack = TRACKS.find(t => t.id === 6)
  
  // Get chords track (id: 7)
  const chordsTrack = TRACKS.find(t => t.id === 7)
  
  // Check if any track is soloed
  const hasSolo = Object.values(soloTracks).some(v => v)

  return (
    <div className="app-container">
      <div className="tracks-container">
        {!toneStarted ? (
          <button className="start-button" onClick={startTone}>Start Audio</button>
        ) : (
          <>
            <div className="controls-row">
              <TransportControls
                isPlaying={isPlaying}
                currentStep={currentStep}
                bpm={bpm}
                onTogglePlay={togglePlay}
                onBpmChange={setBpm}
              />
              <SongSettings
                songKey={songSettings.key}
                progression={songSettings.progression}
                onKeyChange={handleKeyChange}
                onProgressionChange={handleProgressionChange}
                currentBar={currentBar}
                isPlaying={isPlaying}
              />
            </div>
            <div className="tracks-grid">
              {visibleTracks.map((track) => (
                <Track
                  key={track.id}
                  track={track}
                  isActive={activeTracks[track.id] || false}
                  selectedPattern={selectedPatterns[track.id]}
                  customPattern={customPatterns[track.id]}
                  trackParams={trackParams[track.id]}
                  currentStep={currentStep}
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
                />
              ))}
              {/* Bass Synth Track */}
              {bassTrack && (
                <BassTrack
                  track={bassTrack}
                  isActive={activeTracks[6] || false}
                  selectedPattern={selectedPatterns[6] ?? 0}
                  customPattern={customPatterns[6]}
                  bassParams={bassParams[6]}
                  currentStep={currentBassStep}
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
                />
              )}
              {/* Chord Synth Track */}
              {chordsTrack && (
                <ChordsTrack
                  track={chordsTrack}
                  isActive={activeTracks[7] || false}
                  selectedPattern={selectedPatterns[7] ?? 0}
                  customPattern={customPatterns[7]}
                  chordParams={chordParams[7]}
                  currentStep={currentChordStep}
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
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App

