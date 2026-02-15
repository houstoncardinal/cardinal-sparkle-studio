import { useDAWStore } from '@/stores/dawStore';
import MixerChannel from './MixerChannel';
import { motion } from 'framer-motion';

const Mixer = () => {
  const tracks = useDAWStore((s) => s.tracks);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-72 border-t border-border bg-card flex overflow-x-auto"
    >
      {tracks.map((track) => (
        <MixerChannel key={track.id} track={track} />
      ))}

      {/* Master channel */}
      <div className="w-24 flex flex-col items-center py-2 px-2 bg-daw-surface-raised border-l-2 border-primary/30">
        <div className="text-[10px] font-semibold text-primary mb-2 tracking-wider">MASTER</div>

        <div className="flex gap-1 flex-1 w-full mb-1">
          <div className="flex gap-px flex-1 justify-center">
            <div className="w-2 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset flex flex-col-reverse">
              <div className="w-full meter-gradient rounded-sm animate-meter-pulse" style={{ height: '72%' }} />
            </div>
            <div className="w-2 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset flex flex-col-reverse">
              <div className="w-full meter-gradient rounded-sm animate-meter-pulse" style={{ height: '68%' }} />
            </div>
          </div>
        </div>

        <div className="text-[9px] font-mono text-primary tabular-nums mb-1">-0.3 dB</div>
        <div className="text-[8px] text-muted-foreground">-14.2 LUFS</div>
      </div>
    </motion.div>
  );
};

export default Mixer;
