import type { Track } from '@/types/daw';
import { useDAWStore } from '@/stores/dawStore';
import { useState, useEffect } from 'react';

interface ProMixerChannelProps {
  track: Track;
}

const ProMixerChannel = ({ track }: ProMixerChannelProps) => {
  const {
    toggleMute, toggleSolo, toggleArm, setVolume, setPan, selectTrack, selectedTrackId,
    setInputTrim, togglePhase, toggleStereoMode, resetClipIndicator
  } = useDAWStore();
  const isSelected = selectedTrackId === track.id;

  const [meterL, setMeterL] = useState(track.meterLevel);
  const [meterR, setMeterR] = useState(track.meterLevel * 0.9);
  const [peakL, setPeakL] = useState(0);
  const [peakR, setPeakR] = useState(0);
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!track.muted) {
        const l = track.meterLevel * (0.7 + Math.random() * 0.3) * (track.volume);
        const r = track.meterLevel * (0.65 + Math.random() * 0.35) * (track.volume);
        setMeterL(l);
        setMeterR(r);
        if (l > peakL) setPeakL(l);
        if (r > peakR) setPeakR(r);
        if (l > 0.95 || r > 0.95) setClipped(true);
      } else {
        setMeterL(0);
        setMeterR(0);
      }
    }, 80);
    // Peak hold decay
    const peakIv = setInterval(() => {
      setPeakL((p) => Math.max(0, p - 0.005));
      setPeakR((p) => Math.max(0, p - 0.005));
    }, 50);
    return () => { clearInterval(iv); clearInterval(peakIv); };
  }, [track.meterLevel, track.muted, track.volume]);

  const dbValue = track.volume > 0 ? (20 * Math.log10(track.volume)).toFixed(1) : '-∞';
  const trimDb = track.inputTrim > 0 ? `+${track.inputTrim}` : `${track.inputTrim}`;

  // GR meter simulation
  const [gr, setGr] = useState(0);
  useEffect(() => {
    const hasComp = track.effects.some((e) => e.type === 'compressor' && e.enabled);
    if (hasComp && !track.muted) {
      const iv = setInterval(() => setGr(Math.random() * 0.4 + 0.05), 100);
      return () => clearInterval(iv);
    } else {
      setGr(0);
    }
  }, [track.effects, track.muted]);

  return (
    <div
      className={`w-[88px] min-w-[88px] flex flex-col items-center py-2 px-1.5 border-r border-border cursor-pointer transition-colors ${
        isSelected ? 'bg-daw-surface-raised' : 'bg-card hover:bg-daw-surface-raised/30'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Track name */}
      <div className="text-[9px] font-medium text-foreground/80 truncate w-full text-center mb-1">{track.name}</div>

      {/* Type badge */}
      <div className="flex items-center gap-1 mb-1.5">
        <span className={`text-[7px] px-1.5 py-0.5 rounded-sm uppercase font-semibold ${
          track.type === 'bus' ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
        }`}>{track.type}</span>
        {track.frozen && <span className="text-[7px] px-1 py-0.5 rounded-sm bg-daw-track-1/20 text-daw-track-1">❄</span>}
      </div>

      {/* Input trim + phase + stereo */}
      <div className="flex items-center gap-0.5 mb-1.5 w-full">
        <button
          onClick={(e) => { e.stopPropagation(); togglePhase(track.id); }}
          className={`w-5 h-4 rounded text-[7px] font-bold flex items-center justify-center transition-all ${
            track.phaseInverted ? 'bg-daw-meter-yellow text-primary-foreground' : 'bg-secondary/60 text-muted-foreground'
          }`}
          title="Phase Invert"
        >
          Ø
        </button>
        <div className="flex-1 text-center">
          <span className="text-[7px] text-muted-foreground font-mono">{trimDb}dB</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleStereoMode(track.id); }}
          className={`px-1 h-4 rounded text-[7px] font-bold flex items-center justify-center transition-all ${
            track.stereoMode === 'mono' ? 'bg-daw-track-2/30 text-daw-track-2' : 'bg-secondary/60 text-muted-foreground'
          }`}
          title="Stereo/Mono"
        >
          {track.stereoMode === 'mono' ? 'M' : 'ST'}
        </button>
      </div>

      {/* Effects slots */}
      <div className="w-full space-y-0.5 mb-1.5">
        {track.effects.slice(0, 4).map((fx) => (
          <div
            key={fx.id}
            className={`text-[7px] px-1 py-0.5 rounded truncate text-center ${
              fx.enabled ? 'bg-primary/12 text-primary' : 'bg-secondary/50 text-muted-foreground line-through'
            }`}
          >
            {fx.name}
          </div>
        ))}
        <div className="text-[7px] px-1 py-0.5 rounded bg-secondary/30 text-muted-foreground text-center cursor-pointer hover:bg-secondary/60 transition-colors">+ Insert</div>
      </div>

      {/* Sends */}
      {track.sends.length > 0 && (
        <div className="w-full mb-1.5">
          {track.sends.map((send) => (
            <div key={send.id} className="flex items-center gap-0.5 text-[7px]">
              <span className="text-daw-track-1">→</span>
              <span className="text-muted-foreground truncate flex-1">Bus</span>
              <span className="text-primary font-mono">{Math.round(send.level * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Pan knob */}
      <div className="relative w-9 h-9 mb-1.5 group">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="12" fill="hsl(var(--daw-surface))" className="group-hover:fill-[hsl(var(--daw-surface-raised))] transition-colors" />
          {/* Indicator marks */}
          <circle cx="18" cy="18" r="2" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <line
            x1="18" y1="18"
            x2={18 + 9 * Math.sin(track.pan * Math.PI * 0.75)}
            y2={18 - 9 * Math.cos(track.pan * Math.PI * 0.75)}
            stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"
          />
        </svg>
        <div className="text-[7px] text-muted-foreground text-center mt-0.5 font-mono">
          {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
        </div>
      </div>

      {/* Meter + Fader area */}
      <div className="flex gap-1.5 flex-1 mb-1 w-full">
        {/* Stereo meters with peak hold */}
        <div className="flex gap-0.5">
          {[meterL, meterR].map((level, idx) => {
            const peak = idx === 0 ? peakL : peakR;
            return (
              <div key={idx} className="w-2 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset relative flex flex-col-reverse">
                <div
                  className="w-full meter-gradient rounded-sm transition-all duration-75"
                  style={{ height: `${Math.min(100, level * 100)}%` }}
                />
                {/* Peak hold indicator */}
                {peak > 0.01 && (
                  <div
                    className="absolute w-full h-px bg-foreground/60"
                    style={{ bottom: `${Math.min(100, peak * 100)}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* GR meter */}
        {gr > 0 && (
          <div className="w-1 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset flex flex-col">
            <div
              className="w-full bg-daw-meter-yellow rounded-sm transition-all duration-75"
              style={{ height: `${gr * 100}%` }}
            />
          </div>
        )}

        {/* Fader track */}
        <div className="flex-1 flex flex-col items-center relative">
          <input
            type="range"
            min={0} max={1} step={0.005}
            value={track.volume}
            onChange={(e) => { e.stopPropagation(); setVolume(track.id, Number(e.target.value)); }}
            className="fader-input w-full"
            style={{
              writingMode: 'vertical-lr',
              direction: 'rtl',
              height: '100%',
              appearance: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Clip indicator */}
      {clipped && (
        <button
          onClick={(e) => { e.stopPropagation(); setClipped(false); resetClipIndicator(track.id); }}
          className="w-full h-3 rounded-sm bg-daw-meter-red text-[7px] text-destructive-foreground font-bold mb-0.5 animate-pulse"
        >
          CLIP
        </button>
      )}

      {/* dB display */}
      <div className="text-[9px] font-mono text-primary mb-1 tabular-nums">{dbValue} dB</div>

      {/* Solo / Mute / Arm */}
      <div className="flex gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); toggleArm(track.id); }}
          className={`w-6 h-5 rounded text-[8px] font-bold transition-all ${
            track.armed ? 'bg-daw-recording text-destructive-foreground animate-recording-blink' : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          R
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }}
          className={`w-6 h-5 rounded text-[8px] font-bold transition-all ${
            track.soloed ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          S
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }}
          className={`w-6 h-5 rounded text-[8px] font-bold transition-all ${
            track.muted ? 'bg-daw-meter-red/30 text-daw-meter-red' : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          M
        </button>
      </div>

      {/* Color bar */}
      <div className={`w-full h-1 rounded-b mt-1.5 bg-${track.color}`} />
    </div>
  );
};


export default ProMixerChannel;
