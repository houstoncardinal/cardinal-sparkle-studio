import { useDAWStore } from '@/stores/dawStore';
import {
  Scissors, Copy, Trash2, Undo2, Redo2, Magnet, ZoomIn, ZoomOut,
  Plus, Download, Save, Users, Share2, Activity, Snowflake
} from 'lucide-react';

const Toolbar = () => {
  const { zoom, setZoom, snapEnabled, toggleSnap, togglePerformanceMonitor, toggleExportDialog, toggleCollabModal } = useDAWStore();

  const tools = [
    { icon: <Undo2 size={13} />, label: 'Undo', shortcut: '⌘Z' },
    { icon: <Redo2 size={13} />, label: 'Redo', shortcut: '⌘⇧Z' },
    null,
    { icon: <Scissors size={13} />, label: 'Split', shortcut: 'S' },
    { icon: <Copy size={13} />, label: 'Duplicate', shortcut: '⌘D' },
    { icon: <Trash2 size={13} />, label: 'Delete', shortcut: '⌫' },
    null,
    { icon: <Magnet size={13} />, label: 'Snap', active: snapEnabled, onClick: toggleSnap },
    { icon: <Snowflake size={13} />, label: 'Freeze Track' },
    null,
    { icon: <Plus size={13} />, label: 'Add Track' },
  ];

  return (
    <div className="h-8 bg-daw-surface border-b border-border flex items-center px-3 gap-1">
      {tools.map((tool, i) =>
        tool === null ? (
          <div key={i} className="w-px h-4 bg-border mx-1" />
        ) : (
          <button
            key={i}
            onClick={tool.onClick}
            className={`p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${
              tool.active ? 'text-primary bg-primary/10' : ''
            }`}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            {tool.icon}
          </button>
        )
      )}

      <div className="flex-1" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[10px] font-mono text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(4, zoom + 0.25))}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ZoomIn size={13} />
        </button>
      </div>

      <div className="w-px h-4 bg-border mx-2" />

      {/* Performance Monitor */}
      <button
        onClick={togglePerformanceMonitor}
        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Performance Monitor"
      >
        <Activity size={13} />
      </button>

      {/* Actions */}
      <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Save">
        <Save size={13} />
      </button>
      <button
        onClick={toggleExportDialog}
        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Export"
      >
        <Download size={13} />
      </button>
      <button
        onClick={toggleCollabModal}
        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Collaborate"
      >
        <Users size={13} />
      </button>
      <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Share">
        <Share2 size={13} />
      </button>
    </div>
  );
};

export default Toolbar;
