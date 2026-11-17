import { GameParams, RgbTuple, ViewMode } from '../types/game';
import { packAbgr } from '../utils/math';

export const WORLD_SIZE = 2048;
export const WORLD_MASK = WORLD_SIZE - 1;
export const WORLD_SHIFT = 11;

export const CLOUD_SIZE = 1024;
export const CLOUD_MASK = CLOUD_SIZE - 1;
export const CLOUD_SHIFT = 10;
export const CLOUD_LAYERS = 8;
export const CLOUD_ALTITUDE = 40;

export const JET_NOSE_OFFSET = 25.3;
export const JET_SLICE_MID = 5;
export const NOZZLE_X_OFFSET = 1.96;
export const NOZZLE_Z_SLICE = 4.1;
export const NOZZLE_RADIUS = 1.63;
export const NOZZLE_Y_BACK = 43.6;
export const WINGTIP_X_OFFSET = 15.5;
export const WINGTIP_Y_BACK = 33;
export const WINGTIP_Z_SLICE = 4;

export const TRAIL_CAPACITY = 160;
export const PUFF_CAPACITY = 360;
export const PUFF_STRIDE = 10;

export const MAX_RENDER_ALTITUDE = CLOUD_ALTITUDE + CLOUD_LAYERS;
export const FAR_CLIP_BASE = 1500;
export const FOG_START_BASE = 300;
export const FOG_STEPS = 10;
export const SKY_BANDS = 8;
export const HORIZON_EPSILON = 1e-5;
export const TAP_MAX_DURATION = 0.2;
export const COCKPIT_EYE_FORWARD = 64;
export const COCKPIT_EYE_UP = 3;

export const MAX_WEBGL_FLAMES = 14;
export const FLAME_DATA_STRIDE = 16;
export const FLAME_LENGTH_SCALE = 1.3;

export const BAYER_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export const SUN_COLOR_DAY = packAbgr(255, 246, 222);
export const SUN_COLOR_SUNSET = packAbgr(255, 170, 92);
export const SUN_COLOR_NIGHT = packAbgr(150, 190, 255);

export const TERRAIN_TOP_COLORS: RgbTuple[] = [
  [36, 104, 180],
  [44, 124, 198],
  [66, 160, 216],
  [104, 204, 214],
  [238, 220, 164],
  [222, 200, 140],
  [96, 178, 52],
  [70, 148, 44],
  [134, 206, 76],
  [70, 158, 64],
  [42, 122, 54],
  [28, 92, 46],
  [146, 140, 134],
  [118, 112, 110],
  [178, 172, 162],
  [246, 250, 255],
  [214, 226, 244],
];

export const TERRAIN_SIDE_COLORS: RgbTuple[] = [
  [36, 104, 180],
  [44, 124, 198],
  [66, 160, 216],
  [104, 204, 214],
  [204, 180, 122],
  [204, 180, 122],
  [56, 120, 44],
  [50, 108, 42],
  [60, 128, 46],
  [24, 78, 42],
  [22, 72, 40],
  [20, 64, 38],
  [96, 90, 92],
  [86, 82, 86],
  [104, 98, 98],
  [186, 202, 228],
  [176, 192, 220],
];

export const TERRAIN_PALETTE_COUNT = TERRAIN_TOP_COLORS.length;

export const DEFAULT_ENGINE_PARAMS: GameParams = {
  speed: 92,
  boost: 1.8,
  agility: 1.25,
  altitude: 64,
  ceiling: 300,
  clearance: 7,
  bank: 52,
  spread: 1,
  jetScale: 1,
  cameraFollow: 0.6,
  view: 'top',
  chaseDistance: 2.6,
  chaseAngle: 12,
  chaseSize: 0.19,
  transition: 1.4,
  timeOfDay: 'day',
  clouds: 0.45,
  land: 0.33,
  seed: 7,
  afterburner: 0.8,
  flameStyle: 'pixel',
  trails: true,
  wingmen: 0,
  shadow: true,
  followPointer: true,
  stunts: true,
  intro: true,
  bodyColor: '#545969',
  accentColor: '#f0580e',
  canopyColor: '#1e8ca0',
  crash: true,
  enemyBody: '#b03038',
  enemyAccent: '#f2eee4',
  enemyCanopy: '#f2b636',
};

export const ENGINE_PARAM_KEYS = Object.keys(DEFAULT_ENGINE_PARAMS) as Array<keyof GameParams>;

export const DEFAULT_STORY_VALUES: GameParams = {
  ...DEFAULT_ENGINE_PARAMS,
  showHint: true,
  touchControls: 'auto',
  altitude: 110,
  jetScale: 0.6,
  pixelSize: 3,
  intro: false,
  flameStyle: 'realistic',
  afterburner: 1,
  crash: true,
  enemyBody: '#b03038',
  enemyAccent: '#f2eee4',
  enemyCanopy: '#f2b636',
};

export const DESKTOP_VIEW_HINTS: Record<ViewMode, string> = {
  top: 'Move to steer · Click to roll · Hold for thrusters · Shift boost · F guns · R missile · Q EMP · E flares · Wheel or +/- zooms · Esc or P pauses · Fly through light gates for specials · Space or V for chase view',
  chase:
    'Point to turn, climb and dive · Click to roll · Hold for thrusters · Shift boost · F guns · R missile · Wheel or +/- zooms · Esc or P pauses · Space or V for the cockpit',
  cockpit:
    'Point to turn, climb and dive · Click to roll · Hold for thrusters · Shift boost · F guns · R missile · Esc or P pauses · Space or V for overhead',
};

export const TOUCH_VIEW_HINTS: Record<ViewMode, string> = {
  top: 'Touch & drag to fly (or use HUD Stick) · Tap to roll · Hold Thrust / Burn · Hold Guns · Msl for missile · Menu ⚙ to pause & config',
  chase:
    'Use HUD Stick to turn, climb & dive · Roll for barrel roll · Hold Thrust / Burn · Hold Guns · Msl for missile · View for cockpit',
  cockpit:
    'Use HUD Stick to turn, climb & dive · Roll for barrel roll · Hold Thrust / Burn · Hold Guns · Msl for missile · View for overhead',
};

export const HUD_PILL_CLASS =
  'rounded-[3px] bg-[#0b1a33]/55 px-2.5 py-1.5 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-white/90';

export const HUD_BAR_SEGMENTS = 10;

export function normalizeViewMode(view?: string): ViewMode {
  return view === 'cockpit' ? 'cockpit' : view === 'chase' ? 'chase' : 'top';
}
