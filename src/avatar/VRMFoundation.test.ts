import { describe, expect, it } from 'vitest';
import { VRMExpressionMapper } from './VRMExpressionMapper';
import { AvatarProviderRegistry } from './AvatarProviderRegistry';
import type { AvatarFrame } from '../types';

const frame: AvatarFrame = { mouthOpen: 0.4, headX: 0, headY: 0, blink: true, smile: 0.9, tilt: 0, idle: 0, handGesture: false, viseme: 'round' };
describe('VRM foundation', () => {
  it('registers VRM as an active provider', () => { const result = new AvatarProviderRegistry().resolve('vrm'); expect(result.fellBack).toBe(false); expect(result.provider.status().available).toBe(true); });
  it('maps presence signals into bounded VRM expressions', () => { const values = new VRMExpressionMapper().map(frame); expect(values.blink).toBe(1); expect(values.happy).toBeLessThanOrEqual(0.7); expect(values.ou).toBe(0.4); });
});