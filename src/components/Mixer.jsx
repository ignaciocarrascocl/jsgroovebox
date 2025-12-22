import React from 'react';
import Fader from './Fader';
import './Mixer.css';

const Mixer = () => {
  const tracks = [
    'Kick', 'Snare', 'HiHat', 'OHat', 'Tom', 'Clap', 'Bass', 'Chords', 'Arp'
  ];

  const buses = ['Bus 1', 'Bus 2'];
  const master = 'Master';

  // Mock volume values for now (will be connected to actual audio later)
  const mockVolumes = {
    Kick: -6, Snare: -3, HiHat: -8, OHat: -10, Tom: -5, Clap: -6, Bass: -6, Chords: -10, Arp: -6,
    'Bus 1': -6, 'Bus 2': -6, Master: 0
  };

  // Mock meter levels for now
  const mockLevels = {
    Kick: -12, Snare: -8, HiHat: -15, OHat: -18, Tom: -10, Clap: -14, Bass: -6, Chords: -12, Arp: -9,
    'Bus 1': -10, 'Bus 2': -12, Master: -3
  };

  const handleVolumeChange = (trackName, value) => {
    // TODO: Connect to actual audio engine
    console.log(`${trackName} volume changed to: ${value}`);
  };

  const compactColorForLevel = (level) => {
    if (level >= 0) return '#ff4444';
    if (level >= -6) return '#ffaa44';
    return '#44ff44';
  }

  return (
    <div className="mixer-container">
      <div className="mixer-header">
        <div className="mixer-title">Mixer</div>
        <div className="mixer-legend" aria-hidden>
          <div className="legend-item"><span className="legend-pill mute-pill">M</span><small>Mute</small></div>
          <div className="legend-item"><span className="legend-pill solo-pill">S</span><small>Solo</small></div>
        </div>
      </div>

      {tracks.map((track, index) => (
        <div key={index} className="mixer-channel compact-channel">
          <div className="channel-strip">
            <div className="channel-top">
              <div className="channel-label" title={track}>{track}</div>
            </div>

            <div className="channel-body compact-body">
              <div className="compact-indicator" title={`${mockLevels[track]} dB`} aria-label={`${mockLevels[track]} dB`}> 
                <div className="mini-led" style={{ background: compactColorForLevel(mockLevels[track]) }} />
              </div>

              <Fader
                label=""
                value={mockVolumes[track]}
                min={-60}
                max={12}
                onChange={(value) => handleVolumeChange(track, value)}
                color="#44ff44"
              />
            </div>

            <div className="channel-footer">
              <div className="channel-db">{mockVolumes[track] <= -60 ? '-∞' : `${Math.round(mockVolumes[track])} dB`}</div>
              <div className="channel-buttons">
                <button className="mute-btn" aria-label={`Mute ${track}`}>M</button>
                <button className="solo-btn" aria-label={`Solo ${track}`}>S</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {buses.map((bus, index) => (
        <div key={`bus-${index}`} className="mixer-channel bus-channel compact-channel">
          <div className="channel-strip">
            <div className="channel-top">
              <div className="channel-label" title={bus}>{bus}</div>
            </div>

            <div className="channel-body compact-body">
              <div className="compact-indicator" title={`${mockLevels[bus]} dB`} aria-label={`${mockLevels[bus]} dB`}>
                <div className="mini-led" style={{ background: compactColorForLevel(mockLevels[bus]) }} />
              </div>

              <Fader
                label=""
                value={mockVolumes[bus]}
                min={-60}
                max={12}
                onChange={(value) => handleVolumeChange(bus, value)}
                color="#ffaa44"
              />
            </div>

            <div className="channel-footer">
              <div className="channel-db">{mockVolumes[bus] <= -60 ? '-∞' : `${Math.round(mockVolumes[bus])} dB`}</div>
              <div className="channel-buttons">
                <button className="mute-btn" aria-label={`Mute ${bus}`}>M</button>
                <button className="solo-btn" aria-label={`Solo ${bus}`}>S</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="mixer-channel master-channel compact-channel">
        <div className="channel-strip">
          <div className="channel-top">
            <div className="channel-label" title={master}>{master}</div>
          </div>

          <div className="channel-body compact-body">
            <div className="compact-indicator" title={`${mockLevels[master]} dB`} aria-label={`${mockLevels[master]} dB`}>
              <div className="mini-led" style={{ background: compactColorForLevel(mockLevels[master]) }} />
            </div>

            <Fader
              label=""
              value={mockVolumes[master]}
              min={-60}
              max={12}
              onChange={(value) => handleVolumeChange(master, value)}
              color="#ff4444"
            />
          </div>

          <div className="channel-footer">
            <div className="channel-db">{mockVolumes[master] <= -60 ? '-∞' : `${Math.round(mockVolumes[master])} dB`}</div>
            <div className="channel-buttons">
              <button className="mute-btn" aria-label={`Mute ${master}`}>M</button>
              <button className="solo-btn" aria-label={`Solo ${master}`}>S</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mixer;
