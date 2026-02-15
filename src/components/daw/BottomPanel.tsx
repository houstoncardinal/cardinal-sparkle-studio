import { useState } from 'react';
import { Sliders, Piano, Wand2, FolderOpen } from 'lucide-react';
import Mixer from './Mixer';
import EffectsRack from './EffectsRack';
import AIPanel from './AIPanel';

type Tab = 'mixer' | 'effects' | 'ai' | 'browser';

const BottomPanel = () => {
  const [activeTab, setActiveTab] = useState<Tab>('mixer');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'mixer', label: 'Mixer', icon: <Sliders size={12} /> },
    { id: 'effects', label: 'Effects', icon: <Piano size={12} /> },
    { id: 'ai', label: 'AI Tools', icon: <Wand2 size={12} /> },
    { id: 'browser', label: 'Browser', icon: <FolderOpen size={12} /> },
  ];

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="h-7 bg-daw-surface border-t border-border flex items-center px-2 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {activeTab === 'mixer' && <Mixer />}
      {activeTab === 'effects' && <EffectsRack />}
      {activeTab === 'ai' && <AIPanel />}
      {activeTab === 'browser' && (
        <div className="h-72 border-t border-border bg-card flex items-center justify-center">
          <div className="text-center">
            <FolderOpen size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sound Browser</p>
            <p className="text-xs text-muted-foreground/60">Drag sounds to timeline</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomPanel;
