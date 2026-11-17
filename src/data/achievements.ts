import {
  AchievementDef,
  AchievementState,
  AchievementTierDef,
  AchievementUnlockEvent,
  PaintScheme,
  RgbTuple,
} from '../types/game';

export const ACHIEVEMENTS_STORAGE_KEY = 'fighter-guns-achievements';

function tier(need: number, bonus: Record<string, any>, bonusText: string): AchievementTierDef {
  return { need, bonus, bonusText };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'kills',
    name: 'Trigger finger',
    desc: 'Destroy enemies',
    stat: 'kills',
    tiers: [
      tier(10, { gunDamage: 0.02 }, '+2% gun damage'),
      tier(50, { gunDamage: 0.02 }, '+2% gun damage'),
      tier(150, { gunDamage: 0.03 }, '+3% gun damage'),
      tier(400, { fireRate: 1.03 }, '+3% rate of fire'),
      tier(1000, { gunDamage: 0.04 }, '+4% gun damage'),
    ],
  },
  {
    id: 'waves',
    name: 'Wave rider',
    desc: 'Clear waves',
    stat: 'waves',
    tiers: [
      tier(5, { hullMax: 5 }, '+5 hull'),
      tier(15, { hullMax: 5 }, '+5 hull'),
      tier(30, { hullMax: 8 }, '+8 hull'),
      tier(60, { regenRate: 0.5 }, '+0.5 hull/s repair'),
      tier(100, { hullMax: 12 }, '+12 hull'),
    ],
  },
  {
    id: 'aces',
    name: 'Ace hunter',
    desc: 'Shoot down aces',
    stat: 'aces',
    tiers: [
      tier(1, { missileDmgMul: 0.03 }, '+3% missile damage'),
      tier(5, { bigGameMul: 0.04 }, '+4% vs aces and bombers'),
      tier(15, { missileDmgMul: 0.04 }, '+4% missile damage'),
      tier(30, { assistMul: 0.05 }, '+5% lock cone'),
      tier(50, { paint: 'ace' }, 'black-and-gold ace paint'),
    ],
  },
  {
    id: 'ufos',
    name: 'Saucer scare',
    desc: 'Destroy UFOs',
    stat: 'ufos',
    tiers: [
      tier(3, { ufoDmg: 0.06 }, '+6% damage to UFOs'),
      tier(10, { ufoDmg: 0.06 }, '+6% damage to UFOs'),
      tier(25, { armor: 0.015 }, '\u22121.5% damage taken'),
      tier(50, { ufoDmg: 0.08 }, '+8% damage to UFOs'),
      tier(80, { startGun: 'spirit' }, 'start runs with Spirit Wave I'),
    ],
  },
  {
    id: 'buildings',
    name: 'Demolition',
    desc: 'Destroy turret buildings',
    stat: 'buildings',
    tiers: [
      tier(5, { gunDamage: 0.02 }, '+2% gun damage'),
      tier(20, { gunDamage: 0.02 }, '+2% gun damage'),
      tier(50, { hullMax: 6 }, '+6 hull'),
      tier(100, { gunDamage: 0.03 }, '+3% gun damage'),
      tier(200, { trail: 'ember' }, 'ember wingtip trails'),
    ],
  },
  {
    id: 'boats',
    name: 'Keelhaul',
    desc: 'Sink turret boats',
    stat: 'boats',
    tiers: [
      tier(5, { armor: 0.012 }, '\u22121.2% damage taken'),
      tier(20, { armor: 0.012 }, '\u22121.2% damage taken'),
      tier(50, { hullMax: 6 }, '+6 hull'),
      tier(100, { armor: 0.015 }, '\u22121.5% damage taken'),
      tier(200, { trail: 'sea' }, 'sea-green wingtip trails'),
    ],
  },
  {
    id: 'airships',
    name: 'Airship ace',
    desc: 'Bring down dirigibles',
    stat: 'airships',
    tiers: [
      tier(3, { airshipDmg: 0.06 }, '+6% damage to airships'),
      tier(10, { airshipDmg: 0.06 }, '+6% damage to airships'),
      tier(20, { hullMax: 6 }, '+6 hull'),
      tier(40, { airshipDmg: 0.08 }, '+8% damage to airships'),
      tier(75, { trail: 'gas' }, 'gaslight wingtip trails'),
    ],
  },
  {
    id: 'steampunks',
    name: 'Brass hat',
    desc: 'Bring down steampunk airships',
    stat: 'steampunks',
    tiers: [
      tier(2, { airshipDmg: 0.05 }, '+5% damage to airships'),
      tier(6, { armor: 0.012 }, '\u22121.2% damage taken'),
      tier(12, { hullMax: 6 }, '+6 hull'),
      tier(20, { airshipDmg: 0.06 }, '+6% damage to airships'),
      tier(35, { trail: 'brass' }, 'brass wingtip trails'),
    ],
  },
  {
    id: 'alienships',
    name: 'Violet ace',
    desc: 'Bring down alien airships',
    stat: 'alienships',
    tiers: [
      tier(2, { airshipDmg: 0.05 }, '+5% damage to airships'),
      tier(6, { ufoDmg: 0.04 }, '+4% damage to UFOs'),
      tier(12, { hullMax: 6 }, '+6 hull'),
      tier(20, { airshipDmg: 0.06 }, '+6% damage to airships'),
      tier(35, { paint: 'violet' }, 'violet sheen paint'),
    ],
  },
  {
    id: 'gates',
    name: 'Gate runner',
    desc: 'Fly through light gates',
    stat: 'gates',
    tiers: [
      tier(10, { xpMul: 0.03 }, '+3% XP'),
      tier(40, { xpMul: 0.03 }, '+3% XP'),
      tier(100, { startLv: 1 }, 'gate weapons start +1 level'),
      tier(250, { xpMul: 0.04 }, '+4% XP'),
      tier(500, { startGun: 'cannon' }, 'start runs with Main guns I'),
    ],
  },
  {
    id: 'streak',
    name: 'On a roll',
    desc: 'Best kill streak in a run',
    stat: 'bestStreak',
    tiers: [
      tier(5, { fireRate: 1.02 }, '+2% rate of fire'),
      tier(10, { fireRate: 1.02 }, '+2% rate of fire'),
      tier(20, { gunDamage: 0.03 }, '+3% gun damage'),
      tier(35, { fireRate: 1.03 }, '+3% rate of fire'),
      tier(50, { gunDamage: 0.04 }, '+4% gun damage'),
    ],
  },
  {
    id: 'score',
    name: 'High score',
    desc: 'Best score in a run',
    stat: 'bestScore',
    tiers: [
      tier(5000, { xpMul: 0.02 }, '+2% XP'),
      tier(20000, { trail: 'gold' }, 'gold wingtip trails'),
      tier(75000, { gunDamage: 0.03 }, '+3% gun damage'),
      tier(200000, { paint: 'gold' }, 'gilded jet paint'),
      tier(500000, { pointBonus: 1 }, '+1 skill point per run'),
    ],
  },
  {
    id: 'level',
    name: 'Climb',
    desc: 'Highest level reached in a run',
    stat: 'bestLevel',
    tiers: [
      tier(5, { assistMul: 0.04 }, '+4% aim assist'),
      tier(10, { assistMul: 0.04 }, '+4% aim assist'),
      tier(15, { xpMul: 0.03 }, '+3% XP'),
      tier(25, { hullMax: 8 }, '+8 hull'),
      tier(40, { pointBonus: 1 }, '+1 skill point per run'),
    ],
  },
  {
    id: 'runs',
    name: 'Frequent flyer',
    desc: 'Finish runs',
    stat: 'runs',
    tiers: [
      tier(3, { hullMax: 4 }, '+4 hull'),
      tier(10, { regenRate: 0.4 }, '+0.4 hull/s repair'),
      tier(25, { armor: 0.012 }, '\u22121.2% damage taken'),
      tier(50, { paint: 'ivory' }, 'ivory-trim paint'),
      tier(100, { pointBonus: 1 }, '+1 skill point per run'),
    ],
  },
  {
    id: 'spent',
    name: 'Investor',
    desc: 'Spend skill-tree points',
    stat: 'spent',
    tiers: [
      tier(20, { xpMul: 0.02 }, '+2% XP'),
      tier(60, { gunDamage: 0.02 }, '+2% gun damage'),
      tier(120, { missileDmgMul: 0.03 }, '+3% missile damage'),
      tier(200, { hullMax: 8 }, '+8 hull'),
      tier(280, { startGun: 'lumen' }, 'start runs with Lumen Lance I'),
    ],
  },
  {
    id: 'boosts',
    name: 'Afterburner',
    desc: 'Kick the power boost',
    stat: 'boosts',
    tiers: [
      tier(15, { boostMax: 1.04 }, '+4% boost tank'),
      tier(50, { boostSpeedMul: 1.04 }, '+4% boost speed'),
      tier(150, { boostMax: 1.05 }, '+5% boost tank'),
      tier(400, { boostRegen: 1.06 }, '+6% boost refill'),
      tier(800, { boostSpeedMul: 1.05 }, '+5% boost speed'),
    ],
  },
  {
    id: 'droneKills',
    name: 'Wingman',
    desc: 'Kills scored by your drones',
    stat: 'droneKills',
    tiers: [
      tier(10, { droneDamage: 1.05 }, '+5% drone damage'),
      tier(40, { droneDamage: 1.05 }, '+5% drone damage'),
      tier(100, { droneRate: 1.05 }, '+5% drone fire rate'),
      tier(250, { droneRange: 1.08 }, '+8% drone range'),
      tier(500, { droneDamage: 1.08 }, '+8% drone damage'),
    ],
  },
  {
    id: 'chains',
    name: 'Thunderer',
    desc: 'Land chain-lightning jumps',
    stat: 'chains',
    tiers: [
      tier(15, { chainDmg: 1.05 }, '+5% chain damage'),
      tier(60, { chainDmg: 1.05 }, '+5% chain damage'),
      tier(150, { chainRange: 1.08 }, '+8% chain range'),
      tier(400, { chainDmg: 1.06 }, '+6% chain damage'),
      tier(800, { chainChance: 0.03 }, '+3% chain chance'),
    ],
  },
  {
    id: 'clean',
    name: 'Untouchable',
    desc: 'Clear a wave without taking a hit',
    stat: 'cleanWaves',
    tiers: [
      tier(1, { armor: 0.01 }, '\u22121% damage taken'),
      tier(5, { armor: 0.012 }, '\u22121.2% damage taken'),
      tier(15, { hullMax: 6 }, '+6 hull'),
      tier(30, { armor: 0.015 }, '\u22121.5% damage taken'),
      tier(50, { regenRate: 0.6 }, '+0.6 hull/s repair'),
    ],
  },
  {
    id: 'wepCannon',
    name: 'Calibrated',
    desc: 'Use Main guns from a light gate',
    stat: 'use_cannon',
    tiers: [
      tier(1, { gunDamage: 0.02 }, '+2% gun damage'),
      tier(25, { gunDamage: 0.03 }, '+3% gun damage'),
    ],
  },
  {
    id: 'wepAnime',
    name: 'Anime arsenal',
    desc: 'Use an anime-inspired special gun',
    stat: 'use_anime',
    tiers: [
      tier(1, { gunDamage: 0.02 }, '+2% gun damage'),
      tier(20, { startLv: 1 }, 'gate weapons start +1 level'),
    ],
  },
  {
    id: 'wepMsl',
    name: 'Special payload',
    desc: 'Fire a square-gate special missile',
    stat: 'use_specmsl',
    tiers: [
      tier(1, { missileDmgMul: 0.03 }, '+3% missile damage'),
      tier(30, { missileDmgMul: 0.04 }, '+4% missile damage'),
    ],
  },
  {
    id: 'wepShield',
    name: 'Soft kill',
    desc: 'Pick up a triangle shield',
    stat: 'use_shield',
    tiers: [
      tier(1, { armor: 0.01 }, '\u22121% damage taken'),
      tier(20, { armor: 0.015 }, '\u22121.5% damage taken'),
    ],
  },
  {
    id: 'firstMother',
    name: 'First contact',
    desc: 'Destroy a UFO mothership',
    stat: 'motherships',
    hidden: true,
    tiers: [tier(1, { ufoDmg: 0.1, paint: 'saucer' }, '+10% vs UFOs \xB7 saucer sheen')],
  },
  {
    id: 'hindenburg',
    name: 'Hindenburg-free',
    desc: 'Destroy a zeppelin carrier',
    stat: 'carriers',
    hidden: true,
    tiers: [tier(1, { airshipDmg: 0.1, paint: 'linen' }, '+10% vs airships \xB7 linen envelope paint')],
  },
  {
    id: 'maxedGun',
    name: 'Overcharged',
    desc: 'Hold a special gun at level 8',
    stat: 'maxGun',
    hidden: true,
    tiers: [tier(1, { gunDamage: 0.04 }, '+4% gun damage')],
  },
  {
    id: 'fullHouse',
    name: 'Full house',
    desc: 'Hold a special gun, missile and shield at the same time',
    stat: 'fullHouse',
    hidden: true,
    tiers: [tier(1, { hullMax: 10 }, '+10 hull')],
  },
  {
    id: 'closeAce',
    name: 'Close call',
    desc: 'Finish an ace inside 50 units',
    stat: 'closeAce',
    hidden: true,
    tiers: [tier(1, { bigGameMul: 0.06 }, '+6% vs aces and bombers')],
  },
  {
    id: 'picks8',
    name: 'Overachiever',
    desc: 'Take 8 in-run upgrade cards in one run',
    stat: 'maxPicks',
    hidden: true,
    tiers: [tier(8, { xpMul: 0.05 }, '+5% XP')],
  },
  {
    id: 'splashdown',
    name: 'Splashdown',
    desc: 'Crash while over open water',
    stat: 'waterCrash',
    hidden: true,
    tiers: [tier(1, { trail: 'sea' }, 'sea-green wingtip trails')],
  },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

export const TOTAL_ACHIEVEMENT_TIERS = ACHIEVEMENTS.reduce((sum, a) => sum + a.tiers.length, 0);

export function createEmptyAchievementState(): AchievementState {
  return { stats: {}, unlocked: {}, seen: true };
}

export function loadAchievements(): AchievementState {
  try {
    const raw = JSON.parse(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return createEmptyAchievementState();
    return {
      stats: raw.stats && typeof raw.stats === 'object' ? raw.stats : {},
      unlocked: raw.unlocked && typeof raw.unlocked === 'object' ? raw.unlocked : {},
      seen: !!raw.seen,
    };
  } catch {
    return createEmptyAchievementState();
  }
}

export function saveAchievements(state: AchievementState): AchievementState {
  try {
    localStorage.setItem(
      ACHIEVEMENTS_STORAGE_KEY,
      JSON.stringify({
        stats: state.stats || {},
        unlocked: state.unlocked || {},
        seen: true,
      })
    );
  } catch {
    // ignore storage errors
  }
  return state;
}

export function evaluateAchievementUnlocks(
  state: AchievementState,
  statKey: string | null = null
): AchievementUnlockEvent[] {
  const events: AchievementUnlockEvent[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (statKey && ach.stat !== statKey) continue;
    const val = Number(state.stats[ach.stat]) || 0;
    const prevTier = state.unlocked[ach.id] | 0;
    let newTier = prevTier;
    for (let i = prevTier; i < ach.tiers.length && val >= ach.tiers[i].need; i++) {
      newTier = i + 1;
    }
    if (newTier > prevTier) {
      state.unlocked[ach.id] = newTier;
      for (let t = prevTier + 1; t <= newTier; t++) {
        events.push({
          id: ach.id,
          tier: t,
          def: ach,
          row: ach.tiers[t - 1],
        });
      }
    }
  }
  return events;
}

export function recordAchievementStat(
  state: AchievementState,
  statKey: string,
  amount = 1,
  mode: 'add' | 'max' = 'add'
): AchievementUnlockEvent[] {
  const prev = Number(state.stats[statKey]) || 0;
  const next = mode === 'max' ? Math.max(prev, amount) : prev + amount;
  if (next === prev) return [];
  state.stats[statKey] = next;
  return evaluateAchievementUnlocks(state, statKey);
}

export function formatAchievementTierName(def: AchievementDef, tierNum: number): string {
  if (def.tiers.length <= 1) return def.name;
  const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  return def.name + ' ' + (numerals[tierNum] || String(tierNum));
}

export function getUnlockedAchievementCount(state: AchievementState): number {
  let count = 0;
  for (const ach of ACHIEVEMENTS) {
    count += state.unlocked[ach.id] | 0;
  }
  return count;
}

const MULTIPLICATIVE_ACHIEVEMENT_STATS = new Set([
  'fireRate',
  'xpMul',
  'boostMax',
  'boostSpeedMul',
  'boostRegen',
  'droneDamage',
  'droneRate',
  'droneRange',
  'chainDmg',
  'chainRange',
]);

export function applyAchievementBonuses<T extends Record<string, any>>(
  stats: T,
  achieve: AchievementState | null | undefined
): T {
  if (!achieve) return stats;
  const paints: string[] = [];
  const trails: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    const unlockedCount = achieve.unlocked[ach.id] | 0;
    for (let i = 0; i < unlockedCount; i++) {
      const bonus = ach.tiers[i].bonus || {};
      for (const key in bonus) {
        const val = bonus[key];
        if (key === 'paint') {
          paints.push(val);
          continue;
        }
        if (key === 'trail') {
          trails.push(val);
          continue;
        }
        if (key === 'startGun') {
          (stats as any).startGun = (stats as any).startGun || val;
          continue;
        }
        if (key === 'startLv') {
          (stats as any).achieveStartLv = ((stats as any).achieveStartLv || 0) + val;
          continue;
        }
        if (key === 'ufoDmg') {
          (stats as any).ufoDmg = ((stats as any).ufoDmg || 1) + val;
          continue;
        }
        if (key === 'airshipDmg') {
          (stats as any).airshipDmg = ((stats as any).airshipDmg || 1) + val;
          continue;
        }
        if (key === 'chainChance') {
          (stats as any).chainChance = ((stats as any).chainChance || 0) + val;
          continue;
        }
        if (key === 'pointBonus') {
          (stats as any).pointBonus = ((stats as any).pointBonus || 0) + val;
          continue;
        }
        if (key === 'bigGameMul') {
          (stats as any).bigGameMul = ((stats as any).bigGameMul || 1) + val;
          continue;
        }
        if (key === 'armor') {
          (stats as any).armor = Math.min(0.6, ((stats as any).armor || 0) + val);
          continue;
        }
        if (MULTIPLICATIVE_ACHIEVEMENT_STATS.has(key)) {
          (stats as any)[key] = ((stats as any)[key] || 1) * val;
          continue;
        }
        if (typeof val === 'number') {
          (stats as any)[key] = ((stats as any)[key] || 0) + val;
        }
      }
    }
  }
  if (paints.length) (stats as any).achievePaint = paints[paints.length - 1];
  if (trails.length) (stats as any).achieveTrail = trails[trails.length - 1];
  return stats;
}

export const UNLOCKABLE_PAINTS: Record<string, PaintScheme> = {
  ace: { body: '#24242e', accent: '#e9b52c', canopy: '#ff4a3a' },
  gold: { body: '#6a5a28', accent: '#f0d060', canopy: '#1e8ca0' },
  ivory: { body: '#d8d0c0', accent: '#f0580e', canopy: '#1e8ca0' },
  saucer: { body: '#3a4a58', accent: '#7effc0', canopy: '#c8ff66' },
  linen: { body: '#c8b894', accent: '#8a3a28', canopy: '#3a5a68' },
  violet: { body: '#3a3a58', accent: '#8a58ff', canopy: '#40ffc8' },
};

export const UNLOCKABLE_TRAILS: Record<string, [RgbTuple, RgbTuple, RgbTuple]> = {
  gold: [
    [255, 230, 120],
    [220, 180, 60],
    [140, 100, 30],
  ],
  ember: [
    [255, 160, 60],
    [220, 80, 30],
    [120, 30, 16],
  ],
  sea: [
    [120, 255, 220],
    [40, 180, 170],
    [16, 80, 90],
  ],
  gas: [
    [255, 210, 120],
    [200, 130, 40],
    [90, 40, 16],
  ],
  brass: [
    [230, 180, 80],
    [160, 100, 30],
    [70, 40, 16],
  ],
};
