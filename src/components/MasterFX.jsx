import { useState } from 'react'
import Knob from './Knob'
import MasterSoundVisualizer from './MasterSoundVisualizer'
import './MasterFX.css'

const MasterFX = ({
  masterParams,
  onMasterParamChange,
  busParams,
  onBusParamChange,
  meter,
  masterNode,
  onResetMaster,
  onResetComp,
  onResetEQ,
  onResetFilter,
  onResetReverb,
  onResetDelay,
  activeResetTarget,
}) => {
  const [fxCollapsed, setFxCollapsed] = useState(true)

  const linToDb = (v) => {
    if (typeof v !== 'number') return '-∞'
    const val = Math.max(1e-8, Math.abs(v))
    return `${Math.round(20 * Math.log10(val))} dB`
  }

  // Handlers to update master and bus parameters via the callbacks passed from parent
  const handleMaster = (key, value) => {
    // setMasterParams in App accepts either an object or an updater function
    onMasterParamChange?.(prev => ({ ...prev, [key]: value }))
  }

  const handleBus = (bus, key, value) => {
    onBusParamChange?.(prev => ({ ...prev, [bus]: { ...(prev?.[bus]), [key]: value } }))
  }

  return (
    <div className="masterfx">
      <div className="masterfx-header">
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div className="masterfx-name">MASTER</div>
          <button className="masterfx-reset" title="Reset master & FX" onClick={() => onResetMaster?.()}>⟲</button>
        </div>
        {/* master meter removed */}
        <div className="masterfx-sub">FX</div>
      </div>

      <div className="masterfx-visualizer">
        <MasterSoundVisualizer
          inputNode={masterNode}
          height={80}
          strokeColor="rgba(255,255,255,0.90)"
          isActive={true}
        />
      </div>

      <div className="masterfx-global">
        <div
          className="masterfx-global-header"
          role="button"
          tabIndex={0}
          aria-expanded={!fxCollapsed}
          aria-controls="global-fx-grid"
          onClick={() => setFxCollapsed(s => !s)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFxCollapsed(s => !s) } }}
        >
          <div className="masterfx-global-title">Global FX</div>
          <div className="masterfx-global-actions">
            <div
              className="masterfx-global-toggle"
              aria-hidden="true"
              title={fxCollapsed ? 'Show FX' : 'Hide FX'}
            >
              <span className={`chev ${fxCollapsed ? 'collapsed' : 'expanded'}`}>{fxCollapsed ? '▸' : '▾'}</span>
            </div>
          </div>
        </div>

        <div id="global-fx-grid" aria-hidden={fxCollapsed} className={`masterfx-body ${fxCollapsed ? 'collapsed' : 'expanded'}`}>
          <div className="masterfx-grid">


  <div className={`fx-strip eq ${activeResetTarget === 'eq' ? 'just-reset' : ''}`}>
          <div className="fx-strip-title">EQ <button className="fx-strip-reset" title="Reset EQ" onClick={() => onResetEQ?.()}>⟲</button></div>
          {/* visualization removed */}
          <div className="eq-bands">
            <div className="eq-band">
              <div className="eq-band-title">Low</div>
                <div className="knob-grid">
                  <Knob
                    label="Freq"
                    unit="Hz"
                    tooltip="Center frequency for low band"
                    value={masterParams?.eqLowFreq ?? 100}
                    min={20}
                    max={1000}
                    onChange={(v) => handleMaster('eqLowFreq', v)}
                    color="#4ecdc4"
                    size={44}
                  />
                  <Knob
                    label="Gain"
                    unit="dB"
                    tooltip="Gain for low band"
                    value={masterParams?.eqLowGain ?? 0}
                    min={-12}
                    max={12}
                    onChange={(v) => handleMaster('eqLowGain', v)}
                    color="#4ecdc4"
                    size={44}
                  />
                  <Knob
                    label="Q"
                    unit="Q"
                    tooltip="Bandwidth of the low band"
                    value={masterParams?.eqLowQ ?? 1}
                    min={0.1}
                    max={10}
                    onChange={(v) => handleMaster('eqLowQ', v)}
                    color="#4ecdc4"
                    size={44}
                  />
                </div>
            </div>

            <div className="eq-band">
              <div className="eq-band-title">Low Mid</div>
              <div className="knob-grid">
                <Knob
                  label="Freq"
                  unit="Hz"
                  tooltip="Center frequency for low mid band"
                  value={masterParams?.eqLowMidFreq ?? 300}
                  min={100}
                  max={1000}
                  onChange={(v) => handleMaster('eqLowMidFreq', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Gain"
                  unit="dB"
                  tooltip="Gain for low mid band"
                  value={masterParams?.eqLowMidGain ?? 0}
                  min={-12}
                  max={12}
                  onChange={(v) => handleMaster('eqLowMidGain', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Q"
                  unit="Q"
                  tooltip="Bandwidth of the low mid band"
                  value={masterParams?.eqLowMidQ ?? 1}
                  min={0.1}
                  max={10}
                  onChange={(v) => handleMaster('eqLowMidQ', v)}
                  color="#4ecdc4"
                  size={44}
                />
              </div>
            </div>

            <div className="eq-band">
              <div className="eq-band-title">Mid</div>
              <div className="knob-grid">
                <Knob
                  label="Freq"
                  unit="Hz"
                  tooltip="Center frequency for mid band"
                  value={masterParams?.eqMidFreq ?? 1000}
                  min={200}
                  max={5000}
                  onChange={(v) => handleMaster('eqMidFreq', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Gain"
                  unit="dB"
                  tooltip="Gain for mid band"
                  value={masterParams?.eqMidGain ?? 0}
                  min={-12}
                  max={12}
                  onChange={(v) => handleMaster('eqMidGain', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Q"
                    unit="Q"
                    tooltip="Bandwidth of the mid band"
                    value={masterParams?.eqMidQ ?? 1}
                    min={0.1}
                    max={10}
                    onChange={(v) => handleMaster('eqMidQ', v)}
                    color="#4ecdc4"
                    size={44}
                />
              </div>
            </div>

            <div className="eq-band">
              <div className="eq-band-title">High Mid</div>
              <div className="knob-grid">
                <Knob
                  label="Freq"
                  unit="Hz"
                  tooltip="Center frequency for high mid band"
                  value={masterParams?.eqHighMidFreq ?? 3000}
                  min={1000}
                  max={8000}
                  onChange={(v) => handleMaster('eqHighMidFreq', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Gain"
                  unit="dB"
                  tooltip="Gain for high mid band"
                  value={masterParams?.eqHighMidGain ?? 0}
                  min={-12}
                  max={12}
                  onChange={(v) => handleMaster('eqHighMidGain', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Q"
                  unit="Q"
                  tooltip="Bandwidth of the high mid band"
                  value={masterParams?.eqHighMidQ ?? 1}
                  min={0.1}
                  max={10}
                  onChange={(v) => handleMaster('eqHighMidQ', v)}
                  color="#4ecdc4"
                  size={44}
                />
              </div>
            </div>

            <div className="eq-band">
              <div className="eq-band-title">High</div>
              <div className="knob-grid">
                <Knob
                  label="Freq"
                  unit="Hz"
                  tooltip="Center frequency for high band"
                  value={masterParams?.eqHighFreq ?? 8000}
                  min={2000}
                  max={20000}
                  onChange={(v) => handleMaster('eqHighFreq', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Gain"
                  unit="dB"
                  tooltip="Gain for high band"
                  value={masterParams?.eqHighGain ?? 0}
                  min={-12}
                  max={12}
                  onChange={(v) => handleMaster('eqHighGain', v)}
                  color="#4ecdc4"
                  size={44}
                />
                <Knob
                  label="Q"
                  unit="Q"
                  tooltip="Bandwidth of the high band"
                  value={masterParams?.eqHighQ ?? 1}
                  min={0.1}
                  max={10}
                  onChange={(v) => handleMaster('eqHighQ', v)}
                  color="#4ecdc4"
                  size={44}
                />
              </div>
            </div>
          </div>
          {/* EQViz already shown at top of this strip */}
        </div>
  <div className={`fx-strip ${activeResetTarget === 'filter' ? 'just-reset' : ''}`}>
          <div className="fx-strip-title">FILTER <button className="fx-strip-reset" title="Reset filter" onClick={() => onResetFilter?.()}>⟲</button></div>
          {/* filter visualization removed */}
          <div className="knob-grid">
            <Knob
              label="Cutoff"
              unit="Hz"
              tooltip="Frequency where the filter starts to attenuate"
              value={masterParams?.filterCutoff ?? 20000}
              min={40}
              max={20000}
              onChange={(v) => handleMaster('filterCutoff', v)}
              color="#ffd166"
            />
            {/* Dynamic control: resonance (Q) for LP/HP, width (Hz) for BP/Notch */}
            {((masterParams?.filterType ?? 0) === 2 || (masterParams?.filterType ?? 0) === 3) ? (
              <Knob
                label="Width"
                unit="Hz"
                tooltip="Absolute bandwidth for bandpass/notch (Hz)"
                value={masterParams?.filterBandwidth ?? 1000}
                min={20}
                max={8000}
                onChange={(v) => handleMaster('filterBandwidth', v)}
                color="#ffd166"
              />
            ) : (
              <Knob
                label="Resonance"
                unit="Q"
                tooltip="Emphasis around the cutoff (Q)"
                value={masterParams?.filterReso ?? 0.7}
                min={0.1}
                max={20}
                onChange={(v) => handleMaster('filterReso', v)}
                color="#ffd166"
              />
            )}
          </div>

          {/* visualization is shown at the top of the strip */}

          <div className="filter-slope">
            <label className="filter-slope-label">Slope</label>
            <div className="segmented" role="tablist" aria-label="Filter slope">
              {[12, 24, 36, 48].map((d) => (
                <button
                  key={d}
                  className={"segmented-btn" + ((masterParams?.filterSlope ?? 24) === d ? ' active' : '')}
                  onClick={() => handleMaster('filterSlope', d)}
                >
                  {d}dB
                </button>
              ))}
            </div>
          </div>
          <div className="filter-type">
            <div className="filter-type-label">Type</div>
            <div className="segmented" role="tablist" aria-label="Filter type">
              {[["Lowpass","LP"], ["Highpass","HP"], ["Bandpass","BP"], ["Notch","NT"]].map(([t, short], i) => (
                <button
                  key={t}
                  className={"segmented-btn" + ((masterParams?.filterType ?? 0) === i ? ' active' : '')}
                  onClick={() => {
                    // Adjust cutoff/resonance when switching to types that make more sense in a narrower band
                    const fp = masterParams ?? {}
                    const next = {
                      ...fp,
                      filterType: i,
                    }
                    // Reasonable defaults when switching to band-focused filters
                    if (i === 2) {
                      // Bandpass: prefer midrange if cutoff is very high/low
                      if ((fp.filterCutoff ?? 20000) > 12000) next.filterCutoff = 1000
                      next.filterReso = Math.max(1, fp.filterReso ?? 1)
                    }
                    if (i === 3) {
                      // Notch: prefer midrange
                      if ((fp.filterCutoff ?? 20000) > 12000) next.filterCutoff = 1000
                      next.filterReso = Math.max(1, fp.filterReso ?? 1)
                    }
                    handleMaster('filterType', i)
                    // push adjusted cutoff/reso if we changed them
                    if (next.filterCutoff !== fp.filterCutoff) handleMaster('filterCutoff', next.filterCutoff)
                    if (next.filterReso !== fp.filterReso) handleMaster('filterReso', next.filterReso)
                  }}
                  title={t}
                  aria-pressed={(masterParams?.filterType ?? 0) === i}
                >
                  {short}
                </button>
              ))}
            </div>
          </div>
        </div>

  <div className={`fx-strip ${activeResetTarget === 'reverb' ? 'just-reset' : ''}`}>
    <div className="fx-strip-title">REVERB <button className="fx-strip-reset" title="Reset reverb" onClick={() => onResetReverb?.()}>⟲</button></div>
          <div className="fx-strip-sub">
            <span className={`fx-led ${((function(v){ if (v === undefined) return false; if (Math.abs(v) <= 2) return Math.abs(v) > 1e-3; return v > -60; })(meter?.reverbVal)) ? 'on' : ''}`}></span>
            <span className="fx-strip-in">In: {linToDb(meter?.reverbVal)}</span>
          </div>
          <div className="reverb-type">
            <div className="filter-type-label">Type</div>
            <div className="segmented" role="tablist" aria-label="Reverb type">
              {["Hall","Plate","Room"].map((t) => {
                const key = t.toLowerCase()
                return (
                  <button
                    key={t}
                    className={"segmented-btn" + ((busParams?.reverb?.type ?? 'hall') === key ? ' active' : '')}
                    onClick={() => handleBus('reverb', 'type', key)}
                    title={t}
                    aria-pressed={(busParams?.reverb?.type ?? 'hall') === key}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="knob-grid">
            <Knob
              label="Vol"
              value={busParams?.reverb?.wet ?? 0.2}
              min={0}
              max={0.9}
              onChange={(v) => handleBus('reverb', 'wet', v)}
              color="#60a5fa"
            />
            <Knob
              label="Decay"
              value={busParams?.reverb?.decay ?? 1.8}
              min={0.2}
              max={8}
              onChange={(v) => handleBus('reverb', 'decay', v)}
              color="#60a5fa"
            />
            <Knob
              label="Pre"
              value={busParams?.reverb?.preDelay ?? 0.01}
              min={0}
              max={0.2}
              onChange={(v) => handleBus('reverb', 'preDelay', v)}
              color="#60a5fa"
            />
            <Knob
              label="Tone"
              unit="Hz"
              tooltip="Brightness / damping (lowpass on reverb output)"
              value={busParams?.reverb?.tone ?? 8000}
              min={500}
              max={20000}
              onChange={(v) => handleBus('reverb', 'tone', v)}
              color="#60a5fa"
            />
          </div>
        </div>
  <div className={`fx-strip ${activeResetTarget === 'delay' ? 'just-reset' : ''}`}>
          <div className="fx-strip-title">DELAY <button className="fx-strip-reset" title="Reset delay" onClick={() => onResetDelay?.()}>⟲</button></div>
          <div className="fx-strip-sub">
            <span className={`fx-led ${((function(v){ if (v === undefined) return false; if (Math.abs(v) <= 2) return Math.abs(v) > 1e-3; return v > -60; })(meter?.delayVal)) ? 'on' : ''}`}></span>
            <span className="fx-strip-in">In: {linToDb(meter?.delayVal)}</span>
          </div>
          <div className="delay-type-sync-row">
            <div className="delay-type">
              <div className="filter-type-label">Type</div>
              <div className="segmented" role="tablist" aria-label="Delay type">
                {[["Feedback","feedback"],["PingPong","pingpong"]].map(([label, key]) => (
                  <button
                    key={key}
                    className={"segmented-btn" + ((busParams?.delay?.type ?? 'feedback') === key ? ' active' : '')}
                    onClick={() => handleBus('delay', 'type', key)}
                    title={label}
                    aria-pressed={(busParams?.delay?.type ?? 'feedback') === key}
                  >
                    {label === 'PingPong' ? 'PP' : label[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="delay-sync">
              <div className="filter-type-label">Sync</div>
              <div className="segmented" role="tablist" aria-label="Delay sync">
                {[['Free', false], ['Sync', true]].map(([label, val]) => (
                  <button
                    key={label}
                    className={"segmented-btn" + ((busParams?.delay?.sync ?? false) === val ? ' active' : '')}
                    onClick={() => handleBus('delay', 'sync', val)}
                    title={label}
                    aria-pressed={(busParams?.delay?.sync ?? false) === val}
                  >{label[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="knob-grid">
            <Knob
              label="Vol"
              value={busParams?.delay?.wet ?? 0.15}
              min={0}
              max={0.9}
              onChange={(v) => handleBus('delay', 'wet', v)}
              color="#34d399"
            />
            <Knob
              label="FB"
              value={busParams?.delay?.feedback ?? 0.25}
              min={0}
              max={0.85}
              onChange={(v) => handleBus('delay', 'feedback', v)}
              color="#34d399"
            />
            <Knob
              label="Time"
              value={busParams?.delay?.time ?? 0.25}
              min={0.05}
              max={0.75}
              onChange={(v) => handleBus('delay', 'time', v)}
              color="#34d399"
            />
            <Knob
              label="Filter"
              unit="Hz"
              tooltip="Lowpass on delay repeats"
              value={busParams?.delay?.filter ?? 8000}
              min={200}
              max={12000}
              onChange={(v) => handleBus('delay', 'filter', v)}
              color="#34d399"
            />
          </div>
          {busParams?.delay?.sync ? (
            <div className="delay-division">
              <div className="filter-type-label">Division</div>
              <div className="segmented" role="tablist" aria-label="Delay division">
                {["4n","8n","8n.","16n"].map(d => (
                  <button
                    key={d}
                    className={"segmented-btn" + ((busParams?.delay?.division ?? '8n') === d ? ' active' : '')}
                    onClick={() => handleBus('delay', 'division', d)}
                    title={d}
                    aria-pressed={(busParams?.delay?.division ?? '8n') === d}
                  >{d}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
    <div className={`fx-strip comp ${activeResetTarget === 'comp' ? 'just-reset' : ''}`}>
          <div className="fx-strip-title">COMP <button className="fx-strip-reset" title="Reset compressor" onClick={() => onResetComp?.()}>⟲</button></div>
          {/* compressor visualization removed */}
          <div className="knob-grid">
            {/* Threshold: level where compression starts (dB) */}
            <Knob
              label="Threshold"
              unit="dB"
              tooltip="Level where compression starts"
              value={masterParams?.compThreshold ?? -24}
              min={-60}
              max={0}
              onChange={(v) => handleMaster('compThreshold', v)}
              color="#ff6b6b"
            />
            {/* Ratio: how strongly levels above threshold are reduced */}
            <Knob
              label="Ratio"
              unit="x"
              tooltip="Compression ratio (e.g., 4 means 4:1)"
              value={masterParams?.compRatio ?? 4}
              min={1}
              max={20}
              onChange={(v) => handleMaster('compRatio', v)}
              color="#ff6b6b"
            />
            {/* Attack: how fast the compressor reacts (ms) */}
            <Knob
              label="Attack"
              unit="ms"
              tooltip="How fast the compressor reacts (ms)"
              value={masterParams?.compAttack ?? 10}
              min={0.1}
              max={200}
              onChange={(v) => handleMaster('compAttack', v)}
              color="#ff6b6b"
            />
            {/* Release: how fast the compressor releases (ms) - a close 4th to Attack */}
            <Knob
              label="Release"
              unit="ms"
              tooltip="How fast the compressor releases (ms)"
              value={masterParams?.compRelease ?? 200}
              min={10}
              max={2000}
              onChange={(v) => handleMaster('compRelease', v)}
              color="#ff6b6b"
            />
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MasterFX
