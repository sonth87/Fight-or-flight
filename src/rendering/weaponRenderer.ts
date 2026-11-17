import { RgbTuple } from '../types/game';
import { clamp, hashU32, hashUnitFloat, hexIntToAbgr, mapHexPalette } from '../utils/math';

export interface WeaponRenderTarget {
  time?: number;
  put: (x: number, y: number, color: number, depth: number) => void;
  line: (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: number,
    width: number,
    depth: number
  ) => void;
  disk: (x: number, y: number, radius: number, color: number, depth: number) => void;
  project: (x: number, y: number, z: number) => boolean;
  prX: () => number;
  prY: () => number;
  prM: () => number;
  prV: () => number;
  worldLine?: (
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    color: number,
    width: number
  ) => void;
  worldDisk?: (
    x: number,
    y: number,
    z: number,
    color: number,
    radius: number,
    minPx?: number
  ) => boolean;
}

interface ProjectedBulletPose {
  fx: number;
  fy: number;
  sx: number;
  sy: number;
  z: number;
  sc: number;
}

function plotOrientedPixel(
  rt: WeaponRenderTarget,
  sx: number,
  sy: number,
  fx: number,
  fy: number,
  along: number,
  across: number,
  color: number,
  depth: number,
  scale: number
): void {
  const x = sx + (along * fx - across * fy) * scale;
  const y = sy + (along * fy + across * fx) * scale;
  if (scale > 1.2) {
    rt.disk(x, y, scale * 0.65, color, depth);
  } else {
    rt.put(x, y, color, depth);
  }
}

function plotOrientedDisk(
  rt: WeaponRenderTarget,
  sx: number,
  sy: number,
  fx: number,
  fy: number,
  along: number,
  across: number,
  radius: number,
  color: number,
  depth: number,
  scale: number
): void {
  const x = sx + (along * fx - across * fy) * scale;
  const y = sy + (along * fy + across * fx) * scale;
  rt.disk(x, y, Math.max(0.7, radius * scale), color, depth);
}

function plotAsciiSprite(
  rt: WeaponRenderTarget,
  sx: number,
  sy: number,
  fx: number,
  fy: number,
  rows: string[],
  palette: Record<string, number>,
  offX: number,
  offY: number,
  depth: number,
  scale: number
): void {
  const s = Math.max(0.85, scale);
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') continue;
      const col = palette[ch];
      if (col) {
        plotOrientedPixel(rt, sx, sy, fx, fy, c + offX, r + offY, col, depth, s);
      }
    }
  }
}

const PAL_FIREBALL = mapHexPalette({
  d: 6951432,
  r: 14559756,
  o: 16742932,
  y: 16765514,
  w: 16775384,
  s: 3813424,
  e: 16755268,
});

const FIREBALL_FRAMES = [
  [
    '......oy........',
    '....oyyyo.......',
    '...rryyywo......',
    '..rrooyyww......',
    '.drooyyywww.....',
    'droooyyywww.....',
    '.rrooyyyywo.....',
    '..rroyyyo.......',
    '...orryo........',
    '....rro.........',
    '.....rd.........',
    '......s.........',
  ],
  [
    '.......y........',
    '....oyyyo.......',
    '...oyyyywo......',
    '..rroyyyww......',
    '.rrooyyywww.....',
    'droooyyywww.....',
    '.rrooyyyyww.....',
    '..rroyyyo.......',
    '...rrryo........',
    '....oro.........',
    '.....r..........',
    '......d.........',
  ],
  [
    '......oyw.......',
    '....oyyywo......',
    '...rryyyyww.....',
    '..rrooyyyww.....',
    '.drooyyywww.....',
    'droooyyywww.....',
    '.rrooyyyyw......',
    '..rroyyyo.......',
    '...orry.........',
    '....rr..........',
    '....rd..........',
    '.....s..........',
  ],
  [
    '.....oy.........',
    '....oyywo.......',
    '...rryyyww......',
    '..rrooyywww.....',
    '.rrooyyyyww.....',
    'droooyyywww.....',
    '.rrooyyywo......',
    '..rroyyy........',
    '...rryo.........',
    '....ro..........',
    '....rd..........',
    '.....d..........',
  ],
];

const PAL_PLASMA = mapHexPalette({
  u: 8392768,
  m: 16726664,
  p: 16751296,
  w: 16774399,
  c: 16765160,
  k: 4196384,
});
const PAL_WAVE = mapHexPalette({
  n: 674416,
  t: 1747160,
  c: 6219775,
  w: 15269887,
  y: 12120319,
});
const PAL_SCATTER = mapHexPalette({
  d: 9062928,
  o: 16756784,
  y: 16769152,
  w: 16775392,
});
const PAL_CANNON = mapHexPalette({
  s: 9083562,
  g: 13687008,
  w: 16777215,
  y: 16773312,
});
const PAL_DRONE = mapHexPalette({
  e: 1081440,
  g: 5308352,
  w: 15269876,
  y: 11599840,
});
const PAL_TRACER = mapHexPalette({
  d: 8392720,
  r: 16728128,
  o: 16748640,
  w: 16769232,
});
const PAL_BOLT = mapHexPalette({
  e: 1073200,
  g: 6750105,
  y: 13172582,
  w: 15794144,
});
const PAL_FLAK = mapHexPalette({
  d: 6965776,
  o: 16764006,
  y: 16769152,
  w: 16774864,
  s: 3813408,
});
const PAL_SPIRIT = mapHexPalette({
  n: 1335488,
  t: 3711231,
  c: 8446207,
  w: 15794175,
});
const PAL_LUMEN = mapHexPalette({
  u: 10489968,
  m: 16722112,
  p: 16748768,
  w: 16773375,
});
const PAL_HELIX = mapHexPalette({
  d: 10502160,
  o: 16747560,
  y: 16765056,
  w: 16774352,
});
const PAL_BITS = mapHexPalette({
  e: 1083480,
  g: 5308336,
  w: 15728628,
});
const PAL_RAIL = mapHexPalette({
  d: 10514448,
  o: 16756768,
  y: 16769120,
  w: 16774848,
});
const PAL_CHAKRAM = mapHexPalette({
  f: 6959280,
  h: 11832575,
  w: 16773375,
  p: 14201087,
});

const COLOR_LASER_CORE = hexIntToAbgr(16773364);
const COLOR_LASER_OUTER = hexIntToAbgr(16721992);
const COLOR_LASER_MID = hexIntToAbgr(16748704);

function getProjectileKind(shot: Record<string, any>): string {
  if (!shot) return 'cannon';
  if (shot.special) return shot.special;
  if (shot.drone) return 'drone';
  if (shot.own) {
    if (shot.flak || shot.special === 'flak') return 'flak';
    return shot.special || 'foe';
  }
  return 'cannon';
}

function projectBulletPose(
  rt: WeaponRenderTarget,
  shot: Record<string, any>
): ProjectedBulletPose | null {
  let vx = shot.vx || 0;
  let vy = shot.vy || 0;
  if (Math.abs(vx) + Math.abs(vy) < 1e-4 && shot.ox != null) {
    vx = shot.x - shot.ox;
    vy = shot.y - shot.oy;
  }
  if (rt.project && rt.project(shot.x, shot.y, shot.z)) {
    const sx = rt.prX();
    const sy = rt.prY();
    const tailX = shot.x - (shot.vx || vx) * 0.04;
    const tailY = shot.y - (shot.vy || vy) * 0.04;
    const tailZ = shot.z - (shot.vz || 0) * 0.04;
    if (rt.project(tailX, tailY, tailZ)) {
      const dx = sx - rt.prX();
      const dy = sy - rt.prY();
      const dist = Math.hypot(dx, dy);
      if (dist > 0.2) {
        return { fx: dx / dist, fy: dy / dist, sx, sy, z: rt.prV(), sc: rt.prM() };
      }
    }
    return { fx: 1, fy: 0, sx, sy, z: rt.prV(), sc: rt.prM() };
  }
  return null;
}

function clampSpriteScale(sc: number, min: number, max: number): number {
  return clamp(sc * 2.55, min, max);
}

function drawFireballShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.55, 3.2);
  const frame = FIREBALL_FRAMES[((shot.age * 16) | 0) + (hashU32((shot.x * 8) | 0) & 3) & 3];
  plotAsciiSprite(rt, pose.sx, pose.sy, pose.fx, pose.fy, frame, PAL_FIREBALL, -13, -5.5, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, -3.2, 0, 2.3, PAL_FIREBALL.y, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, -2.4, -0.3, 1.25, PAL_FIREBALL.w, pose.z, s);
  const tip = 3.5 + 1.2 * Math.sin(shot.age * 22);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, tip, 0, 1.1, PAL_FIREBALL.y, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, tip + 1.6, 0, PAL_FIREBALL.w, pose.z, s);
  const puffs = 7;
  for (let i = 1; i <= puffs; i++) {
    const t = i / puffs;
    const across = Math.sin(shot.age * 14 + i * 1.7) * 1.6;
    const along = -12 - t * 14;
    const col = t > 0.65 ? PAL_FIREBALL.s : t > 0.35 ? PAL_FIREBALL.d : PAL_FIREBALL.o;
    plotOrientedDisk(
      rt,
      pose.sx,
      pose.sy,
      pose.fx,
      pose.fy,
      along,
      across,
      1.7 - t * 0.8,
      col,
      pose.z + t,
      s
    );
    if ((hashU32(((shot.age * 20) | 0) + i * 17) & 3) !== 0) {
      plotOrientedDisk(
        rt,
        pose.sx,
        pose.sy,
        pose.fx,
        pose.fy,
        along - 1.4,
        across + 1.1,
        0.7,
        PAL_FIREBALL.e,
        pose.z,
        s
      );
    }
  }
}

function drawPlasmaShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.6);
  const r = 6.2 + 0.4 * Math.sin(shot.age * 18);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, r + 2.6, PAL_PLASMA.k, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, r + 1.2, PAL_PLASMA.u, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, r, PAL_PLASMA.m, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.4, -0.3, r * 0.58, PAL_PLASMA.p, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.7, -0.4, r * 0.3, PAL_PLASMA.w, pose.z, s);
  const sparks = 7;
  for (let i = 0; i < sparks; i++) {
    const ang = shot.age * 10 + i * ((Math.PI * 2) / sparks);
    const mult = 1.1 + 0.55 * hashUnitFloat(i * 13 + ((shot.age * 24) | 0));
    const ax = Math.cos(ang) * r * mult;
    const ay = Math.sin(ang) * r * mult;
    plotOrientedPixel(
      rt,
      pose.sx,
      pose.sy,
      pose.fx,
      pose.fy,
      ax,
      ay,
      i & 1 ? PAL_PLASMA.w : PAL_PLASMA.c,
      pose.z,
      s
    );
    plotOrientedPixel(
      rt,
      pose.sx,
      pose.sy,
      pose.fx,
      pose.fy,
      ax * 1.25,
      ay * 1.25,
      PAL_PLASMA.m,
      pose.z,
      s
    );
  }
}

function drawWaveShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.6, 3.6);
  const amp = 4.2;
  const steps = 16;
  let prevX = 0;
  let prevY = 0;
  let hasPrev = false;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const along = -t * 12;
    const across = Math.sin(t * Math.PI * 2 + shot.age * 14 + (shot.phase || 0)) * amp;
    const px = pose.sx + (along * pose.fx - across * pose.fy) * s;
    const py = pose.sy + (along * pose.fy + across * pose.fx) * s;
    if (hasPrev) {
      rt.line(prevX, prevY, px, py, PAL_WAVE.t, 3, pose.z);
      rt.line(prevX, prevY, px, py, PAL_WAVE.c, 2, pose.z);
    }
    prevX = px;
    prevY = py;
    hasPrev = true;
  }
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 1.7, PAL_WAVE.c, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.4, 0, 0.8, PAL_WAVE.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.8, 1.6, PAL_WAVE.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.8, -1.6, PAL_WAVE.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 2.6, 0, PAL_WAVE.w, pose.z, s);
}

function drawScatterShot(
  rt: WeaponRenderTarget,
  _shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.4);
  const rows = ['...y..', '..oyw.', '.doyww', 'doyyww', '.doyw.', '..oy..'];
  plotAsciiSprite(rt, pose.sx, pose.sy, pose.fx, pose.fy, rows, PAL_SCATTER, -4.5, -2.5, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.8, 0, 1.35, PAL_SCATTER.y, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.4, 0, 0.7, PAL_SCATTER.w, pose.z, s);
}

function drawCannonShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.6);
  const heavy = shot.dmg > 1.5;
  const tailLen = heavy ? 16 : 13;
  const x0 = pose.sx - pose.fx * tailLen * s;
  const y0 = pose.sy - pose.fy * tailLen * s;
  const x1 = pose.sx + pose.fx * 2.4 * s;
  const y1 = pose.sy + pose.fy * 2.4 * s;
  rt.line(x0, y0, x1, y1, PAL_CANNON.s, heavy ? 6 : 5, pose.z);
  rt.line(x0 * 0.25 + pose.sx * 0.75, y0 * 0.25 + pose.sy * 0.75, x1, y1, PAL_CANNON.g, 3, pose.z);
  rt.line(x0 * 0.1 + pose.sx * 0.9, y0 * 0.1 + pose.sy * 0.9, x1, y1, PAL_CANNON.w, 2, pose.z);
  plotOrientedDisk(
    rt,
    pose.sx,
    pose.sy,
    pose.fx,
    pose.fy,
    1,
    0,
    heavy ? 2.5 : 2.1,
    PAL_CANNON.y,
    pose.z,
    s
  );
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.6, 0, 1.15, PAL_CANNON.w, pose.z, s);
}

function drawDroneShot(
  rt: WeaponRenderTarget,
  _shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.4);
  const x0 = pose.sx - pose.fx * 9 * s;
  const y0 = pose.sy - pose.fy * 9 * s;
  rt.line(x0, y0, pose.sx, pose.sy, PAL_DRONE.e, 4, pose.z);
  rt.line(
    (x0 + pose.sx) / 2,
    (y0 + pose.sy) / 2,
    pose.sx + pose.fx * 2 * s,
    pose.sy + pose.fy * 2 * s,
    PAL_DRONE.g,
    2,
    pose.z
  );
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 2.1, PAL_DRONE.g, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.4, 0, 1, PAL_DRONE.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.6, 0, PAL_DRONE.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1, 0.9, PAL_DRONE.y, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1, -0.9, PAL_DRONE.y, pose.z, s);
}

function drawEnemyTracerShot(
  rt: WeaponRenderTarget,
  _shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.4);
  const x0 = pose.sx - pose.fx * 10 * s;
  const y0 = pose.sy - pose.fy * 10 * s;
  rt.line(x0, y0, pose.sx, pose.sy, PAL_TRACER.d, 4, pose.z);
  rt.line(
    (x0 + pose.sx) / 2,
    (y0 + pose.sy) / 2,
    pose.sx + pose.fx * 2 * s,
    pose.sy + pose.fy * 2 * s,
    PAL_TRACER.r,
    3,
    pose.z
  );
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.4, 0, 2, PAL_TRACER.o, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.4, 0, PAL_TRACER.w, pose.z, s);
}

function drawUfoBoltShot(
  rt: WeaponRenderTarget,
  _shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.8, 3.6);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 3.6, PAL_BOLT.e, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 2.4, PAL_BOLT.g, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.4, -0.25, 1.1, PAL_BOLT.w, pose.z, s);
  const x0 = pose.sx - pose.fx * 8 * s;
  const y0 = pose.sy - pose.fy * 8 * s;
  rt.line(x0, y0, pose.sx, pose.sy, PAL_BOLT.y, 3, pose.z);
}

function drawFlakShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.8, 3.6);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 3.5, PAL_FLAK.d, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 2.4, PAL_FLAK.o, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.3, -0.2, 1.1, PAL_FLAK.w, pose.z, s);
  const ang = shot.age * 10;
  plotOrientedPixel(
    rt,
    pose.sx,
    pose.sy,
    pose.fx,
    pose.fy,
    Math.cos(ang) * 1.8,
    Math.sin(ang) * 1.8,
    PAL_FLAK.y,
    pose.z,
    s
  );
  plotOrientedPixel(
    rt,
    pose.sx,
    pose.sy,
    pose.fx,
    pose.fy,
    Math.cos(ang + 2) * 1.8,
    Math.sin(ang + 2) * 1.8,
    PAL_FLAK.y,
    pose.z,
    s
  );
}

function drawSpiritWaveShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.8);
  const rad = (shot.size || 3) * 0.55;
  const len = 16;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const along = -t * len;
    const r = (0.7 + 0.5 * Math.sin(t * Math.PI + shot.age * 8)) * rad * (1 - t * 0.35);
    plotOrientedDisk(
      rt,
      pose.sx,
      pose.sy,
      pose.fx,
      pose.fy,
      along,
      0,
      r,
      t < 0.2 ? PAL_SPIRIT.c : PAL_SPIRIT.t,
      pose.z,
      s
    );
  }
  for (let k = -3; k <= 3; k++) {
    plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.2, k * 1.15, PAL_SPIRIT.w, pose.z, s);
    plotOrientedPixel(
      rt,
      pose.sx,
      pose.sy,
      pose.fx,
      pose.fy,
      2 - Math.abs(k) * 0.25,
      k * 1.15,
      PAL_SPIRIT.c,
      pose.z,
      s
    );
  }
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.4, 0, 1.3, PAL_SPIRIT.w, pose.z, s);
}

function drawLumenShot(
  rt: WeaponRenderTarget,
  _shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.6);
  const len = 13;
  const x0 = pose.sx - pose.fx * len * s;
  const y0 = pose.sy - pose.fy * len * s;
  rt.line(x0, y0, pose.sx + pose.fx * 2 * s, pose.sy + pose.fy * 2 * s, PAL_LUMEN.u, 4, pose.z);
  rt.line(x0, y0, pose.sx + pose.fx * 2 * s, pose.sy + pose.fy * 2 * s, PAL_LUMEN.m, 2, pose.z);
  rt.line(
    x0 * 0.2 + pose.sx * 0.8,
    y0 * 0.2 + pose.sy * 0.8,
    pose.sx + pose.fx * 3 * s,
    pose.sy + pose.fy * 3 * s,
    PAL_LUMEN.w,
    1,
    pose.z
  );
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.2, 0, 1.3, PAL_LUMEN.p, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.6, 0, 0.55, PAL_LUMEN.w, pose.z, s);
}

function drawHelixShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.7, 3.6);
  const len = 12;
  const amp = 3.1;
  const steps = 16;
  let prevX = 0;
  let prevY = 0;
  let hasPrev = false;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = shot.age * 20 + t * Math.PI * 4;
    const along = -len * (1 - t);
    const across = Math.cos(ang) * amp;
    const px = pose.sx + (along * pose.fx - across * pose.fy) * s;
    const py = pose.sy + (along * pose.fy + across * pose.fx) * s;
    if (hasPrev) {
      rt.line(prevX, prevY, px, py, i & 1 ? PAL_HELIX.y : PAL_HELIX.o, 2, pose.z);
    }
    prevX = px;
    prevY = py;
    hasPrev = true;
  }
  hasPrev = false;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = shot.age * 20 + t * Math.PI * 4 + Math.PI;
    const along = -len * (1 - t);
    const across = Math.cos(ang) * amp;
    const px = pose.sx + (along * pose.fx - across * pose.fy) * s;
    const py = pose.sy + (along * pose.fy + across * pose.fx) * s;
    if (hasPrev) {
      rt.line(prevX, prevY, px, py, PAL_HELIX.o, 1, pose.z);
    }
    prevX = px;
    prevY = py;
    hasPrev = true;
  }
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.4, 0, 1.6, PAL_HELIX.o, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.8, 0, 0.7, PAL_HELIX.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 2.2, 0, PAL_HELIX.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.6, 1.1, PAL_HELIX.y, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 1.6, -1.1, PAL_HELIX.y, pose.z, s);
}

function drawBitsShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.8, 3.4);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 1.7, PAL_BITS.e, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 1.15, PAL_BITS.g, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0.25, -0.2, 0.5, PAL_BITS.w, pose.z, s);
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + shot.age * 6;
    plotOrientedPixel(
      rt,
      pose.sx,
      pose.sy,
      pose.fx,
      pose.fy,
      Math.cos(ang) * 1.8,
      Math.sin(ang) * 1.8,
      PAL_BITS.w,
      pose.z,
      s
    );
  }
  const x0 = pose.sx - pose.fx * 4 * s;
  const y0 = pose.sy - pose.fy * 4 * s;
  rt.line(x0, y0, pose.sx, pose.sy, PAL_BITS.g, 2, pose.z);
}

function drawCoinRailShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.8, 3.6);
  const spin = shot.age * 22;
  const rad = 3.6;
  let prevX = 0;
  let prevY = 0;
  let hasPrev = false;
  for (let i = 0; i <= 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const along = Math.cos(ang + spin) * rad;
    const across = Math.sin(ang + spin) * rad * 0.38;
    const px = pose.sx + (along * pose.fx - across * pose.fy) * s;
    const py = pose.sy + (along * pose.fy + across * pose.fx) * s;
    if (hasPrev) {
      rt.line(prevX, prevY, px, py, i & 1 ? PAL_RAIL.y : PAL_RAIL.o, 2, pose.z);
    }
    prevX = px;
    prevY = py;
    hasPrev = true;
  }
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 1.5, PAL_RAIL.o, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 0.7, PAL_RAIL.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, -0.8, PAL_RAIL.w, pose.z, s);
  plotOrientedPixel(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0.8, PAL_RAIL.w, pose.z, s);
}

function drawChakramShot(
  rt: WeaponRenderTarget,
  shot: Record<string, any>,
  pose: ProjectedBulletPose
): void {
  const s = clampSpriteScale(pose.sc, 1.8, 3.8);
  const spin = shot.age * (shot.spin || 14);
  const rad = 6.4;
  const points = 5;
  for (let i = 0; i < points; i++) {
    const ang0 = spin + (i * Math.PI * 2) / points;
    const ang1 = ang0 + Math.PI / points;
    const xTip = pose.sx + (Math.cos(ang0) * rad * pose.fx - Math.sin(ang0) * rad * pose.fy) * s;
    const yTip = pose.sy + (Math.cos(ang0) * rad * pose.fy + Math.sin(ang0) * rad * pose.fx) * s;
    const xVal =
      pose.sx + (Math.cos(ang1) * rad * 0.38 * pose.fx - Math.sin(ang1) * rad * 0.38 * pose.fy) * s;
    const yVal =
      pose.sy + (Math.cos(ang1) * rad * 0.38 * pose.fy + Math.sin(ang1) * rad * 0.38 * pose.fx) * s;
    rt.line(pose.sx, pose.sy, xTip, yTip, PAL_CHAKRAM.f, 3, pose.z);
    rt.line(xTip, yTip, xVal, yVal, PAL_CHAKRAM.h, 2, pose.z);
    rt.line(xTip, yTip, xVal, yVal, PAL_CHAKRAM.w, 1, pose.z);
  }
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 1.8, PAL_CHAKRAM.f, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 1, PAL_CHAKRAM.h, pose.z, s);
  plotOrientedDisk(rt, pose.sx, pose.sy, pose.fx, pose.fy, 0, 0, 0.45, PAL_CHAKRAM.w, pose.z, s);
}

/** Render a bullet / projectile sprite onto the target buffer. */
export function drawProjectileSprite(
  rt: WeaponRenderTarget,
  shot: Record<string, any>
): boolean {
  const pose = projectBulletPose(rt, shot);
  if (!pose) return true;
  const kind = getProjectileKind(shot);
  if (kind === 'fireball') {
    drawFireballShot(rt, shot, pose);
    return true;
  }
  if (kind === 'plasma' && !shot.own) {
    drawPlasmaShot(rt, shot, pose);
    return true;
  }
  if (kind === 'wave') {
    drawWaveShot(rt, shot, pose);
    return true;
  }
  if (kind === 'scatter') {
    drawScatterShot(rt, shot, pose);
    return true;
  }
  if (kind === 'cannon') {
    drawCannonShot(rt, shot, pose);
    return true;
  }
  if (kind === 'drone') {
    drawDroneShot(rt, shot, pose);
    return true;
  }
  if (kind === 'spirit') {
    drawSpiritWaveShot(rt, shot, pose);
    return true;
  }
  if (kind === 'lumen') {
    drawLumenShot(rt, shot, pose);
    return true;
  }
  if (kind === 'helix') {
    drawHelixShot(rt, shot, pose);
    return true;
  }
  if (kind === 'bits') {
    drawBitsShot(rt, shot, pose);
    return true;
  }
  if (kind === 'rail') {
    drawCoinRailShot(rt, shot, pose);
    return true;
  }
  if (kind === 'chakram') {
    drawChakramShot(rt, shot, pose);
    return true;
  }
  if (kind === 'flak') {
    drawFlakShot(rt, shot, pose);
    return true;
  }
  if (kind === 'bolt' || kind === 'plasmafoe' || (shot.own && kind === 'plasma')) {
    drawUfoBoltShot(rt, shot, pose);
    return true;
  }
  if (kind === 'tracer' || (shot.own && !shot.special) || shot.own) {
    drawEnemyTracerShot(rt, shot, pose);
    return true;
  }
  drawCannonShot(rt, shot, pose);
  return true;
}

const MISSILE_PALETTES: Record<
  string,
  {
    body: number;
    shade: number;
    tip: number;
    fin: number;
    flame: number;
    glow: number;
    band: number;
  }
> = {
  default: {
    body: hexIntToAbgr(13160668),
    shade: hexIntToAbgr(6976384),
    tip: hexIntToAbgr(15791352),
    fin: hexIntToAbgr(9082016),
    flame: hexIntToAbgr(16760896),
    glow: hexIntToAbgr(16740384),
    band: hexIntToAbgr(16777215),
  },
  swarm: {
    body: hexIntToAbgr(5300479),
    shade: hexIntToAbgr(1603720),
    tip: hexIntToAbgr(15269887),
    fin: hexIntToAbgr(2797768),
    flame: hexIntToAbgr(8454112),
    glow: hexIntToAbgr(2146464),
    band: hexIntToAbgr(16777215),
  },
  circus: {
    body: hexIntToAbgr(5952767),
    shade: hexIntToAbgr(1337472),
    tip: hexIntToAbgr(16774352),
    fin: hexIntToAbgr(16751152),
    flame: hexIntToAbgr(16765024),
    glow: hexIntToAbgr(16740376),
    band: hexIntToAbgr(16773280),
  },
  torpedo: {
    body: hexIntToAbgr(3830015),
    shade: hexIntToAbgr(1056864),
    tip: hexIntToAbgr(13689087),
    fin: hexIntToAbgr(8429823),
    flame: hexIntToAbgr(8438015),
    glow: hexIntToAbgr(2121983),
    band: hexIntToAbgr(16777215),
  },
  singularity: {
    body: hexIntToAbgr(2101304),
    shade: hexIntToAbgr(525332),
    tip: hexIntToAbgr(13148415),
    fin: hexIntToAbgr(6963392),
    flame: hexIntToAbgr(10514687),
    glow: hexIntToAbgr(4202656),
    band: hexIntToAbgr(15257855),
  },
  cluster: {
    body: hexIntToAbgr(15266047),
    shade: hexIntToAbgr(7372960),
    tip: hexIntToAbgr(16760896),
    fin: hexIntToAbgr(16748576),
    flame: hexIntToAbgr(16769152),
    glow: hexIntToAbgr(16736272),
    band: hexIntToAbgr(16728096),
  },
  mini: {
    body: hexIntToAbgr(7405520),
    shade: hexIntToAbgr(1603672),
    tip: hexIntToAbgr(15794168),
    fin: hexIntToAbgr(4243600),
    flame: hexIntToAbgr(10551264),
    glow: hexIntToAbgr(2138224),
    band: hexIntToAbgr(16777215),
  },
};

function getMissilePalette(msl: Record<string, any>) {
  if (msl.mini) return MISSILE_PALETTES.mini;
  if (msl.special && MISSILE_PALETTES[msl.special]) return MISSILE_PALETTES[msl.special];
  return MISSILE_PALETTES.default;
}

const CIRCUS_HEAD_OUTER = hexIntToAbgr(16723624);
const CIRCUS_HEAD_MID = hexIntToAbgr(16740560);
const CIRCUS_HEAD_CORE = hexIntToAbgr(16773375);
const CIRCUS_BODY_LINE = hexIntToAbgr(12595320);
const CIRCUS_SHADE_LINE = hexIntToAbgr(5247016);
const CIRCUS_TRAIL_COLORS = [
  hexIntToAbgr(16761066),
  hexIntToAbgr(16743120),
  hexIntToAbgr(13652128),
  hexIntToAbgr(8409200),
  hexIntToAbgr(4862016),
];
const CIRCUS_SPARK_A = hexIntToAbgr(16775423);
const CIRCUS_SPARK_B = hexIntToAbgr(16737512);

function drawCircusMissile(rt: WeaponRenderTarget, msl: Record<string, any>): void {
  const yaw = msl.yaw || 0;
  const fx = Math.sin(yaw);
  const fy = -Math.cos(yaw);
  const rx = Math.cos(yaw);
  const ry = Math.sin(yaw);
  const spiral = msl.spiral || 0;
  const age = msl.age || 0;
  const spinRate = 16;
  const steps = 22;
  const trailLen = 22;

  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const distBack = t * trailLen;
    const ang = spiral + age * spinRate - t * 9;
    const orbitR = 3.2 + t * 3.2;
    const wx = msl.x - fx * distBack + rx * Math.cos(ang) * orbitR;
    const wy = msl.y - fy * distBack + ry * Math.sin(ang) * orbitR;
    const wz = msl.z + Math.sin(ang) * orbitR * 0.85;
    if (!rt.project(wx, wy, wz)) continue;
    const sx = rt.prX();
    const sy = rt.prY();
    const depth = rt.prV();
    const sc = Math.max(1.15, Math.min(3.4, rt.prM() * 2.2));
    const rad = (1.2 - t * 0.55) * sc * 0.9;
    const col =
      CIRCUS_TRAIL_COLORS[t < 0.18 ? 0 : t < 0.36 ? 1 : t < 0.55 ? 2 : t < 0.78 ? 3 : 4];
    rt.disk(sx, sy, rad, col, depth);
    if (t < 0.3) {
      rt.disk(sx, sy, rad * 0.4, hexIntToAbgr(16769268), depth);
    }
    if ((i * 17 + ((age * 20) | 0)) % 5 === 0) {
      const ox = Math.cos(ang * 1.7) * 1.7 * sc;
      const oy = Math.sin(ang * 2.1) * 1.7 * sc;
      rt.put(sx + ox, sy + oy, i & 1 ? CIRCUS_SPARK_A : CIRCUS_SPARK_B, depth);
    }
  }

  const len = 4.2 * (msl.size || 0.65);
  if (!rt.project(msl.x + fx * len * 0.25, msl.y + fy * len * 0.25, msl.z)) return;
  const sx0 = rt.prX();
  const sy0 = rt.prY();
  const depth0 = rt.prV();
  const sc0 = rt.prM();
  if (!rt.project(msl.x - fx * len, msl.y - fy * len, msl.z)) return;
  const sx1 = rt.prX();
  const sy1 = rt.prY();
  const dx = sx0 - sx1;
  const dy = sy0 - sy1;
  const dLen = Math.hypot(dx, dy) || 1;
  const ux = dx / dLen;
  const uy = dy / dLen;
  const s = clamp(sc0 * 2.4, 1.6, 3.6);
  const bodyLen = 6.2 * (msl.size || 0.65);
  const noseX = sx0 + ux * 0.8 * s;
  const noseY = sy0 + uy * 0.8 * s;
  const tailX = sx0 - ux * bodyLen * s;
  const tailY = sy0 - uy * bodyLen * s;
  rt.line(tailX, tailY, noseX, noseY, CIRCUS_SHADE_LINE, 3, depth0);
  rt.line(tailX, tailY, noseX, noseY, CIRCUS_BODY_LINE, 1, depth0);
  rt.disk(noseX, noseY, 1.6 * s, CIRCUS_HEAD_OUTER, depth0);
  rt.disk(noseX, noseY, 0.9 * s, CIRCUS_HEAD_MID, depth0);
  rt.disk(noseX, noseY, 0.4 * s, CIRCUS_HEAD_CORE, depth0);
  if (age > 0.05) {
    const flicker = ((rt.time || 0) * 30) & 1;
    rt.disk(
      tailX - ux * 0.8 * s,
      tailY - uy * 0.8 * s,
      (flicker ? 1.15 : 0.85) * s,
      CIRCUS_HEAD_MID,
      depth0
    );
    rt.disk(tailX - ux * 2 * s, tailY - uy * 2 * s, 0.65 * s, hexIntToAbgr(10494064), depth0);
  }
}

/** Render a missile sprite onto the target buffer. */
export function drawMissileSprite(rt: WeaponRenderTarget, msl: Record<string, any>): void {
  if (msl.age < 0) return;
  if (msl.special === 'circus') {
    drawCircusMissile(rt, msl);
    return;
  }
  const yaw = msl.yaw || 0;
  const fx = Math.sin(yaw);
  const fy = -Math.cos(yaw);
  const wLen =
    (msl.mini ? 5.5 : 9.5) * Math.max(1, msl.size || 1) * (msl.special ? 1.15 : 1);
  if (!rt.project(msl.x + fx * wLen * 0.15, msl.y + fy * wLen * 0.15, msl.z)) return;
  const sx0 = rt.prX();
  const sy0 = rt.prY();
  const depth = rt.prV();
  const sc0 = rt.prM();
  if (!rt.project(msl.x - fx * wLen, msl.y - fy * wLen, msl.z)) return;
  const sx1 = rt.prX();
  const sy1 = rt.prY();
  const dx = sx0 - sx1;
  const dy = sy0 - sy1;
  const dLen = Math.hypot(dx, dy) || 1;
  const ux = dx / dLen;
  const uy = dy / dLen;
  const s = clamp(sc0 * 2.2, 1.7, 3.8);
  const pal = getMissilePalette(msl);
  const bodyLen = (msl.mini ? 8 : 12) * (msl.size || 1);
  const thick =
    msl.special === 'torpedo' || msl.special === 'cluster' ? 5 : msl.mini ? 3 : 4;
  const noseX = sx0 + ux * 1.2 * s;
  const noseY = sy0 + uy * 1.2 * s;
  const tailX = sx0 - ux * bodyLen * s;
  const tailY = sy0 - uy * bodyLen * s;
  rt.line(tailX, tailY, noseX, noseY, pal.shade, thick + 1, depth);
  rt.line(tailX, tailY, noseX, noseY, pal.body, thick, depth);
  rt.disk(
    noseX,
    noseY,
    Math.max(1, 1.15 * s * (msl.special === 'torpedo' ? 1.3 : 1)),
    pal.tip,
    depth
  );

  const nx = -uy;
  const ny = ux;
  const finSpan = (msl.mini ? 3.4 : 5.4) * s * (msl.special === 'circus' ? 1.15 : 1);
  const finBaseX = tailX + ux * 2.2 * s;
  const finBaseY = tailY + uy * 2.2 * s;
  rt.line(
    finBaseX - nx * finSpan,
    finBaseY - ny * finSpan,
    finBaseX + nx * finSpan,
    finBaseY + ny * finSpan,
    pal.fin,
    2,
    depth
  );
  rt.line(
    finBaseX - nx * finSpan * 0.3 - ux * s,
    finBaseY - ny * finSpan * 0.3 - uy * s,
    finBaseX - nx * finSpan,
    finBaseY - ny * finSpan,
    pal.fin,
    2,
    depth
  );
  rt.line(
    finBaseX + nx * finSpan * 0.3 - ux * s,
    finBaseY + ny * finSpan * 0.3 - uy * s,
    finBaseX + nx * finSpan,
    finBaseY + ny * finSpan,
    pal.fin,
    2,
    depth
  );

  if (msl.special === 'torpedo') {
    rt.line(
      sx0 - ux * 3 * s,
      sy0 - uy * 3 * s,
      sx0 - ux * 3.2 * s,
      sy0 - uy * 3.2 * s,
      pal.band,
      3,
      depth
    );
    rt.line(
      sx0 - ux * 6 * s,
      sy0 - uy * 6 * s,
      sx0 - ux * 6.2 * s,
      sy0 - uy * 6.2 * s,
      pal.band,
      3,
      depth
    );
  }
  if (msl.special === 'cluster') {
    rt.line(
      sx0 - ux * 4 * s,
      sy0 - uy * 4 * s,
      sx0 - ux * 4.2 * s,
      sy0 - uy * 4.2 * s,
      pal.band,
      3,
      depth
    );
    rt.disk(sx0 - ux * 2 * s, sy0 - uy * 2 * s, 1.1 * s, pal.tip, depth);
  }
  if (msl.special === 'singularity') {
    rt.disk(sx0 - ux * 3 * s, sy0 - uy * 3 * s, 2.1 * s, pal.shade, depth);
    rt.disk(sx0 - ux * 3 * s, sy0 - uy * 3 * s, 1.1 * s, pal.tip, depth);
    for (let i = 0; i < 5; i++) {
      const ang = msl.age * 4 + i * 1.26;
      rt.put(sx0 + Math.cos(ang) * 4.2 * s, sy0 + Math.sin(ang) * 3.2 * s, pal.band, depth);
    }
  }
  if (msl.special === 'swarm') {
    rt.disk(noseX, noseY, 0.8 * s, pal.tip, depth);
  }
  if (msl.age > 0.08) {
    const flicker = (((rt.time || 0) * 28) | 0) & 1;
    const plumeLen =
      (msl.special === 'torpedo' ? 11 : msl.special === 'circus' ? 10 : 8.5) * s;
    rt.line(tailX, tailY, tailX - ux * plumeLen, tailY - uy * plumeLen, pal.glow, 2, depth);
    rt.disk(
      tailX - ux * 0.6 * s,
      tailY - uy * 0.6 * s,
      (flicker ? 1.6 : 1.25) * s,
      pal.flame,
      depth
    );
    rt.disk(tailX - ux * 2.2 * s, tailY - uy * 2.2 * s, 1.05 * s, pal.glow, depth);
    rt.disk(tailX - ux * 3.6 * s, tailY - uy * 3.6 * s, 0.7 * s, hexIntToAbgr(3811360), depth);
    rt.put(tailX, tailY, hexIntToAbgr(16775392), depth);
  }
}

export function drawStarFlare(
  rt: WeaponRenderTarget,
  x: number,
  y: number,
  radius: number,
  color: number,
  depth: number
): void {
  rt.line(x - radius, y, x + radius, y, color, 1, depth);
  rt.line(x, y - radius, x, y + radius, color, 1, depth);
  const diag = radius * 0.7;
  rt.line(x - diag, y - diag, x + diag, y + diag, color, 1, depth);
  rt.line(x - diag, y + diag, x + diag, y - diag, color, 1, depth);
}

/** Render a laser or rail beam onto the target buffer. */
export function drawLaserBeam(rt: WeaponRenderTarget, beam: Record<string, any>): void {
  if (!rt.project(beam.x, beam.y, beam.z)) return;
  const x0 = rt.prX();
  const y0 = rt.prY();
  const depth = rt.prV();
  const sc = rt.prM();
  if (!rt.project(beam.ex, beam.ey, beam.ez)) return;
  const x1 = rt.prX();
  const y1 = rt.prY();
  const isRail = beam.tint === 'rail';
  const outerCol = isRail ? hexIntToAbgr(16742932) : COLOR_LASER_OUTER;
  const midCol = isRail ? hexIntToAbgr(16765056) : COLOR_LASER_MID;
  const coreCol = isRail ? hexIntToAbgr(16774864) : COLOR_LASER_CORE;

  rt.line(x0, y0, x1, y1, outerCol, isRail ? 8 : 7, depth);
  rt.line(x0, y0, x1, y1, midCol, 4, depth);
  rt.line(x0, y0, x1, y1, coreCol, 1, depth);
  drawStarFlare(rt, x0, y0, 5 * Math.max(1, sc), outerCol, depth);
  drawStarFlare(rt, x0, y0, 2.6 * Math.max(1, sc), coreCol, depth);
  drawStarFlare(rt, x1, y1, 4.2 * Math.max(1, sc), outerCol, depth);
  rt.disk(x1, y1, 1.4 * Math.max(1, sc), coreCol, depth);

  if (beam.fork && rt.project(beam.fork.x, beam.fork.y, beam.fork.z)) {
    const fx = rt.prX();
    const fy = rt.prY();
    const fDepth = rt.prV();
    rt.line((x0 + x1) / 2, (y0 + y1) / 2, fx, fy, outerCol, 2, fDepth);
    rt.line((x0 + x1) / 2, (y0 + y1) / 2, fx, fy, coreCol, 1, fDepth);
    drawStarFlare(rt, fx, fy, 3, outerCol, fDepth);
  }
}

/** Render a jagged chain-lightning arc onto the target buffer. */
export function drawLightningArc(rt: WeaponRenderTarget, zap: Record<string, any>): void {
  if (!rt.project(zap.ax, zap.ay, zap.az)) return;
  const x0 = rt.prX();
  const y0 = rt.prY();
  const d0 = rt.prV();
  if (!rt.project(zap.bx, zap.by, zap.bz)) return;
  const x1 = rt.prX();
  const y1 = rt.prY();
  const d1 = rt.prV();
  const segs = 7;
  const seed = hashU32(((zap.age * 40) | 0) * 31 + ((zap.ax * 4) | 0));
  const outerCol = hexIntToAbgr(4886783);
  const midCol = hexIntToAbgr(11067647);
  const coreCol = hexIntToAbgr(16056319);
  const pts: Array<[number, number]> = [[x0, y0]];
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const jx = 7 * (hashUnitFloat(seed + i * 19) - 0.5);
    const jy = 7 * (hashUnitFloat(seed + i * 47) - 0.5);
    pts.push([x0 + (x1 - x0) * t + jx, y0 + (y1 - y0) * t + jy]);
  }
  pts.push([x1, y1]);

  for (let pass = 0; pass < 3; pass++) {
    const col = pass === 0 ? outerCol : pass === 1 ? midCol : coreCol;
    const width = pass === 0 ? 4 : pass === 1 ? 2 : 1;
    for (let i = 1; i < pts.length; i++) {
      const depth = d0 * (1 - i / pts.length) + d1 * (i / pts.length);
      rt.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], col, width, depth);
    }
  }
  if (pts.length > 4) {
    const idx = 2 + (seed % 3);
    const ang = hashUnitFloat(seed + 99) * Math.PI * 2;
    const len = 8 + hashUnitFloat(seed + 3) * 8;
    const bx = pts[idx][0] + Math.cos(ang) * len;
    const by = pts[idx][1] + Math.sin(ang) * len;
    rt.line(pts[idx][0], pts[idx][1], bx, by, outerCol, 2, d0);
    rt.line(pts[idx][0], pts[idx][1], bx, by, coreCol, 1, d0);
  }
  rt.disk(x0, y0, 2.2, coreCol, d0);
  rt.disk(x1, y1, 2.4, coreCol, d1);
  drawStarFlare(rt, x1, y1, 5, midCol, d1);
}

const WEAPON_RGB_TINTS: Record<string, RgbTuple> = {
  cannon: [240, 230, 180],
  wave: [80, 220, 255],
  scatter: [255, 200, 80],
  fireball: [255, 80, 20],
  plasma: [255, 80, 150],
  laser: [255, 50, 70],
  chain: [180, 230, 255],
  spirit: [80, 200, 255],
  lumen: [255, 60, 190],
  helix: [255, 140, 40],
  bits: [80, 255, 180],
  rail: [255, 200, 60],
  chakram: [200, 140, 255],
  drone: [80, 255, 200],
  flak: [255, 200, 80],
  foe: [255, 80, 60],
  bolt: [100, 255, 140],
  missile: [255, 180, 80],
  circus: [255, 70, 180],
  swarm: [80, 230, 255],
  torpedo: [80, 140, 255],
  singularity: [180, 120, 255],
  cluster: [255, 160, 40],
};

export function getWeaponImpactRgb(kind: string): RgbTuple {
  return WEAPON_RGB_TINTS[kind] || WEAPON_RGB_TINTS.cannon;
}

/** Render an expanding shockwave or impact burst ring. */
export function drawShockRing(rt: WeaponRenderTarget, shock: Record<string, any>): void {
  const frac = shock.age / shock.life;
  if (!rt.project(shock.x, shock.y, shock.z)) return;
  const sx = rt.prX();
  const sy = rt.prY();
  const depth = -1e9;
  const sc = Math.max(1, rt.prM());
  const rgb = shock.rgb || getWeaponImpactRgb(shock.kind || 'cannon');
  const col = hexIntToAbgr((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]);
  const white = hexIntToAbgr(16777215);
  const kind = shock.kind || 'ring';
  const radius =
    (shock.r0 + (shock.r1 - shock.r0) * frac) * (shock.screen ? 1 : Math.min(1.6, sc) * 0.35);

  if (kind === 'fireball') {
    rt.disk(sx, sy, radius * 1.1, hexIntToAbgr(16726544), depth);
    rt.disk(sx, sy, radius * 0.65, hexIntToAbgr(16752672), depth);
    rt.disk(sx, sy, radius * 0.28, hexIntToAbgr(16774336), depth);
    for (let i = 0; i < 8; i++) {
      const ang = i * 0.8 + frac * 3;
      rt.put(
        sx + Math.cos(ang) * radius * 1.3,
        sy + Math.sin(ang) * radius * 1.3,
        hexIntToAbgr(16744480),
        depth
      );
    }
    return;
  }
  if (kind === 'plasma') {
    rt.disk(sx, sy, radius * 0.8, hexIntToAbgr(16726664), depth);
    for (let i = 0; i < 10; i++) {
      const ang = i * 0.63;
      rt.line(
        sx,
        sy,
        sx + Math.cos(ang) * radius,
        sy + Math.sin(ang) * radius,
        i & 1 ? white : col,
        1,
        depth
      );
    }
    return;
  }
  if (kind === 'scatter') {
    for (let i = 0; i < 6; i++) {
      const ang = i * 1.05 + frac;
      rt.put(sx + Math.cos(ang) * radius, sy + Math.sin(ang) * radius, col, depth);
      rt.put(sx + Math.cos(ang) * radius * 0.5, sy + Math.sin(ang) * radius * 0.5, white, depth);
    }
    return;
  }
  if (kind === 'laser' || kind === 'lumen') {
    drawStarFlare(rt, sx, sy, radius, col, depth);
    rt.disk(sx, sy, Math.max(1, radius * 0.2), white, depth);
    return;
  }
  if (kind === 'wave' || kind === 'spirit') {
    let prevX = 0;
    let prevY = 0;
    let hasPrev = false;
    for (let i = 0; i <= 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const px = sx + Math.cos(ang) * radius;
      const py = sy + Math.sin(ang) * radius;
      if (hasPrev) {
        rt.line(prevX, prevY, px, py, col, 2, depth);
      }
      prevX = px;
      prevY = py;
      hasPrev = true;
    }
    return;
  }
  drawStarFlare(rt, sx, sy, radius, col, depth);
  const dots = 12;
  for (let i = 0; i < dots; i++) {
    const ang = (i / dots) * Math.PI * 2;
    rt.put(sx + Math.cos(ang) * radius, sy + Math.sin(ang) * radius, i & 1 ? white : col, depth);
  }
}

/** Render a gun muzzle flash at (x, y). */
export function drawMuzzleFlash(
  rt: WeaponRenderTarget,
  x: number,
  y: number,
  depth: number,
  scale: number,
  style: string,
  tintRgb: number[] | null | undefined,
  time: number
): void {
  const r = Math.max(1, 1.6 * scale);
  if (style === 'fireball') {
    rt.disk(x, y, r * 2.2, hexIntToAbgr(16732176), depth);
    rt.disk(x, y, r * 1.3, hexIntToAbgr(16760896), depth);
    rt.disk(x, y, r * 0.55, hexIntToAbgr(16775376), depth);
    return;
  }
  if (style === 'plasma') {
    rt.disk(x, y, r * 1.8, hexIntToAbgr(16726664), depth);
    rt.disk(x, y, r * 0.8, hexIntToAbgr(16773375), depth);
    for (let i = 0; i < 6; i++) {
      const ang = i * 1.05 + time * 20;
      rt.put(
        x + Math.cos(ang) * r * 2.2,
        y + Math.sin(ang) * r * 2.2,
        hexIntToAbgr(16765160),
        depth
      );
    }
    return;
  }
  if (style === 'laser' || style === 'lumen') {
    drawStarFlare(
      rt,
      x,
      y,
      r * 3.2,
      tintRgb ? hexIntToAbgr((tintRgb[0] << 16) | (tintRgb[1] << 8) | tintRgb[2]) : COLOR_LASER_OUTER,
      depth
    );
    rt.disk(x, y, r * 0.8, hexIntToAbgr(16777215), depth);
    return;
  }
  if (style === 'wave' || style === 'spirit') {
    rt.disk(x, y, r * 1.8, hexIntToAbgr(3711231), depth);
    rt.disk(x, y, r * 0.8, hexIntToAbgr(15269887), depth);
    return;
  }
  if (style === 'circus') {
    rt.disk(x, y, r * 1.9, hexIntToAbgr(16723624), depth);
    rt.disk(x, y, r * 0.85, hexIntToAbgr(16773375), depth);
    for (let i = 0; i < 5; i++) {
      const ang = i * 1.26 + time * 18;
      rt.put(
        x + Math.cos(ang) * r * 2.4,
        y + Math.sin(ang) * r * 2.4,
        hexIntToAbgr(16740560),
        depth
      );
    }
    return;
  }
  const coreCol = hexIntToAbgr(tintRgb ? 16777215 : 16776416);
  const outerCol = hexIntToAbgr(
    tintRgb ? (tintRgb[0] << 16) | (tintRgb[1] << 8) | tintRgb[2] : 16769144
  );
  rt.disk(x, y, r * 1.5, outerCol, depth);
  rt.disk(x, y, r * 0.6, coreCol, depth);
}

const SHEET_FONT: Record<string, string[]> = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['101', '111', '111', '111', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  Q: ['010', '101', '101', '110', '001'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '011'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  ' ': ['000', '000', '000', '000', '000'],
  '-': ['000', '000', '111', '000', '000'],
  '.': ['000', '000', '000', '000', '010'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
};

function drawSheetText(
  rt: WeaponRenderTarget,
  text: string,
  x: number,
  y: number,
  color: number,
  depth: number,
  scale = 1
): number {
  let cursorX = x;
  const upper = String(text).toUpperCase();
  for (const ch of upper) {
    const glyph = SHEET_FONT[ch] || SHEET_FONT[' '];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if (glyph[r][c] === '1') {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              rt.put(cursorX + c * scale + dx, y + r * scale + dy, color, depth);
            }
          }
        }
      }
    }
    cursorX += 4 * scale;
  }
  return cursorX;
}

const WEAPON_SHEET_ITEMS = [
  { id: 'cannon', label: 'CANNON', kind: 'bullet' },
  { id: 'wave', label: 'WAVE', kind: 'bullet' },
  { id: 'scatter', label: 'SCATTER', kind: 'bullet' },
  { id: 'fireball', label: 'FIREBALL', kind: 'bullet' },
  { id: 'plasma', label: 'PLASMA', kind: 'bullet' },
  { id: 'laser', label: 'LASER', kind: 'laser' },
  { id: 'chain', label: 'LIGHTNING', kind: 'zap' },
  { id: 'drone', label: 'DRONE', kind: 'bullet' },
  { id: 'foe', label: 'ENEMY', kind: 'bullet' },
  { id: 'bolt', label: 'UFO BOLT', kind: 'bullet' },
  { id: 'flak', label: 'FLAK', kind: 'bullet' },
  { id: 'missile', label: 'MISSILE', kind: 'missile' },
  { id: 'swarm', label: 'SWARM', kind: 'missile' },
  { id: 'circus', label: 'CIRCUS', kind: 'missile' },
  { id: 'torpedo', label: 'TORPEDO', kind: 'missile' },
  { id: 'singularity', label: 'SINGULAR', kind: 'missile' },
  { id: 'cluster', label: 'CLUSTER', kind: 'missile' },
  { id: 'spirit', label: 'SPIRIT', kind: 'bullet' },
  { id: 'lumen', label: 'LUMEN', kind: 'bullet' },
  { id: 'helix', label: 'HELIX', kind: 'bullet' },
  { id: 'bits', label: 'ECHO BITS', kind: 'bullet' },
  { id: 'rail', label: 'COIN RAIL', kind: 'bullet' },
  { id: 'chakram', label: 'CHAKRAM', kind: 'bullet' },
];

function createSheetSampleEntity(
  item: { id: string; label: string; kind: string },
  time: number
): Record<string, any> {
  if (item.kind === 'bullet') {
    const spec = item.id === 'foe' ? 'tracer' : item.id === 'bolt' ? 'bolt' : item.id;
    return {
      x: 0,
      y: 0,
      z: 0,
      vx: 80,
      vy: 0,
      vz: 0,
      age: 0.35 + time * 0.2,
      life: 2,
      special: spec,
      own: item.id === 'foe' || item.id === 'bolt' || item.id === 'flak' || item.id === 'tracer' ? 1 : 0,
      drone: item.id === 'drone',
      size: item.id === 'spirit' ? 4 : 2.6,
      dmg: 1,
      spin: 14,
      phase: 0,
    };
  }
  if (item.kind === 'missile') {
    return {
      x: 0,
      y: 0,
      z: 0,
      yaw: Math.PI / 2,
      age: 0.4,
      size: item.id === 'torpedo' ? 1.3 : 1,
      special: item.id === 'missile' ? null : item.id,
      mini: false,
    };
  }
  return {
    x: 0,
    y: 0,
    z: 0,
    ex: 40,
    ey: 0,
    ez: 0,
    ax: 0,
    ay: 0,
    az: 0,
    bx: 40,
    by: 0,
    bz: 0,
    age: 0.05,
    life: 0.2,
    tint: item.id === 'rail' ? 'rail' : null,
  };
}

/** Render a diagnostic sprite sheet of all 23 weapon types at 1x and 3x scale. */
export function renderWeaponSheet(
  width: number,
  height: number,
  time: number
): { data: Uint8ClampedArray; width: number; height: number } {
  const W = width | 0;
  const H = height | 0;
  const rgba = new Uint8ClampedArray(W * H * 4);
  let clipRect: { x: number; y: number; w: number; h: number } | null = null;
  const inClip = (px: number, py: number) =>
    clipRect
      ? px >= clipRect.x &&
        py >= clipRect.y &&
        px < clipRect.x + clipRect.w &&
        py < clipRect.y + clipRect.h
      : true;

  const put = (px: number, py: number, color: number, _depth: number) => {
    const x = Math.round(px);
    const y = Math.round(py);
    if (x < 0 || y < 0 || x >= W || y >= H || !inClip(x, y)) return;
    const idx = (y * W + x) * 4;
    rgba[idx] = color & 255;
    rgba[idx + 1] = (color >> 8) & 255;
    rgba[idx + 2] = (color >> 16) & 255;
    rgba[idx + 3] = 255;
  };

  const line = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: number,
    thick: number,
    depth: number
  ) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
    const w = Math.max(1, thick || 1);
    for (let i = 0; i <= steps; i++) {
      const px = x0 + dx * (i / steps);
      const py = y0 + dy * (i / steps);
      put(px, py, color, depth);
      if (w > 1) {
        put(px + 1, py, color, depth);
        put(px, py + 1, color, depth);
      }
      if (w > 2) {
        put(px - 1, py, color, depth);
        put(px, py - 1, color, depth);
      }
      if (w > 3) {
        put(px + 1, py + 1, color, depth);
        put(px - 1, py + 1, color, depth);
      }
    }
  };

  const disk = (cx: number, cy: number, radius: number, color: number, depth: number) => {
    const r = Math.max(0.6, radius);
    const bound = Math.ceil(r);
    for (let dy = -bound; dy <= bound; dy++) {
      for (let dx = -bound; dx <= bound; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          put(cx + dx, cy + dy, color, depth);
        }
      }
    }
  };

  const baseM = 1.8;
  const baseScale = 2.2;
  let projX = 0;
  let projY = 0;
  let projM = baseM;
  let projV = 0;

  const rt: WeaponRenderTarget = {
    time,
    put,
    line,
    disk,
    project: (x, y, z) => {
      projX = x;
      projY = y;
      projM = baseM;
      projV = -z;
      return true;
    },
    prX: () => projX,
    prY: () => projY,
    prM: () => projM,
    prV: () => projV,
  };

  const cardBg = hexIntToAbgr(1383470);
  const zoomBg = hexIntToAbgr(658968);
  const zoomBorder = hexIntToAbgr(3820134);
  const labelCol = hexIntToAbgr(13227235);
  const subCol = hexIntToAbgr(9082538);
  const titleCol = hexIntToAbgr(16769152);

  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = 11;
    rgba[i + 1] = 18;
    rgba[i + 2] = 32;
    rgba[i + 3] = 255;
  }

  drawSheetText(rt, 'WEAPON  SHEET', 24, 14, titleCol, 0, 3);
  drawSheetText(rt, 'LEFT  IN-GAME SCALE    RIGHT  3X DETAIL', 24, 34, subCol, 0, 1);

  const cols = 6;
  const rows = Math.ceil(WEAPON_SHEET_ITEMS.length / cols);
  const padX = 14;
  const padY = 52;
  const cellW = (W - padX * 2) / cols;
  const cellH = (H - padY - 12) / rows;

  const renderSample = (
    item: { id: string; label: string; kind: string },
    ent: Record<string, any>,
    cx: number,
    cy: number,
    worldScale: number,
    mag: number,
    isDetail: boolean
  ) => {
    rt.project = (x, y, _z) => {
      projX = cx + x * worldScale;
      projY = cy - y * worldScale;
      projM = mag;
      projV = 0;
      return true;
    };
    ent.x = 0;
    ent.y = 0;
    ent.z = 0;
    if (item.id === 'circus') {
      const count = isDetail ? 3 : 5;
      for (let i = 0; i < count; i++) {
        const xOff = (i - (count - 1) / 2) * (isDetail ? 3.2 : 4.2);
        const ang = (rt.time || 0.4) * 16 + (i / count) * Math.PI * 2;
        const rad = isDetail ? 2.4 : 3.2;
        const msl = {
          x: xOff,
          y: Math.cos(ang) * rad,
          z: Math.sin(ang) * rad,
          yaw: Math.PI / 2,
          age: 0.55,
          size: 0.62,
          special: 'circus',
          spiral: (i / count) * Math.PI * 2,
        };
        drawMissileSprite(rt, msl);
      }
    } else if (item.kind === 'bullet') {
      drawProjectileSprite(rt, ent);
    } else if (item.kind === 'missile') {
      drawMissileSprite(rt, ent);
    } else if (item.kind === 'laser') {
      ent.x = -16;
      ent.y = 0;
      ent.ex = 18;
      ent.ey = 0;
      drawLaserBeam(rt, ent);
    } else if (item.kind === 'zap') {
      ent.ax = -16;
      ent.ay = 2;
      ent.bx = 18;
      ent.by = -2;
      drawLightningArc(rt, ent);
    }
  };

  WEAPON_SHEET_ITEMS.forEach((item, idx) => {
    const col = idx % cols;
    const row = (idx / cols) | 0;
    const x0 = padX + col * cellW;
    const y0 = padY + row * cellH;
    for (let dy = 2; dy < cellH - 5; dy++) {
      for (let dx = 2; dx < cellW - 5; dx++) {
        put(x0 + dx, y0 + dy, cardBg, 0);
      }
    }
    drawSheetText(rt, item.label, x0 + 7, y0 + 6, labelCol, 0, 2);
    const ent = createSheetSampleEntity(item, time);
    clipRect = {
      x: x0 + 3,
      y: y0 + 20,
      w: Math.floor(cellW * 0.5) - 6,
      h: Math.floor(cellH - 28),
    };
    renderSample(item, ent, x0 + cellW * 0.26, y0 + cellH * 0.62, baseScale, baseM, false);

    const zx = Math.round(x0 + cellW * 0.52);
    const zy = Math.round(y0 + 22);
    const zw = Math.floor(cellW * 0.44);
    const zh = Math.floor(cellH - 32);
    clipRect = null;
    for (let dy = 0; dy < zh; dy++) {
      for (let dx = 0; dx < zw; dx++) {
        put(zx + dx, zy + dy, zoomBg, 0);
      }
    }
    for (let dx = 0; dx < zw; dx++) {
      put(zx + dx, zy, zoomBorder, 0);
      put(zx + dx, zy + zh - 1, zoomBorder, 0);
    }
    for (let dy = 0; dy < zh; dy++) {
      put(zx, zy + dy, zoomBorder, 0);
      put(zx + zw - 1, zy + dy, zoomBorder, 0);
    }
    drawSheetText(rt, '3X', zx + 4, zy + 3, subCol, 0, 1);
    clipRect = { x: zx + 1, y: zy + 1, w: zw - 2, h: zh - 2 };
    renderSample(
      item,
      ent,
      zx + zw * 0.48,
      zy + zh * 0.58,
      baseScale * 3,
      baseM * 3,
      true
    );
    clipRect = null;
  });

  return { data: rgba, width: W, height: H };
}
