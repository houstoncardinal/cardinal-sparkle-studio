import { useState } from 'react';
import { useDAWStore } from '@/stores/dawStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Copy, Check, Mail, Link } from 'lucide-react';

const CollabModal = () => {
  const { showCollabModal, toggleCollabModal } = useDAWStore();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [collaborators] = useState([
    { name: 'You', role: 'Owner', status: 'online', avatar: 'H' },
  ]);

  const sessionLink = 'https://cardinal.studio/session/abc-123-xyz';

  const copyLink = () => {
    navigator.clipboard.writeText(sessionLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!showCollabModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        onClick={toggleCollabModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-[420px] glass-panel rounded-xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Invite to Session</h2>
            </div>
            <button onClick={toggleCollabModal} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          {/* Session link */}
          <div className="mb-4">
            <label className="text-[10px] text-muted-foreground block mb-1.5 uppercase tracking-wider">Session Link</label>
            <div className="flex gap-1">
              <div className="flex-1 bg-daw-surface rounded-lg px-3 py-2 daw-inset flex items-center">
                <Link size={12} className="text-muted-foreground mr-2" />
                <span className="text-[10px] text-foreground font-mono truncate">{sessionLink}</span>
              </div>
              <button
                onClick={copyLink}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  copied ? 'bg-daw-meter-green/20 text-daw-meter-green' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Invite by email */}
          <div className="mb-4">
            <label className="text-[10px] text-muted-foreground block mb-1.5 uppercase tracking-wider">Invite by Email</label>
            <div className="flex gap-1">
              <div className="flex-1 bg-daw-surface rounded-lg px-3 py-2 daw-inset flex items-center">
                <Mail size={12} className="text-muted-foreground mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="producer@email.com"
                  className="bg-transparent text-[10px] text-foreground outline-none flex-1 placeholder:text-muted-foreground/50"
                />
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all">
                Invite
              </button>
            </div>
          </div>

          {/* Collaborators */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1.5 uppercase tracking-wider">In Session</label>
            <div className="space-y-1">
              {collaborators.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-daw-surface/50">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {c.avatar}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-medium text-foreground block">{c.name}</span>
                    <span className="text-[8px] text-muted-foreground">{c.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-daw-meter-green" />
                    <span className="text-[8px] text-daw-meter-green">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[9px] text-muted-foreground">
              🔒 Real-time collaboration with live cursors, multi-user editing, and instant sync. All changes are saved automatically.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CollabModal;
