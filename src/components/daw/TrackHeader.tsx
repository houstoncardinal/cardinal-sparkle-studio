import type { Track } from '@/types/daw';
import { useDAWStore } from '@/stores/dawStore';
import { Mic, Snowflake } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TrackHeaderProps {
  track: Track;
}

const TrackHeader = ({ track }: TrackHeaderProps) => {
  const { toggleMute, toggleSolo, toggleArm, selectTrack, selectedTrackId } = useDAWStore();
  const isSelected = selectedTrackId === track.id;

  const [meter, setMeter] = useState(track.meterLevel);
  useEffect(() => {
    const iv = setInterval(() => {
      setMeter(track.muted ? 0 : track.meterLevel * (0.75 + Math.random() * 0.25));
    }, 100);
    return () => clearInterval(iv);
  }, [track.meterLevel, track.muted]);

  return (
    <div
      className={`h-20 border-b border-border flex items-center gap-2 px-2 cursor-pointer transition-colors ${
        isSelected ? 'bg-daw-surface-raised' : 'bg-card hover:bg-daw-surface-raised/50'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Color indicator */}
      <div className={`w-1 h-12 rounded-full bg-${track.color}`} />

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-foreground truncate">{track.name}</span>
          {track.frozen && <Snowflake size={8} className="text-daw-track-1 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase">{track.type}</span>
          {track.phaseInverted && <span className="text-[8px] text-daw-meter-yellow">Ø</span>}
          {track.stereoMode === 'mono' && <span className="text-[8px] text-daw-track-2">M</span>}
        </div>
        {track.sends.length > 0 && (
          <div className="text-[7px] text-primary/60">{track.sends.length} send{track.sends.length > 1 ? 's' : ''}</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); toggleArm(track.id); }}
          className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center transition-all ${
            track.armed ? 'bg-daw-recording text-destructive-foreground animate-recording-blink' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic size={10} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }}
          className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center transition-all ${
            track.soloed ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          S
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }}
          className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center transition-all ${
            track.muted ? 'bg-daw-meter-red/20 text-daw-meter-red' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          M
        </button>
      </div>

      {/* Mini meter */}
      <div className="w-1.5 h-12 bg-daw-surface rounded-full overflow-hidden daw-inset flex flex-col-reverse">
        <div
          className="w-full rounded-full transition-all duration-75 meter-gradient"
          style={{ height: `${meter * 100}%` }}
        />
      </div>
    </div>
  );
};

export default TrackHeader;
