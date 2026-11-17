import { SkillBranchDef, SkillNodeDef, SkillTabDef, SkillTreeState, SpecialWeaponDef } from '../types/game';
import { sumDiminishingSeries } from '../utils/math';
import { SPECIAL_WEAPONS } from './weapons';

export const SKILL_TREE_STORAGE_KEY = 'fighter-guns-skilltree';
export const SKILL_TREE_VERSION = 2;
export const MAX_WEAPON_GATE_LEVEL = 8;

export const SKILL_TABS: SkillTabDef[] = [
  { id: 'core', name: 'Core' },
  { id: 'sguns', name: 'Gun specials' },
  { id: 'anime', name: 'Anime arsenal' },
  { id: 'smiss', name: 'Missiles' },
  { id: 'shields', name: 'Shields' },
  { id: 'support', name: 'Support' },
];

export function getGateLevelMultiplier(level?: number): number {
  return 1 + 0.15 * Math.max(0, Math.min(7, (level || 1) - 1));
}

export function getGateDuration(baseDur: number, bonusDur?: number, level?: number): number {
  return (baseDur + (bonusDur || 0)) * getGateLevelMultiplier(level);
}

export function getWeaponShortLabel(id: string): string {
  const def = SPECIAL_WEAPONS[id];
  return (def && (def.short || def.name.toUpperCase())) || String(id).toUpperCase();
}

export function getMaxWeaponLevel(def?: SpecialWeaponDef | null): number {
  return def && def.kind === 'shield' ? 5 : MAX_WEAPON_GATE_LEVEL;
}

export function getGateBannerInfo(
  weaponId: string,
  currentId: string | null,
  currentLevel?: number
): { text: string; mode: 'max' | 'up' | 'new' } {
  const def = SPECIAL_WEAPONS[weaponId];
  const label = def ? def.short || def.name.toUpperCase() : String(weaponId).toUpperCase();
  const maxLv = getMaxWeaponLevel(def);
  if (currentId === weaponId) {
    if ((currentLevel || 1) >= maxLv) {
      return { text: label + '  MAX', mode: 'max' };
    }
    const nextLv = Math.min(maxLv, (currentLevel || 1) + 1);
    return { text: label + '  LV' + nextLv, mode: 'up' };
  }
  return { text: label + '  NEW', mode: 'new' };
}

export const SPECIAL_STAT_DEFAULTS = {
  cannonStart: 0,
  cannonDmg: 1,
  cannonFreq: 1,
  cannonCap: 0,
  waveDur: 0,
  waveStart: 0,
  waveDmg: 1,
  waveWide: 1,
  waveFreq: 1,
  waveCap: 0,
  scatterDur: 0,
  scatterStart: 0,
  scatterDmg: 1,
  scatterPellets: 0,
  scatterFreq: 1,
  scatterCap: 0,
  fireballDur: 0,
  fireballStart: 0,
  fireballDmg: 1,
  fireballRad: 1,
  fireballFreq: 1,
  fireballCap: 0,
  plasmaDur: 0,
  plasmaStart: 0,
  plasmaDmg: 1,
  plasmaCharge: 1,
  plasmaFreq: 1,
  plasmaCap: 0,
  laserDur: 0,
  laserStart: 0,
  laserDmg: 1,
  laserWidth: 1,
  laserFreq: 1,
  laserCap: 0,
  spiritStart: 0,
  spiritDmg: 1,
  spiritFreq: 1,
  spiritCap: 0,
  circusStart: 0,
  circusDmg: 1,
  circusFreq: 1,
  circusCap: 0,
  lumenStart: 0,
  lumenDmg: 1,
  lumenFreq: 1,
  lumenCap: 0,
  helixStart: 0,
  helixDmg: 1,
  helixFreq: 1,
  helixCap: 0,
  bitsStart: 0,
  bitsDmg: 1,
  bitsFreq: 1,
  bitsCap: 0,
  railStart: 0,
  railDmg: 1,
  railFreq: 1,
  railCap: 0,
  chakramStart: 0,
  chakramDmg: 1,
  chakramFreq: 1,
  chakramCap: 0,
  swarmDur: 0,
  swarmStart: 0,
  swarmDmg: 1,
  swarmCount: 0,
  swarmFreq: 1,
  swarmCap: 0,
  torpDur: 0,
  torpStart: 0,
  torpDmg: 1,
  torpTurn: 1,
  torpFreq: 1,
  torpCap: 0,
  singDur: 0,
  singStart: 0,
  singDmg: 1,
  singPull: 1,
  singFreq: 1,
  singCap: 0,
  clusterDur: 0,
  clusterStart: 0,
  clusterDmg: 1,
  clusterSplits: 0,
  clusterFreq: 1,
  clusterCap: 0,
  deflectDur: 0,
  deflectMul: 1,
  deflectFreq: 1,
  deflectCap: 0,
  phaseDur: 0,
  phaseSpeed: 0,
  phaseFreq: 1,
  phaseCap: 0,
  absorbDur: 0,
  absorbCap: 0,
  absorbMul: 1,
  absorbFreq: 1,
  mirrorDur: 0,
  mirrorArc: 1,
  mirrorFreq: 1,
  mirrorCap: 0,
  chainChance: 0,
  chainJumps: 2,
  chainRange: 140,
  chainDmg: 1,
  chainCap: 0,
  gateCount: 0,
  gateRadiusMul: 1,
  gateMagnet: 0,
  gateStaggerMul: 1,
  gateGradeChance: 0,
  shieldDurMul: 1,
  craftFreq: 1,
  craftStart: 0,
  gateEcho: 0,
};

interface SpecialBranchTemplate {
  prefix: string;
  branch: string;
  dName: string;
  dDesc: string;
  dStat: string;
  dAmt: number;
  pName: string;
  pDesc: string;
  pStat: string;
  pAmt: number;
  pHow: 'add' | 'mul';
  fName: string;
  fDesc: string;
  fStat: string;
  fAmt: number;
  fAlso?: string;
  fAlsoAmt?: number;
  fMul?: string;
  fMulAmt?: number;
  cName: string;
  cDesc: string;
  capStat: string;
}

function buildSpecialWeaponBranchNodes(cfg: SpecialBranchTemplate): SkillNodeDef[] {
  const {
    prefix,
    branch,
    dName,
    pName,
    fName,
    cName,
    cDesc,
    dStat,
    pStat,
    pHow,
    fStat,
    capStat,
  } = cfg;
  return [
    {
      id: prefix + '_time',
      branch,
      name: dName,
      desc: cfg.dDesc,
      maxRank: 10,
      cost: 1,
      req: [],
      apply: (stats, rank) => {
        stats[dStat] += Math.min(3, Math.floor((rank + 2) / 3));
      },
    },
    {
      id: prefix + '_pow',
      branch,
      name: pName,
      desc: cfg.pDesc,
      maxRank: 12,
      cost: 2,
      req: [[prefix + '_time', 1]],
      apply: (stats, rank) => {
        const val = sumDiminishingSeries(rank, pHow === 'add' ? cfg.pAmt : 0.08, 0.9);
        if (pHow === 'add') {
          stats[pStat] += val;
        } else {
          stats[pStat] *= 1 + val;
        }
      },
    },
    {
      id: prefix + '_freq',
      branch,
      name: fName,
      desc: cfg.fDesc,
      maxRank: 10,
      cost: 1,
      req: [[prefix + '_time', 1]],
      apply: (stats, rank) => {
        stats[fStat] += sumDiminishingSeries(rank, (cfg.fAmt || 0.4) * 0.35, 0.9);
        if (cfg.fAlso) {
          stats[cfg.fAlso] += Math.min(5, Math.floor((rank + 1) / 2));
        }
        if (cfg.fMul) {
          stats[cfg.fMul] *= 1 + sumDiminishingSeries(rank, (cfg.fMulAmt || 1.15) - 1, 0.9);
        }
      },
    },
    {
      id: prefix + '_cap',
      branch,
      name: cName,
      desc: 'Capstone \xB7 ' + cDesc,
      maxRank: 1,
      cost: 5,
      capstone: true,
      req: [
        [prefix + '_pow', 1],
        [prefix + '_freq', 1],
      ],
      apply: (stats) => {
        stats[capStat] = 1;
      },
    },
  ];
}

export const SKILL_BRANCHES: SkillBranchDef[] = [
  { id: 'guns', name: 'Guns', tab: 'core' },
  { id: 'missiles', name: 'Missiles', tab: 'core' },
  { id: 'airframe', name: 'Airframe', tab: 'core' },
  { id: 'drones', name: 'Drones', tint: '#7ef0d8', tab: 'core' },
  { id: 'boost', name: 'Boost', tint: '#ffb44a', tab: 'core' },
  { id: 'cannon', name: 'Main guns', tint: '#c8d0d8', tab: 'sguns' },
  { id: 'wave', name: 'Wave shot', tint: '#5ad0ff', tab: 'sguns' },
  { id: 'scatter', name: 'Scatter shot', tint: '#ffdc50', tab: 'sguns' },
  { id: 'fireball', name: 'Fireball', tint: '#ff6e1e', tab: 'sguns' },
  { id: 'plasma', name: 'Plasma cannon', tint: '#d26eff', tab: 'sguns' },
  { id: 'laser', name: 'Laser', tint: '#ff465a', tab: 'sguns' },
  { id: 'spirit', name: 'Spirit Wave', tint: '#50c8ff', tab: 'anime' },
  { id: 'circus', name: 'Spiral Circus', tint: '#ff70d0', tab: 'smiss' },
  { id: 'lumen', name: 'Lumen Lance', tint: '#ff5ac8', tab: 'anime' },
  { id: 'helix', name: 'Helix Bore', tint: '#ff8c28', tab: 'anime' },
  { id: 'bits', name: 'Echo Bits', tint: '#a0ffc8', tab: 'anime' },
  { id: 'rail', name: 'Coin Rail', tint: '#ffe650', tab: 'anime' },
  { id: 'chakram', name: 'Star Chakram', tint: '#b48cff', tab: 'anime' },
  { id: 'swarm', name: 'Swarm', tint: '#8cff9e', tab: 'smiss' },
  { id: 'torpedo', name: 'Torpedo', tint: '#be5aff', tab: 'smiss' },
  { id: 'singularity', name: 'Singularity', tint: '#5064ff', tab: 'smiss' },
  { id: 'cluster', name: 'Cluster', tint: '#ffb43c', tab: 'smiss' },
  { id: 'deflect', name: 'Deflector', tint: '#50dcff', tab: 'shields' },
  { id: 'phase', name: 'Phase', tint: '#c878ff', tab: 'shields' },
  { id: 'absorb', name: 'Absorb', tint: '#ffb428', tab: 'shields' },
  { id: 'mirror', name: 'Mirror', tint: '#e6f0ff', tab: 'shields' },
  { id: 'avionics', name: 'Avionics', tint: '#9fe0ff', tab: 'support' },
  { id: 'ordnance', name: 'Ordnance', tint: '#ffb07a', tab: 'support' },
  { id: 'lightning', name: 'Chain lightning', tint: '#b8f0ff', tab: 'support' },
  { id: 'gatecraft', name: 'Gatecraft', tint: '#ffd24a', tab: 'support' },
];

export const SKILL_NODES: SkillNodeDef[] = [
  {
    id: 'g_rounds',
    branch: 'guns',
    name: 'Calibrated rounds',
    desc: '+4% gun damage per rank, diminishing',
    maxRank: 20,
    cost: 1,
    req: [],
    apply: (t, e) => {
      t.gunDamage += sumDiminishingSeries(e, 0.04, 0.9);
    },
  },
  {
    id: 'g_feed',
    branch: 'guns',
    name: 'Feed tuning',
    desc: '+3% rate of fire per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['g_rounds', 1]],
    apply: (t, e) => {
      t.fireRate *= 1 + sumDiminishingSeries(e, 0.03, 0.9);
    },
  },
  {
    id: 'g_sinks',
    branch: 'guns',
    name: 'Heat sinks',
    desc: '\u22124% heat and +4% cooling per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['g_rounds', 1]],
    apply: (t, e) => {
      const a = sumDiminishingSeries(e, 0.04, 0.9);
      t.heatPerVolley *= 1 - a;
      t.coolMul *= 1 + a;
    },
  },
  {
    id: 'g_camera',
    branch: 'guns',
    name: 'Gun camera',
    desc: '+5% aim assist and lock cone per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['g_feed', 1]],
    apply: (t, e) => {
      t.assistMul += sumDiminishingSeries(e, 0.05, 0.9);
    },
  },
  {
    id: 'g_cap',
    branch: 'guns',
    name: 'Big-game rounds',
    desc: 'Capstone \xB7 +25% gun damage against bombers and aces',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['g_sinks', 1],
      ['g_camera', 1],
    ],
    apply: (t) => {
      t.bigGameMul = 1.25;
    },
  },
  {
    id: 'm_pylon',
    branch: 'missiles',
    name: 'Extra pylon',
    desc: '+1 missile per rank',
    maxRank: 5,
    cost: 1,
    req: [],
    apply: (t, e) => {
      t.missileMax += e;
    },
  },
  {
    id: 'm_loader',
    branch: 'missiles',
    name: 'Quick loaders',
    desc: 'Missiles reload 4% faster per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['m_pylon', 1]],
    apply: (t, e) => {
      t.missileReload *= 1 - sumDiminishingSeries(e, 0.04, 0.9);
    },
  },
  {
    id: 'm_charge',
    branch: 'missiles',
    name: 'Shaped charge',
    desc: '+5% missile damage per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['m_pylon', 1]],
    apply: (t, e) => {
      t.missileDmgMul += sumDiminishingSeries(e, 0.05, 0.9);
    },
  },
  {
    id: 'm_cap',
    branch: 'missiles',
    name: 'Hot rails',
    desc: 'Capstone \xB7 each missile kill loads half a missile (two kills = one missile back)',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['m_loader', 1],
      ['m_charge', 1],
    ],
    apply: (t) => {
      t.killReload = 1;
    },
  },
  {
    id: 'a_spars',
    branch: 'airframe',
    name: 'Doubled spars',
    desc: '+10 max hull per rank, diminishing',
    maxRank: 20,
    cost: 1,
    req: [],
    apply: (t, e) => {
      t.hullMax += Math.round(sumDiminishingSeries(e, 10, 0.93));
    },
  },
  {
    id: 'a_repair',
    branch: 'airframe',
    name: 'Damage control',
    desc: '+0.6 hull/s auto-repair per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['a_spars', 1]],
    apply: (t, e) => {
      t.regenRate += sumDiminishingSeries(e, 0.6, 0.9);
    },
  },
  {
    id: 'a_plates',
    branch: 'airframe',
    name: 'Ceramic plates',
    desc: '\u22122.5% damage taken per rank, diminishing',
    maxRank: 12,
    cost: 2,
    req: [['a_spars', 1]],
    apply: (t, e) => {
      t.armor = Math.min(0.55, t.armor + sumDiminishingSeries(e, 0.025, 0.88));
    },
  },
  {
    id: 'a_trim',
    branch: 'airframe',
    name: 'Trim tabs',
    desc: '+2.5% turn, +2% speed, +3% boost per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['a_spars', 1]],
    apply: (t, e) => {
      const a = sumDiminishingSeries(e, 0.025, 0.9);
      t.turnMul += a;
      t.speedMul += a * 0.75;
      t.boostMul += a * 1.2;
    },
  },
  {
    id: 'a_cap',
    branch: 'airframe',
    name: 'Second wind',
    desc: 'Capstone \xB7 once per run, a killing hit (not a crash) leaves 20% hull and 2 s of shield',
    maxRank: 1,
    cost: 7,
    capstone: true,
    req: [
      ['a_repair', 1],
      ['a_plates', 1],
    ],
    apply: (t) => {
      t.secondWind = 1;
    },
  },
  {
    id: 'd_wing',
    branch: 'drones',
    name: 'Wingman',
    desc: 'A small automated drone flies in formation and shoots nearby enemies',
    maxRank: 1,
    cost: 2,
    req: [],
    apply: (t) => {
      t.drones += 1;
    },
  },
  {
    id: 'd_squad',
    branch: 'drones',
    name: 'Squadron',
    desc: '+1 drone per rank (up to 6)',
    maxRank: 5,
    cost: 2,
    req: [['d_wing', 1]],
    apply: (t, e) => {
      t.drones += e;
    },
  },
  {
    id: 'd_payload',
    branch: 'drones',
    name: 'Hot payloads',
    desc: '+8% drone damage and +5% fire rate per rank, diminishing',
    maxRank: 12,
    cost: 2,
    req: [['d_wing', 1]],
    apply: (t, e) => {
      const a = sumDiminishingSeries(e, 0.08, 0.9);
      t.droneDamage *= 1 + a;
      t.droneRate *= 1 + a * 0.6;
    },
  },
  {
    id: 'd_optics',
    branch: 'drones',
    name: 'Wide net',
    desc: '+12% drone targeting range per rank, diminishing',
    maxRank: 12,
    cost: 1,
    req: [['d_wing', 1]],
    apply: (t, e) => {
      t.droneRange *= 1 + sumDiminishingSeries(e, 0.12, 0.9);
    },
  },
  {
    id: 'd_screen',
    branch: 'drones',
    name: 'Point defense',
    desc: 'Drones shoot down nearby enemy shots',
    maxRank: 1,
    cost: 4,
    req: [['d_payload', 1]],
    apply: (t) => {
      t.droneScreen = 1;
    },
  },
  {
    id: 'd_cap',
    branch: 'drones',
    name: 'Phoenix protocol',
    desc: 'Capstone \xB7 a downed drone kamikazes the nearest foe and respawns in 6 s \xB7 drones fire a mini-missile every 10 s',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['d_squad', 1],
      ['d_payload', 1],
    ],
    apply: (t) => {
      t.dronePhoenix = 1;
    },
  },
  {
    id: 'b_tanks',
    branch: 'boost',
    name: 'Deep tanks',
    desc: '+12% boost capacity per rank, diminishing',
    maxRank: 12,
    cost: 1,
    req: [],
    apply: (t, e) => {
      t.boostMax *= 1 + sumDiminishingSeries(e, 0.12, 0.9);
    },
  },
  {
    id: 'b_recharge',
    branch: 'boost',
    name: 'Fast refill',
    desc: '+12% boost recharge per rank, diminishing \xB7 shorter wait',
    maxRank: 12,
    cost: 1,
    req: [['b_tanks', 1]],
    apply: (t, e) => {
      const a = sumDiminishingSeries(e, 0.12, 0.9);
      t.boostRegen *= 1 + a;
      t.boostDelay *= 1 - a * 0.4;
    },
  },
  {
    id: 'b_burn',
    branch: 'boost',
    name: 'Afterburner',
    desc: '+7% boost speed per rank, diminishing',
    maxRank: 12,
    cost: 2,
    req: [['b_tanks', 1]],
    apply: (t, e) => {
      t.boostSpeedMul *= 1 + sumDiminishingSeries(e, 0.07, 0.9);
    },
  },
  {
    id: 'b_jink',
    branch: 'boost',
    name: 'Jink',
    desc: 'A dodge roll and a brief invulnerable window at the start of a boost',
    maxRank: 1,
    cost: 3,
    req: [['b_burn', 1]],
    apply: (t) => {
      t.boostIframe = 1;
    },
  },
  {
    id: 'b_break',
    branch: 'boost',
    name: 'Break lock',
    desc: 'Starting a boost makes pursuers lose their lock and overshoot',
    maxRank: 1,
    cost: 3,
    req: [['b_tanks', 1]],
    apply: (t) => {
      t.boostLock = 1;
    },
  },
  {
    id: 'b_cap',
    branch: 'boost',
    name: 'Sonic boom',
    desc: 'Capstone \xB7 kicking a nearly-full boost releases a shockwave, and the afterburner trail burns foes',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['b_burn', 1],
      ['b_break', 1],
    ],
    apply: (t) => {
      t.boostCap = 1;
    },
  },
  {
    id: 'v_range',
    branch: 'avionics',
    name: 'Range finder',
    desc: '+6% aim assist and lock range per rank, diminishing',
    maxRank: 15,
    cost: 1,
    req: [],
    apply: (t, e) => {
      const a = sumDiminishingSeries(e, 0.06, 0.9);
      t.assistMul += a;
      t.lockRange *= 1 + a;
    },
  },
  {
    id: 'v_lock',
    branch: 'avionics',
    name: 'Fast lock',
    desc: 'Missiles acquire sooner \xB7 + lock cone, per rank, diminishing',
    maxRank: 12,
    cost: 2,
    req: [['v_range', 1]],
    apply: (t, e) => {
      const a = Math.min(0.5, sumDiminishingSeries(e, 0.1, 0.88));
      t.lockDelay *= 1 - a;
      t.assistMul += a * 0.4;
    },
  },
  {
    id: 'v_xp',
    branch: 'avionics',
    name: 'Flight log',
    desc: '+5% XP earned per rank, diminishing',
    maxRank: 15,
    cost: 2,
    req: [['v_range', 1]],
    apply: (t, e) => {
      t.xpMul += sumDiminishingSeries(e, 0.05, 0.9);
    },
  },
  {
    id: 'v_pts',
    branch: 'avionics',
    name: 'War college',
    desc: '+1 skill point at the end of each run, per rank',
    maxRank: 3,
    cost: 3,
    req: [['v_xp', 1]],
    apply: (t, e) => {
      t.pointBonus += e;
    },
  },
  {
    id: 'v_cap',
    branch: 'avionics',
    name: 'Battle network',
    desc: 'Capstone \xB7 missile locks are instant \xB7 off-screen enemies show as ticks on the rim of the view',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['v_lock', 1],
      ['v_xp', 1],
    ],
    apply: (t) => {
      t.battleNet = 1;
      t.lockDelay = 0;
    },
  },
  {
    id: 'o_flare',
    branch: 'ordnance',
    name: 'Flare rack',
    desc: 'E pops flares that pull incoming shots off you (2 charges, 16 s)',
    maxRank: 1,
    cost: 2,
    req: [],
    apply: (t) => {
      t.flareMax += 2;
    },
  },
  {
    id: 'o_spare',
    branch: 'ordnance',
    name: 'Spare rack',
    desc: '+1 flare charge per rank',
    maxRank: 5,
    cost: 1,
    req: [['o_flare', 1]],
    apply: (t, e) => {
      t.flareMax += e;
    },
  },
  {
    id: 'o_cycle',
    branch: 'ordnance',
    name: 'Fast cycle',
    desc: 'Special cooldowns \u22128% per rank, diminishing',
    maxRank: 10,
    cost: 2,
    req: [['o_flare', 1]],
    apply: (t, e) => {
      t.specialCd *= 1 - Math.min(0.5, sumDiminishingSeries(e, 0.08, 0.88));
    },
  },
  {
    id: 'o_emp',
    branch: 'ordnance',
    name: 'EMP coil',
    desc: 'Q fires an EMP that stuns nearby enemies for 2.5 s (20 s cooldown)',
    maxRank: 1,
    cost: 3,
    req: [['o_flare', 1]],
    apply: (t) => {
      t.empMax += 1;
    },
  },
  {
    id: 'o_cap',
    branch: 'ordnance',
    name: 'Thunderstrike',
    desc: 'Capstone \xB7 EMP also blasts enemies, and stunned foes take +25% damage',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['o_emp', 1],
      ['o_cycle', 1],
    ],
    apply: (t) => {
      t.thunderstrike = 1;
    },
  },
  ...buildSpecialWeaponBranchNodes({
    prefix: 'w',
    branch: 'wave',
    dName: 'Primed crest',
    dDesc: 'Wave shot starts +1 level per 3 ranks (up to +3)',
    dStat: 'waveStart',
    dAmt: 1,
    pName: 'Higher crests',
    pDesc: '+20% wave-shot damage',
    pStat: 'waveDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Tide marks',
    fDesc: 'Wave-shot rings show up more often',
    fStat: 'waveFreq',
    fAmt: 0.4,
    cName: 'Tidal bore',
    cDesc: 'wave shots pierce and leave a second trailing crest',
    capStat: 'waveCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'sc',
    branch: 'scatter',
    dName: 'Primed magazines',
    dDesc: 'Scatter starts +1 level per 3 ranks (up to +3)',
    dStat: 'scatterStart',
    dAmt: 1,
    pName: 'Heavier shot',
    pDesc: '+20% scatter damage',
    pStat: 'scatterDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Loose packing',
    fDesc: '+1 pellet per rank \xB7 scatter rings show up more often',
    fStat: 'scatterFreq',
    fAmt: 0.4,
    fAlso: 'scatterPellets',
    fAlsoAmt: 1,
    cName: 'Flak burst',
    cDesc: 'pellets detonate in a small burst when they hit',
    capStat: 'scatterCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'fb',
    branch: 'fireball',
    dName: 'Primed core',
    dDesc: 'Fireball starts +1 level per 3 ranks (up to +3)',
    dStat: 'fireballStart',
    dAmt: 1,
    pName: 'Hotter cores',
    pDesc: '+20% fireball damage',
    pStat: 'fireballDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Wide splash',
    fDesc: '+20% blast radius \xB7 fireball rings show up more often',
    fStat: 'fireballFreq',
    fAmt: 0.4,
    cName: 'Napalm',
    cDesc: 'blasts leave a burning patch that keeps cooking foes',
    capStat: 'fireballCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'pl',
    branch: 'plasma',
    dName: 'Primed cell',
    dDesc: 'Plasma starts +1 level per 3 ranks (up to +3)',
    dStat: 'plasmaStart',
    dAmt: 1,
    pName: 'Overcharge',
    pDesc: '+20% plasma damage',
    pStat: 'plasmaDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Quick charge',
    fDesc: 'charges 15% faster \xB7 plasma rings show up more often',
    fStat: 'plasmaFreq',
    fAmt: 0.4,
    fMul: 'plasmaCharge',
    fMulAmt: 0.85,
    cName: 'Ion lance',
    cDesc: 'a fully charged bolt pierces through every foe in a line',
    capStat: 'plasmaCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'ls',
    branch: 'laser',
    dName: 'Primed optic',
    dDesc: 'Laser starts +1 level per 3 ranks (up to +3)',
    dStat: 'laserStart',
    dAmt: 1,
    pName: 'Hot beam',
    pDesc: '+20% laser damage',
    pStat: 'laserDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Wide emitter',
    fDesc: '+20% beam width \xB7 laser rings show up more often',
    fStat: 'laserFreq',
    fAmt: 0.4,
    cName: 'Forked beam',
    cDesc: 'the beam splits to a second nearby target',
    capStat: 'laserCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'cn',
    branch: 'cannon',
    dName: 'Primed barrels',
    dDesc: 'Main guns start +1 level when picked up (per rank)',
    dStat: 'cannonStart',
    dAmt: 1,
    pName: 'Hot loads',
    pDesc: '+15% main-gun special damage',
    pStat: 'cannonDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'main-gun rings show up more often',
    fStat: 'cannonFreq',
    fAmt: 0.4,
    cName: 'Overbore',
    cDesc: 'leveled main guns also pierce and crackle',
    capStat: 'cannonCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'sp',
    branch: 'spirit',
    dName: 'Primed spirit',
    dDesc: 'Spirit Wave starts +1 level per 3 ranks (up to +3)',
    dStat: 'spiritStart',
    dAmt: 1,
    pName: 'Rising ki',
    pDesc: '+15% Spirit Wave damage',
    pStat: 'spiritDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'Spirit Wave rings show up more often',
    fStat: 'spiritFreq',
    fAmt: 0.4,
    cName: 'World breaker',
    cDesc: 'a fully charged wave leaves a shock ring',
    capStat: 'spiritCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'ci',
    branch: 'circus',
    dName: 'Primed spiral',
    dDesc: 'Spiral Circus starts +1 level per 3 ranks (up to +3)',
    dStat: 'circusStart',
    dAmt: 1,
    pName: 'Tight orbit',
    pDesc: '+15% circus micro-missile damage',
    pStat: 'circusDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'Spiral Circus squares show up more often',
    fStat: 'circusFreq',
    fAmt: 0.4,
    cName: 'Grand finale',
    cDesc: 'the swarm splits once more at the target',
    capStat: 'circusCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'lu',
    branch: 'lumen',
    dName: 'Primed lumen',
    dDesc: 'Lumen Lance starts +1 level per 3 ranks (up to +3)',
    dStat: 'lumenStart',
    dAmt: 1,
    pName: 'Hot beam',
    pDesc: '+15% Lumen Lance damage',
    pStat: 'lumenDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'Lumen Lance rings show up more often',
    fStat: 'lumenFreq',
    fAmt: 0.4,
    cName: 'Beam saber',
    cDesc: 'each volley also cuts a close-range saber arc',
    capStat: 'lumenCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'hx',
    branch: 'helix',
    dName: 'Primed bore',
    dDesc: 'Helix Bore starts +1 level per 3 ranks (up to +3)',
    dStat: 'helixStart',
    dAmt: 1,
    pName: 'Hard spiral',
    pDesc: '+15% Helix Bore damage',
    pStat: 'helixDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'Helix Bore rings show up more often',
    fStat: 'helixFreq',
    fAmt: 0.4,
    cName: 'Break through',
    cDesc: 'the drill always pierces and stuns',
    capStat: 'helixCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'bt',
    branch: 'bits',
    dName: 'Primed bits',
    dDesc: 'Echo Bits start +1 level when picked up (per rank)',
    dStat: 'bitsStart',
    dAmt: 1,
    pName: 'Hot funnels',
    pDesc: '+15% Echo Bit damage',
    pStat: 'bitsDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'Echo Bits rings show up more often',
    fStat: 'bitsFreq',
    fAmt: 0.4,
    cName: 'All-range',
    cDesc: 'bits also fire at a second nearby target',
    capStat: 'bitsCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'rl',
    branch: 'rail',
    dName: 'Primed rail',
    dDesc: 'Coin Rail starts +1 level per 3 ranks (up to +3)',
    dStat: 'railStart',
    dAmt: 1,
    pName: 'Live coin',
    pDesc: '+15% Coin Rail damage',
    pStat: 'railDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'Coin Rail rings show up more often',
    fStat: 'railFreq',
    fAmt: 0.4,
    cName: 'Rail storm',
    cDesc: 'fires a second coin at a nearby foe',
    capStat: 'railCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'ck',
    branch: 'chakram',
    dName: 'Primed star',
    dDesc: 'Star Chakram starts +1 level per 3 ranks (up to +3)',
    dStat: 'chakramStart',
    dAmt: 1,
    pName: 'Keen edge',
    pDesc: '+15% chakram damage',
    pStat: 'chakramDmg',
    pAmt: 1.15,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'Star Chakram rings show up more often',
    fStat: 'chakramFreq',
    fAmt: 0.4,
    cName: 'Ricochet star',
    cDesc: 'the chakram always bounces to a second foe',
    capStat: 'chakramCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'sw',
    branch: 'swarm',
    dName: 'Primed nest',
    dDesc: 'Swarm starts +1 level per 3 ranks (up to +3)',
    dStat: 'swarmStart',
    dAmt: 1,
    pName: 'Sharper darts',
    pDesc: '+20% swarm damage',
    pStat: 'swarmDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Extra darts',
    fDesc: '+1 micro-missile per rank \xB7 swarm squares show up more often',
    fStat: 'swarmFreq',
    fAmt: 0.4,
    fAlso: 'swarmCount',
    fAlsoAmt: 1,
    cName: 'Hive mind',
    cDesc: 'micro-missiles retarget instantly when their mark goes down',
    capStat: 'swarmCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'tp',
    branch: 'torpedo',
    dName: 'Primed tube',
    dDesc: 'Torpedo starts +1 level per 3 ranks (up to +3)',
    dStat: 'torpStart',
    dAmt: 1,
    pName: 'Fat warhead',
    pDesc: '+20% torpedo damage',
    pStat: 'torpDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Tight track',
    fDesc: '+20% turn rate \xB7 torpedo squares show up more often',
    fStat: 'torpFreq',
    fAmt: 0.4,
    cName: 'Plasma bloom',
    cDesc: 'the torpedo leaves a damaging plasma trail and a larger blast',
    capStat: 'torpCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'sg',
    branch: 'singularity',
    dName: 'Primed well',
    dDesc: 'Singularity starts +1 level per 3 ranks (up to +3)',
    dStat: 'singStart',
    dAmt: 1,
    pName: 'Deeper well',
    pDesc: '+20% singularity damage and pull',
    pStat: 'singDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Event marks',
    fDesc: 'singularity squares show up more often',
    fStat: 'singFreq',
    fAmt: 0.4,
    cName: 'Horizon',
    cDesc: 'the well also pulls enemy shots in, and its collapse always triggers chain lightning',
    capStat: 'singCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'cl',
    branch: 'cluster',
    dName: 'Primed rack',
    dDesc: 'Cluster starts +1 level per 3 ranks (up to +3)',
    dStat: 'clusterStart',
    dAmt: 1,
    pName: 'Heavier bomblets',
    pDesc: '+20% cluster damage',
    pStat: 'clusterDmg',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Extra splits',
    fDesc: '+1 bomblet per rank \xB7 cluster squares show up more often',
    fStat: 'clusterFreq',
    fAmt: 0.4,
    fAlso: 'clusterSplits',
    fAlsoAmt: 1,
    cName: 'Double split',
    cDesc: 'bomblets split once more just before they hit',
    capStat: 'clusterCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'df',
    branch: 'deflect',
    dName: 'Long field',
    dDesc: '+1.5 s deflector duration',
    dStat: 'deflectDur',
    dAmt: 1.5,
    pName: 'Hard bounce',
    pDesc: 'deflected shots deal +20% damage',
    pStat: 'deflectMul',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'deflector triangles show up more often',
    fStat: 'deflectFreq',
    fAmt: 0.4,
    cName: 'Ricochet',
    cDesc: 'a deflected shot homes toward the nearest foe',
    capStat: 'deflectCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'ph',
    branch: 'phase',
    dName: 'Long phase',
    dDesc: '+1.5 s phase duration',
    dStat: 'phaseDur',
    dAmt: 1.5,
    pName: 'Slipstream',
    pDesc: '+8% top speed and turn while phased (per rank)',
    pStat: 'phaseSpeed',
    pAmt: 0.08,
    pHow: 'add',
    fName: 'Beacon',
    fDesc: 'phase triangles show up more often',
    fStat: 'phaseFreq',
    fAmt: 0.4,
    cName: 'Ghost walk',
    cDesc: 'while phased, enemy guns cannot get a lock on you',
    capStat: 'phaseCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'ab',
    branch: 'absorb',
    dName: 'Long soak',
    dDesc: '+1.5 s absorb duration',
    dStat: 'absorbDur',
    dAmt: 1.5,
    pName: 'Dense foam',
    pDesc: '+20% stored blast damage',
    pStat: 'absorbMul',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'absorb triangles show up more often',
    fStat: 'absorbFreq',
    fAmt: 0.4,
    cName: 'Overload',
    cDesc: 'releasing the blast also stuns foes in the radius',
    capStat: 'absorbCap',
  }),
  ...buildSpecialWeaponBranchNodes({
    prefix: 'mr',
    branch: 'mirror',
    dName: 'Long glass',
    dDesc: '+1.5 s mirror duration',
    dStat: 'mirrorDur',
    dAmt: 1.5,
    pName: 'Wide pane',
    pDesc: 'the mirror covers a wider arc in front of the jet',
    pStat: 'mirrorArc',
    pAmt: 1.2,
    pHow: 'mul',
    fName: 'Beacon',
    fDesc: 'mirror triangles show up more often',
    fStat: 'mirrorFreq',
    fAmt: 0.4,
    cName: 'Prism',
    cDesc: 'a reflected shot splits into two at a shallower angle',
    capStat: 'mirrorCap',
  }),
  {
    id: 'l_spark',
    branch: 'lightning',
    name: 'Arc initiator',
    desc: '+8% chance gun hits chain to a nearby foe, per rank, diminishing',
    maxRank: 10,
    cost: 2,
    req: [],
    apply: (t, e) => {
      t.chainChance = sumDiminishingSeries(e, 0.08, 0.88);
    },
  },
  {
    id: 'l_jump',
    branch: 'lightning',
    name: 'Extra forks',
    desc: '+1 lightning jump per rank',
    maxRank: 5,
    cost: 2,
    req: [['l_spark', 1]],
    apply: (t, e) => {
      t.chainJumps += e;
    },
  },
  {
    id: 'l_reach',
    branch: 'lightning',
    name: 'Longer arc',
    desc: '+12% chain range per rank, diminishing',
    maxRank: 12,
    cost: 1,
    req: [['l_spark', 1]],
    apply: (t, e) => {
      t.chainRange *= 1 + sumDiminishingSeries(e, 0.12, 0.9);
    },
  },
  {
    id: 'l_volt',
    branch: 'lightning',
    name: 'Hot spark',
    desc: '+10% chain damage per rank, diminishing',
    maxRank: 12,
    cost: 2,
    req: [['l_spark', 1]],
    apply: (t, e) => {
      t.chainDmg *= 1 + sumDiminishingSeries(e, 0.1, 0.9);
    },
  },
  {
    id: 'l_cap',
    branch: 'lightning',
    name: 'Thunderhead',
    desc: 'Capstone \xB7 a kill always chains, and the bolt can jump two further',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['l_jump', 1],
      ['l_volt', 1],
    ],
    apply: (t) => {
      t.chainCap = 1;
      t.chainJumps += 2;
    },
  },
  {
    id: 'gc_reach',
    branch: 'gatecraft',
    name: 'Wide aperture',
    desc: '+8% gate pickup radius per rank, diminishing',
    maxRank: 12,
    cost: 1,
    req: [],
    apply: (t, e) => {
      t.gateRadiusMul *= 1 + sumDiminishingSeries(e, 0.08, 0.9);
    },
  },
  {
    id: 'gc_magnet',
    branch: 'gatecraft',
    name: 'Gate magnet',
    desc: 'Nearby gates tug the jet in when you pass close \xB7 stronger per rank',
    maxRank: 5,
    cost: 2,
    req: [['gc_reach', 1]],
    apply: (t, e) => {
      t.gateMagnet = e;
    },
  },
  {
    id: 'gc_tide',
    branch: 'gatecraft',
    name: 'Quick beacons',
    desc: 'Gates appear sooner after a wave starts, per rank, diminishing',
    maxRank: 10,
    cost: 2,
    req: [['gc_reach', 1]],
    apply: (t, e) => {
      t.gateStaggerMul *= 1 - Math.min(0.5, sumDiminishingSeries(e, 0.1, 0.88));
    },
  },
  {
    id: 'gc_field',
    branch: 'gatecraft',
    name: 'Open field',
    desc: '+1 gate per wave per rank, and a higher cap on how many can be up at once',
    maxRank: 5,
    cost: 2,
    req: [['gc_reach', 1]],
    apply: (t, e) => {
      t.gateCount += e;
    },
  },
  {
    id: 'gc_grade',
    branch: 'gatecraft',
    name: 'High grade',
    desc: 'Chance a gate starts +2 levels, and longer shields, per rank, diminishing',
    maxRank: 8,
    cost: 2,
    req: [['gc_tide', 1]],
    apply: (t, e) => {
      t.gateGradeChance = Math.min(0.7, sumDiminishingSeries(e, 0.1, 0.88));
      t.shieldDurMul = 1 + sumDiminishingSeries(e, 0.08, 0.9);
    },
  },
  {
    id: 'gc_star',
    branch: 'gatecraft',
    name: 'Star chart',
    desc: 'Pentagram gates appear more often \xB7 they start +1 level per rank',
    maxRank: 5,
    cost: 2,
    req: [['gc_field', 1]],
    apply: (t, e) => {
      t.craftFreq = 1 + sumDiminishingSeries(e, 0.4, 0.85);
      t.craftStart = e;
    },
  },
  {
    id: 'gc_cap',
    branch: 'gatecraft',
    name: 'Gate echo',
    desc: 'Capstone \xB7 after a pickup, a random gate of the same group often appears nearby',
    maxRank: 1,
    cost: 6,
    capstone: true,
    req: [
      ['gc_grade', 1],
      ['gc_star', 1],
    ],
    apply: (t) => {
      t.gateEcho = 1;
    },
  },
];

export const SKILL_NODE_MAP: Record<string, SkillNodeDef> = Object.fromEntries(
  SKILL_NODES.map((node) => [node.id, node])
);

export function getNodeRankCost(node: SkillNodeDef | undefined, rank: number): number {
  if (!node || rank < 1) return 0;
  if (node.capstone || node.maxRank === 1) return node.cost;
  const base = Math.max(1, node.cost | 0);
  return Math.max(1, Math.round(base * (1 + (rank - 1) * 0.4)));
}

export function getNodeCumulativeCost(node: SkillNodeDef | undefined, totalRanks: number): number {
  let sum = 0;
  const count = Math.max(0, totalRanks | 0);
  for (let r = 1; r <= count; r++) {
    sum += getNodeRankCost(node, r);
  }
  return sum;
}

export const TOTAL_SKILL_TREE_COST = SKILL_NODES.reduce(
  (acc, node) => acc + getNodeCumulativeCost(node, node.maxRank),
  0
);

export const BASE_SKILL_STATS = {
  bigGameMul: 1,
  missileDmgMul: 1,
  killReload: 0,
  secondWind: 0,
  drones: 0,
  droneDamage: 0.42,
  droneRate: 2.3,
  droneRange: 280,
  droneScreen: 0,
  dronePhoenix: 0,
  droneRespawn: 1,
  lockRange: 1,
  lockDelay: 1,
  xpMul: 1,
  pointBonus: 0,
  battleNet: 0,
  flareMax: 0,
  empMax: 0,
  specialCd: 1,
  thunderstrike: 0,
  ...SPECIAL_STAT_DEFAULTS,
  boostMax: 1,
  boostDrain: 0.48,
  boostRegen: 0.22,
  boostDelay: 0.4,
  boostSpeedMul: 1.72,
  boostIframe: 0,
  boostLock: 0,
  boostCap: 0,
};

export function getDifficultyScalingFromSpentPoints(spentPoints: number): number {
  return Math.min(28, spentPoints / 80);
}

export function calculateRunSkillPoints({
  wave = 0,
  cleared = undefined,
  level = 1,
  aces = 0,
  pointBonus = 0,
  gates = 0,
}: {
  wave?: number;
  cleared?: number;
  level?: number;
  aces?: number;
  pointBonus?: number;
  gates?: number;
}): number {
  return (
    1 * Math.max(0, cleared ?? wave - 1) +
    Math.floor(Math.max(0, level - 1) / 6) +
    2 * aces +
    Math.floor(Math.max(0, gates) / 6) +
    Math.max(0, pointBonus | 0)
  );
}

export function createEmptySkillTreeState(): SkillTreeState {
  return { v: SKILL_TREE_VERSION, earned: 0, ranks: {}, runs: 0 };
}

function sumLegacyLinearCost(ranks: Record<string, number> | undefined): number {
  let sum = 0;
  for (const id in ranks || {}) {
    if (SKILL_NODE_MAP[id]) {
      sum += SKILL_NODE_MAP[id].cost * Math.max(0, ranks![id] | 0);
    }
  }
  return sum;
}

export function getSpentSkillPoints(tree: { ranks: Record<string, number> }): number {
  return Object.entries(tree.ranks).reduce(
    (sum, [id, rank]) => sum + (SKILL_NODE_MAP[id] ? getNodeCumulativeCost(SKILL_NODE_MAP[id], rank) : 0),
    0
  );
}

export function getAvailableSkillPoints(tree: SkillTreeState): number {
  return tree.earned - getSpentSkillPoints(tree);
}

export function loadSkillTree(): SkillTreeState {
  try {
    const raw = JSON.parse(localStorage.getItem(SKILL_TREE_STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return createEmptySkillTreeState();
    const validRanks: Record<string, number> = {};
    for (const id in raw.ranks || {}) {
      if (SKILL_NODE_MAP[id]) {
        validRanks[id] = Math.max(0, Math.min(SKILL_NODE_MAP[id].maxRank, raw.ranks[id] | 0));
      }
    }
    const state: SkillTreeState = {
      v: SKILL_TREE_VERSION,
      earned: Math.max(0, Number(raw.earned) || 0),
      ranks: validRanks,
      runs: Math.max(0, raw.runs | 0),
    };
    if ((raw.v | 0) < SKILL_TREE_VERSION) {
      const unspentOld = state.earned - sumLegacyLinearCost(raw.ranks || {});
      const newSpent = getSpentSkillPoints(state);
      state.earned = newSpent + Math.max(0, unspentOld);
      saveSkillTree(state);
    }
    return state;
  } catch {
    return createEmptySkillTreeState();
  }
}

export function saveSkillTree(tree: {
  earned: number;
  ranks: Record<string, number>;
  runs: number;
}): SkillTreeState {
  const state: SkillTreeState = {
    v: SKILL_TREE_VERSION,
    earned: tree.earned,
    ranks: tree.ranks,
    runs: tree.runs,
  };
  try {
    localStorage.setItem(SKILL_TREE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
  return state;
}

export function getBranchPointsSpent(
  tree: SkillTreeState,
  branchId: string,
  excludeNodeId?: string
): number {
  let sum = 0;
  for (const node of SKILL_NODES) {
    if (node.branch === branchId && node.id !== excludeNodeId) {
      sum += getNodeCumulativeCost(node, tree.ranks[node.id] || 0);
    }
  }
  return sum;
}

export function getCapstoneBranchRequirement(branchId: string): number {
  let sum = 0;
  for (const node of SKILL_NODES) {
    if (node.branch === branchId && !node.capstone) {
      sum += getNodeCumulativeCost(node, node.maxRank);
    }
  }
  return Math.max(8, Math.ceil(sum * 0.18));
}

export function getNodeLockReason(tree: SkillTreeState, nodeId: string): string {
  const node = SKILL_NODE_MAP[nodeId];
  if (!node) return 'unknown';
  if ((tree.ranks[nodeId] || 0) >= node.maxRank) return 'maxed';
  const nextCost = getNodeRankCost(node, (tree.ranks[nodeId] || 0) + 1);
  if (node.capstone) {
    const need = getCapstoneBranchRequirement(node.branch);
    if (getBranchPointsSpent(tree, node.branch, node.id) < need) {
      return 'needs ' + need + ' pts in branch';
    }
  }
  if (getAvailableSkillPoints(tree) < nextCost) {
    return 'needs ' + nextCost + ' pt' + (nextCost > 1 ? 's' : '');
  }
  return '';
}

export function upgradeSkillNode(tree: SkillTreeState, nodeId: string): SkillTreeState {
  if (getNodeLockReason(tree, nodeId)) return tree;
  return saveSkillTree({
    ...tree,
    ranks: {
      ...tree.ranks,
      [nodeId]: (tree.ranks[nodeId] || 0) + 1,
    },
  });
}

export function respecSkillTree(tree: SkillTreeState): SkillTreeState {
  return saveSkillTree({ ...tree, ranks: {} });
}

export function applySkillTreeBonuses<T extends Record<string, any>>(
  stats: T,
  ranks: Record<string, number> | null | undefined
): T {
  for (const node of SKILL_NODES) {
    const r = (ranks && ranks[node.id]) || 0;
    if (r > 0) {
      node.apply(stats, r);
    }
  }
  return stats;
}

export function awardRunSkillPoints(
  tree: SkillTreeState,
  runMetrics: {
    wave?: number;
    cleared?: number;
    level?: number;
    aces?: number;
    gates?: number;
  }
): { tree: SkillTreeState; pts: number } {
  const temp = { pointBonus: 0 };
  applySkillTreeBonuses(temp, tree.ranks);
  const pts = calculateRunSkillPoints({ ...runMetrics, pointBonus: temp.pointBonus });
  return {
    tree: saveSkillTree({
      ...tree,
      earned: tree.earned + pts,
      runs: tree.runs + 1,
    }),
    pts,
  };
}
