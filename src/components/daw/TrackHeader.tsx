import type { Track } from '@/types/daw';
import { useDAWStore } from '@/stores/dawStore';
import { Mic, Snowflake, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { audioEngine } from '@/engine/AudioEngine';

interface TrackHeaderProps {
  track: Track;
}

const TrackHeader = ({ track }: TrackHeaderProps) => {
  const { toggleMute, toggleSolo, toggleArm, selectTrack, selectedTrackId, deleteTrack, renameTrack } = useDAWStore();
  const isSelected = selectedTrackId === track.id;
  const [meter, setMeter] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(track.name);

  // Real metering
  useEffect(() => {
    const iv = setInterval(() => {
      if (audioEngine.isReady()) {
        const m = audioEngine.getTrackMeter(track.id);
        setMeter(track.muted ? 0 : Math.min(1, m.left * 3));
      }
    }, 80);
    return () => clearInterval(iv);
  }, [track.id, track.muted]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(track.name);
  };

  const handleRenameSubmit = () => {
    if (editName.trim()) renameTrack(track.id, editName.trim());
    setIsEditing(false);
  };

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
          {isEditing ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              className="text-xs font-medium text-foreground bg-daw-surface rounded px-1 py-0.5 outline-none border border-primary/30 w-full"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-xs font-medium text-foreground truncate" onDoubleClick={handleDoubleClick}>{track.name}</span>
          )}
          {track.frozen && <Snowflake size={8} className="text-daw-track-1 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase">{track.type}</span>
          {track.phaseInverted && <span className="text-[8px] text-daw-meter-yellow">Ø</span>}
          {track.stereoMode === 'mono' && <span className="text-[8px] text-daw-track-2">M</span>}
          {audioEngine.hasTrackBuffer(track.id) && <span className="text-[8px] text-daw-meter-green">●</span>}
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
          title="Arm for recording"
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

      {/* Mini meter - real data */}
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
