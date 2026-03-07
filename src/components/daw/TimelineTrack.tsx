import type { Track, Clip } from '@/types/daw';
import { useDAWStore } from '@/stores/dawStore';
import { useRef, useState, useCallback } from 'react';

interface TimelineTrackProps {
  track: Track;
}

const ClipView = ({ clip, trackColor, trackId }: { clip: Clip; trackColor: string; trackId: string }) => {
  const { zoom, snapEnabled, moveClip, resizeClip, deleteClip, splitClip, currentBeat } = useDAWStore();
  const beatWidth = 24 * zoom;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, startBeat: 0 });
  const resizeStartRef = useRef({ x: 0, duration: 0 });

  const snapBeat = useCallback((beat: number) => {
    if (!snapEnabled) return beat;
    return Math.round(beat * 4) / 4; // Snap to 16th notes
  }, [snapEnabled]);

  // Drag to move
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startBeat: clip.startBeat };

    const handleMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartRef.current.x;
      const dBeats = dx / beatWidth;
      const newStart = snapBeat(dragStartRef.current.startBeat + dBeats);
      moveClip(trackId, clip.id, newStart);
    };

    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // Resize handle (right edge)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, duration: clip.durationBeats };

    const handleMove = (ev: MouseEvent) => {
      const dx = ev.clientX - resizeStartRef.current.x;
      const dBeats = dx / beatWidth;
      const newDur = snapBeat(resizeStartRef.current.duration + dBeats);
      resizeClip(trackId, clip.id, newDur);
    };

    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // Right-click context menu actions via keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteClip(trackId, clip.id);
    }
    if (e.key === 's' || e.key === 'S') {
      // Split at playhead
      splitClip(trackId, clip.id, currentBeat);
    }
  };

  return (
    <div
      className={`absolute top-1 bottom-1 rounded track-clip border border-border/50 overflow-hidden group cursor-grab select-none ${
        isDragging ? 'cursor-grabbing opacity-80 z-20' : ''
      } ${isResizing ? 'z-20' : ''}`}
      style={{
        left: `${clip.startBeat * beatWidth}px`,
        width: `${clip.durationBeats * beatWidth}px`,
        background: `linear-gradient(180deg, hsl(var(--${trackColor}) / 0.25) 0%, hsl(var(--${trackColor}) / 0.08) 100%)`,
        borderColor: `hsl(var(--${trackColor}) / 0.3)`,
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="px-1.5 py-0.5 text-[9px] font-medium text-foreground/70 truncate pointer-events-none">{clip.name}</div>
      {/* Waveform visualization */}
      <div className="flex items-end h-[calc(100%-18px)] px-0.5 gap-px pointer-events-none">
        {clip.waveformData?.map((v, i) => (
          <div
            key={i}
            className="flex-1 min-w-[1px] rounded-t-sm"
            style={{
              height: `${v * 100}%`,
              background: `hsl(var(--${trackColor}) / ${0.3 + v * 0.4})`,
            }}
          />
        ))}
      </div>
      {/* Resize handle */}
      <div
        className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize hover:bg-foreground/10 transition-colors"
        onMouseDown={handleResizeStart}
      />
      {/* Delete button on hover */}
      <button
        className="absolute top-0.5 right-1 w-4 h-4 rounded bg-destructive/80 text-destructive-foreground text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); deleteClip(trackId, clip.id); }}
        title="Delete clip"
      >
        ×
      </button>
    </div>
  );
};

const TimelineTrack = ({ track }: TimelineTrackProps) => {
  const { selectedTrackId, selectTrack, zoom, snapEnabled, splitClip, currentBeat } = useDAWStore();
  const isSelected = selectedTrackId === track.id;
  const totalBeats = 64;
  const beatWidth = 24 * zoom;
  const trackRef = useRef<HTMLDivElement>(null);

  // Double-click on empty area to split at that position
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const beat = x / beatWidth;
    
    // Find clip at this beat
    const clip = track.clips.find(c => beat >= c.startBeat && beat < c.startBeat + c.durationBeats);
    if (clip) {
      const snapBeat = snapEnabled ? Math.round(beat * 4) / 4 : beat;
      splitClip(track.id, clip.id, snapBeat);
    }
  };

  return (
    <div
      ref={trackRef}
      className={`h-20 border-b border-border relative ${
        isSelected ? 'bg-daw-surface-raised/30' : 'bg-daw-timeline-bg'
      } ${track.muted ? 'opacity-40' : ''}`}
      onClick={() => selectTrack(track.id)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Grid lines */}
      {Array.from({ length: totalBeats }, (_, i) => (
        <div
          key={i}
          className={`absolute top-0 bottom-0 border-l ${
            i % 4 === 0 ? 'border-daw-timeline-grid/60' : 'border-daw-timeline-grid/20'
          }`}
          style={{ left: `${i * beatWidth}px` }}
        />
      ))}

      {/* Clips */}
      {track.clips.map((clip) => (
        <ClipView key={clip.id} clip={clip} trackColor={track.color} trackId={track.id} />
      ))}
    </div>
  );
};

export default TimelineTrack;
