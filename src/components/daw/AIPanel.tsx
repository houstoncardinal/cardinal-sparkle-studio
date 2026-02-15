import { Wand2, Mic, Music, Sparkles, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const aiTools = [
  {
    icon: <Mic size={18} />,
    title: 'AI Vocal Enhancer',
    description: 'Auto noise removal, EQ, compression & de-essing',
    gradient: 'from-daw-track-1/20 to-daw-track-1/5',
    borderColor: 'border-daw-track-1/20',
  },
  {
    icon: <Music size={18} />,
    title: 'AI Beat Generator',
    description: 'Generate MIDI beats from text descriptions',
    gradient: 'from-daw-track-2/20 to-daw-track-2/5',
    borderColor: 'border-daw-track-2/20',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'AI Mastering',
    description: 'One-click loudness optimization & stereo widening',
    gradient: 'from-primary/20 to-primary/5',
    borderColor: 'border-primary/20',
  },
  {
    icon: <Zap size={18} />,
    title: 'Stem Separation',
    description: 'Split any song into vocals, drums, bass & instruments',
    gradient: 'from-daw-track-3/20 to-daw-track-3/5',
    borderColor: 'border-daw-track-3/20',
  },
  {
    icon: <Brain size={18} />,
    title: 'AI Song Assistant',
    description: 'Chord suggestions, melody ideas & arrangement help',
    gradient: 'from-daw-track-4/20 to-daw-track-4/5',
    borderColor: 'border-daw-track-4/20',
  },
  {
    icon: <Wand2 size={18} />,
    title: 'Auto Mix',
    description: 'Smart gain staging, panning & effect suggestions',
    gradient: 'from-daw-track-5/20 to-daw-track-5/5',
    borderColor: 'border-daw-track-5/20',
  },
];

const AIPanel = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-72 border-t border-border bg-card p-4 overflow-y-auto"
    >
      <div className="flex items-center gap-2 mb-3">
        <Wand2 size={14} className="text-primary" />
        <h3 className="text-xs font-semibold text-primary tracking-wider">AI PRODUCTION TOOLS</h3>
        <span className="text-[9px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">PRO</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {aiTools.map((tool, i) => (
          <button
            key={i}
            className={`glass-panel rounded-lg p-3 text-left hover:scale-[1.02] transition-all group border ${tool.borderColor}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="text-primary group-hover:gold-text-glow transition-all">{tool.icon}</div>
              <span className="text-[11px] font-semibold text-foreground">{tool.title}</span>
            </div>
            <p className="text-[9px] text-muted-foreground leading-relaxed">{tool.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default AIPanel;
