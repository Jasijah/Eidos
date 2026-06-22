import type { AvatarFrame, AvatarStyle } from '../types';
import type { AvatarAssetDescriptor } from './AvatarAssetProvider';
import type { ResolvedRealismProfile } from './RealismProfile';
import { clamp } from './RealismProfile';

export interface RealisticRenderInput {
  frame: AvatarFrame;
  style: AvatarStyle;
  asset: AvatarAssetDescriptor;
  realism: ResolvedRealismProfile;
  label: string;
}

export class RealisticAvatarRenderer {
  renderSvg(input: RealisticRenderInput): string {
    const { asset, frame, realism } = input;
    const eyeOpen = frame.blink ? 0.08 : 1 - (frame.eyeSquint ?? 0.06) * 0.28;
    const gaze = clamp((frame.eyeContact ?? 0.65) - 0.5, -0.28, 0.28);
    const headX = frame.headX * 34;
    const headY = frame.headY * 22;
    const tilt = frame.tilt * 9;
    const shoulderShift = (frame.shoulderShift ?? 0) * 28;
    const posture = (frame.posture ?? realism.postureLift) * -12;
    const mouthWidth = 34 + (frame.viseme === 'wide' ? 10 : 0) - (frame.viseme === 'round' ? 6 : 0);
    const mouthHeight = 3 + frame.mouthOpen * 34;
    const smileLift = frame.smile * 16;
    const browOffset = (frame.brow ?? 0) * -18;
    const breathing = Math.sin(frame.idle * 5) * 1.8;

    return `
      <svg viewBox="0 0 720 540" role="img" aria-label="${escapeHtml(input.label)} realistic avatar preview" class="realistic-avatar-svg">
        <defs>
          <linearGradient id="studioBg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#f7faf8" />
            <stop offset="0.58" stop-color="#e7efec" />
            <stop offset="1" stop-color="#d7e1de" />
          </linearGradient>
          <radialGradient id="keyLight" cx="44%" cy="20%" r="58%">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.88" />
            <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
          <filter id="feedBlur"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="softDepth" x="-20%" y="-20%" width="140%" height="145%">
            <feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#15201f" flood-opacity="0.18" />
          </filter>
          <linearGradient id="skinShade" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#f2c1a7" />
            <stop offset="0.5" stop-color="${asset.skinTone}" />
            <stop offset="1" stop-color="#9d6554" />
          </linearGradient>
        </defs>
        <rect width="720" height="540" rx="0" fill="url(#studioBg)" />
        <circle cx="165" cy="118" r="95" fill="#ffffff" opacity="0.52" filter="url(#feedBlur)" />
        <circle cx="550" cy="118" r="120" fill="#cbd8d4" opacity="0.36" filter="url(#feedBlur)" />
        <rect x="64" y="72" width="592" height="382" rx="34" fill="#ffffff" opacity="0.18" />
        <rect width="720" height="540" fill="url(#keyLight)" />
        <g transform="translate(${shoulderShift} ${posture + breathing})" filter="url(#softDepth)">
          <path d="M224 482c20-92 78-142 136-142s116 50 136 142" fill="${asset.jacketTone}" />
          <path d="M286 482c6-82 34-122 74-122s68 40 74 122" fill="${asset.shirtTone}" />
          <path d="M300 358c10 28 30 43 60 43s50-15 60-43v-52H300v52Z" fill="${asset.skinTone}" />
        </g>
        <g transform="translate(${headX} ${headY + breathing}) rotate(${tilt} 360 236)" filter="url(#softDepth)">
          <path d="M265 224c-12-92 36-158 98-158 72 0 111 61 94 162-18-64-55-97-103-97-44 0-75 31-89 93Z" fill="${asset.hairTone}" />
          <path d="M260 230c0-88 40-142 101-142s101 54 101 142c0 76-42 138-101 138S260 306 260 230Z" fill="url(#skinShade)" />
          <path d="M274 190c18-60 55-92 99-88 42 4 69 37 78 91-42-22-101-24-177-3Z" fill="${asset.hairTone}" opacity="0.98" />
          <path d="M294 ${220 + browOffset}c20-11 39-12 57-3" stroke="#382a27" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.72" />
          <path d="M374 ${217 + browOffset}c18-9 37-8 55 3" stroke="#382a27" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.72" />
          <ellipse cx="323" cy="244" rx="18" ry="${10 * eyeOpen}" fill="#f7f3ee" />
          <ellipse cx="399" cy="244" rx="18" ry="${10 * eyeOpen}" fill="#f7f3ee" />
          <circle cx="${323 + gaze * 12}" cy="244" r="7" fill="#17201f" />
          <circle cx="${399 + gaze * 12}" cy="244" r="7" fill="#17201f" />
          <path d="M357 252c-2 21-8 35-19 47 13 6 31 5 43-2" stroke="#9e6656" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.72" />
          <ellipse cx="360" cy="318" rx="${mouthWidth}" ry="${mouthHeight}" fill="#5b2424" opacity="0.9" />
          <path d="M324 ${314 - smileLift}Q360 ${329 + smileLift * 0.35} 396 ${314 - smileLift}" stroke="#7b3130" stroke-width="8" stroke-linecap="round" fill="none" />
          <ellipse cx="300" cy="276" rx="18" ry="12" fill="#d99883" opacity="0.22" />
          <ellipse cx="421" cy="276" rx="18" ry="12" fill="#d99883" opacity="0.2" />
        </g>
        <rect x="20" y="20" width="680" height="500" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.42" />
      </svg>`;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
}