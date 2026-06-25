import type { AvatarFrame } from '../types';

export interface VRMExpressionValues { blink: number; happy: number; relaxed: number; aa: number; ih: number; ou: number; }

export class VRMExpressionMapper {
  map(frame: AvatarFrame): VRMExpressionValues {
    return { blink: frame.blink ? 1 : 0, happy: Math.min(0.7, frame.smile), relaxed: Math.max(0, 0.16 - frame.smile * 0.12), aa: frame.viseme === 'wide' ? frame.mouthOpen : frame.mouthOpen * 0.45, ih: frame.viseme === 'soft' ? frame.mouthOpen * 0.7 : 0, ou: frame.viseme === 'round' ? frame.mouthOpen : 0 };
  }
}
