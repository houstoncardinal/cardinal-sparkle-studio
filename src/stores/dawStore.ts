import { create } from 'zustand';
import type { DAWState, Track, Clip } from '@/types/daw';

const generateWaveform = (length: number): number[] =>
  Array.from({ length }, () => Math.random() * 0.8 + 0.1);

const trackColors = [
  'daw-track-1', 'daw-track-2', 'daw-track-3', 'daw-track-4', 'daw-track-5'
];

const defaultTracks: Track[] = [
  {
    id: '1', name: 'Lead Vocals', type: 'audio', color: trackColors[0],
    volume: 0.75, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0.65,
    clips: [
      { id: 'c1', name: 'Verse 1', startBeat: 4, durationBeats: 16, color: trackColors[0], waveformData: generateWaveform(64) },
      { id: 'c2', name: 'Chorus', startBeat: 24, durationBeats: 16, color: trackColors[0], waveformData: generateWaveform(64) },
    ],
    effects: [
      { id: 'e1', name: 'Compressor', type: 'compressor', enabled: true, params: { threshold: -18, ratio: 4 } },
      { id: 'e2', name: 'Reverb', type: 'reverb', enabled: true, params: { mix: 25, decay: 2.5 } },
    ],
  },
  {
    id: '2', name: 'Backing Vocals', type: 'audio', color: trackColors[1],
    volume: 0.55, pan: -0.3, muted: false, soloed: false, armed: false,
    meterLevel: 0.45,
    clips: [
      { id: 'c3', name: 'BV Chorus', startBeat: 24, durationBeats: 16, color: trackColors[1], waveformData: generateWaveform(64) },
    ],
    effects: [
      { id: 'e3', name: 'EQ', type: 'eq', enabled: true, params: { low: -3, mid: 0, high: 2 } },
    ],
  },
  {
    id: '3', name: '808 Bass', type: 'midi', color: trackColors[2],
    volume: 0.8, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0.72,
    clips: [
      { id: 'c4', name: 'Bass Pattern', startBeat: 0, durationBeats: 32, color: trackColors[2], waveformData: generateWaveform(128) },
      { id: 'c5', name: 'Bass Drop', startBeat: 36, durationBeats: 12, color: trackColors[2], waveformData: generateWaveform(48) },
    ],
    effects: [],
  },
  {
    id: '4', name: 'Drums', type: 'midi', color: trackColors[3],
    volume: 0.7, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0.8,
    clips: [
      { id: 'c6', name: 'Main Beat', startBeat: 0, durationBeats: 48, color: trackColors[3], waveformData: generateWaveform(192) },
    ],
    effects: [
      { id: 'e4', name: 'Limiter', type: 'limiter', enabled: true, params: { ceiling: -0.3 } },
    ],
  },
  {
    id: '5', name: 'Synth Pad', type: 'midi', color: trackColors[4],
    volume: 0.45, pan: 0.2, muted: false, soloed: false, armed: false,
    meterLevel: 0.35,
    clips: [
      { id: 'c7', name: 'Pad A', startBeat: 8, durationBeats: 24, color: trackColors[4], waveformData: generateWaveform(96) },
    ],
    effects: [
      { id: 'e5', name: 'Chorus', type: 'chorus', enabled: true, params: { rate: 0.5, depth: 60 } },
      { id: 'e6', name: 'Delay', type: 'delay', enabled: true, params: { time: 375, feedback: 35 } },
    ],
  },
  {
    id: '6', name: 'FX Return', type: 'bus', color: trackColors[0],
    volume: 0.6, pan: 0, muted: false, soloed: false, armed: false,
    meterLevel: 0.3,
    clips: [],
    effects: [
      { id: 'e7', name: 'Reverb', type: 'reverb', enabled: true, params: { mix: 100, decay: 4 } },
    ],
  },
];

interface DAWStore extends DAWState {
  togglePlay: () => void;
  toggleRecord: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setVolume: (trackId: string, volume: number) => void;
  setPan: (trackId: string, pan: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  toggleArm: (trackId: string) => void;
  selectTrack: (trackId: string | null) => void;
  setZoom: (zoom: number) => void;
  toggleLoop: () => void;
  setCurrentBeat: (beat: number) => void;
}

export const useDAWStore = create<DAWStore>((set) => ({
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

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying, isRecording: s.isPlaying ? false : s.isRecording })),
  toggleRecord: () => set((s) => ({ isRecording: !s.isRecording, isPlaying: true })),
  stop: () => set({ isPlaying: false, isRecording: false, currentBeat: 0 }),
  setBpm: (bpm) => set({ bpm }),
  setVolume: (trackId, volume) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, volume } : t)),
  })),
  setPan: (trackId, pan) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, pan } : t)),
  })),
  toggleMute: (trackId) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
  })),
  toggleSolo: (trackId) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, soloed: !t.soloed } : t)),
  })),
  toggleArm: (trackId) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, armed: !t.armed } : t)),
  })),
  selectTrack: (trackId) => set({ selectedTrackId: trackId }),
  setZoom: (zoom) => set({ zoom }),
  toggleLoop: () => set((s) => ({ loopEnabled: !s.loopEnabled })),
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
}));
