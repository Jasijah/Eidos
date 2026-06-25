export interface ExtractedImageIdentityFeatures {
  skinTone: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: 'short' | 'medium' | 'long' | 'unknown';
  faceShape: 'oval' | 'round' | 'angular' | 'unknown';
  facialProportions: { widthToHeight: number; eyeSpacing: number; jawWidth: number };
  confidence: number;
}

export class ImageFeatureExtractor {
  async extract(images: Array<{ dataUrl: string }>): Promise<ExtractedImageIdentityFeatures> {
    if (images.length === 0) throw new Error('At least one image is required for identity feature extraction.');
    const samples = await Promise.all(images.filter((image) => image.dataUrl).map((image) => sampleImage(image.dataUrl)));
    if (samples.length === 0) return fallbackFeatures(images[0].dataUrl);
    const average = (key: 'r' | 'g' | 'b') => Math.round(samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length);
    const r = average('r'); const g = average('g'); const b = average('b');
    const skinTone = rgbToHex(clamp(r + 18), clamp(g + 2), clamp(b - 8));
    const luminance = (r + g + b) / 3;
    return { skinTone, eyeColor: luminance < 100 ? '#3c3028' : '#5b5047', hairColor: luminance < 125 ? '#211b19' : '#4b382e', hairStyle: 'unknown', faceShape: 'unknown', facialProportions: { widthToHeight: 0.78, eyeSpacing: 0.48, jawWidth: 0.52 }, confidence: Math.min(0.72, 0.38 + samples.length * 0.08) };
  }
}

async function sampleImage(dataUrl: string): Promise<{ r: number; g: number; b: number }> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas sampling unavailable.');
  context.drawImage(image, 0, 0, 32, 32);
  const data = context.getImageData(8, 7, 16, 18).data;
  let r = 0; let g = 0; let b = 0; let count = 0;
  for (let index = 0; index < data.length; index += 16) { r += data[index]; g += data[index + 1]; b += data[index + 2]; count += 1; }
  return { r: r / count, g: g / count, b: b / count };
}
function fallbackFeatures(seed: string): ExtractedImageIdentityFeatures { const hash = seed.split('').reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0); return { skinTone: ['#b98268','#a96f57','#c08b70','#8f5f4c'][hash % 4], eyeColor: '#41372f', hairColor: ['#211b19','#382a24','#171d1d'][hash % 3], hairStyle: 'unknown', faceShape: 'unknown', facialProportions: { widthToHeight: 0.78, eyeSpacing: 0.48, jawWidth: 0.52 }, confidence: 0.28 }; }
function clamp(value: number): number { return Math.max(0, Math.min(255, value)); }
function rgbToHex(r: number, g: number, b: number): string { return `#${[r,g,b].map((value) => value.toString(16).padStart(2,'0')).join('')}`; }
