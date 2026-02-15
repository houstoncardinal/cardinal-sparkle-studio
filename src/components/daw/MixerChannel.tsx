import type { Track } from '@/types/daw';
import { useDAWStore } from '@/stores/dawStore';
import { useState, useEffect } from 'react';

interface MixerChannelProps {
  track: Track;
}

const MixerChannel = ({ track }: MixerChannelProps) => {
  const { toggleMute, toggleSolo, setVolume, setPan, selectTrack, selectedTrackId } = useDAWStore();
  const isSelected = selectedTrackId === track.id;

  // Animate meter
  const [meterL, setMeterL] = useState(track.meterLevel);
  const [meterR, setMeterR] = useState(track.meterLevel * 0.9);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!track.muted) {
        setMeterL(track.meterLevel * (0.7 + Math.random() * 0.3));
        setMeterR(track.meterLevel * (0.65 + Math.random() * 0.35));
      } else {
        setMeterL(0);
        setMeterR(0);
      }
    }, 120);
    return () => clearInterval(iv);
  }, [track.meterLevel, track.muted]);

  const dbValue = track.volume > 0 ? (20 * Math.log10(track.volume)).toFixed(1) : '-∞';

  return (
    <div
      className={`w-20 flex flex-col items-center py-2 px-1 border-r border-border cursor-pointer transition-colors ${
        isSelected ? 'bg-daw-surface-raised' : 'bg-card hover:bg-daw-surface-raised/30'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Track name */}
      <div className="text-[9px] font-medium text-foreground/80 truncate w-full text-center mb-2">{track.name}</div>

      {/* Effects slots */}
      <div className="w-full space-y-0.5 mb-2">
        {track.effects.slice(0, 3).map((fx) => (
          <div
            key={fx.id}
            className={`text-[8px] px-1 py-0.5 rounded truncate text-center ${
              fx.enabled ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {fx.name}
          </div>
        ))}
        {track.effects.length === 0 && (
          <div className="text-[8px] px-1 py-0.5 rounded bg-secondary text-muted-foreground text-center">+ Insert</div>
        )}
      </div>

      {/* Pan knob */}
      <div className="relative w-8 h-8 mb-2">
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="12" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
          <circle cx="16" cy="16" r="10" fill="hsl(var(--daw-surface))" />
          <line
            x1="16" y1="16"
            x2={16 + 8 * Math.sin(track.pan * Math.PI * 0.75)}
            y2={16 - 8 * Math.cos(track.pan * Math.PI * 0.75)}
            stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round"
          />
        </svg>
        <div className="text-[7px] text-muted-foreground text-center mt-0.5">
          {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
        </div>
      </div>

      {/* Meter + Fader area */}
      <div className="flex gap-1 flex-1 mb-1">
        {/* Stereo meters */}
        <div className="flex gap-px">
          <div className="w-1.5 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset flex flex-col-reverse">
            <div
              className="w-full meter-gradient rounded-sm transition-all duration-100"
              style={{ height: `${meterL * 100}%` }}
            />
          </div>
          <div className="w-1.5 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset flex flex-col-reverse">
            <div
              className="w-full meter-gradient rounded-sm transition-all duration-100"
              style={{ height: `${meterR * 100}%` }}
            />
          </div>
        </div>

        {/* Fader */}
        <div className="flex-1 flex flex-col items-center relative">
          <input
            type="range"
            min={0} max={1} step={0.01}
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

      {/* dB display */}
      <div className="text-[9px] font-mono text-primary mb-1 tabular-nums">{dbValue} dB</div>

      {/* Solo / Mute */}
      <div className="flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }}
          className={`w-7 h-5 rounded text-[9px] font-bold transition-all ${
            track.soloed ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          S
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }}
          className={`w-7 h-5 rounded text-[9px] font-bold transition-all ${
            track.muted ? 'bg-daw-meter-red/30 text-daw-meter-red' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          M
        </button>
      </div>

      {/* Color bar */}
      <div className={`w-full h-1 rounded-b mt-1 bg-${track.color}`} />
    </div>
  );
};

export default MixerChannel;
