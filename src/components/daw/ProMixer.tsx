import { useDAWStore } from '@/stores/dawStore';
import ProMixerChannel from './ProMixerChannel';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ProMixer = () => {
  const tracks = useDAWStore((s) => s.tracks);

  // Animated master meters
  const [masterL, setMasterL] = useState(0.72);
  const [masterR, setMasterR] = useState(0.68);
  const [lufs, setLufs] = useState(-14.2);
  const [masterPeakL, setMasterPeakL] = useState(0);
  const [masterPeakR, setMasterPeakR] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const l = 0.6 + Math.random() * 0.25;
      const r = 0.58 + Math.random() * 0.25;
      setMasterL(l);
      setMasterR(r);
      setMasterPeakL((p) => Math.max(p - 0.003, l));
      setMasterPeakR((p) => Math.max(p - 0.003, r));
      setLufs(-14 + Math.random() * 2 - 1);
    }, 100);
    return () => clearInterval(iv);
  }, []);

  const masterDb = -0.3;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-[340px] border-t border-border bg-card flex overflow-x-auto"
    >
      {tracks.map((track) => (
        <ProMixerChannel key={track.id} track={track} />
      ))}

      {/* Master channel */}
      <div className="w-28 min-w-[112px] flex flex-col items-center py-2 px-2 bg-daw-surface-raised border-l-2 border-primary/30">
        <div className="text-[10px] font-semibold text-primary mb-1 tracking-wider gold-text-glow">MASTER</div>
        <div className="text-[7px] text-muted-foreground mb-2">Stereo Out</div>

        {/* Master meters */}
        <div className="flex gap-1 flex-1 w-full mb-1">
          <div className="flex gap-0.5 flex-1 justify-center">
            {[masterL, masterR].map((level, idx) => {
              const peak = idx === 0 ? masterPeakL : masterPeakR;
              return (
                <div key={idx} className="w-3 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset relative flex flex-col-reverse">
                  <div
                    className="w-full meter-gradient rounded-sm transition-all duration-75"
                    style={{ height: `${level * 100}%` }}
                  />
                  {peak > 0.01 && (
                    <div
                      className="absolute w-full h-px bg-foreground/80"
                      style={{ bottom: `${Math.min(100, peak * 100)}%` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {/* dB scale */}
          <div className="flex flex-col justify-between text-[6px] font-mono text-muted-foreground/50 py-1">
            <span>0</span>
            <span>-6</span>
            <span>-12</span>
            <span>-24</span>
            <span>-48</span>
            <span>-∞</span>
          </div>
        </div>

        <div className="w-full space-y-1 text-center">
          <div className="text-[10px] font-mono text-primary tabular-nums font-semibold">{masterDb.toFixed(1)} dB</div>
          <div className="bg-daw-surface rounded px-2 py-1 daw-inset">
            <span className="text-[7px] text-muted-foreground block">LUFS (I)</span>
            <span className="text-[10px] font-mono text-foreground font-semibold tabular-nums">{lufs.toFixed(1)}</span>
          </div>
          <div className="bg-daw-surface rounded px-2 py-1 daw-inset">
            <span className="text-[7px] text-muted-foreground block">PEAK</span>
            <span className={`text-[10px] font-mono font-semibold tabular-nums ${masterPeakL > 0.95 ? 'text-daw-meter-red' : 'text-foreground'}`}>
              {(20 * Math.log10(Math.max(masterPeakL, masterPeakR) || 0.001)).toFixed(1)} dB
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProMixer;
