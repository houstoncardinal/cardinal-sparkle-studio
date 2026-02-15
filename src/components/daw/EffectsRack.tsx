import { useDAWStore } from '@/stores/dawStore';
import { motion } from 'framer-motion';

const effectPresets: Record<string, string[]> = {
  compressor: ['Vocal Squeeze', 'Bus Glue', 'Parallel Crush', 'Gentle'],
  reverb: ['Plate', 'Hall', 'Room', 'Cathedral', 'Shimmer'],
  eq: ['Vocal Boost', 'Bass Cut', 'Presence', 'Warmth'],
  delay: ['Slapback', 'Ping Pong', '1/8 Note', 'Ambient'],
  chorus: ['Lush', 'Subtle', 'Wide Stereo'],
  limiter: ['Mastering', 'Brickwall', 'Transparent'],
};

const EffectsRack = () => {
  const { tracks, selectedTrackId } = useDAWStore();
  const track = tracks.find((t) => t.id === selectedTrackId);

  if (!track) {
    return (
      <div className="h-72 border-t border-border bg-card flex items-center justify-center text-muted-foreground text-sm">
        Select a track to view effects
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-72 border-t border-border bg-card flex overflow-x-auto p-3 gap-3"
    >
      {track.effects.map((fx) => (
        <div
          key={fx.id}
          className="w-52 min-w-[208px] rounded-lg glass-panel p-3 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground">{fx.name}</span>
            <div
              className={`w-2 h-2 rounded-full ${fx.enabled ? 'bg-daw-meter-green' : 'bg-muted-foreground'}`}
            />
          </div>

          {/* Params */}
          <div className="space-y-2 flex-1">
            {Object.entries(fx.params).map(([key, val]) => {
              const numVal = val as number;
              return (
              <div key={key}>
                <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                  <span className="uppercase">{key}</span>
                  <span className="font-mono">{numVal}</span>
                </div>
                <div className="h-1.5 bg-daw-surface rounded-full daw-inset overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full"
                    style={{ width: `${Math.min(100, Math.abs(numVal) / (key === 'threshold' ? 60 : key === 'time' ? 1000 : 100) * 100)}%` }}
                  />
                </div>
              </div>
            )})}
          </div>

          {/* Presets */}
          <div className="mt-2 flex flex-wrap gap-1">
            {(effectPresets[fx.type] || []).slice(0, 3).map((p) => (
              <span key={p} className="text-[8px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Add effect */}
      <button className="w-52 min-w-[208px] rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
        <div className="text-center">
          <span className="text-2xl block mb-1">+</span>
          <span className="text-[10px]">Add Effect</span>
        </div>
      </button>
    </motion.div>
  );
};

export default EffectsRack;
