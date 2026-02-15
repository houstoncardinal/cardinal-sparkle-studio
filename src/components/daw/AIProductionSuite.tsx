import { useState } from 'react';
import { useDAWStore } from '@/stores/dawStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Mic, Music, Sparkles, Zap, Brain, ChevronRight, Check, Loader2, BarChart3, Layers } from 'lucide-react';

type AIView = 'home' | 'smart-mix' | 'stem-sep' | 'arrangement';

const AIProductionSuite = () => {
  const [view, setView] = useState<AIView>('home');

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-[340px] border-t border-border bg-card overflow-hidden flex"
    >
      {/* Sidebar */}
      <div className="w-44 min-w-[176px] border-r border-border bg-daw-surface p-2 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 px-2 py-1.5 mb-2">
          <Wand2 size={12} className="text-primary" />
          <span className="text-[10px] font-semibold text-primary tracking-wider">AI STUDIO</span>
          <span className="text-[7px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium ml-auto">PRO</span>
        </div>

        {[
          { id: 'home' as const, icon: <Sparkles size={12} />, label: 'Overview' },
          { id: 'smart-mix' as const, icon: <BarChart3 size={12} />, label: 'Smart Mix' },
          { id: 'stem-sep' as const, icon: <Layers size={12} />, label: 'Stem Separation' },
          { id: 'arrangement' as const, icon: <Music size={12} />, label: 'Arrangement' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-[10px] transition-all w-full text-left ${
              view === item.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {item.icon}
            {item.label}
            {view === item.id && <ChevronRight size={10} className="ml-auto" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {view === 'home' && <AIHome key="home" onNavigate={setView} />}
          {view === 'smart-mix' && <SmartMixPanel key="mix" />}
          {view === 'stem-sep' && <StemSeparationPanel key="stem" />}
          {view === 'arrangement' && <ArrangementPanel key="arr" />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const AIHome = ({ onNavigate }: { onNavigate: (v: AIView) => void }) => {
  const tools = [
    { icon: <BarChart3 size={18} />, title: 'Smart Mix Assistant', desc: 'Analyze & auto-mix your tracks with AI-powered level, EQ & dynamics processing', view: 'smart-mix' as const, color: 'daw-track-1' },
    { icon: <Layers size={18} />, title: 'Stem Separation', desc: 'Isolate vocals, drums, bass & instruments from any audio file', view: 'stem-sep' as const, color: 'daw-track-3' },
    { icon: <Music size={18} />, title: 'AI Arrangement', desc: 'Generate song structure with intro, verse, chorus, bridge & outro', view: 'arrangement' as const, color: 'daw-track-4' },
    { icon: <Mic size={18} />, title: 'Vocal Enhancer', desc: 'Auto noise removal, EQ, compression & de-essing for vocals', view: 'home' as const, color: 'daw-track-2' },
    { icon: <Sparkles size={18} />, title: 'AI Mastering', desc: 'One-click loudness optimization & commercial polish', view: 'home' as const, color: 'primary' },
    { icon: <Brain size={18} />, title: 'Song Assistant', desc: 'Chord, melody & arrangement suggestions powered by AI', view: 'home' as const, color: 'daw-track-5' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <h3 className="text-xs font-semibold text-foreground mb-3">AI Production Tools</h3>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
        {tools.map((tool, i) => (
          <button
            key={i}
            onClick={() => onNavigate(tool.view)}
            className="glass-panel rounded-lg p-3 text-left hover:scale-[1.02] transition-all group border border-border/50 hover:border-primary/20"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="text-primary group-hover:gold-text-glow transition-all">{tool.icon}</div>
              <span className="text-[10px] font-semibold text-foreground">{tool.title}</span>
            </div>
            <p className="text-[8px] text-muted-foreground leading-relaxed">{tool.desc}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const SmartMixPanel = () => {
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'preview' | 'applied'>('idle');
  const [progress, setProgress] = useState(0);
  const tracks = useDAWStore((s) => s.tracks);

  const startAnalysis = () => {
    setStage('analyzing');
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setStage('preview'); return 100; }
        return p + Math.random() * 15 + 5;
      });
    }, 300);
  };

  const analysisResults = [
    { track: 'Lead Vocals', action: 'Boost 3kHz +2dB, reduce 400Hz -3dB', category: 'EQ' },
    { track: 'Lead Vocals', action: 'Set compressor ratio 3:1, threshold -16dB', category: 'Dynamics' },
    { track: '808 Bass', action: 'High-pass at 30Hz, boost 60Hz +2dB', category: 'EQ' },
    { track: 'Drums', action: 'Reduce level -2dB, add 2ms attack on comp', category: 'Level' },
    { track: 'Synth Pad', action: 'Pan to R15, reduce volume -4dB', category: 'Balance' },
    { track: 'Master', action: 'Target -14 LUFS, add light limiting', category: 'Master' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">AI Smart Mix Assistant</h3>
      </div>

      {stage === 'idle' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Wand2 size={28} className="text-primary" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-2">Auto Mix Your Track</h4>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
            AI analyzes frequency masking, stereo balance, dynamic range & levels across {tracks.length} tracks
          </p>
          <button
            onClick={startAnalysis}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all gold-glow"
          >
            Auto Mix My Track
          </button>
        </div>
      )}

      {stage === 'analyzing' && (
        <div className="py-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 size={16} className="text-primary animate-spin" />
            <span className="text-xs text-foreground">Analyzing {tracks.length} tracks...</span>
          </div>
          <div className="h-2 bg-daw-surface rounded-full overflow-hidden daw-inset max-w-md mx-auto mb-3">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground text-center space-y-1">
            {progress < 30 && <p>Scanning frequency spectrum...</p>}
            {progress >= 30 && progress < 60 && <p>Detecting frequency masking...</p>}
            {progress >= 60 && progress < 85 && <p>Optimizing stereo balance...</p>}
            {progress >= 85 && <p>Generating mix recommendations...</p>}
          </div>
        </div>
      )}

      {stage === 'preview' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check size={14} className="text-daw-meter-green" />
            <span className="text-xs text-foreground font-medium">Analysis Complete — Review Changes</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto mb-4">
            {analysisResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-daw-surface/50 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium min-w-[50px] text-center">{r.category}</span>
                <span className="text-foreground font-medium min-w-[100px]">{r.track}</span>
                <span className="text-muted-foreground flex-1">{r.action}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStage('applied')}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all"
            >
              Apply All Changes
            </button>
            <button
              onClick={() => setStage('idle')}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {stage === 'applied' && (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-daw-meter-green/20 flex items-center justify-center mx-auto mb-3">
            <Check size={24} className="text-daw-meter-green" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">Mix Applied Successfully</h4>
          <p className="text-xs text-muted-foreground mb-4">6 changes applied across {tracks.length} tracks</p>
          <button onClick={() => setStage('idle')} className="text-xs text-primary hover:underline">Run Again</button>
        </div>
      )}
    </motion.div>
  );
};

const StemSeparationPanel = () => {
  const [stage, setStage] = useState<'upload' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);

  const stems = [
    { name: 'Vocals', icon: '🎤', color: 'bg-daw-track-1', level: 85 },
    { name: 'Drums', icon: '🥁', color: 'bg-daw-track-3', level: 92 },
    { name: 'Bass', icon: '🎸', color: 'bg-daw-track-2', level: 78 },
    { name: 'Other', icon: '🎹', color: 'bg-daw-track-4', level: 88 },
  ];

  const startProcessing = () => {
    setStage('processing');
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setStage('done'); return 100; }
        return p + Math.random() * 8 + 2;
      });
    }, 400);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center gap-2 mb-4">
        <Layers size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">AI Stem Separation</h3>
      </div>

      {stage === 'upload' && (
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onClick={startProcessing}
        >
          <Zap size={32} className="text-muted-foreground mx-auto mb-3" />
          <h4 className="text-sm font-medium text-foreground mb-1">Drop Audio File Here</h4>
          <p className="text-xs text-muted-foreground mb-3">or click to browse • WAV, MP3, FLAC supported</p>
          <span className="text-[10px] text-primary">Click to simulate separation →</span>
        </div>
      )}

      {stage === 'processing' && (
        <div className="py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 size={16} className="text-primary animate-spin" />
            <span className="text-xs text-foreground">Separating stems with AI...</span>
          </div>
          <div className="space-y-2 mb-4">
            {stems.map((stem, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm">{stem.icon}</span>
                <span className="text-[10px] text-foreground w-16">{stem.name}</span>
                <div className="flex-1 h-1.5 bg-daw-surface rounded-full overflow-hidden daw-inset">
                  <motion.div
                    className={`h-full rounded-full ${stem.color}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(100, progress * (0.8 + i * 0.05))}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {progress < 40 ? 'Running spectral analysis...' : progress < 70 ? 'Isolating frequency bands...' : 'Finalizing stems...'}
          </p>
        </div>
      )}

      {stage === 'done' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check size={14} className="text-daw-meter-green" />
            <span className="text-xs text-foreground font-medium">Separation Complete</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {stems.map((stem, i) => (
              <div key={i} className="glass-panel rounded-lg p-3 flex items-center gap-2">
                <span className="text-lg">{stem.icon}</span>
                <div className="flex-1">
                  <span className="text-[10px] font-medium text-foreground block">{stem.name}</span>
                  <span className="text-[8px] text-muted-foreground">Quality: {stem.level}%</span>
                </div>
                <button className="text-[8px] px-2 py-1 rounded bg-primary/15 text-primary font-medium hover:bg-primary/25 transition-colors">
                  Add to Timeline
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setStage('upload')} className="text-xs text-primary hover:underline">Separate Another</button>
        </div>
      )}
    </motion.div>
  );
};

const ArrangementPanel = () => {
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [generated, setGenerated] = useState(false);
  const bpm = useDAWStore((s) => s.bpm);

  const genres = ['Hip Hop', 'Pop', 'R&B', 'Trap', 'EDM', 'Lo-fi', 'Rock', 'Jazz'];
  const moods = ['Dark', 'Uplifting', 'Chill', 'Aggressive', 'Emotional', 'Party'];

  const sections = [
    { name: 'Intro', bars: 4, color: 'bg-daw-track-1/30' },
    { name: 'Verse 1', bars: 8, color: 'bg-daw-track-2/30' },
    { name: 'Pre-Chorus', bars: 4, color: 'bg-daw-track-3/30' },
    { name: 'Chorus', bars: 8, color: 'bg-primary/20' },
    { name: 'Verse 2', bars: 8, color: 'bg-daw-track-2/30' },
    { name: 'Chorus', bars: 8, color: 'bg-primary/20' },
    { name: 'Bridge', bars: 4, color: 'bg-daw-track-4/30' },
    { name: 'Chorus', bars: 8, color: 'bg-primary/20' },
    { name: 'Outro', bars: 4, color: 'bg-daw-track-5/30' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center gap-2 mb-4">
        <Music size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">AI Arrangement Builder</h3>
      </div>

      {!generated ? (
        <div className="space-y-4">
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1.5">Genre</span>
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                    genre === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1.5">Mood</span>
            <div className="flex flex-wrap gap-1">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                    mood === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-daw-surface rounded px-3 py-1.5 daw-inset">
              <span className="text-[8px] text-muted-foreground block">BPM</span>
              <span className="text-sm font-mono text-primary font-semibold">{bpm}</span>
            </div>
            <button
              onClick={() => genre && mood && setGenerated(true)}
              disabled={!genre || !mood}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed gold-glow"
            >
              Generate Arrangement
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check size={14} className="text-daw-meter-green" />
            <span className="text-xs text-foreground font-medium">{genre} • {mood} • {bpm} BPM</span>
          </div>
          {/* Visual arrangement */}
          <div className="flex gap-0.5 h-10 mb-3 rounded overflow-hidden">
            {sections.map((s, i) => (
              <div
                key={i}
                className={`${s.color} flex items-center justify-center border border-border/30 rounded-sm`}
                style={{ flex: s.bars }}
              >
                <span className="text-[8px] font-medium text-foreground/70 truncate px-1">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {sections.map((s, i) => (
              <span key={i} className="text-[8px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                {s.name} ({s.bars} bars)
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all">
              Apply to Timeline
            </button>
            <button onClick={() => setGenerated(false)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
              Regenerate
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AIProductionSuite;
