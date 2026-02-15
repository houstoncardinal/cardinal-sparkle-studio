import type { Track } from '@/types/daw';
import { useDAWStore } from '@/stores/dawStore';
import { Volume2, VolumeX, Headphones, Mic } from 'lucide-react';

interface TrackHeaderProps {
  track: Track;
}

const TrackHeader = ({ track }: TrackHeaderProps) => {
  const { toggleMute, toggleSolo, toggleArm, selectTrack, selectedTrackId } = useDAWStore();
  const isSelected = selectedTrackId === track.id;

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
        <div className="text-xs font-medium text-foreground truncate">{track.name}</div>
        <div className="text-[10px] text-muted-foreground uppercase">{track.type}</div>
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
      <div className="w-1.5 h-12 bg-daw-surface rounded-full overflow-hidden daw-inset">
        <div
          className="w-full rounded-full transition-all duration-100 meter-gradient"
          style={{ height: `${track.muted ? 0 : track.meterLevel * 100}%`, marginTop: `${100 - (track.muted ? 0 : track.meterLevel * 100)}%` }}
        />
      </div>
    </div>
  );
};

export default TrackHeader;
