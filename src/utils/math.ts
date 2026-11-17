import { RgbTuple, TimeOfDay } from '../types/game';

/** Clamp a number to [0, 255] integer byte. */
export function clampByte(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : value | 0;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Pack RGB (0..255) into a 32-bit unsigned ABGR integer for ImageData / Uint32Array. */
export function packAbgr(r: number, g: number, b: number): number {
  return ((255 << 24) | (clampByte(b) << 16) | (clampByte(g) << 8) | clampByte(r)) >>> 0;
}

/** Convert a 24-bit 0xRRGGBB integer into a 32-bit unsigned ABGR integer. */
export function hexIntToAbgr(rgbInt: number): number {
  const r = (rgbInt >> 16) & 255;
  const g = (rgbInt >> 8) & 255;
  const b = rgbInt & 255;
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/** Map an object of 0xRRGGBB integers to 32-bit ABGR integers. */
export function mapHexPalette<T extends Record<string, number>>(palette: T): Record<keyof T, number> {
  const out = {} as Record<keyof T, number>;
  for (const key in palette) {
    out[key] = hexIntToAbgr(palette[key]);
  }
  return out;
}

/** Blend two 32-bit ABGR colors with weight alpha (0..256). */
export function blendAbgr(colorA: number, colorB: number, alpha256: number): number {
  const r = ((colorA & 255) * (256 - alpha256) + (colorB & 255) * alpha256) >> 8;
  const g = (((colorA >> 8) & 255) * (256 - alpha256) + ((colorB >> 8) & 255) * alpha256) >> 8;
  const b = (((colorA >> 16) & 255) * (256 - alpha256) + ((colorB >> 16) & 255) * alpha256) >> 8;
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/** Perceived luminance of an RGB tuple. */
export function getLuminance(rgb: RgbTuple | number[]): number {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

/** Mulberry32 seeded pseudo-random number generator returning [0, 1). */
export function createSeededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 1831565813) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fast integer hash returning a byte (0..255). */
export function hashByte(n: number): number {
  let h = Math.imul(n ^ (n >>> 13), 1540483477);
  h ^= h >>> 15;
  h = Math.imul(h, 739982445);
  return (h >>> 24) & 255;
}

/** Murmur3-style 32-bit unsigned hash. */
export function hashU32(n: number): number {
  let h = (n ^ 2654435769) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** Deterministic float in [0, 1) from integer seed. */
export function hashUnitFloat(n: number): number {
  return (hashU32(n | 0) & 1023) / 1023;
}

/** Wrap an angle in radians to [-PI, PI]. */
export function wrapAngle(angleRad: number): number {
  return angleRad - Math.PI * 2 * Math.round(angleRad / (Math.PI * 2));
}

/** Parse a hex (#rgb / #rrggbb) or rgb(...) CSS color string into an [R, G, B] tuple. */
export function parseCssColor(colorStr: string | null | undefined, fallback: RgbTuple): RgbTuple {
  if (!colorStr) return fallback;
  let cleaned = String(colorStr).trim();
  if (cleaned[0] === '#') {
    cleaned = cleaned.slice(1);
    if (cleaned.length === 3 || cleaned.length === 4) {
      cleaned = cleaned
        .split('')
        .map((ch) => ch + ch)
        .join('');
    }
    if (cleaned.length >= 6) {
      const parsed = parseInt(cleaned.slice(0, 6), 16);
      if (!isNaN(parsed)) {
        return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
      }
    }
    return fallback;
  }
  const match = cleaned.match(/rgba?\(([^)]+)\)/);
  if (match) {
    const parts = match[1].split(/[ ,/]+/).map(parseFloat);
    if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return [parts[0], parts[1], parts[2]];
    }
  }
  return fallback;
}

/** Tint an RGB color tuple for sunset or night lighting. */
export function tintForTimeOfDay(rgb: number[], timeOfDay: TimeOfDay | string, amount: number): RgbTuple {
  if (timeOfDay === 'day' || amount <= 0) {
    return [rgb[0], rgb[1], rgb[2]];
  }
  let r: number;
  let g: number;
  let b: number;
  if (timeOfDay === 'sunset') {
    r = 0.95 * rgb[0] + 0.1 * rgb[1] + 12;
    g = 0.72 * rgb[1] + 0.05 * rgb[0] + 4;
    b = 0.7 * rgb[2] + 0.08 * rgb[0] + 10;
  } else {
    r = 0.22 * rgb[0] + 2;
    g = 0.3 * rgb[1] + 6;
    b = 0.5 * rgb[2] + 22;
  }
  return [
    rgb[0] + (r - rgb[0]) * amount,
    rgb[1] + (g - rgb[1]) * amount,
    rgb[2] + (b - rgb[2]) * amount,
  ];
}

/** Add a bilinear-interpolated value-noise octave onto a square heightmap grid. */
export function addValueNoiseOctave(
  grid: Float32Array,
  size: number,
  wavelength: number,
  amplitude: number,
  rng: () => number
): void {
  const cells = size / wavelength;
  const lattice = new Float32Array(cells * cells);
  for (let i = 0; i < lattice.length; i++) {
    lattice[i] = rng();
  }
  const idx0 = new Int32Array(size);
  const idx1 = new Int32Array(size);
  const smooth = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const pos = i / wavelength;
    const base = Math.floor(pos);
    const frac = pos - base;
    idx0[i] = base % cells;
    idx1[i] = (base + 1) % cells;
    smooth[i] = frac * frac * (3 - 2 * frac);
  }
  for (let y = 0; y < size; y++) {
    const row0 = idx0[y] * cells;
    const row1 = idx1[y] * cells;
    const sy = smooth[y];
    const rowOffset = y * size;
    for (let x = 0; x < size; x++) {
      const v00 = lattice[row0 + idx0[x]];
      const v10 = lattice[row1 + idx0[x]];
      const top = v00 + (lattice[row0 + idx1[x]] - v00) * smooth[x];
      const bottom = v10 + (lattice[row1 + idx1[x]] - v10) * smooth[x];
      grid[rowOffset + x] += amplitude * (top + (bottom - top) * sy);
    }
  }
}

/** Normalize a Float32Array in place to [0, 1]. */
export function normalizeHeightmap(grid: Float32Array): void {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const invRange = 1 / (max - min || 1);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = (grid[i] - min) * invRange;
  }
}

/** Diminishing-returns geometric series sum: base + base*decay + base*decay^2 ... */
export function sumDiminishingSeries(ranks: number, baseAmount: number, decay = 0.9): number {
  let total = 0;
  let step = baseAmount;
  const count = Math.max(0, ranks | 0);
  for (let i = 0; i < count; i++) {
    total += step;
    step *= decay;
  }
  return total;
}

/** Format a number with up to `decimals` trailing digits, stripping trailing zeros. */
export function formatCompactNumber(value: number, decimals = 2): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  return num
    .toFixed(decimals)
    .replace(/\.0+$/, '')
    .replace(/(\.[0-9]*?)0+$/, '$1');
}

/** Percentage increase between current and baseline value. */
export function percentDelta(current: number, baseline: number): number {
  return Math.round((current / baseline - 1) * 100);
}
