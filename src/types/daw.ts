export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'bus' | 'master';
  color: string;
  volume: number; // 0-1
  pan: number; // -1 to 1
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  clips: Clip[];
  effects: Effect[];
  meterLevel: number; // 0-1 current level
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
}
