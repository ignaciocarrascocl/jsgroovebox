import Knob from './Knob'
import './MasterFX.css'

const MasterFX = ({
  masterParams,
  onMasterParamChange,
  busParams,
  onBusParamChange,
  meter,
}) => {
  const handleMaster = (param, value) => {
    onMasterParamChange({ ...masterParams, [param]: value })
  }

  const handleBus = (bus, param, value) => {
    onBusParamChange({
      ...busParams,
      [bus]: {
        ...busParams?.[bus],
        [param]: value,
      },
    })
  }

  const peakDb = meter?.peakDb ?? -Infinity

  return (
    <div className="masterfx">
      <div className="masterfx-header">
        <div className="masterfx-name">MASTER</div>
        <div className="masterfx-meterbar">
          <div className="meterbar-bg" />
          <div
            className="meterbar-fill"
            style={{
              width: `${Math.min(100, Math.max(0, ((peakDb + 60) / 60) * 100))}%`,
            }}
          />
          <div className="meterbar-markers">
            {[-48, -36, -24, -12, -6, 0].map((db) => (
              <div key={db} className="meterbar-marker" style={{ left: `${((db + 60) / 60) * 100}%` }} />
            ))}
          </div>
        </div>
  <div className="masterfx-sub">FX</div>
      </div>

      <div className="masterfx-grid">
        <div className="fx-strip">
          <div className="fx-strip-title">COMP</div>
          <Knob
            label="Amount"
            value={masterParams?.compression ?? 0}
            min={0}
            max={1}
            onChange={(v) => handleMaster('compression', v)}
            color="#ff6b6b"
          />
          <Knob
            label="Makeup"
            value={masterParams?.compMakeup ?? 0}
            min={-12}
            max={12}
            onChange={(v) => handleMaster('compMakeup', v)}
            color="#ff6b6b"
          />
          <Knob
            label="Mix"
            value={masterParams?.compMix ?? 1}
            min={0}
            max={1}
            onChange={(v) => handleMaster('compMix', v)}
            color="#ff6b6b"
          />
        </div>

        <div className="fx-strip">
          <div className="fx-strip-title">EQ</div>
          <Knob
            label="Low"
            value={masterParams?.eqLow ?? 0}
            min={-12}
            max={12}
            onChange={(v) => handleMaster('eqLow', v)}
            color="#4ecdc4"
          />
          <Knob
            label="Mid"
            value={masterParams?.eqMid ?? 0}
            min={-12}
            max={12}
            onChange={(v) => handleMaster('eqMid', v)}
            color="#4ecdc4"
          />
          <Knob
            label="High"
            value={masterParams?.eqHigh ?? 0}
            min={-12}
            max={12}
            onChange={(v) => handleMaster('eqHigh', v)}
            color="#4ecdc4"
          />
        </div>

        <div className="fx-strip">
          <div className="fx-strip-title">VOLUME</div>
          <Knob
            label="Master"
            value={masterParams?.volume ?? 0}
            min={-60}
            max={6}
            onChange={(v) => handleMaster('volume', v)}
            color="#a78bfa"
          />
          <Knob
            label="Out"
            value={masterParams?.outGain ?? 0}
            min={-18}
            max={18}
            onChange={(v) => handleMaster('outGain', v)}
            color="#a78bfa"
          />
          <Knob
            label="Pan"
            value={masterParams?.pan ?? 0}
            min={-1}
            max={1}
            onChange={(v) => handleMaster('pan', v)}
            color="#a78bfa"
          />
        </div>

        <div className="fx-strip">
          <div className="fx-strip-title">FILTER</div>
          <Knob
            label="Cutoff"
            value={masterParams?.filterCutoff ?? 20000}
            min={40}
            max={20000}
            onChange={(v) => handleMaster('filterCutoff', v)}
            color="#ffd166"
          />
          <Knob
            label="Reso"
            value={masterParams?.filterReso ?? 0.7}
            min={0.1}
            max={12}
            onChange={(v) => handleMaster('filterReso', v)}
            color="#ffd166"
          />
          <Knob
            label="Drive"
            value={masterParams?.filterDrive ?? 0}
            min={0}
            max={1}
            onChange={(v) => handleMaster('filterDrive', v)}
            color="#ffd166"
          />
        </div>

        <div className="fx-strip">
          <div className="fx-strip-title">REVERB</div>
          <Knob
            label="Wet"
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
        </div>

        <div className="fx-strip">
          <div className="fx-strip-title">DELAY</div>
          <Knob
            label="Wet"
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
        </div>
      </div>
    </div>
  )
}

export default MasterFX
