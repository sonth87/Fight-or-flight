export type ViewMode = 'top' | 'chase' | 'cockpit';
export type TimeOfDay = 'day' | 'sunset' | 'night';
export type FlameStyle = 'pixel' | 'realistic';
export type TouchControlsMode = 'auto' | 'on' | 'off';
export type MobileControlMode = 'touch' | 'joystick';
export type AirshipVariant = 'linen' | 'steampunk' | 'alien' | 'carrier';
export type WeaponKind = 'gun' | 'missile' | 'shield' | 'craft';
export type GateShape = 'ring' | 'square' | 'triangle' | 'pentagram';

export type RgbTuple = [number, number, number];

export interface GameParams {
  speed: number;
  boost: number;
  agility: number;
  altitude: number;
  ceiling: number;
  clearance: number;
  bank: number;
  spread: number;
  jetScale: number;
  cameraFollow: number;
  view: ViewMode;
  chaseDistance: number;
  chaseAngle: number;
  chaseSize: number;
  transition: number;
  timeOfDay: TimeOfDay;
  clouds: number;
  land: number;
  seed: number;
  afterburner: number;
  flameStyle: FlameStyle;
  trails: boolean;
  wingmen: number;
  shadow: boolean;
  followPointer: boolean;
  stunts: boolean;
  intro: boolean;
  bodyColor: string;
  accentColor: string;
  canopyColor: string;
  crash: boolean;
  enemyBody: string;
  enemyAccent: string;
  enemyCanopy: string;
  pixelSize?: number;
  showHint?: boolean;
  touchControls?: TouchControlsMode;
}

export interface SpecialWeaponDef {
  id: string;
  kind: WeaponKind;
  shape: GateShape;
  name: string;
  short: string;
  color: RgbTuple;
  dur: number;
  persist?: boolean;
  fromWave: number;
  anime?: boolean;
}

export interface GateColorScheme {
  base: RgbTuple;
  variant: RgbTuple;
  kind: WeaponKind;
  cssBase: string;
  cssVariant: string;
}

export interface SkillTabDef {
  id: string;
  name: string;
}

export interface SkillBranchDef {
  id: string;
  name: string;
  tab: string;
  tint?: string;
}

export interface SkillNodeDef {
  id: string;
  branch: string;
  name: string;
  desc: string;
  maxRank: number;
  cost: number;
  capstone?: boolean;
  req: Array<[string, number]>;
  apply: (stats: Record<string, any>, rank: number) => void;
}

export interface SkillTreeState {
  v: number;
  earned: number;
  ranks: Record<string, number>;
  runs: number;
}

export interface AchievementTierDef {
  need: number;
  bonus: Record<string, any>;
  bonusText: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  stat: string;
  hidden?: boolean;
  tiers: AchievementTierDef[];
}

export interface AchievementState {
  stats: Record<string, number>;
  unlocked: Record<string, number>;
  seen: boolean;
}

export interface AchievementUnlockEvent {
  id: string;
  tier: number;
  def: AchievementDef;
  row: AchievementTierDef;
}

export interface PaintScheme {
  body: string;
  accent: string;
  canopy: string;
}

export interface RunUpgradeContext {
  heal: (amount: number) => void;
  refillMissiles: () => void;
  readonly hullMax: number;
}

export interface RunUpgradeDef {
  id: string;
  name: string;
  desc: string;
  maxRank: number;
  tags: string[];
  weight?: number;
  when?: (stats: Record<string, any>) => boolean;
  apply: (stats: Record<string, any>, rank: number) => void;
  onPick?: (ctx: RunUpgradeContext) => void;
}

export interface UpgradeOfferItem {
  id: string;
  name: string;
  desc: string;
  rank: number;
  maxRank: number;
}

export interface UpgradeOfferState {
  level: number;
  items: UpgradeOfferItem[];
}

export interface KeybindActionDef {
  id: string;
  name: string;
  defaults: string[];
}

export type KeybindMap = Record<string, string[]>;

export interface SaveSlotMeta {
  wave: number;
  level: number;
  score: number;
  dead: boolean;
  savedAt: number;
}

export interface SaveSlotData {
  v: number;
  savedAt: number;
  tree: SkillTreeState;
  achieve: AchievementState;
  run: Record<string, any>;
  meta?: SaveSlotMeta;
}

export interface JetEntity {
  x: number;
  y: number;
  z: number;
  yaw: number;
  yawRate: number;
  roll: number;
  pitch: number;
  stunt: number;
  stuntDir: number;
  stuntDelay: number;
  vx: number;
  vy: number;
  vz?: number;
  trail: [Float32Array, Float32Array];
  trailHead: number;
  trailLen: number;
  g: number;
  lastTrailX: number;
  lastTrailY: number;
  [key: string]: any;
}

export interface AirshipTurret {
  i: number;
  a: number;
  b: number;
  y: number;
  r: number;
  hp: number;
  hpMax: number;
  dead: boolean;
  flash: number;
  cd: number;
  burst: number;
  burstT: number;
}

export interface AirshipVoxelPoint {
  a: number;
  b: number;
  y: number;
  v: number;
  steam?: boolean;
}

export interface ThrusterRenderer {
  draw: (count: number, data: Float32Array, scale: number, timeSec: number) => void;
  dispose: () => void;
}

export interface GameEngineAPI {
  setParams: (params: GameParams) => void;
  resize: (width: number, height: number) => void;
  pointerMove: (x: number, y: number) => void;
  pointerLeave: () => void;
  press: () => void;
  release: () => void;
  replayIntro: () => void;
  toggleView: () => void;
  setKeys: (dx: number, dy: number, thrust: boolean, burn?: boolean) => void;
  setJoystick: (dx: number, dy: number, active: boolean) => void;
  setInvertY: (invert: boolean) => void;
  getInvertY: () => boolean;
  setMuted: (muted: boolean) => void;
  getMuted: () => boolean;
  setBurn: (burn: boolean) => void;
  step: (dt: number) => void;
  render: () => Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
  readonly flames: { count: number; data: Float32Array };
  readonly view: ViewMode;
  setFire: (firing: boolean) => void;
  fireMissile: () => boolean;
  fireFlare: () => boolean;
  fireEmp: () => boolean;
  restart: () => void;
  chooseUpgrade: (index: number) => boolean;
  treeStats: () => Record<string, any>;
  upgrades: RunUpgradeDef[];
  startCombat: () => void;
  readonly combat: Record<string, any>;
  grantSpecial: (id: string, opts?: { echo?: boolean; bonusLv?: number }) => boolean;
  spawnGateAt: (id: string, x: number, y: number) => any;
  spawnGates: (count?: number, immediate?: boolean) => void;
  revealGates: () => void;
  weaponSheet: (width?: number, height?: number) => { data: Uint8ClampedArray; width: number; height: number };
  previewShot: (type: string, x: number, y: number, z: number, opts?: Record<string, any>) => number;
  clearShots: () => void;
  readonly gates: any[];
  clearGates: () => void;
  gateList: () => any[];
  demoChain: () => number;
  spawnEnemyAt: (type: string, x: number, y: number, z?: number) => any;
  clearEnemies: () => void;
  debugEnemy: (type?: string, patch?: Record<string, any>) => any;
  forceDie: (type?: string, silent?: boolean) => boolean;
  clearHUD: () => boolean;
  setShield: (seconds: number) => number;
  clearTrails: () => boolean;
  holdWaves: (hold: boolean) => boolean;
  setAttitude: (pitch?: number, roll?: number) => { pitch: number; roll: number };
  setBoostFuel: (fuel: number) => void;
  exportRun: () => Record<string, any>;
  importRun: (save: Record<string, any>) => boolean;
  quitRun: () => void;
  pointers: () => any[];
  damage: (amount: number, cause?: string) => void;
  addXP: (xp: number, reason?: string) => void;
  setAlt: (altitude: number) => void;
  wingtipSamples: () => any[];
  adjustZoom: (dir: number) => { chaseZoom: number; overheadZoom: number };
  setChaseZoom: (zoom: number) => number;
  getChaseZoom: () => number;
  getOverheadZoom: () => number;
  viewMetrics: () => Record<string, number>;
  getAchievements: () => AchievementState;
  reloadAchievements: () => AchievementState;
  structurePlan: (wave: number) => Record<string, any>;
  pickupRadius: (gate?: { r?: number }) => number;
  gateColors: (idOrDef: string | SpecialWeaponDef) => GateColorScheme;
  clearToast: () => void;
  nearestEnemyOnScreen: () => [number | null, number | null, number, number, number] | null;
}
