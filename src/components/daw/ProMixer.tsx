import { useDAWStore } from '@/stores/dawStore';
import ProMixerChannel from './ProMixerChannel';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { audioEngine } from '@/engine/AudioEngine';

const ProMixer = () => {
  const tracks = useDAWStore((s) => s.tracks);
  const [masterMeter, setMasterMeter] = useState({ left: 0, right: 0, peakL: 0, peakR: 0, lufs: -60 });

  // Real master metering
  useEffect(() => {
    const iv = setInterval(() => {
      if (audioEngine.isReady()) {
        setMasterMeter(audioEngine.getMasterMeter());
      }
    }, 50);
    return () => clearInterval(iv);
  }, []);

  const masterDb = masterMeter.peakL > 0 ? (20 * Math.log10(Math.max(masterMeter.peakL, masterMeter.peakR))).toFixed(1) : '-∞';

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

        {/* Master meters - real data */}
        <div className="flex gap-1 flex-1 w-full mb-1">
          <div className="flex gap-0.5 flex-1 justify-center">
            {[masterMeter.left, masterMeter.right].map((level, idx) => {
              const peak = idx === 0 ? masterMeter.peakL : masterMeter.peakR;
              // Scale for visual: RMS to display (0-1 range, amplified for visibility)
              const displayLevel = Math.min(1, level * 3);
              const displayPeak = Math.min(1, peak * 2.5);
              return (
                <div key={idx} className="w-3 h-full bg-daw-surface rounded-sm overflow-hidden daw-inset relative flex flex-col-reverse">
                  <div
                    className="w-full meter-gradient rounded-sm transition-all duration-75"
                    style={{ height: `${displayLevel * 100}%` }}
                  />
                  {displayPeak > 0.01 && (
                    <div
                      className="absolute w-full h-px bg-foreground/80"
                      style={{ bottom: `${Math.min(100, displayPeak * 100)}%` }}
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
          <div className="text-[10px] font-mono text-primary tabular-nums font-semibold">{masterDb} dB</div>
          <div className="bg-daw-surface rounded px-2 py-1 daw-inset">
            <span className="text-[7px] text-muted-foreground block">LUFS (I)</span>
            <span className="text-[10px] font-mono text-foreground font-semibold tabular-nums">
              {isFinite(masterMeter.lufs) ? masterMeter.lufs.toFixed(1) : '-∞'}
            </span>
          </div>
          <div className="bg-daw-surface rounded px-2 py-1 daw-inset">
            <span className="text-[7px] text-muted-foreground block">PEAK</span>
            <span className={`text-[10px] font-mono font-semibold tabular-nums ${masterMeter.peakL > 0.95 ? 'text-daw-meter-red' : 'text-foreground'}`}>
              {masterDb} dB
            </span>
          </div>
          <button
            onClick={() => audioEngine.resetPeaks()}
            className="text-[7px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset Peaks
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProMixer;
