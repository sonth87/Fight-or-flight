import { BAYER_4X4 } from '../config/defaults';
import { blendAbgr, clamp, hashByte } from '../utils/math';

const packRgb = (r: number, g: number, b: number) => (-16777216 | (b << 16) | (g << 8) | r) >>> 0;

const CRT_GREEN_PALETTE = [
  packRgb(3, 20, 13),
  packRgb(5, 34, 22),
  packRgb(10, 66, 40),
  packRgb(22, 150, 78),
  packRgb(70, 226, 126),
  packRgb(186, 255, 210),
];
const BRASS_PALETTE = [packRgb(120, 86, 26), packRgb(206, 158, 54), packRgb(255, 222, 120)];
const AMBER_KEY_PALETTE = [packRgb(110, 84, 26), packRgb(255, 206, 84), packRgb(255, 244, 190)];
const NAV_SKY_DARK = packRgb(70, 140, 224);
const NAV_SKY_LIGHT = packRgb(110, 176, 240);
const NAV_GROUND_LIGHT = packRgb(150, 92, 40);
const NAV_GROUND_DARK = packRgb(120, 70, 30);
const COLOR_WHITE = packRgb(255, 255, 255);
const COLOR_BLACK = packRgb(0, 0, 0);
const COLOR_GLINT = packRgb(232, 246, 255);
const COLOR_HUD_GREEN = packRgb(120, 255, 164);
const COLOR_HUD_GLASS = packRgb(170, 226, 255);

const PARALLAX_FACTORS = {
  canopy: 0.3,
  glass: 0.5,
  panel: 0.72,
  deck: 1,
  lever: 1.12,
  stick: 1.32,
  rear: 1.65,
};

const DIGIT_BITMAPS: Record<string, number[]> = {
  '0': [7, 5, 5, 5, 7],
  '1': [2, 6, 2, 2, 7],
  '2': [7, 1, 7, 4, 7],
  '3': [7, 1, 7, 1, 7],
  '4': [5, 5, 7, 1, 1],
  '5': [7, 4, 7, 1, 7],
  '6': [7, 4, 7, 5, 7],
  '7': [7, 1, 1, 2, 2],
  '8': [7, 5, 7, 5, 7],
  '9': [7, 5, 7, 1, 7],
};

export class PixelSurface {
  buf: Uint32Array;
  W: number;
  H: number;
  ox = 0;
  oy = 0;

  constructor(buf: Uint32Array, W: number, H: number) {
    this.buf = buf;
    this.W = W;
    this.H = H;
  }

  put(x: number, y: number, color: number): void {
    x += this.ox;
    y += this.oy;
    if (x >= 0 && y >= 0 && x < this.W && y < this.H) {
      this.buf[y * this.W + x] = color;
    }
  }

  tint(x: number, y: number, color: number, alpha256: number): void {
    x += this.ox;
    y += this.oy;
    if (x >= 0 && y >= 0 && x < this.W && y < this.H) {
      const idx = y * this.W + x;
      this.buf[idx] = blendAbgr(this.buf[idx], color, alpha256);
    }
  }

  get(x: number, y: number): number {
    x += this.ox;
    y += this.oy;
    return x >= 0 && y >= 0 && x < this.W && y < this.H ? this.buf[y * this.W + x] : 0;
  }

  box(x0: number, y0: number, x1: number, y1: number, color: number): void {
    x0 += this.ox;
    x1 += this.ox;
    y0 += this.oy;
    y1 += this.oy;
    if (x0 < 0) x0 = 0;
    if (y0 < 0) y0 = 0;
    if (x1 > this.W) x1 = this.W;
    if (y1 > this.H) y1 = this.H;
    if (x0 >= x1) return;
    for (let y = y0; y < y1; y++) {
      this.buf.fill(color, y * this.W + x0, y * this.W + x1);
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, color: number): void {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= steps; i++) {
      this.put(
        Math.round(x0 + ((x1 - x0) * i) / steps),
        Math.round(y0 + ((y1 - y0) * i) / steps),
        color
      );
    }
  }

  disc(cx: number, cy: number, radius: number, color: number): void {
    const bound = Math.ceil(radius);
    for (let dy = -bound; dy <= bound; dy++) {
      for (let dx = -bound; dx <= bound; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          this.put(cx + dx, cy + dy, color);
        }
      }
    }
  }

  text(x: number, y: number, text: string, color: number): void {
    for (let i = 0; i < text.length; i++) {
      const glyph = DIGIT_BITMAPS[text[i]];
      if (glyph) {
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 3; col++) {
            if (glyph[row] & (4 >> col)) {
              this.put(x + i * 4 + col, y + row, color);
            }
          }
        }
      }
    }
  }

  plate(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    fill: number,
    hi: number,
    lo: number
  ): void {
    this.box(x0, y0, x1, y1, fill);
    this.box(x0, y0, x1, y0 + 1, hi);
    this.box(x0, y0, x0 + 1, y1, hi);
    this.box(x0, y1 - 1, x1, y1, lo);
    this.box(x1 - 1, y0, x1, y1, lo);
  }

  well(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    fill: number,
    hi: number,
    lo: number
  ): void {
    this.box(x0, y0, x1, y1, fill);
    this.box(x0, y0, x1, y0 + 2, lo);
    this.box(x0, y0, x0 + 2, y1, lo);
    this.box(x0 + 1, y1 - 1, x1, y1, hi);
    this.box(x1 - 1, y0 + 1, x1, y1, hi);
  }

  bolt(x: number, y: number, hi: number, lo: number): void {
    this.put(x, y, hi);
    this.put(x + 1, y, lo);
    this.put(x, y + 1, lo);
    this.put(x + 1, y + 1, lo);
  }
}

export interface CockpitAssets {
  W: number;
  H: number;
  s: number;
  cx: number;
  pad: number;
  aw: number;
  ah: number;
  rear: Uint32Array;
  canopy: Uint32Array;
  panel: Uint32Array;
  deck: Uint32Array;
  panelTop: number;
  deckTop: number;
  rearBottom: number;
  radar: { x: number; y: number; w: number; h: number };
  status: { x: number; y: number; w: number; h: number };
  ball: { x: number; y: number; r: number };
  dials: Array<{ x: number; y: number; r: number }>;
  lamps: Array<{ x: number; y: number; w: number; h: number }>;
  panelKeys: Array<{ x: number; y: number; w: number; h: number }>;
  deckKeys: Array<{ x: number; y: number; w: number; h: number }>;
  throttle: { x: number; y0: number; y1: number; w: number };
  stick: { x: number; y: number };
  pal: { body: number[]; hot: number[] };
}

export function buildCockpitAssets(
  W: number,
  H: number,
  pal: { body: number[]; hot: number[] }
): CockpitAssets {
  const s = H / 300;
  const cx = W >> 1;
  const pad = Math.ceil(14 * s) + 3;
  const aw = W + pad * 2;
  const ah = H + pad * 2;
  const sc = (v: number) => Math.round(v * s);
  const sx = (v: number) => cx + Math.round(v * s);
  const body = pal.body;
  const hot = pal.hot;

  const makeLayer = () => {
    const buf = new Uint32Array(aw * ah);
    const surf = new PixelSurface(buf, aw, ah);
    surf.ox = pad;
    surf.oy = pad;
    return surf;
  };

  const rear = makeLayer();
  const canopy = makeLayer();
  const panel = makeLayer();
  const deck = makeLayer();
  const exp = 2.5;
  const superEllipse = (dx: number, dy: number, rx: number, ry: number) =>
    Math.pow(Math.abs(dx) / rx, exp) + Math.pow(Math.abs(dy) / ry, exp);

  let rearBottom = 0;
  {
    const archY = 252 * s;
    const rx = 280 * s;
    const ry = 276 * s;
    for (let y = -pad; y < H; y++) {
      const dy = archY - y;
      if (dy <= 0) break;
      for (let x = -pad; x < W + pad; x++) {
        const d = superEllipse(x - cx, dy, rx, ry);
        if (d <= 1) continue;
        const rim = (Math.pow(d, 1 / exp) - 1) * rx;
        const h = hashByte(x * 71 + y * 409);
        rear.put(
          x,
          y,
          rim < 1.2
            ? body[5]
            : rim < 2.4 + s
              ? body[3]
              : rim < 2.4 + 6 * s
                ? h < 20
                  ? body[1]
                  : body[2]
                : h > 248
                  ? body[2]
                  : body[1]
        );
        if (y > rearBottom) rearBottom = y;
      }
    }
    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * Math.PI;
      const mult = 1 + (9 * s) / rx;
      const bx = Math.round(
        cx + Math.sign(Math.cos(ang)) * Math.pow(Math.abs(Math.cos(ang)), 2 / exp) * rx * mult
      );
      const by = Math.round(archY - Math.pow(Math.abs(Math.sin(ang)), 2 / exp) * ry * mult);
      if (rear.get(bx, by) !== 0) {
        rear.bolt(bx, by, body[5], body[0]);
      }
    }
  }

  {
    const archY = 236 * s;
    const rx = 226 * s;
    const ry = 228 * s;
    const band = Math.max(6, 13 * s);
    const segments = 15;
    const hotSegs = [1, 4, 7, 10, 13];
    for (let y = -pad; y < H + pad; y++) {
      const dy = archY - y;
      if (dy <= 0) break;
      for (let x = -pad; x < W + pad; x++) {
        const dx = x - cx;
        const d = superEllipse(dx, dy, rx, ry);
        if (d <= 1 || superEllipse(dx, dy, rx + band, ry + band) > 1) continue;
        const t = clamp((Math.pow(d, 1 / exp) - 1) / ((rx + band) / rx - 1), 0, 1);
        const segPos = (Math.atan2(dy / ry, dx / rx) / Math.PI) * segments;
        const segIdx = Math.floor(segPos);
        const segFrac = segPos - segIdx;
        const h = hashByte(x * 131 + y * 977);
        const isSeam = segFrac < 0.035 || segFrac > 0.965;
        let col: number;
        if (isSeam) col = body[0];
        else if (t < 0.08) col = body[2];
        else if (t < 0.2) col = body[6];
        else if (t < 0.34) col = body[5];
        else if (t < 0.66) col = h < 14 ? body[3] : body[4];
        else if (t < 0.86) col = body[2];
        else col = body[0];

        if (!isSeam && hotSegs.indexOf(segIdx) >= 0 && t > 0.14 && t < 0.86) {
          const edge = Math.min(segFrac, 1 - segFrac) * 9 + Math.min(t - 0.14, 0.86 - t) * 5;
          if (h > 70 - edge * 150) {
            col = t < 0.3 ? hot[5] : t < 0.42 ? hot[4] : t < 0.68 ? hot[3] : hot[2];
          }
        } else if (!isSeam && t > 0.24 && t < 0.8 && h > 249) {
          col = hot[2];
        }
        canopy.put(x, y, col);
      }
    }
    for (let i = 1; i < segments; i++) {
      for (const off of [-0.09, 0.09]) {
        const ang = ((i + off) / segments) * Math.PI;
        const mult = 1 + band / (2 * rx);
        const bx = Math.round(
          cx + Math.sign(Math.cos(ang)) * Math.pow(Math.abs(Math.cos(ang)), 2 / exp) * rx * mult
        );
        const by = Math.round(archY - Math.pow(Math.abs(Math.sin(ang)), 2 / exp) * ry * mult);
        if (canopy.get(bx, by) !== 0) {
          canopy.bolt(bx - 1, by - 1, body[7], body[0]);
        }
      }
    }
    {
      const topY = Math.round(archY - ry - band);
      const halfW = sc(26);
      for (let dy = -pad; dy < sc(21); dy++) {
        const taper = Math.max(0, Math.round(dy * 0.45));
        canopy.box(
          cx - halfW + taper,
          topY + dy,
          cx + halfW - taper,
          topY + dy + 1,
          dy < 2 ? body[5] : dy > sc(21) - 3 ? body[1] : body[3]
        );
        canopy.put(cx - halfW + taper, topY + dy, body[0]);
        canopy.put(cx + halfW - taper - 1, topY + dy, body[0]);
      }
      canopy.box(cx - sc(14), topY + sc(7), cx + sc(14), topY + sc(13), body[0]);
      canopy.box(cx - sc(12), topY + sc(8), cx + sc(12), topY + sc(12), hot[4]);
      canopy.box(cx - sc(12), topY + sc(8), cx + sc(12), topY + sc(9), hot[5]);
      canopy.bolt(cx - sc(21), topY + sc(5), body[7], body[0]);
      canopy.bolt(cx + sc(19), topY + sc(5), body[7], body[0]);
    }
    for (const side of [-1, 1]) {
      const py = Math.round(118 * s);
      const span = rx * Math.pow(1 - Math.pow((archY - py) / ry, exp), 1 / exp);
      const px = Math.round(cx + side * (span + band * 0.35));
      canopy.box(px - sc(5), py - sc(9), px + sc(5), py + sc(9), body[0]);
      canopy.box(px - sc(4), py - sc(8), px + sc(4), py + sc(8), hot[3]);
      canopy.box(px - sc(4), py - sc(8), px + sc(4), py - sc(6), hot[5]);
      canopy.box(px - sc(4), py + sc(5), px + sc(4), py + sc(8), hot[2]);
      canopy.bolt(px - 1, py - 1, body[7], body[0]);
    }
    for (const side of [-1, 1]) {
      for (const [x0, y0, x1, y1, w] of [
        [-152, 66, -124, 38, 3],
        [-141, 72, -127, 58, 2],
        [-190, 40, -170, 20, 3],
        [-197, 54, -184, 41, 2],
        [-178, 44, -172, 38, 1],
      ]) {
        const steps = Math.max(1, Math.round(Math.abs(x1 - x0) * s));
        for (let i = 0; i <= steps; i++) {
          for (let k = 0; k < Math.max(1, Math.round(w * s)); k++) {
            const gx = Math.round(cx + side * (x0 + ((x1 - x0) * i) / steps) * s) + k * side;
            const gy = Math.round((y0 + ((y1 - y0) * i) / steps) * s) + k;
            if (canopy.get(gx, gy) !== 0) continue;
            const nearEnd = Math.min(i, steps - i) < 2;
            if ((k === 0 && !nearEnd) || ((gx + gy) & 1) === 0) {
              canopy.put(gx, gy, COLOR_GLINT);
            }
          }
        }
      }
    }
  }

  const getPanelCurveY = (xNorm: number) => {
    const ax = Math.abs(xNorm);
    return ax <= 58
      ? 168
      : ax <= 74
        ? 168 + ((ax - 58) / 16) * 11
        : ax <= 92
          ? 179
          : ax <= 104
            ? 179 - ((ax - 92) / 12) * 9
            : ax <= 206
              ? 170 + (ax - 104) * 0.02
              : 172 + ((ax - 206) / 16) * 10;
  };
  const cowlingH = Math.max(5, sc(11));
  let panelTop = H;
  for (let x = -pad; x < W + pad; x++) {
    const xNorm = (x - cx) / s;
    if (Math.abs(xNorm) > 232) continue;
    const topY = Math.round(getPanelCurveY(xNorm) * s);
    if (topY < panelTop) panelTop = topY;
    for (let y = topY; y < H + pad; y++) {
      const dy = y - topY;
      const h = hashByte(x * 53 + y * 311);
      let col: number;
      if (dy < cowlingH) {
        const frac = dy / cowlingH;
        const rib = Math.abs(xNorm) / (15 + frac * 9);
        const onSeam = rib - Math.floor(rib) < 0.07;
        col =
          dy === 0
            ? body[6]
            : dy === 1
              ? body[4]
              : onSeam
                ? body[0]
                : frac < 0.45
                  ? h > 236
                    ? body[3]
                    : body[2]
                  : body[1];
        if (dy > 0 && dy < cowlingH * 0.5 && hashByte((x >> 3) * 7 + 5) > 208 && h > 120) {
          col = dy < 3 ? hot[3] : hot[2];
        }
      } else if (dy < cowlingH + 2) {
        col = dy === cowlingH ? body[5] : body[3];
      } else if (dy < cowlingH + 4) {
        col = body[0];
      } else {
        const pdy = dy - cowlingH - 4;
        const band = pdy < sc(4) || (pdy < sc(8) && ((x + y) & 1) === 0) ? 0 : 1;
        const yNorm = y / s;
        col =
          band === 0 || yNorm > 262
            ? body[0]
            : yNorm > 250
              ? ((x + y) & 1) === 0
                ? body[0]
                : body[1]
              : yNorm > 222 || ((x + y) & 3) === 0
                ? body[1]
                : body[2];
        if (band === 1 && h > 251) col = body[3];
      }
      panel.put(x, y, col);
    }
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const vx = sx(side * (150 + i * 5));
      panel.box(vx, sc(173), vx + Math.max(1, sc(2)), sc(179), body[0]);
    }
  }

  const lamps: Array<{ x: number; y: number; w: number; h: number }> = [];
  panel.well(sx(-34), sc(183), sx(34), sc(191), body[0], body[4], body[0]);
  for (let i = 0; i < 5; i++) {
    const lamp = {
      x: sx(-30 + i * 12.4),
      y: sc(185),
      w: Math.max(4, sc(10)),
      h: Math.max(3, sc(5)),
    };
    lamps.push(lamp);
    panel.box(lamp.x, lamp.y, lamp.x + lamp.w, lamp.y + lamp.h, hot[1]);
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      panel.box(sx(side * (41 + i * 4)), sc(184), sx(side * (41 + i * 4)) + 1, sc(190), body[0]);
    }
  }

  const panelKeys: Array<{ x: number; y: number; w: number; h: number }> = [];
  const buildMfd = (xStart: number) => {
    const x0 = sx(xStart);
    const x1 = sx(xStart + 100);
    const y0 = sc(193);
    const y1 = sc(261);
    panel.box(x0 + 2, y0 + 2, x1 + 3, y1 + 3, body[0]);
    panel.plate(x0, y0, x1, y1, body[3], body[6], body[1]);
    panel.box(x0 + 1, y0 + 1, x1 - 1, y0 + 2, body[5]);
    panel.box(x0 + 2, y0 + 2, x1 - 2, y1 - 2, body[3]);
    const inset = Math.max(4, sc(7));
    const rect = {
      x: x0 + inset,
      y: y0 + inset - 1,
      w: x1 - x0 - inset * 2,
      h: y1 - y0 - inset * 2 - sc(3),
    };
    panel.well(rect.x - 3, rect.y - 3, rect.x + rect.w + 3, rect.y + rect.h + 3, body[1], body[5], body[0]);
    panel.box(rect.x - 1, rect.y - 1, rect.x + rect.w + 1, rect.y + rect.h + 1, body[0]);
    panel.box(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h, CRT_GREEN_PALETTE[0]);
    for (const [bx, by] of [
      [x0 + 3, y0 + 3],
      [x1 - 5, y0 + 3],
      [x0 + 3, y1 - 5],
      [x1 - 5, y1 - 5],
    ]) {
      panel.bolt(bx, by, body[7], body[0]);
    }
    for (let i = 0; i < 6; i++) {
      const btn = {
        x: rect.x + sc(4) + i * Math.round(rect.w / 6.4),
        y: y1 - sc(7),
        w: Math.max(3, sc(7)),
        h: Math.max(2, sc(3)),
      };
      panel.box(btn.x, btn.y + 1, btn.x + btn.w + 1, btn.y + btn.h + 1, body[0]);
      panel.box(btn.x, btn.y, btn.x + btn.w, btn.y + btn.h, body[5]);
      panel.box(btn.x, btn.y, btn.x + btn.w, btn.y + 1, body[7]);
      if (i === 1 || i === 4) panelKeys.push(btn);
    }
    return rect;
  };

  const radar = buildMfd(-206);
  const status = buildMfd(106);

  panel.box(sx(-100) + 2, sc(193) + 2, sx(100) + 3, sc(262) + 3, body[0]);
  panel.plate(sx(-100), sc(193), sx(100), sc(262), body[2], body[5], body[0]);
  for (const [bx, by] of [
    [-97, 196],
    [94, 196],
    [-97, 257],
    [94, 257],
  ]) {
    panel.bolt(sx(bx), sc(by), body[7], body[0]);
  }

  const ball = { x: cx, y: sc(228), r: sc(25) };
  {
    const outerR = ball.r + Math.max(4, sc(8));
    for (let dy = -outerR - 3; dy <= outerR + 3; dy++) {
      for (let dx = -outerR - 3; dx <= outerR + 3; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > outerR + 3) continue;
        let col: number;
        if (dist > outerR + 1) {
          if (dx + dy < outerR * 0.4) continue;
          col = body[0];
        } else if (dist > outerR) {
          col = body[0];
        } else if (dist > ball.r + 2) {
          const lit = (-dx - dy) / (dist * 1.4142 + 0.001);
          col = lit > 0.55 ? body[7] : lit > 0.1 ? body[5] : lit > -0.45 ? body[4] : body[2];
        } else {
          col = body[0];
        }
        panel.put(ball.x + dx, ball.y + dy, col);
      }
    }
    const lugR = ball.r + Math.max(3, sc(5));
    for (const [sxSign, sySign] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const lx = Math.round(ball.x + sxSign * lugR * 0.7071);
      const ly = Math.round(ball.y + sySign * lugR * 0.7071);
      panel.put(lx, ly, BRASS_PALETTE[2]);
      panel.put(lx + 1, ly, BRASS_PALETTE[1]);
      panel.put(lx, ly + 1, BRASS_PALETTE[1]);
      panel.put(lx + 1, ly + 1, BRASS_PALETTE[0]);
    }
    const tickH = Math.max(3, sc(5));
    for (let i = 0; i < tickH; i++) {
      panel.box(
        ball.x - i,
        ball.y - outerR + tickH - i,
        ball.x + i + 1,
        ball.y - outerR + tickH - i + 1,
        i === 0 ? BRASS_PALETTE[2] : BRASS_PALETTE[1]
      );
    }
    panel.box(ball.x - sc(6), ball.y + outerR - sc(2), ball.x + sc(6) + 2, ball.y + outerR + sc(4), body[0]);
    panel.box(
      ball.x - sc(6),
      ball.y + outerR - sc(3),
      ball.x + sc(6) + 1,
      ball.y + outerR + sc(3),
      BRASS_PALETTE[1]
    );
    panel.box(
      ball.x - sc(6),
      ball.y + outerR - sc(3),
      ball.x + sc(6) + 1,
      ball.y + outerR - sc(2),
      BRASS_PALETTE[2]
    );
    panel.box(
      ball.x - sc(6),
      ball.y + outerR + sc(2),
      ball.x + sc(6) + 1,
      ball.y + outerR + sc(3),
      BRASS_PALETTE[0]
    );
    for (let dx = -sc(5); dx <= sc(5); dx += 2) {
      panel.put(ball.x + dx, ball.y + outerR, BRASS_PALETTE[0]);
    }
  }

  const dials: Array<{ x: number; y: number; r: number }> = [];
  for (const [dx, dy] of [
    [-72, 211],
    [-72, 246],
    [72, 211],
    [72, 246],
  ]) {
    const dial = { x: sx(dx), y: sc(dy), r: Math.max(6, sc(12)) };
    dials.push(dial);
    for (let oy = -dial.r - 3; oy <= dial.r + 4; oy++) {
      for (let ox = -dial.r - 3; ox <= dial.r + 4; ox++) {
        const dist = Math.sqrt(ox * ox + oy * oy);
        if (dist > dial.r + 3.5) continue;
        let col: number;
        if (dist > dial.r + 2) {
          if (ox + oy < dial.r * 0.5) continue;
          col = body[0];
        } else if (dist > dial.r) {
          col = -ox - oy > dial.r * 0.4 ? body[7] : -ox - oy > -dial.r * 0.5 ? body[5] : body[2];
        } else if (dist > dial.r - 1.5) {
          col = body[0];
        } else {
          col = dist > dial.r - 4 && -ox - oy > dial.r * 0.3 ? body[0] : body[1];
        }
        panel.put(dial.x + ox, dial.y + oy, col);
      }
    }
    for (let i = 0; i < 10; i++) {
      const ang = (-225 + i * 30) * (Math.PI / 180);
      panel.put(
        Math.round(dial.x + Math.cos(ang) * (dial.r - 3)),
        Math.round(dial.y + Math.sin(ang) * (dial.r - 3)),
        i > 7 ? hot[4] : body[7]
      );
    }
  }

  for (const side of [-1, 1]) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const key = {
          x: sx(side * 72) - sc(8) + col * sc(9),
          y: sc(224) + row * sc(6),
          w: Math.max(4, sc(7)),
          h: Math.max(3, sc(5)),
        };
        const isHot = (col + row) % 2 === 0;
        panel.box(key.x - 1, key.y - 1, key.x + key.w + 2, key.y + key.h + 2, body[0]);
        panel.box(key.x, key.y, key.x + key.w, key.y + key.h, isHot ? hot[3] : body[4]);
        panel.box(key.x, key.y, key.x + key.w, key.y + 1, isHot ? hot[5] : body[6]);
        if (isHot && row === 0) panelKeys.push(key);
      }
    }
  }

  const weatherSurface = (surf: PixelSurface, startY: number, seed: number) => {
    const buf = surf.buf;
    const isMidBody = (c: number) => c === body[2] || c === body[3] || c === body[1];
    const isEdgeBody = (c: number) =>
      c === body[0] || c === body[4] || c === body[5] || c === body[6];
    const wearIndices: number[] = [];
    for (let y = startY + pad; y < ah - 1; y++) {
      for (let x = 1; x < aw - 1; x++) {
        const idx = y * aw + x;
        if (
          isMidBody(buf[idx]) &&
          !(hashByte((x >> 3) * 31 + (y >> 2) * 17 + seed) < 234) &&
          (isEdgeBody(buf[idx - 1]) ||
            isEdgeBody(buf[idx + 1]) ||
            isEdgeBody(buf[idx - aw]) ||
            isEdgeBody(buf[idx + aw])) &&
          hashByte(x * 7 + y * 13) > 96
        ) {
          wearIndices.push(idx);
        }
      }
    }
    for (const idx of wearIndices) {
      buf[idx] = hashByte(idx) > 170 ? hot[3] : hashByte(idx) > 70 ? hot[2] : hot[1];
    }
    for (let i = 0; i < Math.round(16 * s * (W / H)); i++) {
      const sx0 = Math.round((hashByte(i * 97 + seed) / 255) * (aw - 8)) + 2;
      const sy0 =
        startY + pad + Math.round((hashByte(i * 57 + seed * 3) / 255) * (ah - startY - pad - 6));
      const len = 2 + (hashByte(i * 11 + seed) & 3);
      for (let k = 0; k < len; k++) {
        const idx = (sy0 + k) * aw + sx0 + k;
        if (sy0 + k < ah && sx0 + k < aw && isMidBody(buf[idx])) {
          buf[idx] = hashByte(i) > 128 ? body[4] : body[0];
        }
      }
    }
  };
  weatherSurface(panel, panelTop + cowlingH + sc(10), 3);

  const getDeckCurveY = (xNorm: number) => {
    const ax = Math.abs(xNorm);
    return ax <= 212
      ? 263
      : ax <= 222
        ? 263 - ((ax - 212) / 10) * 77
        : Math.max(110, 186 - (ax - 222) * 0.42);
  };
  let deckTop = H;
  for (let x = -pad; x < W + pad; x++) {
    const xNorm = (x - cx) / s;
    const ax = Math.abs(xNorm);
    const topY = Math.round(getDeckCurveY(xNorm) * s);
    if (ax <= 212 && topY < deckTop) deckTop = topY;
    for (let y = topY; y < H + pad; y++) {
      const dy = y - topY;
      const h = hashByte(x * 59 + y * 211);
      let col: number;
      if (ax > 212) {
        const yNorm = y / s;
        const rib = ((yNorm - 112) / Math.max(1, ax)) * 7;
        const onRib = rib - Math.floor(rib) < 0.06;
        col =
          dy === 0
            ? body[6]
            : dy < sc(3)
              ? body[4]
              : dy < sc(5)
                ? body[2]
                : dy < sc(7)
                  ? body[0]
                  : ax < 222
                    ? ax < 215
                      ? body[5]
                      : ax < 218
                        ? body[3]
                        : body[1]
                    : onRib
                      ? body[0]
                      : Math.floor(rib) % 2 === 0
                        ? h > 250
                          ? body[3]
                          : body[2]
                        : body[1];
        if (yNorm > 276 && !onRib) {
          col = ((x + y) & 1) === 0 ? col : body[0];
        }
      } else {
        const yNorm = y / s;
        col =
          dy === 0
            ? body[6]
            : dy === 1
              ? body[4]
              : yNorm > 290
                ? ((x + y) & 1) === 0
                  ? body[1]
                  : body[2]
                : h > 250
                  ? body[4]
                  : body[3];
      }
      deck.put(x, y, col);
    }
  }

  const deckKeys: Array<{ x: number; y: number; w: number; h: number }> = [];
  const keyColors = [
    hot[3],
    hot[3],
    body[4],
    AMBER_KEY_PALETTE[1],
    AMBER_KEY_PALETTE[1],
    body[4],
    body[4],
    hot[3],
  ];
  const drawDeckKey = (rect: { x: number; y: number; w: number; h: number }, col: number) => {
    deck.box(rect.x, rect.y + 1, rect.x + rect.w + 1, rect.y + rect.h + 2, body[0]);
    deck.box(rect.x - 1, rect.y - 1, rect.x + rect.w + 1, rect.y, body[1]);
    deck.box(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h, col);
    deck.box(
      rect.x,
      rect.y,
      rect.x + rect.w,
      rect.y + 1,
      col === body[4] ? body[6] : col === AMBER_KEY_PALETTE[1] ? AMBER_KEY_PALETTE[2] : hot[5]
    );
    deck.box(
      rect.x,
      rect.y + rect.h - 1,
      rect.x + rect.w,
      rect.y + rect.h,
      col === body[4] ? body[2] : col === AMBER_KEY_PALETTE[1] ? AMBER_KEY_PALETTE[0] : hot[2]
    );
  };

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const rect = {
        x: sx(-209 + col * 12),
        y: sc(269 + row * 9),
        w: Math.max(5, sc(10)),
        h: Math.max(3, sc(6)),
      };
      const kc = keyColors[(col + row * 3) % keyColors.length];
      drawDeckKey(rect, kc);
      if (kc === AMBER_KEY_PALETTE[1] && col === 0) deckKeys.push(rect);
    }
  }

  const throttle = { x: sx(-150), y0: sc(270), y1: sc(290), w: sc(34) };
  deck.well(sx(-173), sc(267), sx(-109), H + pad, body[1], body[5], body[0]);
  for (const rxPos of [-158, -141, -124]) {
    deck.box(sx(rxPos), sc(270), sx(rxPos) + Math.max(2, sc(3)), H + pad, body[0]);
    for (let y = sc(272); y < H + pad; y += Math.max(2, sc(4))) {
      deck.put(sx(rxPos) + Math.max(2, sc(3)) + 1, y, body[5]);
    }
  }

  for (let i = 0; i < 4; i++) {
    const swX = sx(112 + i * 11);
    deck.box(swX - 1, sc(281), swX + Math.max(4, sc(6)) + 1, sc(288), body[0]);
    deck.box(swX, sc(282), swX + Math.max(3, sc(5)), sc(286), body[5]);
    const up = i % 2 === 0;
    deck.box(
      swX + 2,
      sc(up ? 274 : 285),
      swX + Math.max(2, sc(3)) + 2,
      sc(up ? 284 : 294),
      body[0]
    );
    deck.box(swX + 1, sc(up ? 273 : 284), swX + Math.max(2, sc(3)), sc(up ? 283 : 293), body[7]);
    deck.box(
      swX + 1,
      sc(up ? 273 : 290),
      swX + Math.max(2, sc(3)),
      sc(up ? 275 : 293),
      COLOR_WHITE
    );
  }

  deck.disc(sx(167), sc(282), Math.max(4, sc(8)), body[0]);
  deck.disc(sx(166), sc(280), Math.max(4, sc(8)), body[1]);
  deck.disc(sx(166), sc(280), Math.max(3, sc(7)), body[5]);
  deck.disc(sx(166), sc(279), Math.max(2, sc(5)), hot[3]);
  deck.disc(sx(165), sc(278), Math.max(1, sc(2.5)), hot[5]);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const rect = {
        x: sx(180 + col * 12),
        y: sc(269 + row * 9),
        w: Math.max(5, sc(10)),
        h: Math.max(3, sc(6)),
      };
      const kc = keyColors[(col * 2 + row * 3 + 2) % keyColors.length];
      drawDeckKey(rect, kc);
      if (kc === hot[3] && row === 1) deckKeys.push(rect);
    }
  }

  const stick = { x: cx, y: sc(253) };
  for (let dy = -sc(10); dy <= sc(10); dy++) {
    for (let dx = -sc(32); dx <= sc(32); dx++) {
      const ell = (dx * dx) / (sc(32) * sc(32)) + (dy * dy) / (sc(10) * sc(10));
      if (ell <= 1) {
        deck.put(
          cx + dx,
          sc(296) + dy,
          ell > 0.8 ? (dy < 0 ? body[1] : body[5]) : ell > 0.62 ? body[0] : body[1]
        );
      }
    }
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const rect = {
        x: sx(side * 233) - (side < 0 ? sc(8) : 0),
        y: sc(212 + i * 15),
        w: Math.max(4, sc(8)),
        h: Math.max(3, sc(6)),
      };
      drawDeckKey(rect, i === 1 ? hot[3] : i === 2 ? AMBER_KEY_PALETTE[1] : body[4]);
    }
  }

  weatherSurface(deck, deckTop + sc(4), 11);

  return {
    W,
    H,
    s,
    cx,
    pad,
    aw,
    ah,
    rear: rear.buf,
    canopy: canopy.buf,
    panel: panel.buf,
    deck: deck.buf,
    panelTop,
    deckTop,
    rearBottom,
    radar,
    status,
    ball,
    dials,
    lamps,
    panelKeys,
    deckKeys,
    throttle,
    stick,
    pal,
  };
}

function blitCockpitLayer(
  dest: Uint32Array,
  assets: CockpitAssets,
  src: Uint32Array,
  ox: number,
  oy: number,
  fracY: number,
  yStart: number,
  yEnd: number,
  sunBeam: { x: number; slope: number; half: number; k: number; col: number; y0: number } | null
): void {
  const { W, H, aw, ah, pad } = assets;
  const subY = fracY > 0.004 ? Math.round(fracY * 256) : 0;
  const top = Math.max(0, yStart + oy);
  const bot = Math.min(H, yEnd + oy + (subY > 0 ? 1 : 0));

  for (let y = top; y < bot; y++) {
    const sy = y - oy + pad;
    if (sy < 0 || sy > ah || (sy === ah && subY === 0)) continue;
    let srcIdx = sy * aw + pad - ox;
    let dstIdx = y * W;
    if (!sunBeam && subY === 0) {
      for (let x = 0; x < W; x++, dstIdx++, srcIdx++) {
        const px = src[srcIdx];
        if (px !== 0) dest[dstIdx] = px;
      }
      continue;
    }
    const hasCurr = sy < ah;
    const hasPrev = subY > 0 && sy > 0;
    let bMin = 0;
    let bMax = 0;
    let gMin = 0;
    let gMax = 0;
    if (sunBeam) {
      const center = sunBeam.x + (y - sunBeam.y0) * sunBeam.slope;
      bMin = center - sunBeam.half;
      bMax = center + sunBeam.half;
      gMin = center - sunBeam.half * 0.22;
      gMax = center + sunBeam.half * 0.02;
    }
    for (let x = 0; x < W; x++, dstIdx++, srcIdx++) {
      let px = hasCurr ? src[srcIdx] : 0;
      let alpha = 256;
      if (subY > 0) {
        const prevPx = hasPrev ? src[srcIdx - aw] : 0;
        if (prevPx !== px) {
          if (prevPx === 0) alpha = 256 - subY;
          else if (px === 0) {
            px = prevPx;
            alpha = subY;
          } else {
            px = blendAbgr(px, prevPx, subY);
          }
        }
      }
      if (px !== 0) {
        if (sunBeam && x >= bMin && x < bMax && !(x >= gMin && x < gMax)) {
          const edgeDist = Math.min(x - bMin, bMax - x);
          if (edgeDist >= 4 || BAYER_4X4[((y & 3) << 2) | (x & 3)] <= edgeDist * 4) {
            px = blendAbgr(px, sunBeam.col, sunBeam.k);
          }
        }
        dest[dstIdx] = alpha === 256 ? px : blendAbgr(dest[dstIdx], px, alpha);
      }
    }
  }
}

function drawCockpitHud(
  dest: Uint32Array,
  assets: CockpitAssets,
  state: Record<string, any>,
  ox: number,
  oy: number
): void {
  const { W, H, s, cx } = assets;
  const body = assets.pal.body;
  const hudAlpha = Math.round(clamp(state.hud, 0, 1) * 256);
  if (hudAlpha <= 0) return;
  const sc = (v: number) => Math.round(v * s);
  const pivotY = state.pivotY;
  const topY = pivotY - sc(57) + oy;
  const botY = sc(170) + oy;
  const topHalfW = sc(86);
  const botHalfW = sc(76);
  const halfWidthAt = (y: number) =>
    botHalfW + ((topHalfW - botHalfW) * (botY - y)) / Math.max(1, botY - topY);

  for (let y = Math.max(0, topY); y < Math.min(H, botY); y++) {
    const hw = Math.round(halfWidthAt(y));
    const xL = Math.max(0, cx + ox - hw);
    const xR = Math.min(W - 1, cx + ox + hw);
    for (let x = xL; x <= xR; x++) {
      const idx = y * W + x;
      const glare = x - xL < sc(10) + (y - topY) * 0.12 && x - xL > sc(4) + (y - topY) * 0.12;
      dest[idx] = blendAbgr(dest[idx], COLOR_HUD_GLASS, ((glare ? 30 : 10) * hudAlpha) >> 8);
    }
    if (xL > 0) {
      dest[y * W + xL] = blendAbgr(
        dest[y * W + xL],
        y - topY < (botY - topY) * 0.5 ? COLOR_GLINT : body[6],
        (150 * hudAlpha) >> 8
      );
    }
    if (xR < W - 1) {
      dest[y * W + xR] = blendAbgr(dest[y * W + xR], body[5], (120 * hudAlpha) >> 8);
    }
  }
  if (topY >= 0 && topY < H) {
    for (let x = cx + ox - topHalfW; x <= cx + ox + topHalfW; x++) {
      if (x >= 0 && x < W) {
        dest[topY * W + x] = blendAbgr(dest[topY * W + x], COLOR_GLINT, (130 * hudAlpha) >> 8);
      }
    }
  }
  for (const side of [-1, 1]) {
    for (let y = botY - sc(14); y < botY + 2; y++) {
      const edgeX = cx + ox + side * (Math.round(halfWidthAt(y)) + 1);
      for (let k = 0; k < Math.max(2, sc(3)); k++) {
        const x = edgeX + side * k;
        if (x >= 0 && x < W && y >= 0 && y < H) {
          dest[y * W + x] = blendAbgr(dest[y * W + x], k === 0 ? body[6] : body[2], hudAlpha);
        }
      }
    }
  }

  const putHud = (x: number, y: number) => {
    if (
      y < topY + 2 ||
      y >= botY - 2 ||
      x < 0 ||
      x >= W ||
      Math.abs(x - cx - ox) > halfWidthAt(y) - 2
    ) {
      return;
    }
    const idx = y * W + x;
    dest[idx] = hudAlpha >= 256 ? COLOR_HUD_GREEN : blendAbgr(dest[idx], COLOR_HUD_GREEN, hudAlpha);
  };

  const lineHud = (x0: number, y0: number, x1: number, y1: number) => {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= steps; i++) {
      putHud(Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps));
    }
  };

  const textHud = (x: number, y: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      const glyph = DIGIT_BITMAPS[str[i]];
      if (glyph) {
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 3; c++) {
            if (glyph[r] & (4 >> c)) {
              putHud(x + i * 4 + c, y + r);
            }
          }
        }
      }
    }
  };

  const boxR = sc(9);
  const cornerLen = Math.max(2, sc(4));
  for (const [sxSign, sySign] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    lineHud(cx + sxSign * boxR, pivotY + sySign * boxR, cx + sxSign * (boxR - cornerLen), pivotY + sySign * boxR);
    lineHud(cx + sxSign * boxR, pivotY + sySign * boxR, cx + sxSign * boxR, pivotY + sySign * (boxR - cornerLen));
  }
  lineHud(cx - sc(3), pivotY, cx + sc(3), pivotY);
  lineHud(cx, pivotY - sc(3), cx, pivotY + sc(3));

  const cosR = Math.cos(state.roll);
  const sinR = Math.sin(state.roll);
  const horizonOff = state.horizonY - pivotY;
  for (let deg = -20; deg <= 20; deg += 10) {
    const yOff = horizonOff - state.focal * Math.tan(((deg * Math.PI) / 180) * 0.8);
    const rIn = sc(deg === 0 ? 16 : 8);
    const rOut = sc(deg === 0 ? 54 : 20);
    for (let side = -1; side <= 1; side += 2) {
      const xIn = side * rIn;
      const xOut = side * rOut;
      lineHud(
        cx + cosR * xIn + sinR * yOff,
        pivotY - sinR * xIn + cosR * yOff,
        cx + cosR * xOut + sinR * yOff,
        pivotY - sinR * xOut + cosR * yOff
      );
      if (deg !== 0) {
        const tickY = yOff + Math.sign(deg) * sc(3);
        lineHud(
          cx + cosR * xOut + sinR * yOff,
          pivotY - sinR * xOut + cosR * yOff,
          cx + cosR * xOut + sinR * tickY,
          pivotY - sinR * xOut + cosR * tickY
        );
      }
    }
  }

  const tapeHalfH = sc(30);
  const tickStep = Math.max(3, sc(5));
  for (let side = -1; side <= 1; side += 2) {
    const tapeX = cx + side * sc(62);
    lineHud(tapeX, pivotY - tapeHalfH, tapeX, pivotY + tapeHalfH);
    const scroll =
      (((side < 0 ? state.speed * 0.6 : state.alt * 0.8) % (tickStep * 4)) + tickStep * 4) %
      (tickStep * 4);
    for (let dy = -tapeHalfH - tickStep * 4; dy <= tapeHalfH; dy += tickStep) {
      const ty = Math.round(pivotY + dy + scroll);
      if (ty < pivotY - tapeHalfH || ty > pivotY + tapeHalfH) continue;
      const major = Math.round((dy + tapeHalfH + tickStep * 4) / tickStep) % 4 === 0;
      lineHud(tapeX, ty, tapeX - side * sc(major ? 6 : 3), ty);
    }
    const ptrX = tapeX + side * sc(4);
    lineHud(ptrX, pivotY, ptrX + side * sc(4), pivotY - sc(3));
    lineHud(ptrX, pivotY, ptrX + side * sc(4), pivotY + sc(3));
    lineHud(ptrX + side * sc(4), pivotY - sc(3), ptrX + side * sc(4), pivotY + sc(3));
  }

  const spdStr = String(Math.round(state.speed * 4.2));
  textHud(cx - sc(62) - spdStr.length * 2, pivotY - tapeHalfH - 8, spdStr);
  const altStr = String(Math.round(state.alt * 120));
  textHud(cx + sc(62) - altStr.length * 2, pivotY - tapeHalfH - 8, altStr);

  const boostBars =
    state.boost > 0.66 ? 3 : state.boost > 0.33 ? 2 : state.boost > 0.05 ? 1 : 0;
  for (let i = 0; i < 3; i++) {
    const by = pivotY - sc(22) + i * sc(4);
    const bw = sc(i === 1 ? 6 : 9);
    if (i >= 3 - boostBars) {
      lineHud(cx - bw, by, cx + bw, by);
    } else {
      putHud(cx - bw, by);
      putHud(cx + bw, by);
    }
  }

  const compY = pivotY + sc(40);
  const compHalfW = sc(34);
  lineHud(cx - compHalfW, compY, cx + compHalfW, compY);
  const hdgDeg = (((state.heading * 180) / Math.PI) % 360 + 360) % 360;
  const pxPerDeg = Math.max(2, sc(4)) / 5;
  for (let deg = Math.floor((hdgDeg - 60) / 5) * 5; deg <= hdgDeg + 60; deg += 5) {
    const tx = Math.round(cx + (deg - hdgDeg) * pxPerDeg);
    if (Math.abs(tx - cx) <= compHalfW) {
      lineHud(tx, compY, tx, compY - (((deg % 15) + 15) % 15 === 0 ? sc(4) : sc(2)));
    }
  }
  lineHud(cx, compY + sc(2), cx - sc(3), compY + sc(6));
  lineHud(cx, compY + sc(2), cx + sc(3), compY + sc(6));
  lineHud(cx - sc(3), compY + sc(6), cx + sc(3), compY + sc(6));
  textHud(cx - 5, compY - sc(4) - 8, String(Math.round(hdgDeg)).padStart(3, '0'));
}

export function renderCockpitView(
  dest: Uint32Array,
  assets: CockpitAssets,
  state: Record<string, any>
): void {
  const { W, H, s, cx } = assets;
  const body = assets.pal.body;
  const hot = assets.pal.hot;
  const sc = (v: number) => Math.round(v * s);
  const inPlace = clamp(state.inPlace, 0, 1);
  if (inPlace <= 0) return;

  const time = state.time;
  const headX = state.headX * s;
  const headY = state.headY * s;
  const slideOut = 1 - inPlace;
  const layerOffset = (factor: number, yShift: number) => {
    const iy = Math.floor(yShift);
    return {
      x: -clamp(Math.round(headX * factor), -assets.pad, assets.pad),
      y: -clamp(Math.round(headY * factor), -assets.pad, assets.pad) + iy,
      f: yShift - iy,
    };
  };

  const deckSlide = slideOut * (H - assets.deckTop + 8) * 1.5;
  const canopyOff = layerOffset(PARALLAX_FACTORS.canopy, -slideOut * H * 0.62);
  const glassOff = layerOffset(PARALLAX_FACTORS.glass, slideOut * (H - assets.panelTop + 8));
  const panelOff = layerOffset(PARALLAX_FACTORS.panel, slideOut * (H - assets.panelTop + 8));
  const deckOff = layerOffset(PARALLAX_FACTORS.deck, deckSlide);
  const leverOff = layerOffset(PARALLAX_FACTORS.lever, deckSlide);
  const stickOff = layerOffset(PARALLAX_FACTORS.stick, deckSlide);
  const rearOff = layerOffset(PARALLAX_FACTORS.rear, -slideOut * H * 0.9);

  let sunBeam: {
    x: number;
    slope: number;
    half: number;
    k: number;
    col: number;
    y0: number;
  } | null = null;
  if (state.sunPower > 0.02 && state.sunReach > 0.02) {
    sunBeam = {
      x: cx - state.sunSide * sc(176),
      slope: clamp(Math.tan(state.roll) * 0.9 - state.sunSide * 0.6, -2.4, 2.4),
      half: sc(78),
      k: Math.round(58 * state.sunPower * state.sunReach),
      col: state.sunColor,
      y0: assets.panelTop,
    };
  }
  const canopyBeam = sunBeam ? { ...sunBeam, k: sunBeam.k >> 1 } : null;

  blitCockpitLayer(
    dest,
    assets,
    assets.canopy,
    canopyOff.x,
    canopyOff.y,
    canopyOff.f,
    -assets.pad,
    H + assets.pad,
    canopyBeam
  );
  drawCockpitHud(dest, assets, state, glassOff.x, glassOff.y);
  blitCockpitLayer(
    dest,
    assets,
    assets.panel,
    panelOff.x,
    panelOff.y,
    panelOff.f,
    assets.panelTop,
    H + assets.pad,
    sunBeam
  );

  const surf = new PixelSurface(dest, W, H);
  surf.ox = panelOff.x;
  surf.oy = panelOff.y;

  for (let i = 0; i < assets.lamps.length; i++) {
    const lamp = assets.lamps[i];
    if (
      state.boost > 0.25 ||
      i < 2 ||
      (i === 2 && ((time * 2) | 0) % 2 === 0) ||
      (i === 4 && hashByte(((time * 3) | 0) * 7) > 200)
    ) {
      surf.box(lamp.x, lamp.y, lamp.x + lamp.w, lamp.y + lamp.h, hot[4]);
      surf.box(lamp.x, lamp.y, lamp.x + lamp.w, lamp.y + 1, hot[5]);
    }
  }

  for (let i = 0; i < assets.panelKeys.length; i++) {
    const key = assets.panelKeys[i];
    if (hashByte(i * 53 + ((time * (0.7 + i * 0.23)) | 0)) <= 150) {
      surf.box(key.x, key.y, key.x + key.w, key.y + key.h, body[3]);
    }
  }

  const drawScreenGlare = (rx: number, ry: number, rw: number, rh: number) => {
    for (let dy = 0; dy < rh; dy++) {
      for (let dx = 0; dx < rw; dx++) {
        if (dy < 2 || dx < 2) {
          surf.tint(rx + dx, ry + dy, COLOR_BLACK, dy < 1 || dx < 1 ? 120 : 60);
        } else {
          const streak = dx + dy * 0.9 - rw * 0.34;
          if (streak > 0 && streak < rw * 0.16) {
            surf.tint(rx + dx, ry + dy, COLOR_WHITE, 22);
          } else if (streak > rw * 0.24 && streak < rw * 0.28) {
            surf.tint(rx + dx, ry + dy, COLOR_WHITE, 16);
          }
        }
      }
    }
  };

  // Left MFD: Radar
  {
    const rad = assets.radar;
    const rcx = rad.x + (rad.w >> 1);
    const rcy = rad.y + (rad.h >> 1);
    const maxR = Math.min(rad.w, rad.h) * 0.47;
    const worldScale = 9 / s;
    const sweepAng = (time * 1.6) % (Math.PI * 2);

    for (let dy = 0; dy < rad.h; dy++) {
      for (let dx = 0; dx < rad.w; dx++) {
        const ox = dx - (rad.w >> 1);
        const oy = dy - (rad.h >> 1);
        const dist = Math.sqrt(ox * ox + oy * oy);
        const landCode = state.land(ox * worldScale, -oy * worldScale);
        let shade =
          landCode >= 3 ? 4 : landCode === 2 ? 3 : landCode === 1 ? 1 : (dy & 1) === 0 ? 0 : 1;
        if (landCode < 2 && (ox === 0 || oy === 0)) shade = 2;
        const normR = dist / maxR;
        if (
          landCode < 3 &&
          (Math.abs(normR - 1) < 0.5 / maxR ||
            Math.abs(normR - 0.66) < 0.5 / maxR ||
            Math.abs(normR - 0.33) < 0.5 / maxR)
        ) {
          shade = Math.max(shade, landCode === 2 ? 4 : 2);
        }
        if (dist <= maxR) {
          let dAng = sweepAng - Math.atan2(ox, -oy);
          dAng -= Math.PI * 2 * Math.floor(dAng / (Math.PI * 2));
          if (dAng < 0.12) shade = 5;
          else if (dAng < 0.7 && shade < 5) shade++;
        }
        surf.put(rad.x + dx, rad.y + dy, CRT_GREEN_PALETTE[shade]);
      }
    }
    for (let i = 0; i + 1 < state.blips.length; i += 2) {
      const bx = rcx + Math.round(state.blips[i] / worldScale);
      const by = rcy - Math.round(state.blips[i + 1] / worldScale);
      if (bx > rad.x + 1 && bx < rad.x + rad.w - 2 && by > rad.y + 1 && by < rad.y + rad.h - 2) {
        surf.box(bx, by, bx + 2, by + 2, CRT_GREEN_PALETTE[5]);
      }
    }
    for (const [ox, oy] of [
      [0, -2],
      [0, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [-2, 1],
      [2, 1],
    ]) {
      surf.put(rcx + ox, rcy + oy, CRT_GREEN_PALETTE[5]);
    }
    for (let i = 0; i < 3; i++) {
      surf.box(
        rad.x + 3,
        rad.y + 3 + i * 3,
        rad.x + 3 + (i === 1 ? 9 : 13),
        rad.y + 5 + i * 3,
        CRT_GREEN_PALETTE[3]
      );
    }
    for (let i = 0; i < 3; i++) {
      surf.box(
        rad.x + rad.w - 15,
        rad.y + rad.h - 11 + i * 3,
        rad.x + rad.w - 3,
        rad.y + rad.h - 9 + i * 3,
        CRT_GREEN_PALETTE[i === 2 ? 4 : 3]
      );
    }
    surf.box(rad.x + rad.w - 14, rad.y + 3, rad.x + rad.w - 3, rad.y + 5, CRT_GREEN_PALETTE[2]);
    drawScreenGlare(rad.x, rad.y, rad.w, rad.h);
  }

  // Right MFD: Jet Status
  {
    const st = assets.status;
    for (let dy = 0; dy < st.h; dy++) {
      surf.box(
        st.x,
        st.y + dy,
        st.x + st.w,
        st.y + dy + 1,
        CRT_GREEN_PALETTE[(dy & 1) === 0 ? 0 : 1]
      );
    }
    const jetSil = state.jet;
    const scale = Math.min((st.h - 8) / jetSil.h, (st.w * 0.5) / jetSil.w);
    const jw = Math.round(jetSil.w * scale);
    const jh = Math.round(jetSil.h * scale);
    const jx = st.x + Math.round(st.w * 0.31) - (jw >> 1);
    const jy = st.y + ((st.h - jh) >> 1);
    const sampleCell = (px: number, py: number) =>
      px < 0 || py < 0 || px >= jw || py >= jh
        ? 0
        : jetSil.cells[
            Math.min(jetSil.h - 1, Math.floor(py / scale)) * jetSil.w +
              Math.min(jetSil.w - 1, Math.floor(px / scale))
          ];
    for (let py = 0; py < jh; py++) {
      for (let px = 0; px < jw; px++) {
        const cell = sampleCell(px, py);
        if (cell === 0) continue;
        const isEdge =
          sampleCell(px - 1, py) === 0 ||
          sampleCell(px + 1, py) === 0 ||
          sampleCell(px, py - 1) === 0 ||
          sampleCell(px, py + 1) === 0;
        surf.put(
          jx + px,
          jy + py,
          cell === 2
            ? isEdge
              ? hot[2]
              : hot[3]
            : cell === 3
              ? CRT_GREEN_PALETTE[5]
              : isEdge
                ? CRT_GREEN_PALETTE[2]
                : CRT_GREEN_PALETTE[3]
        );
      }
    }
    if (hashByte((time * 12) | 0) > 60) {
      surf.box(
        jx + (jw >> 1) - 3,
        jy + jh,
        jx + (jw >> 1) - 1,
        jy + jh + 1 + Math.round(state.boost * 3),
        hot[5]
      );
      surf.box(
        jx + (jw >> 1) + 1,
        jy + jh,
        jx + (jw >> 1) + 3,
        jy + jh + 1 + Math.round(state.boost * 3),
        hot[5]
      );
    }
    const barH = st.h - 16;
    for (let b = 0; b < 2; b++) {
      const bx = st.x + Math.round(st.w * 0.66) + b * Math.max(8, sc(12));
      const by = st.y + 7;
      const bw = Math.max(5, sc(8));
      surf.box(bx - 1, by - 1, bx + bw + 1, by + barH + 1, CRT_GREEN_PALETTE[3]);
      surf.box(bx, by, bx + bw, by + barH, CRT_GREEN_PALETTE[0]);
      const fillRatio = clamp(
        0.5 + 0.45 * state.boost + (hashByte(((time * 9) | 0) + b * 31) - 128) / 2600,
        0,
        1
      );
      const fillPx = Math.round(barH * fillRatio);
      for (let r = 0; r < fillPx; r++) {
        if (r % 3 !== 2) {
          surf.box(
            bx + 1,
            by + barH - 1 - r,
            bx + bw - 1,
            by + barH - r,
            r > barH * 0.8 ? hot[4] : CRT_GREEN_PALETTE[4]
          );
        }
      }
      surf.box(bx, st.y + 2, bx + bw, st.y + 4, CRT_GREEN_PALETTE[3]);
    }
    surf.text(
      st.x + 3,
      st.y + st.h - 7,
      String(Math.round(state.speed * 4.2)).padStart(3, '0'),
      CRT_GREEN_PALETTE[4]
    );
    surf.text(
      st.x + 3,
      st.y + 3,
      String(Math.round(state.alt * 120)).padStart(5, '0'),
      CRT_GREEN_PALETTE[4]
    );
    drawScreenGlare(st.x, st.y, st.w, st.h);
  }

  // Attitude Director Indicator (Nav Ball)
  {
    const ball = assets.ball;
    const cosR = Math.cos(state.roll);
    const sinR = Math.sin(state.roll);
    const scaleR = ball.r / 34;
    const pitchShift = clamp(
      state.pitch * (180 / Math.PI) * scaleR * 0.9,
      -ball.r * 0.85,
      ball.r * 0.85
    );
    const step = Math.max(3, Math.round(5 * scaleR * 2) / 2);
    for (let dy = -ball.r; dy <= ball.r; dy++) {
      for (let dx = -ball.r; dx <= ball.r; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 > ball.r * ball.r) continue;
        const rx = cosR * dx - sinR * dy;
        const ry = sinR * dx + cosR * dy - pitchShift;
        let col =
          ry > 0
            ? ry > ball.r * 0.55
              ? NAV_GROUND_DARK
              : NAV_GROUND_LIGHT
            : ry < -ball.r * 0.55
              ? NAV_SKY_DARK
              : NAV_SKY_LIGHT;
        if (Math.abs(ry) < 0.6) {
          col = COLOR_WHITE;
        } else {
          const rung = Math.round(ry / step);
          if (
            (rung !== 0 &&
              Math.abs(ry - rung * step) < 0.55 &&
              Math.abs(rx) < (rung % 2 === 0 ? ball.r * 0.34 : ball.r * 0.18)) ||
            (Math.abs(rx) < 0.6 && Math.abs(ry) < ball.r * 0.7)
          ) {
            col = COLOR_WHITE;
          }
        }
        const normR2 = d2 / (ball.r * ball.r);
        const shade = normR2 > 0.9 ? 130 : normR2 > 0.74 ? 80 : normR2 > 0.55 ? 34 : 0;
        const diag = (dx + dy) / (ball.r * 1.4142);
        col = blendAbgr(col, COLOR_BLACK, clamp(shade + Math.round(diag * 46), 0, 200));
        surf.put(ball.x + dx, ball.y + dy, col);
      }
    }
    for (let dy = -ball.r; dy < 0; dy++) {
      for (let dx = -ball.r; dx < 0; dx++) {
        const rNorm = Math.sqrt(dx * dx + dy * dy) / ball.r;
        if (
          rNorm > 0.5 &&
          rNorm < 0.72 &&
          dx < dy * 0.4 + ball.r * 0.1 &&
          dx > dy * 2.4
        ) {
          surf.tint(ball.x + dx, ball.y + dy, COLOR_WHITE, 54);
        }
      }
    }
    surf.box(
      ball.x - Math.round(ball.r * 0.62),
      ball.y + 1,
      ball.x - Math.round(ball.r * 0.2),
      ball.y + 2,
      COLOR_BLACK
    );
    surf.box(
      ball.x + Math.round(ball.r * 0.2) + 1,
      ball.y + 1,
      ball.x + Math.round(ball.r * 0.62) + 1,
      ball.y + 2,
      COLOR_BLACK
    );
    surf.box(
      ball.x - Math.round(ball.r * 0.62),
      ball.y,
      ball.x - Math.round(ball.r * 0.2),
      ball.y + 1,
      AMBER_KEY_PALETTE[1]
    );
    surf.box(
      ball.x + Math.round(ball.r * 0.2) + 1,
      ball.y,
      ball.x + Math.round(ball.r * 0.62) + 1,
      ball.y + 1,
      AMBER_KEY_PALETTE[1]
    );
    surf.box(ball.x - 1, ball.y - 1, ball.x + 2, ball.y + 2, AMBER_KEY_PALETTE[1]);
    surf.put(ball.x, ball.y, AMBER_KEY_PALETTE[2]);
  }

  // Analog Dials
  {
    const angles = [
      -225 + clamp(state.speed / Math.max(1, state.speedMax), 0, 1) * 270,
      -225 + clamp(state.alt / Math.max(1, state.altMax), 0, 1) * 270,
      -90 + clamp(state.climb, -1, 1) * 120,
      -90 + clamp(state.turn, -1, 1) * 120,
    ];
    for (let i = 0; i < assets.dials.length; i++) {
      const dial = assets.dials[i];
      const rad = (angles[i] * Math.PI) / 180;
      surf.line(
        dial.x + 1,
        dial.y + 1,
        dial.x + 1 + Math.cos(rad) * (dial.r - 4),
        dial.y + 1 + Math.sin(rad) * (dial.r - 4),
        COLOR_BLACK
      );
      surf.line(
        dial.x,
        dial.y,
        dial.x + Math.cos(rad) * (dial.r - 3),
        dial.y + Math.sin(rad) * (dial.r - 3),
        hot[4]
      );
      surf.line(
        dial.x,
        dial.y,
        dial.x - Math.cos(rad) * 2,
        dial.y - Math.sin(rad) * 2,
        hot[2]
      );
      surf.put(dial.x, dial.y, body[7]);
      for (let k = 0; k < 4; k++) {
        const gAng = (-150 + k * 12) * (Math.PI / 180);
        surf.tint(
          Math.round(dial.x + Math.cos(gAng) * (dial.r - 5)),
          Math.round(dial.y + Math.sin(gAng) * (dial.r - 5)),
          COLOR_WHITE,
          110
        );
      }
    }
  }

  // Lower Deck, Throttle & Flight Stick
  blitCockpitLayer(
    dest,
    assets,
    assets.deck,
    deckOff.x,
    deckOff.y,
    deckOff.f,
    0,
    H + assets.pad,
    sunBeam
  );
  surf.ox = deckOff.x;
  surf.oy = deckOff.y;
  for (let i = 0; i < assets.deckKeys.length; i++) {
    const key = assets.deckKeys[i];
    if (hashByte(i * 91 + ((time * (0.9 + i * 0.31)) | 0)) <= 150) {
      surf.box(key.x, key.y, key.x + key.w, key.y + key.h, body[3]);
    }
  }

  // Throttle Lever
  {
    surf.ox = leverOff.x;
    surf.oy = leverOff.y;
    const thr = assets.throttle;
    const ty = Math.round(thr.y1 - (thr.y1 - thr.y0) * clamp(0.18 + 0.82 * state.boost, 0, 1));
    const xL = thr.x - sc(11);
    const xR = thr.x + thr.w - sc(6);
    surf.box(thr.x - sc(7), ty + sc(5), thr.x - sc(4), H + 12, body[5]);
    surf.box(thr.x - sc(4), ty + sc(5), thr.x - sc(3), H + 12, body[1]);
    surf.box(thr.x + sc(10), ty + sc(5), thr.x + sc(13), H + 12, body[5]);
    surf.box(thr.x + sc(13), ty + sc(5), thr.x + sc(14), H + 12, body[1]);
    surf.box(xL + sc(3), ty + sc(9), xR + sc(3), ty + sc(12), COLOR_BLACK);
    surf.box(xL - 1, ty - 1, xR + 1, ty + sc(9) + 1, body[0]);
    surf.box(xL, ty, xR, ty + sc(9), hot[3]);
    surf.box(xL, ty, xR, ty + Math.max(1, sc(1.5)), hot[4]);
    surf.box(xL + 1, ty + 1, xR - 1, ty + Math.max(2, sc(3)), hot[5]);
    surf.box(xL, ty + sc(6), xR, ty + sc(9), hot[2]);
    surf.box(xL, ty + sc(8), xR, ty + sc(9), hot[1]);
    surf.box(xR - sc(5), ty + 1, xR - sc(4), ty + sc(8), hot[2]);
  }

  // Control Stick
  {
    surf.ox = stickOff.x;
    surf.oy = stickOff.y;
    const topY = assets.stick.y - Math.round(clamp(state.climb, -1, 1) * sc(3));
    const leanX = clamp(state.turn, -1, 1) * sc(9);
    const totalH = H + sc(40) - topY;
    const headH = Math.max(7, sc(14));
    const gripH = Math.max(8, sc(17));
    const bootRingH = Math.max(3, sc(5));
    const maxY = H + assets.pad;

    for (let y = topY + sc(4); y < maxY; y++) {
      const sxNow = Math.round(assets.stick.x + leanX * (1 - (y - topY) / totalH)) + sc(5);
      const dy = y - topY;
      const hw =
        dy < headH
          ? sc(12)
          : dy < headH + gripH
            ? sc(8)
            : sc(12) + Math.floor((dy - headH - gripH) / bootRingH) * sc(3);
      for (let dx = -hw; dx <= hw; dx++) {
        if (((sxNow + dx + y) & 1) === 0) {
          surf.tint(sxNow + dx, y + sc(3), COLOR_BLACK, 150);
        }
      }
    }

    for (let y = topY; y < maxY; y++) {
      const dy = y - topY;
      const sxNow = Math.round(assets.stick.x + leanX * (1 - dy / totalH));
      if (dy < headH) {
        const taper = dy < 2 ? 2 - dy : dy > headH - 2 ? 1 : 0;
        const hw = sc(12) - taper;
        for (let dx = -hw; dx <= hw; dx++) {
          const frac = dx / hw;
          surf.put(
            sxNow + dx,
            y,
            dy === 0
              ? body[5]
              : dy < Math.max(2, sc(3))
                ? body[6]
                : dy > headH - Math.max(2, sc(3))
                  ? body[1]
                  : frac < -0.8
                    ? body[5]
                    : frac > 0.78
                      ? body[1]
                      : frac > 0.3
                        ? body[2]
                        : body[3]
          );
        }
        surf.put(sxNow - hw - 1, y, body[0]);
        surf.put(sxNow + hw + 1, y, body[0]);
      } else if (dy < headH + gripH) {
        const hw = sc(8);
        const groove = (dy - headH) % Math.max(3, sc(4)) === Math.max(2, sc(3));
        for (let dx = -hw; dx <= hw; dx++) {
          const frac = dx / hw;
          let col =
            frac < -0.8
              ? body[2]
              : frac < -0.45
                ? body[5]
                : frac < -0.05
                  ? body[4]
                  : frac < 0.45
                    ? body[3]
                    : frac < 0.8
                      ? body[1]
                      : body[0];
          if (groove) col = frac < -0.05 ? body[2] : body[0];
          surf.put(sxNow + dx, y, col);
        }
        surf.put(sxNow - hw - 1, y, body[0]);
        surf.put(sxNow + hw + 1, y, body[0]);
        if (dy === headH) {
          for (let dx = -hw; dx <= hw; dx++) surf.put(sxNow + dx, y, body[0]);
        }
      } else {
        const ringIdx = Math.floor((dy - headH - gripH) / bootRingH);
        const ringSub = (dy - headH - gripH) % bootRingH;
        const hw = sc(12) + ringIdx * sc(3) - (ringSub === 0 ? 1 : 0);
        for (let dx = -hw; dx <= hw; dx++) {
          const frac = dx / hw;
          surf.put(
            sxNow + dx,
            y,
            ringSub === 0
              ? frac < 0.2
                ? body[4]
                : body[2]
              : ringSub === bootRingH - 1
                ? body[0]
                : frac < -0.55
                  ? body[2]
                  : frac > 0.5
                    ? body[0]
                    : body[1]
          );
        }
        surf.put(sxNow - hw - 1, y, body[0]);
        surf.put(sxNow + hw + 1, y, body[0]);
      }
    }

    const headCenter = Math.round(assets.stick.x + leanX);
    surf.box(headCenter - sc(12) + 2, topY - 1, headCenter + sc(12) - 1, topY, body[0]);
    surf.disc(headCenter - sc(6), topY + sc(7) + 1, Math.max(2, sc(4.2)), body[0]);
    surf.disc(headCenter - sc(6), topY + sc(7), Math.max(2, sc(3.4)), body[2]);
    surf.disc(headCenter - sc(6) - 1, topY + sc(7) - 1, Math.max(1, sc(1.4)), body[6]);
    surf.disc(headCenter + sc(6), topY + sc(7) + 1, Math.max(2, sc(4.2)), body[0]);
    surf.disc(
      headCenter + sc(6),
      topY + sc(7),
      Math.max(2, sc(3.4)),
      state.boost > 0.3 ? hot[5] : hot[3]
    );
    surf.put(
      headCenter + sc(6) - 1,
      topY + sc(7) - 1,
      state.boost > 0.3 ? COLOR_WHITE : hot[5]
    );
  }

  blitCockpitLayer(
    dest,
    assets,
    assets.rear,
    rearOff.x,
    rearOff.y,
    rearOff.f,
    -assets.pad,
    assets.rearBottom + 1,
    null
  );
}
