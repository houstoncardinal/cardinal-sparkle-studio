export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'bus' | 'master';
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  clips: Clip[];
  effects: Effect[];
  meterLevel: number;
  // Pro features
  inputTrim: number; // dB, -20 to +20
  phaseInverted: boolean;
  stereoMode: 'stereo' | 'mono';
  sends: Send[];
  frozen: boolean;
  peakHold: number; // peak hold level 0-1
  clipIndicator: boolean;
  gainReduction: number; // 0-1 for compressor GR meter
}

export interface Send {
  id: string;
  targetBusId: string;
  level: number; // 0-1
  preFader: boolean;
}

export interface Clip {
  id: string;
  name: string;
  startBeat: number;
  durationBeats: number;
  color: string;
  waveformData?: number[];
}

export interface Effect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  params: Record<string, number>;
}

export interface DAWState {
  tracks: Track[];
  bpm: number;
  timeSignature: [number, number];
  isPlaying: boolean;
  isRecording: boolean;
  currentBeat: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  selectedTrackId: string | null;
  zoom: number;
  // New state
  bufferSize: number;
  sampleRate: number;
  bitDepth: number;
  metronomeEnabled: boolean;
  snapEnabled: boolean;
  autosaveEnabled: boolean;
  showPerformanceMonitor: boolean;
  showExportDialog: boolean;
  showCollabModal: boolean;
  showAISmartMix: boolean;
  showAIStemSep: boolean;
  showAIArrangement: boolean;
}

export interface PerformanceMetrics {
  cpuLoad: number;
  memoryUsage: number;
  bufferHealth: number;
  audioLatency: number;
  dropouts: number;
}

export interface ExportSettings {
  format: 'wav' | 'mp3' | 'flac';
  sampleRate: 44100 | 48000 | 88200 | 96000;
  bitDepth: 16 | 24 | 32;
  normalize: boolean;
  dithering: boolean;
  stemExport: boolean;
  mp3Bitrate: 128 | 192 | 256 | 320;
}
