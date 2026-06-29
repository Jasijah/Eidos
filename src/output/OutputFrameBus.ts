import type { AvatarFrame, AvatarStyle } from '../types';
import type { AvatarIdentityModel } from '../avatar/AvatarIdentityModel';
import type { RealismProfile } from '../avatar/RealismProfile';
import type { OutputSettings } from './OutputSettings';
export interface OutputFramePacket { frame: AvatarFrame; style: AvatarStyle; label: string; identity?: AvatarIdentityModel; realism: RealismProfile; settings: OutputSettings; }
const CHANNEL = 'eidos-output-frame';
export class OutputFrameBus {
  private channel?: BroadcastChannel;
  constructor() { this.ensureChannel(); }
  private ensureChannel(): BroadcastChannel | undefined { if (!this.channel && typeof BroadcastChannel !== 'undefined') this.channel = new BroadcastChannel(CHANNEL); return this.channel; }
  publish(packet: OutputFramePacket): void { this.ensureChannel()?.postMessage(packet); }
  subscribe(listener: (packet: OutputFramePacket) => void): () => void { const channel = this.ensureChannel(); if (!channel) return () => undefined; const handler = (event: MessageEvent<OutputFramePacket>) => listener(event.data); channel.addEventListener('message', handler); return () => channel.removeEventListener('message', handler); }
  close(): void { this.channel?.close(); this.channel = undefined; }
}
