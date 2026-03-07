import { useDAWStore } from '@/stores/dawStore';
import { useCallback } from 'react';
import {
  Scissors, Copy, Trash2, Undo2, Redo2, Magnet, ZoomIn, ZoomOut,
  Plus, Download, Save, Users, Share2, Activity, Snowflake, Upload
} from 'lucide-react';
import { useUndoStore } from '@/stores/undoStore';
import { audioEngine } from '@/engine/AudioEngine';
import { toast } from 'sonner';

const Toolbar = () => {
  const { zoom, setZoom, snapEnabled, toggleSnap, togglePerformanceMonitor, toggleExportDialog, toggleCollabModal, addTrack, selectedTrackId, deleteTrack, splitClip, currentBeat, tracks } = useDAWStore();
  const { canUndo, canRedo, undo, redo } = useUndoStore();

  const handleAddTrack = useCallback(() => {
    const id = addTrack('New Track', 'audio');
    toast.success('Track added');
  }, [addTrack]);

  const handleDeleteTrack = useCallback(() => {
    if (selectedTrackId) {
      deleteTrack(selectedTrackId);
      toast.success('Track deleted');
    }
  }, [selectedTrackId, deleteTrack]);

  const handleSplit = useCallback(() => {
    if (!selectedTrackId) return;
    const track = tracks.find(t => t.id === selectedTrackId);
    if (!track) return;
    const clip = track.clips.find(c => currentBeat >= c.startBeat && currentBeat < c.startBeat + c.durationBeats);
    if (clip) {
      splitClip(selectedTrackId, clip.id, currentBeat);
      toast.success('Clip split at playhead');
    }
  }, [selectedTrackId, tracks, currentBeat, splitClip]);

  const handleImportAudio = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const trackId = addTrack(file.name.replace(/\.[^.]+$/, ''), 'audio');
      
      try {
        const buffer = await audioEngine.loadAudioFile(trackId, file);
        if (buffer) {
          // Update waveform data from real audio
          const waveform = audioEngine.getWaveformData(trackId, 128);
          const bpm = useDAWStore.getState().bpm;
          const durationBeats = (buffer.duration * bpm) / 60;
          
          useDAWStore.getState().setTrackClips(trackId, [{
            id: `imported-${Date.now()}`,
            name: file.name.replace(/\.[^.]+$/, ''),
            startBeat: 0,
            durationBeats,
            color: useDAWStore.getState().tracks.find(t => t.id === trackId)?.color ?? 'daw-track-1',
            waveformData: waveform,
          }]);
          
          toast.success(`Imported "${file.name}" (${buffer.duration.toFixed(1)}s)`);
        }
      } catch (err) {
        toast.error('Failed to import audio file');
      }
    };
    input.click();
  }, [addTrack]);

  const handleUndo = useCallback(() => {
    const action = undo();
    if (action?.before.tracks) {
      // Restore tracks from before state
      toast.info(`Undid: ${action.description}`);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const action = redo();
    if (action?.after.tracks) {
      toast.info(`Redid: ${action.description}`);
    }
  }, [redo]);

  const tools = [
    { icon: <Undo2 size={13} />, label: 'Undo', shortcut: '⌘Z', onClick: handleUndo, disabled: !canUndo() },
    { icon: <Redo2 size={13} />, label: 'Redo', shortcut: '⌘⇧Z', onClick: handleRedo, disabled: !canRedo() },
    null,
    { icon: <Scissors size={13} />, label: 'Split at Playhead', shortcut: 'S', onClick: handleSplit },
    { icon: <Copy size={13} />, label: 'Duplicate', shortcut: '⌘D' },
    { icon: <Trash2 size={13} />, label: 'Delete Track', shortcut: '⌫', onClick: handleDeleteTrack },
    null,
    { icon: <Magnet size={13} />, label: 'Snap', active: snapEnabled, onClick: toggleSnap },
    { icon: <Snowflake size={13} />, label: 'Freeze Track' },
    null,
    { icon: <Plus size={13} />, label: 'Add Track', onClick: handleAddTrack },
    { icon: <Upload size={13} />, label: 'Import Audio', onClick: handleImportAudio },
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
            disabled={tool.disabled}
            className={`p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${
              tool.active ? 'text-primary bg-primary/10' : ''
            } ${tool.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
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
      <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Save (⌘S)">
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
