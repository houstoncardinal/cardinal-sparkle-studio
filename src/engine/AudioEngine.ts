// Cardinal Studio Pro — Real Web Audio Engine
// Handles playback, effects, metering, recording, and export

export interface TrackNode {
  id: string;
  gainNode: GainNode;
  panNode: StereoPannerNode;
  analyserL: AnalyserNode;
  analyserR: AnalyserNode;
  splitter: ChannelSplitterNode;
  merger: ChannelMergerNode;
  sourceNode: AudioBufferSourceNode | null;
  buffer: AudioBuffer | null;
  // Effects chain
  eqLow: BiquadFilterNode;
  eqMid: BiquadFilterNode;
  eqHigh: BiquadFilterNode;
  compressor: DynamicsCompressorNode;
  muted: boolean;
  soloed: boolean;
}

class AudioEngine {
  private context: AudioContext | null = null;
  private offlineContext: OfflineAudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterAnalyserL: AnalyserNode | null = null;
  private masterAnalyserR: AnalyserNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private trackNodes: Map<string, TrackNode> = new Map();
  private isInitialized = false;
  private scheduledSources: AudioBufferSourceNode[] = [];
  
  // Recording
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingTrackId: string | null = null;
  
  // Metering data cache
  private meterData: Map<string, { left: number; right: number; peak: number }> = new Map();
  private masterMeterData = { left: 0, right: 0, peakL: 0, peakR: 0, lufs: -14 };

  async initialize(sampleRate: number = 48000) {
    if (this.isInitialized && this.context) return;

    this.context = new AudioContext({
      sampleRate,
      latencyHint: 'interactive',
    });

    // Master chain: compressor → limiter → gain → analysers → destination
    this.masterCompressor = this.context.createDynamicsCompressor();
    this.masterCompressor.threshold.value = -12;
    this.masterCompressor.ratio.value = 4;
    this.masterCompressor.attack.value = 0.003;
    this.masterCompressor.release.value = 0.25;

    this.masterLimiter = this.context.createDynamicsCompressor();
    this.masterLimiter.threshold.value = -1;
    this.masterLimiter.ratio.value = 20;
    this.masterLimiter.attack.value = 0.001;
    this.masterLimiter.release.value = 0.1;

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 1.0;

    // Stereo metering
    const splitter = this.context.createChannelSplitter(2);
    this.masterAnalyserL = this.context.createAnalyser();
    this.masterAnalyserR = this.context.createAnalyser();
    this.masterAnalyserL.fftSize = 256;
    this.masterAnalyserR.fftSize = 256;
    this.masterAnalyserL.smoothingTimeConstant = 0.8;
    this.masterAnalyserR.smoothingTimeConstant = 0.8;

    // Wire master chain
    this.masterCompressor.connect(this.masterLimiter);
    this.masterLimiter.connect(this.masterGain);
    this.masterGain.connect(splitter);
    splitter.connect(this.masterAnalyserL, 0);
    splitter.connect(this.masterAnalyserR, 1);
    this.masterGain.connect(this.context.destination);

    this.isInitialized = true;
    
    // Start metering loop
    this.startMeteringLoop();
  }

  getContext() { return this.context; }
  getMasterGain() { return this.masterGain; }
  isReady() { return this.isInitialized && this.context !== null; }

  // === TRACK MANAGEMENT ===
  
  createTrackNode(trackId: string): TrackNode | null {
    if (!this.context || !this.masterCompressor) return null;
    
    const ctx = this.context;
    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner();
    
    // EQ: 3-band
    const eqLow = ctx.createBiquadFilter();
    eqLow.type = 'lowshelf';
    eqLow.frequency.value = 320;
    eqLow.gain.value = 0;
    
    const eqMid = ctx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.frequency.value = 1000;
    eqMid.Q.value = 1.0;
    eqMid.gain.value = 0;
    
    const eqHigh = ctx.createBiquadFilter();
    eqHigh.type = 'highshelf';
    eqHigh.frequency.value = 3200;
    eqHigh.gain.value = 0;
    
    // Compressor
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.1;
    
    // Per-track metering
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    const analyserL = ctx.createAnalyser();
    const analyserR = ctx.createAnalyser();
    analyserL.fftSize = 256;
    analyserR.fftSize = 256;
    analyserL.smoothingTimeConstant = 0.85;
    analyserR.smoothingTimeConstant = 0.85;
    
    // Signal chain: source → eqLow → eqMid → eqHigh → compressor → gain → pan → splitter → analysers
    // Also: pan → masterCompressor
    eqLow.connect(eqMid);
    eqMid.connect(eqHigh);
    eqHigh.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(splitter);
    splitter.connect(analyserL, 0);
    splitter.connect(analyserR, 1);
    panNode.connect(this.masterCompressor);
    
    const node: TrackNode = {
      id: trackId,
      gainNode, panNode, analyserL, analyserR,
      splitter, merger,
      sourceNode: null, buffer: null,
      eqLow, eqMid, eqHigh, compressor,
      muted: false, soloed: false,
    };
    
    this.trackNodes.set(trackId, node);
    return node;
  }

  removeTrackNode(trackId: string) {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.sourceNode?.stop();
      node.sourceNode?.disconnect();
      node.gainNode.disconnect();
      node.panNode.disconnect();
      node.eqLow.disconnect();
      node.eqMid.disconnect();
      node.eqHigh.disconnect();
      node.compressor.disconnect();
      this.trackNodes.delete(trackId);
    }
  }

  // === AUDIO LOADING ===
  
  async loadAudioFile(trackId: string, file: File): Promise<AudioBuffer | null> {
    if (!this.context) return null;
    
    let node = this.trackNodes.get(trackId);
    if (!node) {
      node = this.createTrackNode(trackId) ?? undefined;
      if (!node) return null;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    node.buffer = audioBuffer;
    
    return audioBuffer;
  }

  async loadAudioFromUrl(trackId: string, url: string): Promise<AudioBuffer | null> {
    if (!this.context) return null;
    
    let node = this.trackNodes.get(trackId);
    if (!node) {
      node = this.createTrackNode(trackId) ?? undefined;
      if (!node) return null;
    }
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    node.buffer = audioBuffer;
    
    return audioBuffer;
  }

  // Generate a test tone buffer for demo purposes
  generateTestTone(trackId: string, frequency: number = 440, duration: number = 4, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.context) return null;
    
    let node = this.trackNodes.get(trackId);
    if (!node) {
      node = this.createTrackNode(trackId) ?? undefined;
      if (!node) return null;
    }
    
    const sampleRate = this.context.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = this.context.createBuffer(2, numSamples, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let sample = 0;
        
        switch (type) {
          case 'sine':
            sample = Math.sin(2 * Math.PI * frequency * t);
            break;
          case 'square':
            sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
            break;
          case 'sawtooth':
            sample = 2 * (frequency * t - Math.floor(frequency * t + 0.5));
            break;
          case 'triangle':
            sample = 2 * Math.abs(2 * (frequency * t - Math.floor(frequency * t + 0.5))) - 1;
            break;
        }
        
        // Envelope: fade in/out
        const fadeTime = 0.02;
        const fadeSamples = fadeTime * sampleRate;
        let envelope = 1;
        if (i < fadeSamples) envelope = i / fadeSamples;
        if (i > numSamples - fadeSamples) envelope = (numSamples - i) / fadeSamples;
        
        data[i] = sample * 0.3 * envelope; // Keep volume moderate
      }
    }
    
    node.buffer = buffer;
    return buffer;
  }

  // === PLAYBACK ===
  
  playTrack(trackId: string, startTime: number = 0, offset: number = 0, duration?: number) {
    if (!this.context) return;
    
    const node = this.trackNodes.get(trackId);
    if (!node || !node.buffer || node.muted) return;
    
    // Stop existing source
    if (node.sourceNode) {
      try { node.sourceNode.stop(); } catch {}
      node.sourceNode.disconnect();
    }
    
    const source = this.context.createBufferSource();
    source.buffer = node.buffer;
    source.connect(node.eqLow);
    source.loop = false;
    
    node.sourceNode = source;
    this.scheduledSources.push(source);
    
    if (duration !== undefined) {
      source.start(startTime, offset, duration);
    } else {
      source.start(startTime, offset);
    }
    
    source.onended = () => {
      const idx = this.scheduledSources.indexOf(source);
      if (idx >= 0) this.scheduledSources.splice(idx, 1);
      if (node.sourceNode === source) node.sourceNode = null;
    };
  }

  playAllTracks(bpm: number, startBeat: number = 0) {
    if (!this.context) return;
    
    // Resume context if suspended
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    
    const startTime = this.context.currentTime + 0.05; // small lookahead
    const beatsPerSec = bpm / 60;
    
    this.trackNodes.forEach((node, trackId) => {
      if (node.buffer && !node.muted) {
        const offsetSec = startBeat / beatsPerSec;
        this.playTrack(trackId, startTime, Math.min(offsetSec, node.buffer.duration));
      }
    });
  }

  stopAllTracks() {
    this.scheduledSources.forEach(source => {
      try { source.stop(); } catch {}
    });
    this.scheduledSources = [];
    this.trackNodes.forEach(node => {
      node.sourceNode = null;
    });
  }

  // === TRACK CONTROLS ===
  
  setTrackVolume(trackId: string, volume: number) {
    const node = this.trackNodes.get(trackId);
    if (node && this.context) {
      node.gainNode.gain.setTargetAtTime(volume, this.context.currentTime, 0.01);
    }
  }

  setTrackPan(trackId: string, pan: number) {
    const node = this.trackNodes.get(trackId);
    if (node && this.context) {
      node.panNode.pan.setTargetAtTime(pan, this.context.currentTime, 0.01);
    }
  }

  setTrackMute(trackId: string, muted: boolean) {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.muted = muted;
      if (muted && this.context) {
        node.gainNode.gain.setTargetAtTime(0, this.context.currentTime, 0.005);
      }
    }
  }

  setTrackSolo(trackId: string, soloed: boolean) {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.soloed = soloed;
    }
    // Update all track gains based on solo state
    const anySoloed = Array.from(this.trackNodes.values()).some(n => n.soloed);
    if (this.context) {
      this.trackNodes.forEach(n => {
        if (anySoloed && !n.soloed) {
          n.gainNode.gain.setTargetAtTime(0, this.context!.currentTime, 0.005);
        } else if (!n.muted) {
          // Restore volume - the store handles this
        }
      });
    }
  }

  // === EQ CONTROLS ===
  
  setTrackEQ(trackId: string, low: number, mid: number, high: number) {
    const node = this.trackNodes.get(trackId);
    if (node && this.context) {
      node.eqLow.gain.setTargetAtTime(low, this.context.currentTime, 0.02);
      node.eqMid.gain.setTargetAtTime(mid, this.context.currentTime, 0.02);
      node.eqHigh.gain.setTargetAtTime(high, this.context.currentTime, 0.02);
    }
  }

  // === COMPRESSOR CONTROLS ===
  
  setTrackCompressor(trackId: string, threshold: number, ratio: number, attack: number, release: number) {
    const node = this.trackNodes.get(trackId);
    if (node && this.context) {
      node.compressor.threshold.setTargetAtTime(threshold, this.context.currentTime, 0.02);
      node.compressor.ratio.setTargetAtTime(ratio, this.context.currentTime, 0.02);
      node.compressor.attack.setTargetAtTime(attack / 1000, this.context.currentTime, 0.02);
      node.compressor.release.setTargetAtTime(release / 1000, this.context.currentTime, 0.02);
    }
  }

  // === METERING ===
  
  private startMeteringLoop() {
    const updateMeters = () => {
      if (!this.isInitialized) return;
      
      // Per-track meters
      this.trackNodes.forEach((node, trackId) => {
        const dataL = new Float32Array(node.analyserL.fftSize);
        const dataR = new Float32Array(node.analyserR.fftSize);
        node.analyserL.getFloatTimeDomainData(dataL);
        node.analyserR.getFloatTimeDomainData(dataR);
        
        let rmsL = 0, rmsR = 0, peakL = 0, peakR = 0;
        for (let i = 0; i < dataL.length; i++) {
          rmsL += dataL[i] * dataL[i];
          rmsR += dataR[i] * dataR[i];
          peakL = Math.max(peakL, Math.abs(dataL[i]));
          peakR = Math.max(peakR, Math.abs(dataR[i]));
        }
        rmsL = Math.sqrt(rmsL / dataL.length);
        rmsR = Math.sqrt(rmsR / dataR.length);
        
        const existing = this.meterData.get(trackId);
        const prevPeak = existing?.peak ?? 0;
        
        this.meterData.set(trackId, {
          left: rmsL,
          right: rmsR,
          peak: Math.max(peakL, peakR, prevPeak * 0.995), // Slow peak decay
        });
      });
      
      // Master meters
      if (this.masterAnalyserL && this.masterAnalyserR) {
        const dataL = new Float32Array(this.masterAnalyserL.fftSize);
        const dataR = new Float32Array(this.masterAnalyserR.fftSize);
        this.masterAnalyserL.getFloatTimeDomainData(dataL);
        this.masterAnalyserR.getFloatTimeDomainData(dataR);
        
        let rmsL = 0, rmsR = 0, peakL = 0, peakR = 0;
        for (let i = 0; i < dataL.length; i++) {
          rmsL += dataL[i] * dataL[i];
          rmsR += dataR[i] * dataR[i];
          peakL = Math.max(peakL, Math.abs(dataL[i]));
          peakR = Math.max(peakR, Math.abs(dataR[i]));
        }
        rmsL = Math.sqrt(rmsL / dataL.length);
        rmsR = Math.sqrt(rmsR / dataR.length);
        
        // Approximate LUFS from RMS (simplified K-weighted)
        const combinedRms = Math.sqrt((rmsL * rmsL + rmsR * rmsR) / 2);
        const lufs = combinedRms > 0 ? 20 * Math.log10(combinedRms) - 0.691 : -Infinity;
        
        this.masterMeterData = {
          left: rmsL,
          right: rmsR,
          peakL: Math.max(peakL, this.masterMeterData.peakL * 0.995),
          peakR: Math.max(peakR, this.masterMeterData.peakR * 0.995),
          lufs: isFinite(lufs) ? lufs : -60,
        };
      }
      
      requestAnimationFrame(updateMeters);
    };
    
    requestAnimationFrame(updateMeters);
  }

  getTrackMeter(trackId: string) {
    return this.meterData.get(trackId) ?? { left: 0, right: 0, peak: 0 };
  }

  getMasterMeter() {
    return this.masterMeterData;
  }

  getTrackGainReduction(trackId: string): number {
    const node = this.trackNodes.get(trackId);
    if (node && node.compressor) {
      return node.compressor.reduction; // Returns negative dB
    }
    return 0;
  }

  // === RECORDING ===
  
  async startRecording(trackId: string): Promise<boolean> {
    if (!this.context) return false;
    
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: this.context.sampleRate,
        }
      });
      
      this.recordedChunks = [];
      this.recordingTrackId = trackId;
      
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm',
      });
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      
      this.mediaRecorder.start(100); // Collect data every 100ms
      
      // Also connect input to a track for monitoring
      const sourceNode = this.context.createMediaStreamSource(this.mediaStream);
      let node = this.trackNodes.get(trackId);
      if (!node) {
        node = this.createTrackNode(trackId) ?? undefined;
      }
      if (node) {
        sourceNode.connect(node.eqLow); // Route through effects chain
      }
      
      return true;
    } catch (err) {
      console.error('Recording failed:', err);
      return false;
    }
  }

  async stopRecording(): Promise<AudioBuffer | null> {
    if (!this.mediaRecorder || !this.context) return null;
    
    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        
        try {
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
          
          // Assign to track
          if (this.recordingTrackId) {
            const node = this.trackNodes.get(this.recordingTrackId);
            if (node) node.buffer = audioBuffer;
          }
          
          resolve(audioBuffer);
        } catch {
          resolve(null);
        }
        
        // Cleanup
        this.mediaStream?.getTracks().forEach(t => t.stop());
        this.mediaStream = null;
        this.recordingTrackId = null;
      };
      
      this.mediaRecorder!.stop();
    });
  }

  // === EXPORT ===
  
  async exportMix(
    duration: number,
    sampleRate: number = 48000,
    onProgress?: (progress: number) => void
  ): Promise<AudioBuffer | null> {
    if (!this.context) return null;
    
    const numSamples = Math.ceil(duration * sampleRate);
    const offlineCtx = new OfflineAudioContext(2, numSamples, sampleRate);
    
    // Recreate the mix in offline context
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = 1.0;
    
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -6;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    compressor.connect(masterGain);
    masterGain.connect(offlineCtx.destination);
    
    // Add each track
    this.trackNodes.forEach((node) => {
      if (!node.buffer || node.muted) return;
      
      const source = offlineCtx.createBufferSource();
      source.buffer = node.buffer;
      
      const gain = offlineCtx.createGain();
      gain.gain.value = node.gainNode.gain.value;
      
      const pan = offlineCtx.createStereoPanner();
      pan.pan.value = node.panNode.pan.value;
      
      source.connect(gain);
      gain.connect(pan);
      pan.connect(compressor);
      
      source.start(0);
    });
    
    // Render
    onProgress?.(10);
    const renderedBuffer = await offlineCtx.startRendering();
    onProgress?.(90);
    
    return renderedBuffer;
  }

  audioBufferToWav(buffer: AudioBuffer, bitDepth: number = 24): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = bitDepth / 8;
    const dataSize = length * numChannels * bytesPerSample;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // format (1=PCM, 3=IEEE float)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Interleave channels and write samples
    const channels: Float32Array[] = [];
    for (let ch = 0; ch < numChannels; ch++) {
      channels.push(buffer.getChannelData(ch));
    }
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        
        if (bitDepth === 16) {
          view.setInt16(offset, sample * 0x7FFF, true);
        } else if (bitDepth === 24) {
          const val = Math.round(sample * 0x7FFFFF);
          view.setUint8(offset, val & 0xFF);
          view.setUint8(offset + 1, (val >> 8) & 0xFF);
          view.setUint8(offset + 2, (val >> 16) & 0xFF);
        } else if (bitDepth === 32) {
          view.setFloat32(offset, sample, true);
        }
        
        offset += bytesPerSample;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // === WAVEFORM EXTRACTION ===
  
  getWaveformData(trackId: string, numPoints: number = 128): number[] {
    const node = this.trackNodes.get(trackId);
    if (!node?.buffer) return Array(numPoints).fill(0);
    
    const data = node.buffer.getChannelData(0);
    const blockSize = Math.floor(data.length / numPoints);
    const waveform: number[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      let sum = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(data[start + j] || 0);
      }
      waveform.push(sum / blockSize);
    }
    
    // Normalize
    const max = Math.max(...waveform, 0.001);
    return waveform.map(v => v / max);
  }

  // === PERFORMANCE ===
  
  getPerformanceMetrics() {
    if (!this.context) {
      return { cpuLoad: 0, memoryUsage: 0, bufferHealth: 100, audioLatency: 0, dropouts: 0 };
    }

    const perf = performance as any;
    const memInfo = perf.memory;
    const trackCount = this.trackNodes.size;
    
    // Estimate CPU load from track count and active sources
    const activeSources = this.scheduledSources.length;
    const estimatedCpu = Math.min(100, (trackCount * 2) + (activeSources * 5));

    return {
      cpuLoad: estimatedCpu,
      memoryUsage: memInfo ? Math.round(memInfo.usedJSHeapSize / 1024 / 1024) : 0,
      bufferHealth: this.context.state === 'running' ? 100 : 0,
      audioLatency: this.context.baseLatency ? Math.round(this.context.baseLatency * 1000 * 100) / 100 : 0,
      dropouts: 0,
    };
  }

  getSampleRate() { return this.context?.sampleRate ?? 48000; }
  getLatency() { return this.context ? Math.round(this.context.baseLatency * 1000 * 10) / 10 : 0; }

  hasTrackBuffer(trackId: string): boolean {
    return !!this.trackNodes.get(trackId)?.buffer;
  }

  getTrackBuffer(trackId: string): AudioBuffer | null {
    return this.trackNodes.get(trackId)?.buffer ?? null;
  }

  async suspend() { await this.context?.suspend(); }
  async resume() { await this.context?.resume(); }

  resetPeaks() {
    this.meterData.forEach((data) => {
      data.peak = 0;
    });
    this.masterMeterData.peakL = 0;
    this.masterMeterData.peakR = 0;
  }

  destroy() {
    this.stopAllTracks();
    this.trackNodes.forEach((_, id) => this.removeTrackNode(id));
    this.context?.close();
    this.context = null;
    this.isInitialized = false;
  }
}

export const audioEngine = new AudioEngine();
