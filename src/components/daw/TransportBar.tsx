import { useDAWStore } from '@/stores/dawStore';
import { Play, Pause, Square, Circle, SkipBack, SkipForward, Repeat, Mic } from 'lucide-react';
import { useEffect, useRef } from 'react';

const TransportBar = () => {
  const {
    isPlaying, isRecording, bpm, currentBeat, loopEnabled, timeSignature,
    togglePlay, toggleRecord, stop, setBpm, toggleLoop, setCurrentBeat
  } = useDAWStore();

  const animRef = useRef<number>();

  useEffect(() => {
    if (isPlaying) {
      let last = performance.now();
      const tick = (now: number) => {
        const delta = (now - last) / 1000;
        last = now;
        const beatsPerSec = bpm / 60;
        setCurrentBeat(useDAWStore.getState().currentBeat + delta * beatsPerSec);
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, bpm]);

  const bars = Math.floor(currentBeat / timeSignature[0]) + 1;
  const beat = Math.floor(currentBeat % timeSignature[0]) + 1;
  const ticks = Math.floor((currentBeat % 1) * 100);

  const totalSeconds = (currentBeat / bpm) * 60;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 100);

  return (
    <div className="h-14 bg-card border-b border-border flex items-center px-3 gap-2 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">C</span>
        </div>
        <span className="text-sm font-semibold text-primary gold-text-glow tracking-wide hidden lg:block">
          CARDINAL STUDIO
        </span>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* Transport Controls */}
      <div className="flex items-center gap-1 mx-2">
        <button onClick={stop} className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <SkipBack size={14} />
        </button>
        <button onClick={stop} className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Square size={14} />
        </button>
        <button
          onClick={togglePlay}
          className={`p-2.5 rounded-md transition-all ${isPlaying ? 'bg-primary text-primary-foreground gold-glow' : 'bg-secondary hover:bg-daw-surface-overlay text-foreground'}`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={toggleRecord}
          className={`p-2 rounded transition-colors ${isRecording ? 'text-daw-recording animate-recording-blink' : 'text-muted-foreground hover:text-daw-recording'}`}
        >
          <Circle size={14} fill={isRecording ? 'currentColor' : 'none'} />
        </button>
        <button className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <SkipForward size={14} />
        </button>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* Time Display */}
      <div className="font-mono text-sm mx-3 flex gap-4">
        <div className="bg-daw-surface rounded px-3 py-1 daw-inset min-w-[100px] text-center">
          <span className="text-muted-foreground text-[10px] block leading-none mb-0.5">BARS</span>
          <span className="text-primary font-semibold tabular-nums">
            {String(bars).padStart(3, '0')}.{beat}.{String(ticks).padStart(2, '0')}
          </span>
        </div>
        <div className="bg-daw-surface rounded px-3 py-1 daw-inset min-w-[100px] text-center">
          <span className="text-muted-foreground text-[10px] block leading-none mb-0.5">TIME</span>
          <span className="text-foreground font-semibold tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}.{String(ms).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* BPM */}
      <div className="mx-2 bg-daw-surface rounded px-3 py-1 daw-inset">
        <span className="text-muted-foreground text-[10px] block leading-none mb-0.5">BPM</span>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="bg-transparent text-primary font-mono font-semibold text-sm w-12 outline-none tabular-nums"
        />
      </div>

      {/* Time Signature */}
      <div className="bg-daw-surface rounded px-3 py-1 daw-inset">
        <span className="text-muted-foreground text-[10px] block leading-none mb-0.5">SIG</span>
        <span className="text-foreground font-mono font-semibold text-sm">{timeSignature[0]}/{timeSignature[1]}</span>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* Loop */}
      <button
        onClick={toggleLoop}
        className={`p-2 rounded transition-colors ${loopEnabled ? 'text-primary gold-text-glow' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Repeat size={14} />
      </button>

      {/* Metronome placeholder */}
      <button className="p-2 rounded text-muted-foreground hover:text-foreground transition-colors">
        <Mic size={14} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CPU / Status */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-daw-meter-green" />
          <span>CPU 12%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-daw-meter-green" />
          <span>RAM 340MB</span>
        </div>
        <span className="text-primary">48kHz / 24bit</span>
      </div>
    </div>
  );
};

export default TransportBar;
