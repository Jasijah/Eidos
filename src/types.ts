export type PresenceMode = 'professional' | 'casual' | 'creator' | 'low-energy';

export type AvatarStyle = 'studio' | 'warm' | 'mono' | 'expressive';

export type VisemeShape = 'rest' | 'soft' | 'wide' | 'round' | 'closed';

export interface UserProfile {
  name: string;
  role: string;
  avatarStyle: AvatarStyle;
  trainingComplete: boolean;
}

export interface GestureProfile {
  nodFrequency: number;
  smileFrequency: number;
  headTilt: number;
  idleMovement: number;
  handGestureEvents: number;
  samples: number;
  updatedAt: string;
}

export interface FaceTrackingSnapshot {
  headX: number;
  headY: number;
  nodding: boolean;
  blinking: boolean;
  smiling: boolean;
  headTilt: number;
}

export interface AvatarFrame {
  mouthOpen: number;
  headX: number;
  headY: number;
  blink: boolean;
  smile: number;
  tilt: number;
  idle: number;
  handGesture: boolean;
  viseme?: VisemeShape;
  jawOpen?: number;
  brow?: number;
  eyeSquint?: number;
  eyeContact?: number;
  shoulderShift?: number;
  posture?: number;
  breathing?: number;
}
