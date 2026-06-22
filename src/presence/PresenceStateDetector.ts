import type { LipSyncFrame } from '../services/AudioLipSyncService';
import type { PresenceActivityState } from './BehaviorSignal';

export interface PresenceContextHooks {
  conversationRole?: 'speaker' | 'listener' | 'presenter' | 'unknown';
  recentTranscriptIntent?: 'question' | 'answer' | 'thinking' | 'unknown';
}

export class PresenceStateDetector {
  classify(lipSync: Pick<LipSyncFrame, 'amplitude'>, hooks: PresenceContextHooks = {}): PresenceActivityState {
    if (hooks.recentTranscriptIntent === 'thinking') return 'thinking';
    if (lipSync.amplitude > 0.055) return 'speaking';
    if (hooks.conversationRole === 'listener' || hooks.conversationRole === 'presenter') return 'listening';
    if (lipSync.amplitude > 0.018) return 'listening';
    return 'idle';
  }
}