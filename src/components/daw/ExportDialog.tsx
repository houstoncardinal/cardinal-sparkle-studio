import { useState } from 'react';
import { useDAWStore } from '@/stores/dawStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileAudio, Loader2, Check } from 'lucide-react';
import type { ExportSettings } from '@/types/daw';

const ExportDialog = () => {
  const { showExportDialog, toggleExportDialog } = useDAWStore();
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const [settings, setSettings] = useState<ExportSettings>({
    format: 'wav',
    sampleRate: 48000,
    bitDepth: 24,
    normalize: true,
    dithering: false,
    stemExport: false,
    mp3Bitrate: 320,
  });

  const startExport = () => {
    setExporting(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setExporting(false); setDone(true); return 100; }
        return p + Math.random() * 12 + 3;
      });
    }, 200);
  };

  if (!showExportDialog) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        onClick={toggleExportDialog}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-[480px] glass-panel rounded-xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Download size={18} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Export Project</h2>
            </div>
            <button onClick={toggleExportDialog} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          {!exporting && !done && (
            <div className="space-y-4">
              {/* Format */}
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1.5 uppercase tracking-wider">Format</label>
                <div className="flex gap-1">
                  {(['wav', 'mp3', 'flac'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setSettings((s) => ({ ...s, format: f }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        settings.format === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Rate & Bit Depth */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1.5 uppercase tracking-wider">Sample Rate</label>
                  <div className="flex flex-col gap-1">
                    {([44100, 48000, 88200, 96000] as const).map((sr) => (
                      <button
                        key={sr}
                        onClick={() => setSettings((s) => ({ ...s, sampleRate: sr }))}
                        className={`py-1 rounded text-[10px] font-mono transition-all ${
                          settings.sampleRate === sr ? 'bg-primary/15 text-primary' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {(sr / 1000).toFixed(1)} kHz
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1.5 uppercase tracking-wider">Bit Depth</label>
                  <div className="flex flex-col gap-1">
                    {([16, 24, 32] as const).map((bd) => (
                      <button
                        key={bd}
                        onClick={() => setSettings((s) => ({ ...s, bitDepth: bd }))}
                        className={`py-1 rounded text-[10px] font-mono transition-all ${
                          settings.bitDepth === bd ? 'bg-primary/15 text-primary' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {bd}-bit
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {settings.format === 'mp3' && (
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1.5 uppercase tracking-wider">MP3 Bitrate</label>
                  <div className="flex gap-1">
                    {([128, 192, 256, 320] as const).map((br) => (
                      <button
                        key={br}
                        onClick={() => setSettings((s) => ({ ...s, mp3Bitrate: br }))}
                        className={`flex-1 py-1 rounded text-[10px] font-mono transition-all ${
                          settings.mp3Bitrate === br ? 'bg-primary/15 text-primary' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {br}k
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'normalize', label: 'Normalize' },
                  { key: 'dithering', label: 'Dithering' },
                  { key: 'stemExport', label: 'Stem Export' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                    <div
                      onClick={() => setSettings((s) => ({ ...s, [key]: !s[key as keyof ExportSettings] }))}
                      className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                        settings[key as keyof ExportSettings] ? 'bg-primary border-primary' : 'border-border'
                      }`}
                    >
                      {settings[key as keyof ExportSettings] && <Check size={10} className="text-primary-foreground" />}
                    </div>
                    <span className="text-[10px] text-foreground">{label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={startExport}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all gold-glow"
              >
                Export {settings.format.toUpperCase()} • {(settings.sampleRate / 1000).toFixed(1)}kHz • {settings.bitDepth}-bit
              </button>
            </div>
          )}

          {exporting && (
            <div className="py-8 text-center">
              <Loader2 size={24} className="text-primary animate-spin mx-auto mb-3" />
              <p className="text-xs text-foreground mb-3">Rendering audio...</p>
              <div className="h-2 bg-daw-surface rounded-full overflow-hidden daw-inset max-w-xs mx-auto mb-2">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{Math.min(100, Math.round(progress))}%</span>
            </div>
          )}

          {done && (
            <div className="py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-daw-meter-green/20 flex items-center justify-center mx-auto mb-3">
                <FileAudio size={24} className="text-daw-meter-green" />
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1">Export Complete</h4>
              <p className="text-xs text-muted-foreground mb-4">Cardinal_Studio_Mix.{settings.format}</p>
              <div className="flex gap-2 justify-center">
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                  Download
                </button>
                <button onClick={() => { setDone(false); toggleExportDialog(); }} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs">
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportDialog;
