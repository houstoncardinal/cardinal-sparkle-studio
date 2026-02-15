import { useDAWStore } from '@/stores/dawStore';
import TrackHeader from './TrackHeader';
import TimelineTrack from './TimelineTrack';
import { useRef } from 'react';

const Timeline = () => {
  const { tracks, currentBeat, zoom, loopEnabled, loopStart, loopEnd } = useDAWStore();
  const beatWidth = 24 * zoom;
  const totalBeats = 64;
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Ruler */}
      <div className="flex h-6 border-b border-border bg-card">
        <div className="w-48 min-w-[192px] border-r border-border flex items-center px-3">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tracks</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="flex h-full" style={{ width: `${totalBeats * beatWidth}px` }}>
            {Array.from({ length: Math.ceil(totalBeats / 4) }, (_, i) => (
              <div
                key={i}
                className="border-l border-daw-timeline-grid/60 flex items-end px-1"
                style={{ width: `${4 * beatWidth}px` }}
              >
                <span className="text-[9px] text-muted-foreground font-mono mb-0.5">{i + 1}</span>
              </div>
            ))}
          </div>
          {/* Loop region */}
          {loopEnabled && (
            <div
              className="absolute top-0 bottom-0 bg-primary/10 border-x border-primary/30"
              style={{
                left: `${loopStart * beatWidth}px`,
                width: `${(loopEnd - loopStart) * beatWidth}px`,
              }}
            />
          )}
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none"
            style={{ left: `${currentBeat * beatWidth}px` }}
          >
            <div className="w-2.5 h-3 bg-primary -ml-[5px] rounded-b-sm" />
          </div>
        </div>
      </div>

      {/* Tracks area */}
      <div className="flex-1 flex overflow-y-auto">
        {/* Track headers */}
        <div className="w-48 min-w-[192px] border-r border-border bg-card flex flex-col">
          {tracks.map((track) => (
            <TrackHeader key={track.id} track={track} />
          ))}
        </div>

        {/* Timeline content */}
        <div className="flex-1 overflow-x-auto" ref={scrollRef}>
          <div style={{ width: `${totalBeats * beatWidth}px` }} className="min-h-full">
            {tracks.map((track) => (
              <TimelineTrack key={track.id} track={track} />
            ))}
          </div>
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none"
            style={{ left: `${currentBeat * beatWidth + 192}px` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
