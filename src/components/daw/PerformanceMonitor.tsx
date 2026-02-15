import { useState, useEffect } from 'react';
import { audioEngine } from '@/engine/AudioEngine';
import { useDAWStore } from '@/stores/dawStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, Activity, Clock, AlertTriangle, X, Settings } from 'lucide-react';

const PerformanceMonitor = () => {
  const { showPerformanceMonitor, togglePerformanceMonitor, bufferSize, sampleRate, setBufferSize } = useDAWStore();
  const [metrics, setMetrics] = useState({
    cpuLoad: 8, memoryUsage: 310, bufferHealth: 98, audioLatency: 5.3, dropouts: 0,
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setMetrics(audioEngine.getPerformanceMetrics());
    }, 500);
    return () => clearInterval(iv);
  }, []);

  if (!showPerformanceMonitor) return null;

  const cpuColor = metrics.cpuLoad > 80 ? 'text-daw-meter-red' : metrics.cpuLoad > 50 ? 'text-daw-meter-yellow' : 'text-daw-meter-green';
  const bufferColor = metrics.bufferHealth < 70 ? 'text-daw-meter-red' : metrics.bufferHealth < 90 ? 'text-daw-meter-yellow' : 'text-daw-meter-green';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-2 right-2 z-50 w-64 glass-panel rounded-lg p-3 shadow-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-primary" />
            <span className="text-[10px] font-semibold text-primary tracking-wider">PERFORMANCE</span>
          </div>
          <button onClick={togglePerformanceMonitor} className="text-muted-foreground hover:text-foreground">
            <X size={12} />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* CPU */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Cpu size={10} className="text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">CPU LOAD</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${cpuColor}`}>{metrics.cpuLoad.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-daw-surface rounded-full overflow-hidden daw-inset">
              <motion.div
                className={`h-full rounded-full ${metrics.cpuLoad > 80 ? 'bg-daw-meter-red' : metrics.cpuLoad > 50 ? 'bg-daw-meter-yellow' : 'bg-daw-meter-green'}`}
                animate={{ width: `${metrics.cpuLoad}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Memory */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <HardDrive size={10} className="text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">MEMORY</span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-foreground">{metrics.memoryUsage} MB</span>
            </div>
            <div className="h-1.5 bg-daw-surface rounded-full overflow-hidden daw-inset">
              <motion.div
                className="h-full rounded-full bg-daw-track-1"
                animate={{ width: `${Math.min(100, metrics.memoryUsage / 10)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Buffer Health */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Activity size={10} className="text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">BUFFER HEALTH</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${bufferColor}`}>{metrics.bufferHealth.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-daw-surface rounded-full overflow-hidden daw-inset">
              <motion.div
                className={`h-full rounded-full ${metrics.bufferHealth < 70 ? 'bg-daw-meter-red' : 'bg-daw-meter-green'}`}
                animate={{ width: `${metrics.bufferHealth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Latency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">LATENCY</span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-foreground">{metrics.audioLatency.toFixed(1)} ms</span>
          </div>

          {/* Dropouts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertTriangle size={10} className="text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">DROPOUTS</span>
            </div>
            <span className={`text-[10px] font-mono font-semibold ${metrics.dropouts > 0 ? 'text-daw-meter-red' : 'text-daw-meter-green'}`}>{metrics.dropouts}</span>
          </div>

          {/* Buffer Size Control */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1 mb-1.5">
              <Settings size={10} className="text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">BUFFER SIZE</span>
            </div>
            <div className="flex gap-1">
              {[64, 128, 256, 512, 1024].map((size) => (
                <button
                  key={size}
                  onClick={() => setBufferSize(size)}
                  className={`flex-1 py-1 rounded text-[8px] font-mono transition-all ${
                    bufferSize === size ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[8px] text-muted-foreground text-center pt-1">
            {sampleRate / 1000}kHz • {bufferSize} samples • {((bufferSize / sampleRate) * 1000).toFixed(1)}ms
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PerformanceMonitor;
