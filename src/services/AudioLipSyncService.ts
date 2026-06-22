import type { VisemeShape } from '../types';

export interface LipSyncFrame {
  amplitude: number;
  mouthOpen: number;
  jawOpen: number;
  viseme: VisemeShape;
  plosive: boolean;
  latencyMs: number;
}

export class AudioLipSyncService {
  private context?: AudioContext;
  private analyser?: AnalyserNode;
  private data?: Uint8Array<ArrayBuffer>;
  private source?: MediaStreamAudioSourceNode;
  private previous: LipSyncFrame = createRestFrame();
  private readonly latencyMs = 80;

  async connect(stream: MediaStream): Promise<void> {
    this.disconnect();
    this.context = new AudioContext({ latencyHint: 'interactive' });
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.82;
    this.data = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    this.source = this.context.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
  }

  getMouthOpen(): number {
    return this.getLipSyncFrame().mouthOpen;
  }

  getLipSyncFrame(): LipSyncFrame {
    if (!this.analyser || !this.data) {
      this.previous = this.smoothFrame(createRestFrame(), this.previous);
      return this.previous;
    }

    this.analyser.getByteTimeDomainData(this.data);
    const amplitude = AudioLipSyncService.computeAmplitude(this.data);
    const plosive = AudioLipSyncService.detectPlosive(amplitude, this.previous.amplitude);
    const viseme = AudioLipSyncService.mapViseme(amplitude, plosive);
    const target = AudioLipSyncService.frameFromAmplitude(amplitude, viseme, this.latencyMs);
    this.previous = this.smoothFrame(target, this.previous);
    return this.previous;
  }

  disconnect(): void {
    this.source?.disconnect();
    this.context?.close();
    this.source = undefined;
    this.context = undefined;
    this.analyser = undefined;
    this.data = undefined;
    this.previous = createRestFrame();
  }

  static computeAmplitude(samples: Uint8Array<ArrayBuffer> | number[]): number {
    if (samples.length === 0) return 0;
    let sum = 0;
    for (const value of samples) {
      const centered = (value - 128) / 128;
      sum += centered * centered;
    }
    return Math.min(1, Math.sqrt(sum / samples.length) * 3.2);
  }

  static detectPlosive(amplitude: number, previousAmplitude: number): boolean {
    return amplitude > 0.22 && amplitude - previousAmplitude > 0.14;
  }

  static mapViseme(amplitude: number, plosive: boolean): VisemeShape {
    if (plosive) return 'closed';
    if (amplitude < 0.035) return 'rest';
    if (amplitude < 0.12) return 'soft';
    if (amplitude < 0.28) return 'wide';
    return 'round';
  }

  static frameFromAmplitude(amplitude: number, viseme: VisemeShape, latencyMs: number): LipSyncFrame {
    const rest = 0.035;
    const shaped = Math.pow(Math.max(0, amplitude - rest), 0.72);
    const visemeScale = viseme === 'round' ? 0.72 : viseme === 'wide' ? 0.64 : viseme === 'closed' ? 0.08 : 0.42;
    const mouthOpen = Math.min(0.46, rest + shaped * visemeScale);
    return {
      amplitude,
      mouthOpen,
      jawOpen: Math.min(0.38, mouthOpen * 0.82),
      viseme,
      plosive: viseme === 'closed',
      latencyMs
    };
  }

  private smoothFrame(target: LipSyncFrame, previous: LipSyncFrame): LipSyncFrame {
    const attack = target.mouthOpen > previous.mouthOpen ? 0.38 : 0.2;
    const smooth = (next: number, last: number) => last + (next - last) * attack;
    const mouthOpen = smooth(target.mouthOpen, previous.mouthOpen);
    return {
      ...target,
      mouthOpen,
      jawOpen: smooth(target.jawOpen, previous.jawOpen),
      viseme: mouthOpen < 0.045 ? 'rest' : target.viseme,
      plosive: target.plosive && target.amplitude > 0.18
    };
  }
}

function createRestFrame(): LipSyncFrame {
  return {
    amplitude: 0,
    mouthOpen: 0.035,
    jawOpen: 0.02,
    viseme: 'rest',
    plosive: false,
    latencyMs: 80
  };
}