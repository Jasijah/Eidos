import type { PresenceMode } from '../types';
import type { ContextState } from './ContextState';

export interface ContextPresenceAdjustment {
  suggestedMode?: PresenceMode;
  engagementBias: number;
  expressionBias: number;
  reasonCode: 'CONTEXT_DISABLED' | 'CONTEXT_LABEL_MAPPED';
}

export class ContextToPresenceMapper {
  map(context: ContextState): ContextPresenceAdjustment {
    if (context.source === 'disabled') return { engagementBias: 0, expressionBias: 0, reasonCode: 'CONTEXT_DISABLED' };
    if (context.label === 'professional') return { suggestedMode: 'professional', engagementBias: 0.04, expressionBias: -0.03, reasonCode: 'CONTEXT_LABEL_MAPPED' };
    if (context.label === 'casual') return { suggestedMode: 'casual', engagementBias: 0.06, expressionBias: 0.05, reasonCode: 'CONTEXT_LABEL_MAPPED' };
    if (context.label === 'presenting') return { suggestedMode: 'creator', engagementBias: 0.12, expressionBias: 0.08, reasonCode: 'CONTEXT_LABEL_MAPPED' };
    if (context.label === 'low-energy') return { suggestedMode: 'low-energy', engagementBias: -0.1, expressionBias: -0.08, reasonCode: 'CONTEXT_LABEL_MAPPED' };
    if (context.label === 'confused' || context.label === 'thinking') return { engagementBias: 0.02, expressionBias: -0.02, reasonCode: 'CONTEXT_LABEL_MAPPED' };
    return { engagementBias: 0.06, expressionBias: 0.03, reasonCode: 'CONTEXT_LABEL_MAPPED' };
  }
}
