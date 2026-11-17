import { AirshipTurret, AirshipVariant, AirshipVoxelPoint } from '../types/game';

export const AIRSHIP_VOXEL_SCALE = 0.5;
export const AIRSHIP_GRID_W = 56;
export const AIRSHIP_GRID_L = 168;
export const AIRSHIP_GRID_H = 52;
export const AIRSHIP_NOSE_OFFSET = 80;
export const AIRSHIP_SLICE_MID = 26;

const CENTER_X = (AIRSHIP_GRID_W - 1) / 2;
const CENTER_Z = 26;
const ENVELOPE_RADIUS_W = 22.4;
const ENVELOPE_RADIUS_H = 15.2;

interface EnginePodSpec {
  a: number;
  k: number;
  y: number;
}

interface SmokestackSpec {
  a: number;
  k: number;
  y: number;
}

interface AlienOrbSpec {
  a: number;
  k: number;
  y: number;
  r: number;
}

interface TurretMountSpec {
  a: number;
  k: number;
  y: number;
  r: number;
}

const ENGINE_PODS: Record<AirshipVariant, EnginePodSpec[]> = {
  linen: [
    { a: -18, k: 68, y: 10 },
    { a: 18, k: 68, y: 10 },
  ],
  carrier: [
    { a: -18, k: 68, y: 10 },
    { a: 18, k: 68, y: 10 },
    { a: -16, k: 100, y: 10 },
    { a: 16, k: 100, y: 10 },
  ],
  steampunk: [
    { a: -20, k: 64, y: 11 },
    { a: 20, k: 64, y: 11 },
    { a: -18, k: 92, y: 11 },
    { a: 18, k: 92, y: 11 },
  ],
  alien: [],
};

const PROPELLER_RADIUS: Record<AirshipVariant, number> = {
  linen: 9.2,
  carrier: 9.2,
  steampunk: 11.2,
  alien: 0,
};

const STEAMPUNK_STACKS: SmokestackSpec[] = [
  { a: -5, k: 108, y: 42 },
  { a: 5, k: 118, y: 42 },
];

const ALIEN_ORBS: AlienOrbSpec[] = [
  { a: -20, k: 50, y: 20, r: 6.2 },
  { a: 20, k: 50, y: 20, r: 6.2 },
  { a: -18, k: 96, y: 18, r: 5.6 },
  { a: 18, k: 96, y: 18, r: 5.6 },
];

const TURRET_MOUNTS: Record<AirshipVariant, TurretMountSpec[]> = {
  linen: [
    { a: 0, k: 56, y: 42, r: 6 },
    { a: -20, k: 84, y: 28, r: 5.6 },
    { a: 20, k: 84, y: 28, r: 5.6 },
  ],
  carrier: [
    { a: 0, k: 56, y: 42, r: 6 },
    { a: -20, k: 84, y: 28, r: 5.6 },
    { a: 20, k: 84, y: 28, r: 5.6 },
    { a: 0, k: 116, y: 40, r: 6 },
  ],
  steampunk: [
    { a: 0, k: 48, y: 42, r: 6.4 },
    { a: -22, k: 72, y: 28, r: 6 },
    { a: 22, k: 72, y: 28, r: 6 },
    { a: -22, k: 108, y: 28, r: 6 },
    { a: 22, k: 108, y: 28, r: 6 },
  ],
  alien: [
    { a: 0, k: 44, y: 40, r: 6.2 },
    { a: -18, k: 78, y: 30, r: 5.8 },
    { a: 18, k: 78, y: 30, r: 5.8 },
  ],
};

export function normalizeAirshipVariant(type?: string): AirshipVariant {
  return type === 'steampunk'
    ? 'steampunk'
    : type === 'alien'
      ? 'alien'
      : type === 'carrier'
        ? 'carrier'
        : 'linen';
}

function setAirshipVoxel(
  slices: Uint8Array[],
  x: number,
  y: number,
  z: number,
  colorIdx: number
): void {
  if (
    x < 0 ||
    y < 0 ||
    z < 0 ||
    x >= AIRSHIP_GRID_W ||
    y >= AIRSHIP_GRID_L ||
    z >= AIRSHIP_GRID_H
  ) {
    return;
  }
  const idx = y * AIRSHIP_GRID_W + (x | 0);
  const existing = slices[z][idx];
  if (
    !existing ||
    colorIdx >= 33 ||
    (colorIdx >= 17 && existing < 17) ||
    (existing < 17 && colorIdx < 17 && colorIdx < existing)
  ) {
    slices[z][idx] = colorIdx;
  }
}

function setAirshipVoxelRounded(
  slices: Uint8Array[],
  x: number,
  y: number,
  z: number,
  colorIdx: number
): void {
  setAirshipVoxel(slices, Math.round(x), Math.round(y), Math.round(z), colorIdx);
}

function getEnvelopeFlare(sliceY: number): number {
  const norm = (sliceY / (AIRSHIP_GRID_L - 1) - 0.48) / 0.52;
  const sq = Math.max(0, 1 - norm * norm);
  return Math.pow(sq, 0.42);
}

function getEnvelopeSection(sliceY: number) {
  const flare = getEnvelopeFlare(sliceY);
  return {
    rW: ENVELOPE_RADIUS_W * flare,
    rH: ENVELOPE_RADIUS_H * flare,
    t: sliceY / (AIRSHIP_GRID_L - 1),
    flare,
  };
}

function sampleEllipseCoverage(dx: number, dz: number, rW: number, rH: number): number {
  if (rW < 0.4 || rH < 0.4) return 0;
  let inside = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const px = dx + ox / 3;
      const pz = dz + oy / 3;
      if ((px * px) / (rW * rW) + (pz * pz) / (rH * rH) <= 1) {
        inside++;
      }
    }
  }
  return inside / 9;
}

function getHullShadeIndex(dz: number, rH: number, variant: AirshipVariant): number {
  const norm = (dz / Math.max(0.001, rH) + 1) * 0.5;
  if (variant === 'steampunk') {
    return norm > 0.84 ? 8 : norm > 0.64 ? 7 : norm > 0.44 ? 6 : norm > 0.26 ? 5 : 4;
  }
  if (variant === 'alien') {
    return norm > 0.8 ? 8 : norm > 0.58 ? 7 : norm > 0.38 ? 6 : norm > 0.22 ? 5 : 4;
  }
  return norm > 0.82 ? 8 : norm > 0.62 ? 7 : norm > 0.42 ? 6 : norm > 0.24 ? 5 : 4;
}

function getRibDistance(sliceY: number, variant: AirshipVariant): number {
  const start = variant === 'steampunk' ? 28 : variant === 'alien' ? 30 : 26;
  const end = variant === 'steampunk' ? 142 : variant === 'alien' ? 140 : 138;
  const count = variant === 'steampunk' ? 10 : variant === 'alien' ? 8 : 9;
  const halfWidth = variant === 'steampunk' ? 1.7 : 1.55;
  if (sliceY < start || sliceY > end) return 99;
  const spacing = (end - start) / (count - 1);
  const pos = (sliceY - start) / spacing;
  const dist = Math.abs(pos - Math.round(pos)) * spacing;
  return dist <= halfWidth ? dist : 99;
}

/** Build the 3D voxel slice array for an airship variant. */
export function buildAirshipVoxels(type = 'linen'): Uint8Array[] {
  const variant = normalizeAirshipVariant(type);
  const slices: Uint8Array[] = [];
  for (let z = 0; z < AIRSHIP_GRID_H; z++) {
    slices.push(new Uint8Array(AIRSHIP_GRID_W * AIRSHIP_GRID_L));
  }

  for (let y = 0; y < AIRSHIP_GRID_L; y++) {
    const { rW, rH, t, flare } = getEnvelopeSection(y);
    if (flare < 0.07) continue;
    const onRib = getRibDistance(y, variant) < 8;
    const isNose = t < 0.1;
    const isTail = t > 0.92;

    for (let z = 0; z < AIRSHIP_GRID_H; z++) {
      const dz = z - CENTER_Z;
      for (let x = 0; x < AIRSHIP_GRID_W; x++) {
        const dx = x - CENTER_X;
        const cov = sampleEllipseCoverage(dx, dz, rW, rH);
        if (cov < 0.45) continue;
        const radSq = (dx * dx) / (rW * rW) + (dz * dz) / (rH * rH);
        if (radSq < 0.3 && !isNose && !isTail) continue;

        let col = getHullShadeIndex(dz, rH, variant);
        if (cov < 0.78 || radSq > 0.92) {
          col = Math.max(3, col - 1);
        }

        if (variant === 'linen' || variant === 'carrier') {
          if (onRib && radSq > 0.48) col = dz > 0 ? 18 : 17;
          if (isNose && radSq > 0.4) col = t < 0.055 ? 6 : onRib ? 18 : col;
          if (isTail && radSq > 0.55) col = 5;
          if (dz < -rH * 0.78 && Math.abs(dx) < 2.2) col = 3;
        }

        if (variant === 'steampunk') {
          if (onRib && radSq > 0.42) col = dz > 0.15 * rH ? 17 : 3;
          const ang = Math.atan2(dz, dx);
          for (const seam of [-2.2, -0.85, 0.85, 2.2]) {
            const diff = Math.abs(Math.atan2(Math.sin(ang - seam), Math.cos(ang - seam)));
            if (diff * Math.max(rW, rH) < 1.35 && radSq > 0.5) {
              col = 17;
            }
          }
          if (onRib && radSq > 0.62 && radSq < 0.9) {
            const studPos = ((Math.atan2(dz, dx) + Math.PI) / (Math.PI * 2)) * 16;
            const studIdx = Math.round(studPos);
            if ((studIdx & 1) === 0 && Math.abs(studPos - studIdx) < 0.16) {
              col = 20;
            }
          }
          if (isNose && radSq > 0.35) col = t < 0.05 ? 18 : radSq > 0.7 ? 17 : col;
          if (dz < -rH * 0.8 && Math.abs(dx) < 2.4) col = 3;
        }

        if (variant === 'alien') {
          if (onRib && radSq > 0.5 && radSq < 0.96) col = dz > 0 ? 18 : 17;
          if (radSq > 0.7 && radSq < 0.94 && !isNose && !isTail && !onRib) {
            const ringIdx = Math.round((y - 24) / 10);
            const secIdx = Math.round(((Math.atan2(dz, dx) + Math.PI) / (Math.PI * 2)) * 10);
            const ringY = 24 + ringIdx * 10;
            const secAng = -Math.PI + (secIdx / 10) * Math.PI * 2;
            const dyRing = y - ringY;
            const dAng = Math.atan2(
              Math.sin(Math.atan2(dz, dx) - secAng),
              Math.cos(Math.atan2(dz, dx) - secAng)
            );
            const dist = Math.hypot(dyRing / 2.2, (dAng * Math.max(rW, rH)) / 2.2);
            if (dist < 1.15) col = dist < 0.55 ? 37 : 36;
          }
          if (dz < -rH * 0.72 && Math.abs(dx) < 3.2 && radSq > 0.5) {
            col = Math.abs(dx) < 1.2 ? 52 : 36;
          }
          if (isNose && radSq > 0.45) col = radSq > 0.72 ? 37 : 36;
        }

        setAirshipVoxel(slices, x, y, z, col);
      }
    }
  }

  // Tail fins
  if (variant !== 'alien') {
    for (let y = 124; y < 164; y++) {
      const frac = (y - 124) / 40;
      const finH = 4 + Math.round((1 - Math.abs(frac - 0.45)) * 16);
      const halfThick = frac > 0.75 ? 1 : frac > 0.55 ? 2 : 3;
      for (let dz = 0; dz <= finH; dz++) {
        const z = CENTER_Z + dz;
        const tipCol = 19;
        const fillCol = variant === 'steampunk' ? 5 : 6;
        for (let dx = -halfThick; dx <= halfThick; dx++) {
          let col = dz > finH - 3 ? tipCol : dz < 3 ? 5 : fillCol;
          if (y >= 138 && y <= 141) col = 20;
          setAirshipVoxel(slices, Math.round(CENTER_X) + dx, y, z, col);
        }
      }
      const hSpan = Math.round(10 * Math.max(0, 1 - Math.abs(frac - 0.4)));
      for (let dx = -hSpan; dx <= hSpan; dx++) {
        if (Math.abs(dx) >= 3) {
          for (let z = CENTER_Z - 2; z <= CENTER_Z + 2; z++) {
            setAirshipVoxel(
              slices,
              Math.round(CENTER_X) + dx,
              y,
              z,
              Math.abs(dx) === hSpan || z === CENTER_Z - 2 || z === CENTER_Z + 2 ? 18 : 6
            );
          }
        }
      }
    }
  } else {
    for (let y = 118; y < 158; y++) {
      const frac = (y - 118) / 40;
      const finH = Math.round((1 - Math.abs(frac - 0.35)) * 12);
      for (let dz = 0; dz <= finH; dz++) {
        const halfThick = dz > finH - 2 ? 1 : 2;
        for (let dx = -halfThick; dx <= halfThick; dx++) {
          const col = dz > finH - 3 ? 37 : frac > 0.7 ? 18 : 7;
          setAirshipVoxel(slices, Math.round(CENTER_X) + dx, y, CENTER_Z + dz, col);
        }
      }
    }
  }

  // Gondola / under-carriage
  if (variant === 'steampunk') {
    for (let y = 52; y <= 96; y++) {
      const frac = (y - 52) / 44;
      const midSec = frac > 0.12 && frac < 0.88;
      const halfW = midSec ? 8 : 6;
      for (let z = 0; z <= 14; z++) {
        const isBulkhead = y === 52 || y === 96 || y === 74 || (y - 52) % 8 === 0;
        const isDeck = z === 0 || z === 7 || z === 14;
        for (let dx = -halfW; dx <= halfW; dx++) {
          const isWall = Math.abs(dx) === halfW;
          if (!(isBulkhead || isDeck || isWall)) continue;
          let col = isWall || isDeck ? 3 : 5;
          if (z >= 4 && z <= 6 && isWall && midSec && y % 6 === 0) col = 36;
          if (isDeck && !isWall) col = 18;
          if (z === 0) col = 3;
          setAirshipVoxel(slices, Math.round(CENTER_X) + dx, y, z, col);
        }
        if (z === 1 || z === 13) {
          for (let dx = -halfW + 1; dx <= halfW - 1; dx++) {
            setAirshipVoxel(slices, Math.round(CENTER_X) + dx, y, z, z === 1 ? 4 : 6);
          }
        }
      }
    }
    for (const sideX of [-8, 8]) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dz = -4; dz <= 4; dz++) {
          const r2 = dy * dy + dz * dz;
          if (r2 > 17 && r2 < 22) {
            setAirshipVoxel(slices, Math.round(CENTER_X) + sideX + dy, 74, 8 + dz, 19);
          } else if (r2 <= 6) {
            setAirshipVoxel(slices, Math.round(CENTER_X) + sideX, 74, 8 + dz, r2 <= 2 ? 20 : 18);
          }
        }
        setAirshipVoxel(slices, Math.round(CENTER_X) + sideX, 74, 8, 19);
      }
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        setAirshipVoxelRounded(
          slices,
          CENTER_X + sideX + Math.cos(ang) * 5,
          74 + Math.sin(ang) * 0.4,
          8 + Math.sin(ang) * 5,
          20
        );
      }
    }
  } else if (variant === 'alien') {
    for (let y = 48; y <= 88; y++) {
      const frac = (y - 48) / 40;
      const halfW = frac > 0.2 && frac < 0.8 ? 6 : 4;
      for (let z = 2; z <= 11; z++) {
        for (let dx = -halfW; dx <= halfW; dx++) {
          const ell = (dx * dx) / (halfW * halfW) + ((z - 6.5) * (z - 6.5)) / 16;
          if (ell > 1) continue;
          let col = ell > 0.7 ? 18 : 6;
          if (z >= 5 && z <= 8 && Math.abs(dx) >= halfW - 1) col = 36;
          if (z <= 4 && Math.abs(dx) < 2) col = 51;
          setAirshipVoxel(slices, Math.round(CENTER_X) + dx, y, z, col);
        }
      }
    }
  } else {
    for (let y = 52; y <= 96; y++) {
      const frac = (y - 52) / 44;
      const midSec = frac > 0.15 && frac < 0.85;
      const halfW = midSec ? 8 : 6;
      for (let z = 0; z <= 14; z++) {
        for (let dx = -halfW; dx <= halfW; dx++) {
          const isShell = Math.abs(dx) === halfW || z === 0 || z === 14 || y === 52 || y === 96;
          if (!isShell && z > 0 && z < 14 && Math.abs(dx) < halfW) continue;
          let col = 3;
          if (z === 0) col = 2;
          if (z === 14) col = 5;
          if (isShell && z >= 5 && z <= 9 && Math.abs(dx) === halfW && midSec && ((y / 2) | 0) % 3 !== 0) {
            col = 36;
          }
          if (z === 2 && Math.abs(dx) < halfW) col = 4;
          setAirshipVoxel(slices, Math.round(CENTER_X) + dx, y, z, col);
        }
        if (z === 2 || z === 12) {
          for (let dx = -halfW + 1; dx <= halfW - 1; dx++) {
            setAirshipVoxel(slices, Math.round(CENTER_X) + dx, y, z, z === 2 ? 3 : 5);
          }
        }
      }
    }
  }

  // Engine pods
  const pods = ENGINE_PODS[variant] || ENGINE_PODS.linen;
  for (const pod of pods) {
    const rad = variant === 'steampunk' ? 5 : 4;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        for (let dz = -rad; dz <= rad; dz++) {
          if (dx * dx + dz * dz > rad * rad) continue;
          let col = dy >= 4 ? 50 : dx * dx + dz * dz >= (rad - 1) * (rad - 1) ? 3 : 5;
          if (variant === 'steampunk' && dx * dx + dz * dz >= (rad - 1) * (rad - 1)) {
            col = 17;
          }
          setAirshipVoxel(slices, Math.round(CENTER_X + pod.a + dx), pod.k + dy, pod.y + dz, col);
        }
      }
    }
    setAirshipVoxel(slices, Math.round(CENTER_X + pod.a), pod.k - 8, pod.y, 51);
  }

  // Steampunk smokestacks & side portholes
  if (variant === 'steampunk') {
    for (const stack of STEAMPUNK_STACKS) {
      for (let dz = 0; dz <= 10; dz++) {
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            if (Math.abs(dx) === 2 && Math.abs(dy) === 2) continue;
            const isRim = dz >= 8;
            const col =
              dx === 0 && dy === 0 && dz >= 8
                ? 2
                : isRim
                  ? 20
                  : Math.abs(dx) === 2 || Math.abs(dy) === 2
                    ? 3
                    : 4;
            setAirshipVoxel(slices, Math.round(CENTER_X + stack.a + dx), stack.k + dy, stack.y + dz, col);
          }
        }
      }
    }
    for (const yPos of [46, 62, 86, 102]) {
      for (const side of [-1, 1]) {
        const { rW } = getEnvelopeSection(yPos);
        const px = Math.round(CENTER_X + side * (rW - 1.2));
        const pz = CENTER_Z;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (dy * dy + dz * dz <= 5) {
              setAirshipVoxel(slices, px + dy, yPos, pz + dz, dy * dy + dz * dz <= 1 ? 37 : 18);
            }
          }
        }
      }
    }
  }

  // Alien glowing orbs
  if (variant === 'alien') {
    for (const orb of ALIEN_ORBS) {
      const r = orb.r;
      const bound = Math.ceil(r);
      for (let dy = -bound; dy <= bound; dy++) {
        for (let dx = -bound; dx <= bound; dx++) {
          for (let dz = -bound; dz <= bound; dz++) {
            const d2 = (dx * dx + dy * dy + dz * dz) / (r * r);
            if (d2 > 1.02) continue;
            let col = d2 > 0.62 ? 18 : d2 > 0.25 ? 36 : 52;
            if (d2 < 0.12) col = 53;
            setAirshipVoxel(slices, Math.round(CENTER_X + orb.a + dx), orb.k + dy, orb.y + dz, col);
          }
        }
      }
    }
  }

  // Turret domes
  const addTurretMount = (mount: TurretMountSpec) => {
    const cx = Math.round(CENTER_X + mount.a);
    const r = mount.r;
    const bound = Math.ceil(r);
    for (let dy = -bound; dy <= bound; dy++) {
      for (let dx = -bound; dx <= bound; dx++) {
        for (let dz = -Math.ceil(r * 0.7); dz <= Math.ceil(r * 0.95); dz++) {
          const d2 = (dx * dx + dy * dy) / (r * r) + (dz * dz) / (r * 0.85 * (r * 0.85));
          if (d2 > 1) continue;
          let col: number;
          if (variant === 'alien') {
            col = d2 > 0.55 ? 18 : dz > 0.4 ? 36 : 6;
            if (d2 < 0.18 && dz > 0) col = 53;
          } else if (variant === 'steampunk') {
            col = d2 > 0.55 ? 17 : 5;
            if (d2 < 0.22 && dz > 0.2) col = 3;
            if (Math.abs(dy) < 1.2 && dz < 1 && Math.abs(dx) >= r - 1.2 && Math.abs(dx) <= r + 3) {
              col = 3;
            }
          } else {
            col = d2 > 0.55 ? 18 : dz > 0.4 ? 36 : 6;
            if (d2 < 0.2 && dz > 0) col = 37;
          }
          setAirshipVoxel(slices, cx + dx, mount.k + dy, mount.y + dz, col);
        }
      }
    }
    if (variant === 'steampunk') {
      const dir = mount.a === 0 ? 0 : mount.a > 0 ? 1 : -1;
      if (dir !== 0) {
        for (let b = 0; b <= 6; b++) {
          setAirshipVoxel(slices, cx + dir * (Math.round(mount.r) + b), mount.k, mount.y, b > 4 ? 2 : 3);
        }
      } else {
        for (let b = 0; b <= 5; b++) {
          setAirshipVoxel(slices, cx, mount.k - Math.round(mount.r) - b, mount.y + 1, b > 3 ? 2 : 3);
        }
      }
    }
  };

  for (const mount of TURRET_MOUNTS[variant] || TURRET_MOUNTS.linen) {
    addTurretMount(mount);
  }

  return slices;
}

/** Compute dynamic rotating propeller voxels for an airship variant. */
export function getAirshipPropellerVoxels(type: string, phase: number): AirshipVoxelPoint[] {
  const variant = normalizeAirshipVariant(type);
  const pods = ENGINE_PODS[variant];
  const radius = PROPELLER_RADIUS[variant] || 0;
  if (!pods || !radius) return [];
  const points: AirshipVoxelPoint[] = [];
  for (const pod of pods) {
    const bPos = AIRSHIP_NOSE_OFFSET - (pod.k - 8);
    for (let blade = 0; blade < 3; blade++) {
      const ang = phase + blade * ((Math.PI * 2) / 3);
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      for (let r = 1; r <= radius; r += 0.45) {
        const a = pod.a + cos * r;
        const y = pod.y + sin * r;
        const v = r < 2 ? 21 : r < 6 ? 20 : 19;
        points.push({ a, b: bPos, y, v });
        if (r > 2.5) {
          points.push({ a: a + cos * 0.3, b: bPos, y: y + sin * 0.3, v: 18 });
        }
      }
    }
    points.push({ a: pod.a, b: bPos, y: pod.y, v: 52 });
  }
  return points;
}

/** Compute dynamic steam puffs (steampunk) or alien pulse lights (alien) for an airship. */
export function getAirshipEffectVoxels(type: string, phase: number): AirshipVoxelPoint[] {
  const variant = normalizeAirshipVariant(type);
  const points: AirshipVoxelPoint[] = [];
  if (variant === 'steampunk') {
    for (const stack of STEAMPUNK_STACKS) {
      const bPos = AIRSHIP_NOSE_OFFSET - stack.k;
      for (let i = 0; i < 5; i++) {
        const rise = (phase * 0.35 + i * 1.7 + stack.k * 0.02) % 8;
        const sway = Math.sin(phase * 0.9 + i + stack.a) * 1.2;
        const a = stack.a + sway;
        const y = stack.y + 10 + rise * 1.6;
        const v = rise < 1.5 ? 8 : rise < 3.5 ? 7 : 6;
        points.push({
          a,
          b: bPos + Math.sin(phase * 0.6 + i) * 0.8,
          y,
          v,
          steam: true,
        });
      }
    }
  }
  if (variant === 'alien') {
    const pulse = 0.5 + 0.5 * Math.sin(phase * 0.8);
    for (const orb of ALIEN_ORBS) {
      const bPos = AIRSHIP_NOSE_OFFSET - orb.k;
      const v = pulse > 0.45 ? 53 : 52;
      points.push({ a: orb.a, b: bPos, y: orb.y, v });
      points.push({ a: orb.a, b: bPos, y: orb.y + 1, v: 37 });
    }
    for (let k = 30; k < 140; k += 3) {
      const bPos = AIRSHIP_NOSE_OFFSET - k;
      const y = CENTER_Z - Math.round(ENVELOPE_RADIUS_H * getEnvelopeFlare(k) * 0.85);
      const v = pulse > 0.55 ? 52 : 36;
      points.push({ a: 0, b: bPos, y, v });
      points.push({ a: -1, b: bPos, y, v: 36 });
      points.push({ a: 1, b: bPos, y, v: 36 });
    }
  }
  return points;
}

/** Create the destructible turret state list for a newly spawned airship. */
export function createAirshipTurrets(type: string): AirshipTurret[] {
  const variant = normalizeAirshipVariant(type);
  const mounts = TURRET_MOUNTS[variant] || TURRET_MOUNTS.linen;
  const hp = variant === 'steampunk' ? 10 : variant === 'carrier' ? 8 : variant === 'alien' ? 7 : 6;
  return mounts.map((m, idx) => ({
    i: idx,
    a: m.a,
    b: AIRSHIP_NOSE_OFFSET - m.k,
    y: m.y,
    r: m.r,
    hp,
    hpMax: hp,
    dead: false,
    flash: 0,
    cd: 0.8 + idx * 0.35,
    burst: 0,
    burstT: 0,
  }));
}
