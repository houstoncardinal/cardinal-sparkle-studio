import type { Track, Clip } from '@/types/daw';
import { useDAWStore } from '@/stores/dawStore';

interface TimelineTrackProps {
  track: Track;
}

const ClipView = ({ clip, trackColor }: { clip: Clip; trackColor: string }) => {
  const zoom = useDAWStore((s) => s.zoom);
  const beatWidth = 24 * zoom;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded track-clip border border-border/50 overflow-hidden group cursor-pointer hover:brightness-110 transition-all`}
      style={{
        left: `${clip.startBeat * beatWidth}px`,
        width: `${clip.durationBeats * beatWidth}px`,
        background: `linear-gradient(180deg, hsl(var(--${trackColor}) / 0.25) 0%, hsl(var(--${trackColor}) / 0.08) 100%)`,
        borderColor: `hsl(var(--${trackColor}) / 0.3)`,
      }}
    >
      <div className="px-1.5 py-0.5 text-[9px] font-medium text-foreground/70 truncate">{clip.name}</div>
      {/* Waveform visualization */}
      <div className="flex items-end h-[calc(100%-18px)] px-0.5 gap-px">
        {clip.waveformData?.map((v, i) => (
          <div
            key={i}
            className="flex-1 min-w-[1px] rounded-t-sm transition-all"
            style={{
              height: `${v * 100}%`,
              background: `hsl(var(--${trackColor}) / ${0.3 + v * 0.4})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const TimelineTrack = ({ track }: TimelineTrackProps) => {
  const { selectedTrackId, selectTrack, zoom } = useDAWStore();
  const isSelected = selectedTrackId === track.id;
  const totalBeats = 64;
  const beatWidth = 24 * zoom;

  return (
    <div
      className={`h-20 border-b border-border relative ${
        isSelected ? 'bg-daw-surface-raised/30' : 'bg-daw-timeline-bg'
      } ${track.muted ? 'opacity-40' : ''}`}
      onClick={() => selectTrack(track.id)}
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
        <ClipView key={clip.id} clip={clip} trackColor={track.color} />
      ))}
    </div>
  );
};

export default TimelineTrack;
