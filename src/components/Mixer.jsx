import React from 'react';
import Fader from './Fader';
import './Mixer.css';
import { TRACKS } from '../constants/tracks'

const Mixer = ({
  trackVolumes = {},
  mutedTracks = {},
  soloTracks = {},
  onTrackVolumeChange = () => {},
  onMuteToggle = () => {},
  onSoloToggle = () => {},
  masterVolume = 0,
  onMasterVolumeChange = () => {},
  busParams = {},
  onBusParamChange = () => {},
  masterMeter = {},
  activeTracks = {},
}) => {
  const buses = [ { key: 'reverb', label: 'Reverb' }, { key: 'delay', label: 'Delay' } ];

  const meterToDb = (v) => {
    if (typeof v !== 'number') return -120
    if (Math.abs(v) <= 2) return Math.round(20 * Math.log10(Math.max(1e-8, Math.abs(v))))
    return Math.max(-120, Math.min(12, Math.round(v)))
  }

  const dbToNormalized = (db) => {
    // map [-60..0+] -> [0..1]
    const n = (db + 60) / 60
    return Math.max(0, Math.min(1, n))
  }

  const ledStyleFromDb = (db) => {
    const n = dbToNormalized(db)
    const hue = 120 - n * 120 // green -> red
    const light = `${45 + n * 25}%`
    const color = `hsl(${hue}, 85%, ${light})`
    const glow = `0 0 ${4 + n * 18}px ${color.replace(')', ', 0.55)')}`
    return { background: color, boxShadow: glow }
  }

  return (
    <div className="mixer-container groovebox-section">
      <div className="mixer-header">
        <div className="mixer-title">Mixer</div>
        <div className="mixer-legend" aria-hidden>
          <div className="legend-item"><span className="legend-pill mute-pill">M</span><small>Mute</small></div>
          <div className="legend-item"><span className="legend-pill solo-pill">S</span><small>Solo</small></div>
        </div>
      </div>

      {TRACKS.map((track) => (
        <div key={track.id} className="mixer-channel compact-channel">
          <div className="channel-strip">
            <div className="channel-top">
              <div className="channel-label" title={track.name}>{track.name}</div>
            </div>

            <div className="channel-body compact-body">
              {(() => {
                const db = masterMeter?.trackLevels?.[track.id]
                const hasDb = (typeof db === 'number' && db > -119)
                const style = hasDb ? ledStyleFromDb(db) : (activeTracks[track.id] ? { background: '#f1c40f', boxShadow: '0 0 12px rgba(241,196,15,0.9)' } : { background: 'rgba(255,255,255,0.06)' })
                const title = hasDb ? `${Math.round(db)} dB` : (activeTracks[track.id] ? 'Activity' : '')
                return (
                  <div className="compact-indicator" title={title} aria-label={title}>
                    <div className="mini-led" style={style} />
                  </div>
                )
              })()}

              <Fader
                label=""
                value={typeof trackVolumes[track.id] === 'number' ? trackVolumes[track.id] : 0}
                min={-60}
                max={12}
                onChange={(value) => onTrackVolumeChange(track.id, Math.round(value))}
                color={track.color}
              />
            </div>

            <div className="channel-footer">
              <div className="channel-db">{(typeof trackVolumes[track.id] === 'number' && trackVolumes[track.id] <= -60) ? '-∞' : `${Math.round(trackVolumes[track.id] ?? 0)} dB`}</div>
              <div className="channel-buttons">
                <button className={`mute-btn ${mutedTracks[track.id] ? 'active' : ''}`} aria-label={`Mute ${track.name}`} onClick={() => onMuteToggle(track.id)}>M</button>
                <button className={`solo-btn ${soloTracks[track.id] ? 'active' : ''}`} aria-label={`Solo ${track.name}`} onClick={() => onSoloToggle(track.id)}>S</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {buses.map((bus, index) => (
        <div key={`bus-${index}`} className="mixer-channel bus-channel compact-channel">
          <div className="channel-strip">
            <div className="channel-top">
              <div className="channel-label" title={bus.label}>{bus.label}</div>
            </div>

            <div className="channel-body compact-body">
              {/* bus meter (real value from audio engine) */}
              <div className="compact-indicator" title={`${Math.round(meterToDb(bus.key === 'reverb' ? masterMeter?.reverbVal : masterMeter?.delayVal))} dB`} aria-label={`${Math.round(meterToDb(bus.key === 'reverb' ? masterMeter?.reverbVal : masterMeter?.delayVal))} dB`}>
                <div className="mini-led" style={ledStyleFromDb(meterToDb(bus.key === 'reverb' ? masterMeter?.reverbVal : masterMeter?.delayVal))} />
              </div>

              <Fader
                label=""
                value={(busParams?.[bus.key]?.wet ?? 0)}
                min={0}
                max={1}
                onChange={(value) => onBusParamChange?.(prev => ({ ...prev, [bus.key]: { ...(prev?.[bus.key]), wet: Math.max(0, Math.min(1, value)) } }))}
                color="#ffaa44"
              />
            </div>

            <div className="channel-footer">
              <div className="channel-db">{Math.round((busParams?.[bus.key]?.wet ?? 0) * 100)}%</div>
               <div className="channel-buttons">
                <button className="mute-btn" aria-label={`Mute ${bus.label}`}>M</button>
                <button className="solo-btn" aria-label={`Solo ${bus.label}`}>S</button>
               </div>
             </div>
           </div>
         </div>
       ))}

      <div className="mixer-channel master-channel compact-channel">
        <div className="channel-strip">
          <div className="channel-top">
            <div className="channel-label" title={'Master'}>{'Master'}</div>
          </div>

          <div className="channel-body compact-body">
            <div className="compact-indicator" title={`${Math.round(masterMeter?.peakDb ?? -120)} dB`} aria-label={`${Math.round(masterMeter?.peakDb ?? -120)} dB`}>
              <div className="mini-led" style={ledStyleFromDb(masterMeter?.peakDb ?? -120)} />
            </div>

            <Fader
              label=""
              value={masterVolume}
              min={-60}
              max={12}
              onChange={(value) => onMasterVolumeChange(Math.round(value))}
              color="#ff4444"
            />
          </div>

          <div className="channel-footer">
            <div className="channel-db">{masterVolume <= -60 ? '-∞' : `${Math.round(masterVolume)} dB`}</div>
            <div className="channel-buttons">
               <button className="mute-btn" aria-label={`Mute Master`}>M</button>
               <button className="solo-btn" aria-label={`Solo Master`}>S</button>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default Mixer;
