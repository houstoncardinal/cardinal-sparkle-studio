import { create } from 'zustand';
import type { DAWState, Track, Clip } from '@/types/daw';
import { audioEngine } from '@/engine/AudioEngine';

const generateWaveform = (length: number): number[] =>
  Array.from({ length }, () => Math.random() * 0.8 + 0.1);

const trackColors = [
  'daw-track-1', 'daw-track-2', 'daw-track-3', 'daw-track-4', 'daw-track-5'
];

const defaultTrackExtras = {
  inputTrim: 0,
  phaseInverted: false,
  stereoMode: 'stereo' as const,
  sends: [],
  frozen: false,
  peakHold: 0,
  clipIndicator: false,
  gainReduction: 0,
};

const defaultTracks: Track[] = [
  {
    id: '1', name: 'Lead Vocals', type: 'audio', color: trackColors[0],
    volume: 0.75, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0, ...defaultTrackExtras,
    sends: [{ id: 's1', targetBusId: '6', level: 0.3, preFader: false }],
    clips: [
      { id: 'c1', name: 'Verse 1', startBeat: 4, durationBeats: 16, color: trackColors[0], waveformData: generateWaveform(64) },
      { id: 'c2', name: 'Chorus', startBeat: 24, durationBeats: 16, color: trackColors[0], waveformData: generateWaveform(64) },
    ],
    effects: [
      { id: 'e1', name: 'Compressor', type: 'compressor', enabled: true, params: { threshold: -18, ratio: 4, attack: 10, release: 100 } },
      { id: 'e2', name: 'De-Esser', type: 'deesser', enabled: true, params: { frequency: 6000, threshold: -20 } },
      { id: 'e3', name: 'Reverb', type: 'reverb', enabled: true, params: { mix: 25, decay: 2.5 } },
    ],
  },
  {
    id: '2', name: 'Backing Vocals', type: 'audio', color: trackColors[1],
    volume: 0.55, pan: -0.3, muted: false, soloed: false, armed: false,
    meterLevel: 0, ...defaultTrackExtras,
    sends: [{ id: 's2', targetBusId: '6', level: 0.5, preFader: false }],
    clips: [
      { id: 'c3', name: 'BV Chorus', startBeat: 24, durationBeats: 16, color: trackColors[1], waveformData: generateWaveform(64) },
    ],
    effects: [
      { id: 'e4', name: 'EQ', type: 'eq', enabled: true, params: { low: -3, mid: 0, high: 2 } },
      { id: 'e5', name: 'Compressor', type: 'compressor', enabled: true, params: { threshold: -15, ratio: 3, attack: 15, release: 120 } },
    ],
  },
  {
    id: '3', name: '808 Bass', type: 'midi', color: trackColors[2],
    volume: 0.8, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0, ...defaultTrackExtras, stereoMode: 'mono' as const,
    clips: [
      { id: 'c4', name: 'Bass Pattern', startBeat: 0, durationBeats: 32, color: trackColors[2], waveformData: generateWaveform(128) },
      { id: 'c5', name: 'Bass Drop', startBeat: 36, durationBeats: 12, color: trackColors[2], waveformData: generateWaveform(48) },
    ],
    effects: [
      { id: 'e6', name: 'Distortion', type: 'distortion', enabled: true, params: { drive: 30, tone: 60 } },
    ],
  },
  {
    id: '4', name: 'Drums', type: 'midi', color: trackColors[3],
    volume: 0.7, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0, ...defaultTrackExtras,
    clips: [
      { id: 'c6', name: 'Main Beat', startBeat: 0, durationBeats: 48, color: trackColors[3], waveformData: generateWaveform(192) },
    ],
    effects: [
      { id: 'e7', name: 'Compressor', type: 'compressor', enabled: true, params: { threshold: -12, ratio: 6, attack: 5, release: 80 } },
      { id: 'e8', name: 'Limiter', type: 'limiter', enabled: true, params: { ceiling: -0.3 } },
    ],
  },
  {
    id: '5', name: 'Synth Pad', type: 'midi', color: trackColors[4],
    volume: 0.45, pan: 0.2, muted: false, soloed: false, armed: false,
    meterLevel: 0, ...defaultTrackExtras,
    sends: [{ id: 's3', targetBusId: '6', level: 0.6, preFader: false }],
    clips: [
      { id: 'c7', name: 'Pad A', startBeat: 8, durationBeats: 24, color: trackColors[4], waveformData: generateWaveform(96) },
    ],
    effects: [
      { id: 'e9', name: 'Chorus', type: 'chorus', enabled: true, params: { rate: 0.5, depth: 60 } },
      { id: 'e10', name: 'Delay', type: 'delay', enabled: true, params: { time: 375, feedback: 35, mix: 25 } },
    ],
  },
  {
    id: '6', name: 'FX Return', type: 'bus', color: trackColors[0],
    volume: 0.6, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0, ...defaultTrackExtras,
    clips: [],
    effects: [
      { id: 'e11', name: 'Reverb', type: 'reverb', enabled: true, params: { mix: 100, decay: 4, predelay: 20 } },
    ],
  },
  {
    id: '7', name: 'Drum Bus', type: 'bus', color: trackColors[3],
    volume: 0.75, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0, ...defaultTrackExtras,
    clips: [],
    effects: [
      { id: 'e12', name: 'Bus Comp', type: 'compressor', enabled: true, params: { threshold: -10, ratio: 2, attack: 30, release: 200 } },
    ],
  },
];

let clipIdCounter = 100;
let trackIdCounter = 10;

interface DAWStore extends DAWState {
  // Transport
  togglePlay: () => void;
  toggleRecord: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setCurrentBeat: (beat: number) => void;
  toggleLoop: () => void;
  toggleMetronome: () => void;
  
  // Track controls
  setVolume: (trackId: string, volume: number) => void;
  setPan: (trackId: string, pan: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  toggleArm: (trackId: string) => void;
  selectTrack: (trackId: string | null) => void;
  addTrack: (name: string, type: 'audio' | 'midi') => string;
  deleteTrack: (trackId: string) => void;
  renameTrack: (trackId: string, name: string) => void;
  
  // Clip operations
  moveClip: (trackId: string, clipId: string, newStartBeat: number) => void;
  resizeClip: (trackId: string, clipId: string, newDuration: number) => void;
  splitClip: (trackId: string, clipId: string, splitBeat: number) => void;
  deleteClip: (trackId: string, clipId: string) => void;
  addClip: (trackId: string, clip: Clip) => void;
  
  // Advanced track controls
  setInputTrim: (trackId: string, trim: number) => void;
  togglePhase: (trackId: string) => void;
  toggleStereoMode: (trackId: string) => void;
  
  // View
  setZoom: (zoom: number) => void;
  toggleSnap: () => void;
  setBufferSize: (size: number) => void;
  
  // Panels
  togglePerformanceMonitor: () => void;
  toggleExportDialog: () => void;
  toggleCollabModal: () => void;
  toggleAISmartMix: () => void;
  toggleAIStemSep: () => void;
  toggleAIArrangement: () => void;
  
  // Metering
  setPeakHold: (trackId: string, level: number) => void;
  resetClipIndicator: (trackId: string) => void;
  updateMeterLevel: (trackId: string, level: number) => void;
  
  // Import
  setTrackClips: (trackId: string, clips: Clip[]) => void;
}

export const useDAWStore = create<DAWStore>((set, get) => ({
  tracks: defaultTracks,
  bpm: 140,
  timeSignature: [4, 4] as [number, number],
  isPlaying: false,
  isRecording: false,
  currentBeat: 0,
  loopEnabled: true,
  loopStart: 0,
  loopEnd: 48,
  selectedTrackId: '1',
  zoom: 1,
  bufferSize: 256,
  sampleRate: 48000,
  bitDepth: 24,
  metronomeEnabled: false,
  snapEnabled: true,
  autosaveEnabled: true,
  showPerformanceMonitor: false,
  showExportDialog: false,
  showCollabModal: false,
  showAISmartMix: false,
  showAIStemSep: false,
  showAIArrangement: false,

  // Transport
  togglePlay: () => {
    const state = get();
    if (!state.isPlaying) {
      // Starting playback
      audioEngine.playAllTracks(state.bpm, state.currentBeat);
    } else {
      // Pausing
      audioEngine.stopAllTracks();
    }
    set((s) => ({ isPlaying: !s.isPlaying, isRecording: s.isPlaying ? false : s.isRecording }));
  },
  toggleRecord: () => {
    const state = get();
    if (!state.isRecording) {
      // Find armed track
      const armedTrack = state.tracks.find(t => t.armed);
      if (armedTrack) {
        audioEngine.startRecording(armedTrack.id);
      }
    } else {
      audioEngine.stopRecording();
    }
    set((s) => ({ isRecording: !s.isRecording, isPlaying: true }));
  },
  stop: () => {
    audioEngine.stopAllTracks();
    set({ isPlaying: false, isRecording: false, currentBeat: 0 });
  },
  setBpm: (bpm) => set({ bpm }),
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
  toggleLoop: () => set((s) => ({ loopEnabled: !s.loopEnabled })),
  toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),

  // Track controls
  setVolume: (trackId, volume) => {
    audioEngine.setTrackVolume(trackId, volume);
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, volume } : t)),
    }));
  },
  setPan: (trackId, pan) => {
    audioEngine.setTrackPan(trackId, pan);
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, pan } : t)),
    }));
  },
  toggleMute: (trackId) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track) audioEngine.setTrackMute(trackId, !track.muted);
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    }));
  },
  toggleSolo: (trackId) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track) audioEngine.setTrackSolo(trackId, !track.soloed);
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, soloed: !t.soloed } : t)),
    }));
  },
  toggleArm: (trackId) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, armed: !t.armed } : t)),
  })),
  selectTrack: (trackId) => set({ selectedTrackId: trackId }),
  
  addTrack: (name, type) => {
    const id = String(++trackIdCounter);
    const color = trackColors[trackIdCounter % trackColors.length];
    const newTrack: Track = {
      id, name, type, color,
      volume: 0.75, pan: 0, muted: false, soloed: false, armed: false,
      clips: [], effects: [], meterLevel: 0, ...defaultTrackExtras,
    };
    audioEngine.createTrackNode(id);
    set((s) => ({ tracks: [...s.tracks, newTrack], selectedTrackId: id }));
    return id;
  },
  
  deleteTrack: (trackId) => {
    audioEngine.removeTrackNode(trackId);
    set((s) => ({
      tracks: s.tracks.filter(t => t.id !== trackId),
      selectedTrackId: s.selectedTrackId === trackId ? (s.tracks[0]?.id ?? null) : s.selectedTrackId,
    }));
  },
  
  renameTrack: (trackId, name) => set((s) => ({
    tracks: s.tracks.map(t => t.id === trackId ? { ...t, name } : t),
  })),

  // Clip operations
  moveClip: (trackId, clipId, newStartBeat) => set((s) => ({
    tracks: s.tracks.map(t => t.id === trackId ? {
      ...t,
      clips: t.clips.map(c => c.id === clipId ? { ...c, startBeat: Math.max(0, newStartBeat) } : c),
    } : t),
  })),
  
  resizeClip: (trackId, clipId, newDuration) => set((s) => ({
    tracks: s.tracks.map(t => t.id === trackId ? {
      ...t,
      clips: t.clips.map(c => c.id === clipId ? { ...c, durationBeats: Math.max(1, newDuration) } : c),
    } : t),
  })),
  
  splitClip: (trackId, clipId, splitBeat) => set((s) => ({
    tracks: s.tracks.map(t => {
      if (t.id !== trackId) return t;
      const clip = t.clips.find(c => c.id === clipId);
      if (!clip || splitBeat <= clip.startBeat || splitBeat >= clip.startBeat + clip.durationBeats) return t;
      
      const leftDuration = splitBeat - clip.startBeat;
      const rightDuration = clip.durationBeats - leftDuration;
      const leftWaveLen = Math.floor((clip.waveformData?.length ?? 64) * (leftDuration / clip.durationBeats));
      
      const leftClip: Clip = {
        ...clip,
        durationBeats: leftDuration,
        waveformData: clip.waveformData?.slice(0, leftWaveLen),
      };
      const rightClip: Clip = {
        id: `c${++clipIdCounter}`,
        name: `${clip.name} (R)`,
        startBeat: splitBeat,
        durationBeats: rightDuration,
        color: clip.color,
        waveformData: clip.waveformData?.slice(leftWaveLen),
      };
      
      return {
        ...t,
        clips: [...t.clips.filter(c => c.id !== clipId), leftClip, rightClip],
      };
    }),
  })),
  
  deleteClip: (trackId, clipId) => set((s) => ({
    tracks: s.tracks.map(t => t.id === trackId ? {
      ...t,
      clips: t.clips.filter(c => c.id !== clipId),
    } : t),
  })),
  
  addClip: (trackId, clip) => set((s) => ({
    tracks: s.tracks.map(t => t.id === trackId ? {
      ...t,
      clips: [...t.clips, clip],
    } : t),
  })),

  // Advanced
  setInputTrim: (trackId, trim) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, inputTrim: trim } : t)),
  })),
  togglePhase: (trackId) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, phaseInverted: !t.phaseInverted } : t)),
  })),
  toggleStereoMode: (trackId) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, stereoMode: t.stereoMode === 'stereo' ? 'mono' : 'stereo' } : t)),
  })),

  // View
  setZoom: (zoom) => set({ zoom }),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setBufferSize: (size) => set({ bufferSize: size }),

  // Panels
  togglePerformanceMonitor: () => set((s) => ({ showPerformanceMonitor: !s.showPerformanceMonitor })),
  toggleExportDialog: () => set((s) => ({ showExportDialog: !s.showExportDialog })),
  toggleCollabModal: () => set((s) => ({ showCollabModal: !s.showCollabModal })),
  toggleAISmartMix: () => set((s) => ({ showAISmartMix: !s.showAISmartMix })),
  toggleAIStemSep: () => set((s) => ({ showAIStemSep: !s.showAIStemSep })),
  toggleAIArrangement: () => set((s) => ({ showAIArrangement: !s.showAIArrangement })),

  // Metering
  setPeakHold: (trackId, level) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, peakHold: Math.max(t.peakHold, level) } : t)),
  })),
  resetClipIndicator: (trackId) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, clipIndicator: false, peakHold: 0 } : t)),
  })),
  updateMeterLevel: (trackId, level) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, meterLevel: level } : t)),
  })),
  
  setTrackClips: (trackId, clips) => set((s) => ({
    tracks: s.tracks.map(t => t.id === trackId ? { ...t, clips } : t),
  })),
}));
