// Web Audio API procedural soundscape generator (Zero external dependencies / 100% offline)

type SoundType = 'rain' | 'waves' | 'alpha' | 'zen';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: { stop: () => void }[] = [];
  private currentSound: SoundType | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentSound(): SoundType | null {
    return this.currentSound;
  }

  public stop() {
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch (e) { /* ignore */ }
    });
    this.activeNodes = [];
    this.currentSound = null;
  }

  public play(type: SoundType) {
    this.initContext();
    if (!this.ctx) return;

    if (this.currentSound === type) {
      this.stop();
      return;
    }

    this.stop();
    this.currentSound = type;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    switch (type) {
      case 'rain':
        this.startRain();
        break;
      case 'waves':
        this.startOceanWaves();
        break;
      case 'alpha':
        this.startAlphaBinaural();
        break;
      case 'zen':
        this.startZenBell();
        break;
    }
  }

  // ============= RAIN GENERATOR (Filtered Pink/Brown Noise) =============
  private startRain() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push({
      stop: () => {
        try { whiteNoise.stop(); } catch (e) {}
      }
    });
  }

  // ============= OCEAN WAVES GENERATOR (LFO Modulated Noise) =============
  private startOceanWaves() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // LFO for wave cycles (approx 0.1 Hz = 10s per wave)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    brownNoise.connect(filter);
    filter.connect(this.masterGain);

    brownNoise.start();
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        try { brownNoise.stop(); lfo.stop(); } catch (e) {}
      }
    });
  }

  // ============= BINAURAL ALPHA BEATS (10Hz Calming Waves) =============
  private startAlphaBinaural() {
    if (!this.ctx || !this.masterGain) return;
    
    // Left ear: 200 Hz, Right ear: 210 Hz -> 10Hz Alpha differential
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(210, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.12, this.ctx.currentTime);

    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.12, this.ctx.currentTime);

    oscLeft.connect(gainL);
    gainL.connect(merger, 0, 0);

    oscRight.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.activeNodes.push({
      stop: () => {
        try { oscLeft.stop(); oscRight.stop(); } catch (e) {}
      }
    });
  }

  // ============= ZEN TIBETAN BOWL (Harmonic Resonance) =============
  private startZenBell() {
    if (!this.ctx || !this.masterGain) return;
    
    const triggerChime = () => {
      if (!this.ctx || !this.masterGain) return;
      const fundamental = 261.63; // C4
      const ratios = [1, 2.76, 5.4, 8.9];
      const gains = [0.2, 0.08, 0.03, 0.01];

      ratios.forEach((ratio, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * ratio, this.ctx.currentTime);

        gain.gain.setValueAtTime(gains[idx], this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 6.0);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 6.0);
      });
    };

    triggerChime();
    const interval = setInterval(triggerChime, 7000);

    this.activeNodes.push({
      stop: () => {
        clearInterval(interval);
      }
    });
  }
}

export const ambientSound = new AmbientSoundEngine();
