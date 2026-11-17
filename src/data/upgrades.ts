import { AchievementState, RunUpgradeDef } from '../types/game';
import { formatCompactNumber, percentDelta } from '../utils/math';
import { applyAchievementBonuses, loadAchievements } from './achievements';
import { applySkillTreeBonuses, BASE_SKILL_STATS } from './skillTree';
import { SPECIAL_WEAPONS } from './weapons';

export const BASE_RUN_STATS = {
  ...BASE_SKILL_STATS,
  gunDamage: 1,
  fireRate: 6.5,
  heatPerVolley: 0.068,
  coolMul: 1,
  barrels: 2,
  spread: 0,
  tracerLen: 1,
  flashSize: 1,
  missileMax: 8,
  missileReload: 7,
  salvo: 1,
  hullMax: 150,
  regenRate: 4,
  regenDelay: 5,
  armor: 0,
  speedMul: 1,
  boostMul: 1,
  turnMul: 1,
  assistMul: 1,
};

export const RUN_UPGRADES: RunUpgradeDef[] = [
  {
    id: 'gunDamage',
    name: 'Heavy rounds',
    desc: '+25% gun damage \xB7 fatter tracers, bigger flashes',
    maxRank: 5,
    tags: ['guns'],
    apply: (t) => {
      t.gunDamage += 0.25;
      t.tracerLen += 0.2;
      t.flashSize += 0.3;
    },
  },
  {
    id: 'fireRate',
    name: 'Rapid feed',
    desc: '+12% rate of fire',
    maxRank: 4,
    tags: ['guns'],
    apply: (t) => {
      t.fireRate *= 1.12;
    },
  },
  {
    id: 'cooling',
    name: 'Cooling jacket',
    desc: '\u221218% heat per volley \xB7 +20% cooling',
    maxRank: 4,
    tags: ['guns'],
    apply: (t) => {
      t.heatPerVolley *= 0.82;
      t.coolMul *= 1.2;
    },
  },
  {
    id: 'barrels',
    name: 'Spread cannons',
    desc: 'Twin \u2192 triple \u2192 quad guns, splayed',
    maxRank: 2,
    tags: ['guns'],
    weight: 1.3,
    apply: (t, rank) => {
      t.barrels = 2 + rank;
      t.spread = 0.03 * rank;
    },
  },
  {
    id: 'missileCap',
    name: 'Missile racks',
    desc: '+2 missiles (refills them)',
    maxRank: 3,
    tags: ['missiles'],
    apply: (t) => {
      t.missileMax += 2;
    },
    onPick: (ctx) => ctx.refillMissiles(),
  },
  {
    id: 'missileReload',
    name: 'Fast reload',
    desc: 'Missiles reload 25% faster',
    maxRank: 3,
    tags: ['missiles'],
    apply: (t) => {
      t.missileReload *= 0.75;
    },
  },
  {
    id: 'salvo',
    name: 'Salvo',
    desc: '+1 missile per launch, each to its own target',
    maxRank: 2,
    tags: ['missiles'],
    apply: (t) => {
      t.salvo += 1;
    },
  },
  {
    id: 'hull',
    name: 'Reinforced hull',
    desc: '+25 max hull \xB7 repairs half the hull',
    maxRank: 4,
    tags: ['defence'],
    apply: (t) => {
      t.hullMax += 25;
    },
    onPick: (ctx) => ctx.heal(ctx.hullMax * 0.5),
  },
  {
    id: 'regen',
    name: 'Auto-repair',
    desc: '+2.5 hull/s regen, starts 1 s sooner',
    maxRank: 3,
    tags: ['defence'],
    apply: (t) => {
      t.regenRate += 2.5;
      t.regenDelay = Math.max(2, t.regenDelay - 1);
    },
  },
  {
    id: 'armor',
    name: 'Armor plating',
    desc: '\u221210% damage taken',
    maxRank: 4,
    tags: ['defence'],
    apply: (t) => {
      t.armor = Math.min(0.55, t.armor + 0.1);
    },
  },
  {
    id: 'thrust',
    name: 'Afterburner',
    desc: '+8% top speed \xB7 +15% thruster boost',
    maxRank: 3,
    tags: ['flight'],
    apply: (t) => {
      t.speedMul += 0.08;
      t.boostMul += 0.15;
    },
  },
  {
    id: 'turn',
    name: 'Control surfaces',
    desc: '+12% turn rate',
    maxRank: 3,
    tags: ['flight'],
    apply: (t) => {
      t.turnMul += 0.12;
    },
  },
  {
    id: 'assist',
    name: 'Targeting computer',
    desc: '+30% aim assist and missile lock cone',
    maxRank: 3,
    tags: ['guns', 'missiles'],
    apply: (t) => {
      t.assistMul += 0.3;
    },
  },
  {
    id: 'droneOverclock',
    name: 'Drone overclock',
    desc: '+18% drone damage and fire rate',
    maxRank: 2,
    tags: ['drones'],
    weight: 1.15,
    when: (t) => t.drones >= 1,
    apply: (t) => {
      t.droneDamage *= 1.18;
      t.droneRate *= 1.18;
    },
  },
  {
    id: 'droneMesh',
    name: 'Mesh uplink',
    desc: '+25% drone range \xB7 drones respawn 20% faster',
    maxRank: 2,
    tags: ['drones'],
    when: (t) => t.drones >= 1,
    apply: (t) => {
      t.droneRange *= 1.25;
      t.droneRespawn = (t.droneRespawn || 1) * 0.8;
    },
  },
];

export const RUN_UPGRADE_MAP: Record<string, RunUpgradeDef> = Object.fromEntries(
  RUN_UPGRADES.map((u) => [u.id, u])
);

export const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function getXpNeededForLevel(level: number): number {
  const n = level - 1;
  return Math.round(120 + 70 * n + 14 * n * n);
}

export function computeRunStats(
  takenIds: string[],
  skillRanks: Record<string, number> | null = null,
  achieveState: AchievementState | null = null
): Record<string, any> {
  const stats = applySkillTreeBonuses(
    {
      ...BASE_RUN_STATS,
      droneRespawn: 1,
      ufoDmg: 1,
      achieveStartLv: 0,
    } as Record<string, any>,
    skillRanks
  );
  applyAchievementBonuses(
    stats,
    achieveState || (typeof localStorage !== 'undefined' ? loadAchievements() : null)
  );
  const rankCounter: Record<string, number> = {};
  for (const id of takenIds) {
    const def = RUN_UPGRADE_MAP[id];
    if (def) {
      rankCounter[id] = (rankCounter[id] || 0) + 1;
      def.apply(stats, rankCounter[id]);
    }
  }
  return stats;
}

export function pickUpgradeOffers(
  currentRanks: Record<string, number>,
  rng: () => number,
  count = 3,
  stats: Record<string, any> | null = null
): RunUpgradeDef[] {
  const pool = RUN_UPGRADES.filter(
    (u) => (currentRanks[u.id] || 0) < u.maxRank && (!u.when || u.when(stats || BASE_RUN_STATS))
  );
  const picked: RunUpgradeDef[] = [];
  while (picked.length < count && pool.length) {
    let totalWeight = 0;
    for (const item of pool) {
      totalWeight += item.weight || 1;
    }
    let roll = rng() * totalWeight;
    let idx = 0;
    while (idx < pool.length - 1) {
      roll -= pool[idx].weight || 1;
      if (roll <= 0) break;
      idx++;
    }
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

export function describeActiveSkillBonuses(skillRanks: Record<string, number>): string[] {
  const base = computeRunStats([]);
  const mod = computeRunStats([], skillRanks);
  const list: string[] = [];
  const pushIf = (cond: any, label: string) => {
    if (cond) list.push(label);
  };
  pushIf(
    mod.gunDamage !== base.gunDamage,
    'Gun dmg +' + formatCompactNumber(percentDelta(mod.gunDamage, base.gunDamage), 1) + '%'
  );
  pushIf(
    mod.fireRate !== base.fireRate,
    'Fire rate +' + formatCompactNumber(percentDelta(mod.fireRate, base.fireRate), 1) + '%'
  );
  pushIf(
    mod.heatPerVolley !== base.heatPerVolley,
    'Heat ' + formatCompactNumber(percentDelta(mod.heatPerVolley, base.heatPerVolley), 1) + '%'
  );
  pushIf(
    mod.assistMul !== base.assistMul,
    'Assist +' + formatCompactNumber(percentDelta(mod.assistMul, base.assistMul), 1) + '%'
  );
  pushIf(mod.bigGameMul > 1, 'Big-game +' + formatCompactNumber(percentDelta(mod.bigGameMul, 1), 1) + '%');
  pushIf(
    mod.missileMax !== base.missileMax,
    'Missiles +' + formatCompactNumber(mod.missileMax - base.missileMax, 1)
  );
  pushIf(
    mod.missileReload !== base.missileReload,
    'Reload ' + formatCompactNumber(percentDelta(mod.missileReload, base.missileReload), 1) + '%'
  );
  pushIf(
    mod.missileDmgMul > 1,
    'Msl dmg +' + formatCompactNumber(percentDelta(mod.missileDmgMul, 1), 1) + '%'
  );
  pushIf(mod.killReload, 'Hot rails');
  pushIf(mod.hullMax !== base.hullMax, 'Hull +' + formatCompactNumber(mod.hullMax - base.hullMax, 1));
  pushIf(
    mod.regenRate !== base.regenRate,
    'Repair +' + formatCompactNumber(mod.regenRate - base.regenRate, 1) + '/s'
  );
  pushIf(mod.armor !== base.armor, 'Armor ' + formatCompactNumber(mod.armor * 100, 1) + '%');
  pushIf(
    mod.turnMul !== base.turnMul,
    'Turn +' + formatCompactNumber(percentDelta(mod.turnMul, base.turnMul), 1) + '%'
  );
  pushIf(mod.secondWind, 'Second wind');
  pushIf(mod.drones, formatCompactNumber(mod.drones, 1) + ' drone' + (mod.drones > 1 ? 's' : ''));
  pushIf(
    mod.droneDamage !== base.droneDamage,
    'Drone dmg +' + formatCompactNumber(percentDelta(mod.droneDamage, base.droneDamage), 1) + '%'
  );
  pushIf(
    mod.droneRate !== base.droneRate,
    'Drone rate +' + formatCompactNumber(percentDelta(mod.droneRate, base.droneRate), 1) + '%'
  );
  pushIf(
    mod.droneRange !== base.droneRange,
    'Drone range +' + formatCompactNumber(percentDelta(mod.droneRange, base.droneRange), 1) + '%'
  );
  pushIf(mod.droneScreen, 'Point defense');
  pushIf(mod.dronePhoenix, 'Phoenix protocol');
  pushIf(mod.xpMul !== base.xpMul, 'XP +' + formatCompactNumber(percentDelta(mod.xpMul, base.xpMul), 1) + '%');
  pushIf(mod.pointBonus, '+' + formatCompactNumber(mod.pointBonus, 1) + ' pt/run');
  pushIf(mod.lockDelay !== base.lockDelay, 'Faster lock');
  pushIf(mod.battleNet, 'Battle network');
  pushIf(
    mod.flareMax,
    formatCompactNumber(mod.flareMax, 1) + ' flare' + (mod.flareMax > 1 ? 's' : '')
  );
  pushIf(mod.empMax, 'EMP');
  pushIf(
    mod.specialCd !== base.specialCd,
    'Special CD ' + formatCompactNumber(percentDelta(mod.specialCd, base.specialCd), 1) + '%'
  );
  pushIf(mod.thunderstrike, 'Thunderstrike');
  pushIf(mod.chainChance > 0, 'Chain lightning ' + formatCompactNumber(mod.chainChance * 100, 1) + '%');
  pushIf(mod.chainCap, 'Thunderhead');
  pushIf(
    mod.gateCount,
    '+' + formatCompactNumber(mod.gateCount, 1) + ' gate' + (mod.gateCount > 1 ? 's' : '') + '/wave'
  );
  pushIf(
    mod.boostMax !== base.boostMax,
    'Boost tank +' + formatCompactNumber(percentDelta(mod.boostMax, base.boostMax), 1) + '%'
  );
  pushIf(
    mod.boostRegen !== base.boostRegen,
    'Boost refill +' + formatCompactNumber(percentDelta(mod.boostRegen, base.boostRegen), 1) + '%'
  );
  pushIf(
    mod.boostSpeedMul !== base.boostSpeedMul,
    'Boost speed +' + formatCompactNumber(percentDelta(mod.boostSpeedMul, base.boostSpeedMul), 1) + '%'
  );
  pushIf(mod.boostIframe, 'Jink');
  pushIf(mod.boostLock, 'Break lock');
  pushIf(mod.boostCap, 'Sonic boom');

  const specials = Object.values(SPECIAL_WEAPONS)
    .filter(
      (w) =>
        (mod[w.id === 'torpedo' ? 'torpDur' : w.id === 'singularity' ? 'singDur' : w.id + 'Dur'] || 0) > 0
    )
    .map((w) => w.name);
  pushIf(specials.length, 'Specials: ' + specials.join(', '));
  return list;
}
