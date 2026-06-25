import { useEffect, useMemo, useState } from 'react';
import { AvatarCanvas } from '../components/AvatarCanvas';
import { defaultRealismProfile } from '../avatar/RealismProfile';
import type { AvatarFrame } from '../types';
import { OutputFrameBus, type OutputFramePacket } from './OutputFrameBus';
import { loadOutputSettings } from './OutputSettings';

const emptyFrame: AvatarFrame = { mouthOpen: 0.03, headX: 0, headY: 0, blink: false, smile: 0.08, tilt: 0, idle: 0.12, handGesture: false, jawOpen: 0.02, posture: 0.62, breathing: 0.5 };

export function OutputWindowApp() {
  const bus = useMemo(() => new OutputFrameBus(), []);
  const [packet, setPacket] = useState<OutputFramePacket>(() => ({ frame: emptyFrame, style: 'studio', label: 'Eidos', realism: defaultRealismProfile, settings: loadOutputSettings() }));
  useEffect(() => { const unsubscribe = bus.subscribe(setPacket); return () => { unsubscribe(); bus.close(); }; }, [bus]);
  return <main className={`output-window output-bg-${packet.settings.background}`} style={packet.settings.background === 'solid' ? { background: packet.settings.solidColor } : undefined}><AvatarCanvas frame={packet.frame} style={packet.style} label={packet.label} realism={packet.realism} identity={packet.identity} outputSettings={packet.settings} /></main>;
}
