export interface EnemyArchetypeDef {
  name: string;
  colors: [string, string, string] | null;
  hp: number;
  speed: number;
  turn: number;
  scale: number;
  xp: number;
  burst: [number, number, number];
  cd: number;
  range: number;
  kind?: 'ground' | 'sea' | 'ufo' | 'airship';
  turret?: boolean;
  boss?: boolean;
  launch?: boolean;
}

export const ENEMY_ARCHETYPES: Record<string, EnemyArchetypeDef> = {
  fighter: {
    name: 'Fighter',
    colors: null,
    hp: 2,
    speed: 1,
    turn: 0.85,
    scale: 1,
    xp: 20,
    burst: [2, 3, 4],
    cd: 2.8,
    range: 320,
  },
  interceptor: {
    name: 'Interceptor',
    colors: ['#e2b81e', '#1c1c22', '#d84a2a'],
    hp: 1.4,
    speed: 1.42,
    turn: 1.12,
    scale: 0.85,
    xp: 30,
    burst: [2, 2, 3],
    cd: 2.3,
    range: 300,
  },
  bomber: {
    name: 'Bomber',
    colors: ['#5a6a40', '#d4bc80', '#9fd6df'],
    hp: 6,
    speed: 0.72,
    turn: 0.55,
    scale: 1.4,
    xp: 50,
    burst: [3, 4, 5],
    cd: 3.2,
    range: 280,
    turret: true,
  },
  ace: {
    name: 'Ace',
    colors: ['#24242e', '#e9b52c', '#ff4a3a'],
    hp: 26,
    speed: 1.15,
    turn: 1.3,
    scale: 1.55,
    xp: 300,
    burst: [5, 6, 7],
    cd: 1.7,
    range: 380,
    boss: true,
  },
  turret: {
    name: 'Gun turret',
    colors: ['#6a5a48', '#c8a060', '#3a3028'],
    hp: 8,
    speed: 0,
    turn: 0,
    scale: 1.1,
    xp: 28,
    burst: [3, 3, 4],
    cd: 2.6,
    range: 420,
    kind: 'ground',
    turret: true,
  },
  bunker: {
    name: 'Bunker',
    colors: ['#4a5240', '#8a9a70', '#2a2e24'],
    hp: 16,
    speed: 0,
    turn: 0,
    scale: 1.4,
    xp: 44,
    burst: [4, 4, 5],
    cd: 2.2,
    range: 460,
    kind: 'ground',
    turret: true,
  },
  boat: {
    name: 'Patrol boat',
    colors: ['#3a4a58', '#c8d0d8', '#e07030'],
    hp: 10,
    speed: 0.28,
    turn: 0.4,
    scale: 1.15,
    xp: 34,
    burst: [3, 3, 4],
    cd: 2.5,
    range: 400,
    kind: 'sea',
    turret: true,
  },
  gunboat: {
    name: 'Gunboat',
    colors: ['#2a3844', '#d0b070', '#e04030'],
    hp: 18,
    speed: 0.22,
    turn: 0.32,
    scale: 1.45,
    xp: 55,
    burst: [4, 5, 5],
    cd: 2,
    range: 460,
    kind: 'sea',
    turret: true,
  },
  ufo: {
    name: 'UFO',
    colors: ['#7a8a9a', '#7effc0', '#c8ff66'],
    hp: 14,
    speed: 0.95,
    turn: 1.4,
    scale: 1.2,
    xp: 70,
    burst: [3, 4, 4],
    cd: 1.8,
    range: 380,
    kind: 'ufo',
  },
  mothership: {
    name: 'Mothership',
    colors: ['#3a4a58', '#66ffc0', '#e8ff88'],
    hp: 48,
    speed: 0.55,
    turn: 0.55,
    scale: 2.4,
    xp: 420,
    burst: [6, 7, 8],
    cd: 1.4,
    range: 520,
    kind: 'ufo',
    boss: true,
  },
  dirigible: {
    name: 'Dirigible',
    colors: ['#c8b894', '#8a3a28', '#3a5a68'],
    hp: 28,
    speed: 0.22,
    turn: 0.22,
    scale: 2.15,
    xp: 90,
    burst: [2, 3, 3],
    cd: 2.4,
    range: 440,
    kind: 'airship',
    turret: true,
  },
  carrier: {
    name: 'Zeppelin carrier',
    colors: ['#6a7060', '#c8a050', '#2a3028'],
    hp: 48,
    speed: 0.16,
    turn: 0.16,
    scale: 2.85,
    xp: 240,
    burst: [3, 3, 4],
    cd: 2,
    range: 500,
    kind: 'airship',
    turret: true,
    boss: true,
    launch: true,
  },
  steampunk: {
    name: 'Steampunk airship',
    colors: ['#b08a4a', '#6a3a22', '#c8d4de'],
    hp: 38,
    speed: 0.18,
    turn: 0.18,
    scale: 2.25,
    xp: 130,
    burst: [3, 3, 4],
    cd: 2.2,
    range: 460,
    kind: 'airship',
    turret: true,
  },
  alien: {
    name: 'Alien airship',
    colors: ['#3a3a58', '#8a58ff', '#40ffc8'],
    hp: 34,
    speed: 0.2,
    turn: 0.2,
    scale: 2.2,
    xp: 140,
    burst: [2, 3, 3],
    cd: 2,
    range: 480,
    kind: 'airship',
    turret: true,
  },
};

export interface WaveStructurePlan {
  buildings: number;
  dirigibles: number;
  boats: number;
  steampunk: number;
  ufos: number;
  carrier: boolean;
  alien: number;
  mothership: boolean;
}

export function getWaveStructurePlan(wave: number): WaveStructurePlan {
  return {
    buildings: wave >= 5 ? Math.min(3, 1 + Math.floor((wave - 5) / 5)) : 0,
    dirigibles: wave >= 7 ? Math.min(2, 1 + Math.floor((wave - 7) / 6)) : 0,
    boats: wave >= 8 ? Math.min(3, 1 + Math.floor((wave - 8) / 5)) : 0,
    steampunk: wave >= 10 ? Math.min(2, 1 + Math.floor((wave - 10) / 6)) : 0,
    ufos: wave >= 11 ? Math.min(3, 1 + Math.floor((wave - 11) / 5)) : 0,
    carrier: wave >= 13 && (wave - 13) % 8 === 0,
    alien: wave >= 14 ? Math.min(2, 1 + Math.floor((wave - 14) / 6)) : 0,
    mothership: wave >= 15 && (wave - 15) % 10 === 0,
  };
}

export function buildWaveEnemyRoster(wave: number): string[] {
  const total = Math.min(8, 1 + Math.floor(wave / 1.5));
  const list: string[] = [];
  if (wave % 5 === 0) {
    list.push('ace');
    const escorts = Math.min(5, Math.floor(wave / 3));
    for (let i = 0; i < escorts; i++) {
      list.push(i % 2 && wave >= 10 ? 'interceptor' : 'fighter');
    }
    return list;
  }
  let bombers = wave >= 4 ? Math.min(3, Math.floor((wave - 1) / 3)) : 0;
  let interceptors = wave >= 3 ? Math.min(4, Math.floor((wave - 1) / 2)) : 0;
  while (bombers + interceptors > total - 1 && (bombers || interceptors)) {
    if (interceptors >= bombers) interceptors--;
    else bombers--;
  }
  for (let i = 0; i < bombers; i++) list.push('bomber');
  for (let i = 0; i < interceptors; i++) list.push('interceptor');
  while (list.length < total) list.push('fighter');
  return list;
}
