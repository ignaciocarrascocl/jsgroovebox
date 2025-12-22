# jsgroovebox

Groovebox / secuenciador en el navegador hecho con **React + Vite** y motor de audio con **Tone.js**.

Incluye:

- Secuenciación por pasos (patrones) para varias pistas.
- Pistas dedicadas para **bajo** y **acordes** con progresiones.
- Controles por pista (volumen, filtro, envolvente, FX, swing, etc.).
- Efectos de master/bus y visualizadores (p. ej. WaveSurfer).

> Nota: por políticas de los navegadores, el audio suele requerir una interacción del usuario (click/tap) antes de poder iniciar.

## Requisitos

- Node.js (recomendado: LTS).

## Instalación

```bash
npm install
```

## Uso

### Desarrollo

```bash
npm run dev
```

### Build de producción

```bash
npm run build
```

### Preview del build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Estructura del proyecto

- `src/App.jsx`: composición principal de la UI.
- `src/hooks/useAudioEngine.js`: motor de audio y secuenciador (Tone.js). Aquí se crean instrumentos, rutas, scheduling y medición.
- `src/components/`: componentes UI (tracks, knobs/faders, transport, visualizadores, etc.).
- `src/constants/`: presets y datos (patrones, tracks, progresiones, parámetros por defecto).
- `public/`: assets estáticos.

## Audio (alto nivel)

El hook `useAudioEngine` mantiene el estado del transporte y usa **refs** para almacenar patrones y parámetros sin provocar re-renders innecesarios mientras el audio corre.

Conceptos clave:

- `Tone.Transport` controla BPM y sincronización.
- Los patrones vienen de `src/constants/*` y/o ediciones desde la UI.
- Para evitar clicks, varios parámetros se actualizan con rampas (por ejemplo `rampTo`).

## Parámetros por track (detalle)

La UI controla los parámetros, y el motor los aplica en tiempo real en `src/hooks/useAudioEngine.js` (sin recrear sintes).

### Tracks de percusión (`Track.jsx`, ids 1/2/3/4/5/9)

Los tracks de percusión comparten la misma “pestaña” de knobs. Internamente cada track es un sinte distinto:

- Kick (id `1`): `Tone.MembraneSynth`
- Snare (id `2`): `Tone.NoiseSynth`
- HiHat (id `3`): `Tone.MetalSynth`
- Open HH (id `4`): `Tone.MetalSynth`
- Tom (id `5`): `Tone.MembraneSynth`
- Clap (id `9`): `Tone.NoiseSynth`

Los knobs (rango UI → comportamiento) son:

- `volume` (dB, aprox `-60..+6`): ganancia de la pista. Se aplica a `synth.volume.rampTo(...)`.
- `pitch` (semitonos): transpone la nota base usada al disparar el sinte.
	- Kick usa base `C1`, Tom usa `C2`, HiHat/OpenHH usan `C6`.
	- En snare/clap no hay tono “real” (son ruido), pero el código reutiliza `pitch` para mover la frecuencia del filtro (ver `useAudioEngine.js`).
- `attack` (segundos): ataque de la envolvente del sinte.
- `release` (segundos): en el motor se usa como decay/release percusivo via `applyPercEnvelope(...)`.
- `filter` (Hz): frecuencia del filtro por pista.
	- Kick/Tom: `lowpass`.
	- HiHat/OpenHH: `highpass`.
	- Clap: `bandpass`.
	- Snare: `lowpass` (pero con “pitch mult” aplicado: `base * pitchToMultiplier(pitch)`).
- `reverb` (0..0.8): **send** a bus de reverb. Se aplica como `fx.reverbSend.gain`.
- `delay` (0..0.8): **send** a bus de delay. Se aplica como `fx.delaySend.gain`.
- `compression` (0..1): amount normalizado. Se mapea a threshold/ratio del `Tone.Compressor` de la pista vía `applyCompressionAmount(...)`.
- `swing` (0..1): retrasa ciertos pasos “offbeat” en la grilla de 16 pasos (pasos `2,6,10,14`).
	- Se calcula un offset: `swing * (duración_16n * 2/3)`.
	- Luego se dispara el evento en `time + swingOffset`.

### Track de bajo (`BassTrack.jsx`, id 6)

Sinte principal: `Tone.MonoSynth` + cadena por pista.

Parámetros:

- `volume` (dB): gain del sinte.
- `waveType` (`sine|triangle|sawtooth|square`): tipo de oscilador (se setea en `synth.oscillator.type`).
- `attack` (segundos): ataque de la envolvente del MonoSynth.
- `decay` (segundos): decay de la envolvente (el sustain/release se mantienen fijos en el motor).
- `filter` (Hz): cutoff del filtro del bajo (`Tone.Filter`, `lowpass`).
- `resonance` (Q, aprox `0.5..15`): resonancia del filtro.
- `detune` (cent/semitono en Tone, se usa el parámetro `detune` del sinte): “ancho” o desafinación.
- `lfoRate` (Hz, `0..10`): frecuencia del LFO.
- `lfoDepth` (Hz, `0..500`): profundidad del LFO aplicada al cutoff.
	- Se implementa ajustando `lfo.min`/`lfo.max` alrededor del `filter` actual.
- `compression` (0..1): compresión por pista (mismo mapeo que percusión).
- `reverb` (0..0.8): send a reverb bus.
- `delay` (0..0.8): send a delay bus.

Patrón de bajo:

- Grilla de 16 steps por compás que se repite.
- Cada step puede ser `0..3`: `0=rest`, `1=root`, `2=fifth`, `3=octave`.

### Track de acordes (`ChordsTrack.jsx`, id 7)

Sinte principal: `Tone.PolySynth(Tone.FMSynth)`.

Parámetros:

- `volume` (dB): gain del polysynth.
- `waveType`: tipo de oscilador del FMSynth (controla el timbre base).
- `attack` (segundos): ataque del envelope.
- `decay` (segundos): decay del envelope (sustain/release se fijan en el motor).
- `filter` (Hz): cutoff del filtro de la pista (`Tone.Filter`, `lowpass`).
- `resonance` (Q): resonancia del filtro.
- `detune`: desafinación del sinte.
- `lfoRate` / `lfoDepth`: LFO al cutoff (igual que bajo).
- `compression` (0..1): compresión por pista.
- `fm` (0..1): cantidad de FM. En el motor se convierte a `modulationIndex = 12 * fm`.
- `fmHarmonicity` (aprox `0.25..8`): relación armónica de la FM (más alto suele sonar más brillante/metálico).
- `reverb` / `delay`: sends a buses.

Patrón de acordes:

- Grilla de 16 steps por compás que se repite.
- Cada step puede ser `0..4`: `0=rest`, `1=triad`, `2=seventh`, `3=inversion`, `4=stab`.
- Duración: `stab` se toca corto (`16n`), el resto más largo (`4n`).

## Flujo esperado (UI → secuenciador → audio)

1) La UI mantiene estado en `App.jsx`:
	 - `selectedPatterns` y `customPatterns`
	 - `trackParams` (percusión)
	 - `bassParams` / `chordParams`
	 - `mutedTracks` / `soloTracks`
	 - `masterParams` / `busParams`

2) `App.jsx` llama al hook `useAudioEngine(...)` y le pasa esos estados.

3) El motor copia esos props a refs (`selectedPatternsRef`, `trackParamsRef`, etc.).
	 Esto permite que el callback del secuenciador lea el “valor actual” sin recrear el `Tone.Sequence`.

4) Al presionar **Start Audio**, se ejecuta `Tone.start()` y se construye toda la cadena:
	 - Sintetizadores por pista
	 - FX por pista (compresor + filtro + sends)
	 - Buses compartidos (reverb/delay)
	 - Cadena de master (compresión paralela + EQ + filtro + ganancia)

5) Al presionar Play:
	 - Se inicia `Tone.Transport` y el `Tone.Sequence` a `'16n'`.
	 - En cada step, el callback:
		 - Calcula swing por pista (si corresponde).
		 - Dispara cada instrumento si el patrón está activo y la pista está audible (mute/solo).
		 - Actualiza el “active track” para feedback visual.

## Efectos (ruteo real)

### Sends por pista → buses compartidos

Cada pista tiene dos nodos `Tone.Gain` que funcionan como *sends*:

- `fx.reverbSend` → `mixer.reverb`
- `fx.delaySend` → `mixer.delay`

El knob `reverb/delay` controla la ganancia del send. El bus tiene su retorno (`reverbReturn`, `delayReturn`) que vuelve al master input.

### Master

El master implementa **compresión paralela**:

- `masterInput` se divide en:
	- `masterDry`
	- `masterCompressor -> masterMakeup -> masterWet`
- `masterDry` y `masterWet` pasan por el mismo `EQ3` y `Filter` y se suman en `masterGain`.

Controles UI (componente `MasterFX.jsx`):

- `COMP.Amount` (`masterParams.compression`): amount 0..1 (mapea a threshold/ratio).
- `COMP.Makeup` (`compMakeup`, dB): ganancia post-compresión (en el wet).
- `COMP.Mix` (`compMix`, 0..1): crossfade entre dry/wet.
- `EQ.Low/Mid/High` (`eqLow/eqMid/eqHigh`, dB): `Tone.EQ3`.
- `FILTER.Cutoff` (`filterCutoff`, Hz) y `FILTER.Reso` (`filterReso`, Q): `Tone.Filter`.
- `VOLUME.Out` (`outGain`, dB): control interno sobre el nivel de salida aplicado a `masterGain`. El control maestro de volumen fue removido de la UI.
- `VOLUME.Pan` y `FILTER.Drive` aparecen en el UI, pero sólo aplican si existe el nodo correspondiente (ver nota en `useAudioEngine.js`).

## Visualización

Hay dos capas:

1) **Medición master** (barra en `MasterFX.jsx`):
	 - En el motor se usa `Tone.Meter` y `Tone.Waveform` conectados al `masterGain`.
	 - Un `requestAnimationFrame` lee `meter.getValue()` (peak aprox) y RMS estimado desde el waveform.
	 - `MasterFX` usa `meter.peakDb` para pintar la barra.

2) **Waveform en vivo** (`WaveSurferViz.jsx`):
	 - A pesar del nombre, no usa WaveSurfer para decodificar archivos.
	 - Conecta un `AnalyserNode` (WebAudio) al `inputNode` y dibuja en canvas con RAF.
	 - En `App.jsx` se le pasa `outputNode` (un `Tone.Gain` del master), expuesto desde `useAudioEngine`.

## Troubleshooting

### No suena nada

- Haz click/tap en la app (bloqueo de Web Audio hasta interacción).
- Revisa que el master no esté muteado y que los volúmenes no estén al mínimo.
- Comprueba si hay pistas en solo/mute.

### Clicks/pops o distorsión

- Baja el BPM.
- Reduce reverb/delay y/o compresión.
- Evita cambios bruscos en parámetros (idealmente siempre con rampas).

## Tecnologías

- React
- Vite
- Tone.js
- WaveSurfer
- Three.js / @react-three/fiber (dependencias presentes en el repo)

## Licencia

Si no se especifica lo contrario, revisa el repositorio para los términos de licencia.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
