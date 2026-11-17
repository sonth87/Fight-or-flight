import { SoundSynthesizer } from "../audio/soundEngine";
import {
  BAYER_4X4 as x1,
  CLOUD_ALTITUDE as Qs,
  CLOUD_LAYERS as Tr,
  CLOUD_MASK as vr,
  CLOUD_SHIFT as Hh,
  CLOUD_SIZE as Ns,
  COCKPIT_EYE_FORWARD as Ih,
  COCKPIT_EYE_UP as Fw,
  FAR_CLIP_BASE as Kw,
  FLAME_DATA_STRIDE as Vh,
  FLAME_LENGTH_SCALE as Jw,
  FOG_START_BASE as Zw,
  FOG_STEPS as TA,
  HORIZON_EPSILON as BA,
  JET_NOSE_OFFSET as ha,
  JET_SLICE_MID as uc,
  MAX_RENDER_ALTITUDE as wr,
  MAX_WEBGL_FLAMES as y1,
  NOZZLE_RADIUS as qh,
  NOZZLE_X_OFFSET as Gh,
  NOZZLE_Y_BACK as d1,
  NOZZLE_Z_SLICE as Yh,
  PUFF_CAPACITY as h1,
  PUFF_STRIDE as m1,
  SKY_BANDS as Sr,
  SUN_COLOR_DAY as Ww,
  SUN_COLOR_NIGHT as $w,
  SUN_COLOR_SUNSET as Pw,
  TAP_MAX_DURATION as CA,
  TERRAIN_PALETTE_COUNT as e0,
  TERRAIN_SIDE_COLORS as e6,
  TERRAIN_TOP_COLORS as kA,
  TRAIL_CAPACITY as Si,
  WINGTIP_X_OFFSET as p1,
  WINGTIP_Y_BACK as EA,
  WINGTIP_Z_SLICE as zA,
  WORLD_MASK as Sn,
  WORLD_SHIFT as Rs,
  WORLD_SIZE as ma,
} from "../config/defaults";
import {
  formatAchievementTierName as a1,
  loadAchievements as Jl,
  recordAchievementStat as cA,
  saveAchievements as Zu,
  UNLOCKABLE_PAINTS as fA,
  UNLOCKABLE_TRAILS as kh,
} from "../data/achievements";
import {
  buildWaveEnemyRoster as H5,
  ENEMY_ARCHETYPES as Yn,
  getWaveStructurePlan as gm,
} from "../data/enemies";
import {
  getDifficultyScalingFromSpentPoints as eA,
  getGateBannerInfo as Bh,
  getGateDuration as Xu,
  getGateLevelMultiplier as Th,
  getMaxWeaponLevel as $f,
  getSpentSkillPoints as Qo,
  getWeaponShortLabel as Zb,
  loadSkillTree as $s,
  MAX_WEAPON_GATE_LEVEL as zh,
} from "../data/skillTree";
import {
  computeRunStats as _s,
  getXpNeededForLevel as s1,
  pickUpgradeOffers as pA,
  ROMAN_NUMERALS as hA,
  RUN_UPGRADE_MAP as l1,
  RUN_UPGRADES as n1,
} from "../data/upgrades";
import { getGateColors as No, SPECIAL_WEAPONS as Xa } from "../data/weapons";
import {
  AIRSHIP_GRID_H as Ds,
  AIRSHIP_GRID_L as Cs,
  AIRSHIP_GRID_W as Ws,
  AIRSHIP_NOSE_OFFSET as ec,
  AIRSHIP_SLICE_MID as _o,
  AIRSHIP_VOXEL_SCALE as ko,
  buildAirshipVoxels as Vu,
  createAirshipTurrets as Sh,
  getAirshipEffectVoxels as qb,
  getAirshipPropellerVoxels as Yb,
  normalizeAirshipVariant as ac,
} from "../models/airshipModel";
import {
  createJetEntity as fc,
  decodeJetSlices as Qb,
  JET_PALETTE_SPEC as Bs,
} from "../models/jetModel";
import { buildCockpitAssets as Xb, renderCockpitView as jb } from "../rendering/cockpitRenderer";
import {
  drawLaserBeam as Qh,
  drawLightningArc as Oh,
  drawMissileSprite as f1,
  drawMuzzleFlash as Uh,
  drawProjectileSprite as Nh,
  drawShockRing as wA,
  getWeaponImpactRgb as Lh,
  renderWeaponSheet as SA,
} from "../rendering/weaponRenderer";
import { GameEngineAPI, GameParams } from "../types/game";
import {
  addValueNoiseOctave as zr,
  clamp as Vt,
  createSeededRandom as DA,
  getLuminance as Er,
  hashByte as to,
  normalizeHeightmap as t6,
  packAbgr as mt,
  parseCssColor as eo,
  tintForTimeOfDay as Wl,
  wrapAngle as Fn,
} from "../utils/math";

export function createGameEngine(t: GameParams): GameEngineAPI { let e = { ...t }, a = Qb(), n = [], l = [], o = [], c = new Uint8Array(1564), h = 13; for (let s = 0; s < 13; s++) {
    let r = a[s], f = 0;
    for (let A = 0; A < r.length; A++)
        r[A] && f++;
    let u = new Float32Array(f), g = new Float32Array(f), i = new Uint8Array(f), y = 0;
    for (let A = 0; A < 46; A++)
        for (let E = 0; E < 34; E++) {
            let D = r[A * 34 + E];
            D && (u[y] = E - 33 / 2, g[y] = ha - A, i[y] = D, y++, c[A * 34 + E] = 1);
        }
    f && s < h && (h = s), n.push(u), l.push(g), o.push(i);
} let d = s => { let r = [], f = [], u = []; for (let g = 0; g < Ds; g++) {
    let i = s[g], y = 0;
    for (let C = 0; C < i.length; C++)
        i[C] && y++;
    let A = new Float32Array(y), E = new Float32Array(y), D = new Uint8Array(y), O = 0;
    for (let C = 0; C < Cs; C++)
        for (let I = 0; I < Ws; I++) {
            let nt = i[C * Ws + I];
            nt && (A[O] = I - (Ws - 1) / 2, E[O] = ec - C, D[O] = nt, O++);
        }
    r.push(A), f.push(E), u.push(D);
} return { A: r, B: f, C: u }; }, m = { linen: d(Vu("linen")), carrier: d(Vu("carrier")), steampunk: d(Vu("steampunk")), alien: d(Vu("alien")) }, x = new Int32Array(Ds), b = new Float64Array(Ds), w = { w: 34, h: 46, cells: new Uint8Array(1564) }; for (let s = 12; s >= 0; s--)
    for (let r = 0; r < 1564; r++) {
        let f = a[s][r];
        f && w.cells[r] === 0 && (w.cells[r] = 1 + Math.min(2, f - 1 >> 4));
    } let z = new Uint32Array(96), L = new Uint32Array(96), U = new Uint32Array(96), dt = 0, v = new Uint32Array(e0), B = new Uint32Array(e0), _ = new Uint32Array(e0), q = new Uint32Array(e0), bt = new Uint32Array(Tr), Dt = new Uint32Array(Tr), it = new Uint32Array(6), Mt = new Uint32Array(3), Kt = new Uint32Array(Sr), P = 0, Ht = 0, T = 0, xt = 0, Bt = 0, pt = 0, kt = 0, Nt = .45, zt = .3; function $() { let s = e.timeOfDay, r = Q && Q.achievePaint && fA[Q.achievePaint] || null, f = r ? r.body : e.bodyColor, u = r ? r.accent : e.accentColor, g = r ? r.canopy : e.canopyColor, i = { 0: { key: 4, col: eo(f, [84, 89, 105]), def: [84, 89, 105] }, 1: { key: 3, col: eo(u, [240, 88, 14]), def: [240, 88, 14] }, 2: { key: 3, col: eo(g, [30, 140, 160]), def: [30, 140, 160] } }, y = {}; for (let H of Bs) {
    let j = H[4];
    j < 3 && (H[0] - 1 & 15) === i[j].key && (y[j] = Er([H[1], H[2], H[3]]));
} let A = s === "sunset" ? .5 : s === "night" ? .16 : 0; for (let H of Bs) {
    let j = H[0], W = H[4], ct = [H[1], H[2], H[3]];
    if (W < 3) {
        let Z = i[W];
        if (!(Z.col[0] === Z.def[0] && Z.col[1] === Z.def[1] && Z.col[2] === Z.def[2])) {
            let Rt = Er(ct), Jt = y[W] || 100;
            if (Rt <= Jt) {
                let Xt = Rt / Jt;
                ct = [Z.col[0] * Xt, Z.col[1] * Xt, Z.col[2] * Xt];
            }
            else {
                let Xt = (Rt - Jt) / (255 - Jt);
                ct = [Z.col[0] + (255 - Z.col[0]) * Xt, Z.col[1] + (255 - Z.col[1]) * Xt, Z.col[2] + (255 - Z.col[2]) * Xt];
            }
        }
        ct = Wl(ct, s, A);
    }
    z[j] = mt(ct[0], ct[1], ct[2]);
} for (let H of Bs) {
    let j = H[0], W = H[4];
    L[j] = W < 3 && z[j + 1] ? z[j + 1] : z[j], U[j] = W < 3 && (j - 1 & 15) > 0 ? z[j - 1] : z[j];
} ra(s, A), yl(s, A), $l = null, Go = .3; let E = s === "night" ? [44, 64, 118] : Wl([13, 15, 26], s, .3); dt = mt(E[0], E[1], E[2]); for (let H = 0; H < e0; H++) {
    let j = Wl(kA[H], s, 1), W = Wl(e6[H], s, 1);
    v[H] = mt(j[0], j[1], j[2]), _[H] = mt(W[0], W[1], W[2]), B[H] = mt(j[0] * .62, j[1] * .67, j[2] * .8), q[H] = mt(W[0] * .62, W[1] * .67, W[2] * .8);
} for (let H = 0; H < Tr; H++) {
    let j = H / (Tr - 1), W = Math.min(1, H / 2), ct = s === "night" ? .72 : 1, Z = Wl([218 + 37 * W, 230 + 25 * W, 247 + 8 * W], s, ct), Tt = Wl([158 + 44 * j, 182 + 36 * j, 222 + 18 * j], s, ct);
    bt[H] = mt(Z[0], Z[1], Z[2]), Dt[H] = mt(Tt[0], Tt[1], Tt[2]);
} let D = s === "sunset" ? [255, 170, 110] : s === "night" ? [70, 110, 190] : [120, 190, 236], O = s === "sunset" ? [255, 226, 170] : s === "night" ? [170, 200, 240] : [236, 250, 255], C = s === "sunset" ? [255, 226, 214] : s === "night" ? [110, 140, 200] : [240, 252, 255]; Bt = mt(D[0], D[1], D[2]), pt = mt(O[0], O[1], O[2]), kt = mt(C[0], C[1], C[2]); let I = [[255, 252, 224], [255, 224, 120], [255, 164, 44], [246, 96, 20], [176, 48, 26], [96, 34, 40]]; for (let H = 0; H < 6; H++)
    it[H] = mt(I[H][0], I[H][1], I[H][2]); let nt = [Wl([255, 255, 255], s, .8), Wl([214, 232, 250], s, .8), Wl([170, 204, 240], s, .8)]; Q && Q.achieveTrail && kh[Q.achieveTrail] && (nt = kh[Q.achieveTrail].map((H?: any) => Wl(H, s, .85))); for (let H = 0; H < 3; H++)
    Mt[H] = mt(nt[H][0], nt[H][1], nt[H][2]); let ht = s === "sunset" ? [255, 198, 132] : s === "night" ? [36, 56, 110] : [198, 232, 250], yt = s === "sunset" ? [238, 122, 130] : s === "night" ? [18, 28, 70] : [122, 190, 240], S = s === "sunset" ? [84, 68, 150] : s === "night" ? [7, 10, 34] : [62, 142, 222]; for (let H = 0; H < Sr; H++) {
    let j = H / (Sr - 1), W = j < .5 ? ht : yt, ct = j < .5 ? yt : S, Z = j < .5 ? j * 2 : j * 2 - 1;
    Kt[H] = mt(W[0] + (ct[0] - W[0]) * Z, W[1] + (ct[1] - W[1]) * Z, W[2] + (ct[2] - W[2]) * Z);
} let X = s === "sunset" ? [250, 182, 134] : s === "night" ? [28, 44, 92] : [188, 224, 246]; P = mt(X[0], X[1], X[2]); let Y = Wl([138, 160, 200], s, s === "night" ? .72 : 1); Ht = mt(Y[0], Y[1], Y[2]); let F = s === "night" ? [232, 238, 255] : [255, 244, 200], ot = s === "night" ? [70, 96, 160] : [255, 222, 150]; T = mt(F[0], F[1], F[2]), xt = mt(ot[0], ot[1], ot[2]), s === "sunset" ? (Nt = .95, zt = .5) : s === "night" ? (Nt = .3, zt = .42) : (Nt = .5, zt = .32); } let lt = new Uint8Array(ma * ma), ut = new Uint8Array(ma * ma), R = new Uint8Array(Ns * Ns), N = new Uint8Array(256 * 256), K = ma / 2, G = ma / 2; function st() { let s = DA((e.seed | 0) * 7919 + 13); for (let C = 0; C < N.length; C++)
    N[C] = s() * 256 | 0; let r = new Float32Array(ma * ma); zr(r, ma, 512, .55, s), zr(r, ma, 256, 1, s), zr(r, ma, 128, .5, s), zr(r, ma, 64, .25, s), zr(r, ma, 32, .11, s), zr(r, ma, 16, .05, s), t6(r); let f = new Uint32Array(1024); for (let C = 0; C < r.length; C++)
    f[r[C] * 1023 | 0]++; let u = Vt(e.land, .02, .9), g = 0, i = 1, y = (1 - u) * r.length; for (let C = 0; C < 1024; C++)
    if (g += f[C], g >= y) {
        i = (C + 1) / 1023;
        break;
    } let A = .012, E = Math.max(.05, 1 - i - A); for (let C = 0; C < ma; C++) {
    let I = C << Rs, nt = (C - 2 & Sn) << Rs, ht = (C + 2 & Sn) << Rs;
    for (let yt = 0; yt < ma; yt++) {
        let S = I | yt, X = r[S], Y = to(S), F = X - i;
        if (F < 0) {
            let Z = -F + (Y - 128) * 4e-5;
            ut[S] = Z > .07 ? 0 : Z > .03 ? 1 : Z > .008 ? 2 : 3, lt[S] = 0;
            continue;
        }
        if (F < A) {
            ut[S] = Y < 34 ? 5 : 4, lt[S] = 0;
            continue;
        }
        let ot = (F - A) / E, H = ot < .5 ? 1 + (ot * 16 | 0) : ot < .78 ? 9 + ((ot - .5) / .07 | 0) : 13 + ((ot - .78) / .09 | 0);
        H > 15 && (H = 15), lt[S] = H <= 8 ? H * 2 : 16 + (H - 8) * 3;
        let j = r[nt | yt - 2 & Sn] - r[ht | yt + 2 & Sn], W = j < -.007, ct = j > .007;
        H >= 13 ? ut[S] = ct ? 16 : 15 : H >= 9 ? ut[S] = W ? 14 : ct || Y < 26 ? 13 : 12 : ut[S] = W ? 8 : ct || Y < 22 ? 7 : Y > 240 ? 8 : 6;
    }
} let D = 5; for (let C = 0; C < ma; C += D)
    for (let I = 0; I < ma; I += D) {
        let nt = to(C * 977 + I * 131 + 7), ht = I + (nt & 3) & Sn, yt = C + (nt >> 2 & 3) & Sn, S = yt << Rs | ht, X = ut[S];
        if (X < 6 || X > 8)
            continue;
        let Y = lt[S];
        if (Y > 14)
            continue;
        let ot = (r[(yt + 613 & Sn) << Rs | ma - 1 - ht + 911 & Sn] - i) * 30;
        if (ot <= 0 || ot * 255 < to(S + 99))
            continue;
        let H = 2 + (nt >> 4 & 1);
        for (let j = -H; j <= H; j++)
            for (let W = -H; W <= H; W++) {
                let ct = Math.sqrt(W * W + j * j);
                if (ct > H + .3)
                    continue;
                let Z = (yt + j & Sn) << Rs | ht + W & Sn;
                if (ut[Z] < 4)
                    continue;
                let Tt = Y + 1 + Math.round((1 - ct / (H + .5)) * (H + 1));
                Tt > lt[Z] && (lt[Z] = Tt, ut[Z] = ct < 1.1 ? 9 : ct < H - .5 ? 10 : 11);
            }
    } let O = -1; for (let C = 0; C < 400; C++) {
    let I = s() * ma | 0, nt = s() * ma | 0;
    if (ut[nt << Rs | I] > 2)
        continue;
    let yt = 0;
    for (let S = 0; S < 8; S++) {
        let X = I + Math.cos(S * .785) * 120 & Sn, Y = nt + Math.sin(S * .785) * 120 & Sn;
        ut[Y << Rs | X] >= 4 && yt++;
    }
    yt > O && yt <= 5 && (O = yt, K = I, G = nt);
} R.fill(0); for (let C = 0; C < 200; C++) {
    let I = C & 15, nt = s() * Ns, ht = s() * Ns, yt = .6 + s() * s() * 1.25, S = .35 + (s() - .5) * 1.3, X = (12 + s() * 24) * yt, Y = 4 + (s() * 7 | 0);
    for (let F = 0; F < Y; F++) {
        let ot = F / (Y - 1) * 2 - 1, H = nt + Math.cos(S) * ot * X + (s() - .5) * 9 * yt, j = ht + Math.sin(S) * ot * X + (s() - .5) * 9 * yt, W = (6 + s() * 8) * yt * (1 - .45 * Math.abs(ot)), ct = Vt(Math.round(W * .6), 2, Tr), Z = Math.ceil(W);
        for (let Tt = -Z; Tt <= Z; Tt++)
            for (let Rt = -Z; Rt <= Z; Rt++) {
                let Jt = (Rt * Rt + Tt * Tt) / (W * W);
                if (Jt > 1)
                    continue;
                let Xt = Math.max(1, Math.round(Math.sqrt(1 - Jt) * ct)), _e = Math.round(H) + Rt & vr, oe = (Math.round(j) + Tt & vr) << Hh | _e;
                Xt > (R[oe] & 15) && (R[oe] = I << 4 | Xt);
            }
    }
} } let V = 0, et = 0, vt = new Uint32Array(0), Ot = new Uint8ClampedArray(0), le = new Uint8Array(0), Lt = 0, Ze = 0, ze = e.spread, Ea = !1, En = 0, pn = !1, Wn = 0, Pn = 0, La = 99, Cl = 6, xn = 0, Ke = 0, dc = !1, pc = 0, Ho = 0, Pl = !1, an = 1, $n = 1; try {
    let s = JSON.parse(localStorage.getItem("fighter-guns-zoom") || "null");
    s && typeof s == "object" && (Number.isFinite(+s.chase) && (an = Math.max(.7, Math.min(2.5, +s.chase))), Number.isFinite(+s.overhead) && ($n = Math.max(.85, Math.min(1.45, +s.overhead))));
}
catch { } let tl = Jl(), Ka: any[] = [], dl = !1, zn = e.altitude, Os = 0, xs = 0, gs = 0, zi = !1, ne = { x: 0, y: 0, yaw: 0, alt: e.altitude }, oa = { x: 0, y: 0, alt: e.altitude }, Yt = [], no = new Int32Array(0), Hn = new Float32Array(0), ia = 0, Cr = new Uint32Array(0), Dl = new Uint8Array(0), hc = new Int32Array(0), Dr = new Float32Array(0), ye = 0, $l: any = null, Go = .3, Tn = 0, bs = 0, Ua = 0, Bn = 0, Yo = 0, lo = new Uint32Array(0), mc = new Uint32Array(0), kr = s => s === "cockpit" ? 2 : s === "chase" ? 1 : 0, Gn = kr(e.view), pl = [0, 0, 0], ts = [0, 0, 0]; pl.fill(Gn === 1 ? 1 : 0), ts.fill(Gn === 2 ? 1 : 0); let Ne = pl[2], ke = ts[2], Ls = 1, yc = 0, Ti = 0, Us = 0, Cn = 0, kl = 1, _l = 1, el = 0, gn = 0, Za = 1, Fa = 0, qo = 0, M1 = 0, Ue = new Float32Array(h1 * m1), al = 0, xc = 0, Rl = 0, so = 0, Bi = 1, gc = 0, Io = 0, Nl = 0, Ft = e.speed, Ci = 0, bc = 0, As = 0, k = 0, tt = new Float32Array(y1 * Vh), ee = { count: 0, data: tt }, rt = new Float32Array(y1 * 3).fill(1), za = [0, 0, 0], Ma = 430, es = 300, Ac = [mt(255, 255, 236), mt(255, 232, 120), mt(255, 176, 60)], v1 = [mt(255, 255, 255), mt(255, 250, 190), mt(255, 206, 90)], n0 = [mt(255, 214, 190), mt(255, 92, 60), mt(196, 40, 40)], w1 = [mt(220, 255, 245), mt(90, 230, 200), mt(20, 150, 140)], l0 = [mt(236, 240, 246), mt(150, 156, 170), mt(44, 47, 60)], S1 = [mt(200, 255, 240), mt(80, 220, 190), mt(20, 120, 110)], s0 = [mt(255, 250, 180), mt(255, 180, 40), mt(255, 90, 20)], hl = [mt(40, 40, 48), mt(84, 89, 105), mt(255, 164, 44), mt(30, 26, 26)], ca = mt(255, 224, 96), aa = mt(120, 255, 164), Mc = new Uint32Array(96), Ql: Record<string, any> = {}; for (let s in Yn)
    Ql[s] = { base: new Uint32Array(96), lit: new Uint32Array(96), dim: new Uint32Array(96) }; let _r = { base: new Uint32Array(96), lit: new Uint32Array(96), dim: new Uint32Array(96) }, ce: any[] = [], Ye: any[] = [], Ta: any[] = [], Hs: any[] = [], Ms: any[] = [], xa: any[] = [], ml: any[] = [], nn: any = null, Ya: any = null, M: any[] = [], qt: any[] = [], wt: any[] = [], be: any[] = [], je: any[] = [], at = DA(991), Ra = {}, oo = 0, vs = () => { let s = $s(); Ra = s.ranks, oo = eA(Qo(s)); }; vs(); let Q: Record<string, any> = _s([], Ra, tl), p: Record<string, any> = { hp: Q.hullMax, hpMax: Q.hullMax, score: 0, wave: 0, kills: 0, heat: 0, overheated: !1, ammo: Q.missileMax, reload: 0, dead: !1, deadT: 0, cause: "", banner: "", bannerT: 0, waveHelp: "", waveHelpT: 0, hitT: 9, pullUp: !1, started: !1, waveT: 3.5, waveLive: !1, firing: !1, gunT: 0, gunSide: 1, muzzleT: 0, missileSide: 1, dmgT: 0, shake: 0, foeShots: 0, shield: 3, calmT: 0, level: 1, xp: 0, pending: 0, offer: null, taken: [], ranks: {}, streak: 0, lastKillT: -99, toast: "", toastT: 0, aces: 0, secondWindUsed: !1, flare: Q.flareMax, flareReload: 0, emp: Q.empMax, empReload: 0, specGun: null, specGunLv: 0, specGunT: 0, specMsl: null, specMslLv: 0, specMslT: 0, achieveToast: "", achieveToastT: 0, achieveBonus: "", waveHit: !1, slowT: 0, specShield: null, specShieldLv: 0, specShieldT: 0, specCraft: null, specCraftLv: 0, specCraftT: 0, absorbStored: 0, plasmaCh: 0, gatesGot: 0, toastRgb: null, boostFuel: Q.boostMax, boostBurn: !1, boostIframe: 0, boostCd: 0 }, Vo = !1, Dn: any[] = [], qn: any[] = [], Di: any[] = []; function ra(s?: any, r?: any) { for (let f in Yn) {
    let u = Yn[f].colors || [e.enemyBody, e.enemyAccent, e.enemyCanopy], g = Ql[f], i = { 0: { key: 4, col: eo(u[0], [176, 48, 56]) }, 1: { key: 3, col: eo(u[1], [242, 238, 228]) }, 2: { key: 3, col: eo(u[2], [242, 182, 54]) } }, y = {};
    for (let A of Bs) {
        let E = A[4];
        E < 3 && (A[0] - 1 & 15) === i[E].key && (y[E] = Er([A[1], A[2], A[3]]));
    }
    for (let A of Bs) {
        let E = A[0], D = A[4], O = [A[1], A[2], A[3]];
        if (D < 3) {
            let C = i[D], I = Er(O), nt = y[D] || 100;
            if (I <= nt) {
                let ht = I / nt;
                O = [C.col[0] * ht, C.col[1] * ht, C.col[2] * ht];
            }
            else {
                let ht = (I - nt) / (255 - nt);
                O = [C.col[0] + (255 - C.col[0]) * ht, C.col[1] + (255 - C.col[1]) * ht, C.col[2] + (255 - C.col[2]) * ht];
            }
            O = Wl(O, s, r);
        }
        g.base[E] = mt(O[0], O[1], O[2]), Mc[E] = mt(255, 248, 230);
    }
    for (let A of Bs) {
        let E = A[0], D = A[4];
        g.lit[E] = D < 3 && g.base[E + 1] ? g.base[E + 1] : g.base[E], g.dim[E] = D < 3 && (E - 1 & 15) > 0 ? g.base[E - 1] : g.base[E];
    }
} } function yl(s?: any, r?: any) { let f = ["#2a8aa8", "#e8f6ff", "#5ef0c8"], u = _r, g = { 0: { key: 4, col: eo(f[0], [42, 138, 168]) }, 1: { key: 3, col: eo(f[1], [232, 246, 255]) }, 2: { key: 3, col: eo(f[2], [94, 240, 200]) } }, i = {}; for (let y of Bs) {
    let A = y[4];
    A < 3 && (y[0] - 1 & 15) === g[A].key && (i[A] = Er([y[1], y[2], y[3]]));
} for (let y of Bs) {
    let A = y[0], E = y[4], D = [y[1], y[2], y[3]];
    if (E < 3) {
        let O = g[E], C = Er(D), I = i[E] || 100;
        if (C <= I) {
            let nt = C / I;
            D = [O.col[0] * nt, O.col[1] * nt, O.col[2] * nt];
        }
        else {
            let nt = (C - I) / (255 - I);
            D = [O.col[0] + (255 - O.col[0]) * nt, O.col[1] + (255 - O.col[1]) * nt, O.col[2] + (255 - O.col[2]) * nt];
        }
        D = Wl(D, s, r);
    }
    u.base[A] = mt(D[0], D[1], D[2]);
} for (let y of Bs) {
    let A = y[0], E = y[4];
    u.lit[A] = E < 3 && u.base[A + 1] ? u.base[A + 1] : u.base[A], u.dim[A] = E < 3 && (A - 1 & 15) > 0 ? u.base[A - 1] : u.base[A];
} } function Ha(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any, y?: any, A = 0, E = 0) { let D = al * m1; Ue[D] = s, Ue[D + 1] = r, Ue[D + 2] = f, Ue[D + 3] = Lt, Ue[D + 4] = u, Ue[D + 5] = A, Ue[D + 6] = E, Ue[D + 7] = i, Ue[D + 8] = g, Ue[D + 9] = y, al = (al + 1) % h1; } function Ga(s?: any, r?: any, f?: any, u?: any) { let g = Ss(s), i = Fe() * (s.scale || 1); return [s.x + (r * g.rx + f * g.fx + u * g.ux) * i, s.y + (r * g.ry + f * g.fy + u * g.uy) * i, s.z + (r * g.rz + f * g.fz + u * g.uz) * i, g]; } function as(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any) { let y = null, A = 1e9; for (let E of ce) {
    if (E.dying >= 0 || i && i.has(E))
        continue;
    let D = E.x - s, O = E.y - r, C = Math.hypot(D, O);
    if (C > g || C < 4)
        continue;
    let I = Math.abs(Fn(Math.atan2(D, -O) - f));
    if (I > u)
        continue;
    let nt = I * 400 + C * .5;
    nt < A && (A = nt, y = E);
} return y; } function Gs() { p.started = !0, Mm(); } function KA(s?: any) { p.firing = !!s && !p.offer, s && Gs(); } let ZA = { heal: s => { p.hp = Math.min(p.hpMax, p.hp + s); }, refillMissiles: () => { p.ammo = Q.missileMax; }, get hullMax() { return p.hpMax; } }; function E1() { let s = Q; Q = _s(p.taken, Ra, tl), p.hpMax = Q.hullMax, p.hp = Math.min(p.hpMax, p.hp + Math.max(0, Q.hullMax - s.hullMax)), p.ammo = Math.min(Q.missileMax, p.ammo + Math.max(0, Q.missileMax - s.missileMax)); } function o0(s?: any, r?: any) { if (!(p.dead || s <= 0))
    for (p.xp += Math.round(s * Q.xpMul), p.toast = "+" + Math.round(s * Q.xpMul) + " XP" + (r ? " \xB7 " + r : ""), p.toastT = 1.8; p.xp >= s1(p.level);)
        p.xp -= s1(p.level), p.level++, p.pending++, qe("bestLevel", p.level, "max"); } function Fh() { let s = pA(p.ranks, at, 3, Q); if (!s.length) {
    p.pending = 0;
    return;
} p.offer = s.map((r?: any) => ({ id: r.id, name: r.name, desc: r.desc, rank: (p.ranks[r.id] || 0) + 1, maxRank: r.maxRank })), p.firing = !1, Ea = !1, dc = !1; } function FA(s?: any) { if (!p.offer || !p.offer[s])
    return !1; let r = p.offer[s], f = l1[r.id]; return p.ranks[r.id] = (p.ranks[r.id] || 0) + 1, p.taken.push(r.id), p.taken.length >= 8 && qe("maxPicks", 1, "max"), E1(), f.onPick && f.onPick(ZA), p.pending--, p.offer = null, p.banner = f.name + " " + hA[p.ranks[r.id]], p.bannerT = 2, p.shield = Math.max(p.shield, 1.5), p.pending > 0 && Fh(), !0; } function io() { let s = Math.max(0, p.wave - 1), r = p.taken.length + (p.wave >= 3 ? oo : 0), f = Math.max(0, s - 4); return { hp: 1 + .13 * s + .18 * f + .05 * r, dmg: Math.min(5.5, (1 + .11 * s + .2 * f) * (1 + .02 * r)), fire: 1 + .09 * s + .1 * f + .02 * r, spread: Math.max(.03, .16 - .016 * s - .003 * r), speed: Math.min(1.28, .7 + .035 * (s + 1) + .006 * r), tier: p.wave <= 2 ? 0 : p.wave <= 5 ? 1 : 2 }; } function Jh(s?: any, r?: any, f?: any, u?: any, g?: any) { let i = Ss(s), y = i.fx, A = i.fy, E = i.fz, D = Ne + ke < .5, O = Q.assistMul, C = as(s.x, s.y, s.yaw, Math.min(1.2, (D ? .6 : .45) * O), (850 + 100 * (O - 1)) * Q.lockRange); if (C) {
    let nt = Math.hypot(C.x - r, C.y - f, C.z - u) / g, ht = C.x + C.vx * nt - r, yt = C.y + C.vy * nt - f, S = C.z + C.vz * nt - u;
    if (Math.abs(Fn(Math.atan2(ht, -yt) - Math.atan2(y, -A))) < Math.min(.7, (D ? .32 : .2) * O)) {
        let Y = Math.hypot(ht, yt, S) || 1;
        y = ht / Y, A = yt / Y, E = S / Y;
    }
    else {
        let Y = Math.hypot(ht, yt) || 1, F = Math.hypot(y, A) || 1, ot = S / Y, H = Math.sqrt(1 + ot * ot);
        y = y / F / H, A = A / F / H, E = ot / H;
    }
} return [y, A, E]; } let Wh = { 2: [[-4.5, 0, -1], [4.5, 0, 1]], 3: [[-4.5, 0, -1], [0, 8, 0], [4.5, 0, 1]], 4: [[-9, -4, -2], [-4.5, 0, -1], [4.5, 0, 1], [9, -4, 2]] }; function JA(s?: any) { let r = Ma + Ft, [f, u, g] = Ga(s, 0, ha - 9, 0), [i, y, A] = Jh(s, f, u, g, r), E = Wh[Vt(Q.barrels, 2, 4)]; for (let [D, O, C] of E) {
    let [I, nt, ht] = Ga(s, D, ha - 9 + O, 0), yt = (at() - .5) * .012 + C * Q.spread * .5, S = i * Math.cos(yt) - y * Math.sin(yt), X = i * Math.sin(yt) + y * Math.cos(yt);
    Ye.push({ x: I, y: nt, z: ht, vx: S * r, vy: X * r, vz: A * r, age: 0, life: 1.5, own: 0, dmg: Q.gunDamage, special: "cannon" });
} p.muzzleT = .05, p.muzzleStyle = "cannon"; } function WA() { if (p.dead || p.offer || p.ammo <= 0 || Ze < 1.9)
    return !1; if (Gs(), p.specMsl)
    return v5(Yt[0], p.specMsl); p.ammo--; let s = Yt[0], r = new Set; for (let f = 0; f < Q.salvo; f++) {
    p.missileSide = -p.missileSide;
    let u = f === 0 && Ya ? Ya : as(s.x, s.y, s.yaw, Math.min(Math.PI, 1 * Q.assistMul), 1100 * Q.lockRange, r);
    u || (u = as(s.x, s.y, s.yaw, Math.PI, 700 * Q.lockRange, r) || Ya), u && r.add(u);
    let [g, i, y] = Ga(s, p.missileSide * (8 + f * 3), ha - 22, -2);
    Ta.push({ x: g, y: i, z: y, yaw: s.yaw + p.missileSide * .06 * f, vz: 0, sp: Math.max(60, Ft), age: -f * .08, puffT: 0, target: u });
} return !0; } let PA = { wave: "waveDur", scatter: "scatterDur", fireball: "fireballDur", plasma: "plasmaDur", laser: "laserDur", swarm: "swarmDur", torpedo: "torpDur", singularity: "singDur", cluster: "clusterDur", deflect: "deflectDur", phase: "phaseDur", absorb: "absorbDur", mirror: "mirrorDur" }, Ph = { wave: "waveFreq", scatter: "scatterFreq", fireball: "fireballFreq", plasma: "plasmaFreq", laser: "laserFreq", cannon: "cannonFreq", spirit: "spiritFreq", circus: "circusFreq", lumen: "lumenFreq", helix: "helixFreq", bits: "bitsFreq", rail: "railFreq", chakram: "chakramFreq", swarm: "swarmFreq", torpedo: "torpFreq", singularity: "singFreq", cluster: "clusterFreq", deflect: "deflectFreq", phase: "phaseFreq", absorb: "absorbFreq", mirror: "mirrorFreq" }, $A = { wave: "waveDmg", scatter: "scatterDmg", fireball: "fireballDmg", plasma: "plasmaDmg", laser: "laserDmg", cannon: "cannonDmg", spirit: "spiritDmg", circus: "circusDmg", lumen: "lumenDmg", helix: "helixDmg", bits: "bitsDmg", rail: "railDmg", chakram: "chakramDmg", swarm: "swarmDmg", torpedo: "torpDmg", singularity: "singDmg", cluster: "clusterDmg" }, $h = 22, tm = 420; function em(s?: any) { return Math.max(tm, (e.ceiling || 300) - (s || 0) + 160, (e.altitude || 110) - (s || 0) + 220); } const soundSynth = new SoundSynthesizer(); function t5(s?: any) { soundSynth.setMuted(s); } function z1(s?: any) { soundSynth.play(s); } function xl(s?: any, r?: any, f?: any) { if (!s || s.dying >= 0)
    return; let u = s.stun > 0 && Q.thunderstrike ? 1.25 : 1, g = s.T.boss || s.type === "bomber" ? Q.bigGameMul : 1, i = (s.kind === "ufo" || s.type === "ufo" || s.type === "mothership") && Q.ufoDmg || 1, y = s.kind === "airship" && Q.airshipDmg || 1; s.hp -= r * g * u * i * y, s.flash = .18, z1("hit"), s.hp <= 0 && (f === "drone" && (s._killSrc = "drone"), Or(s, f === "drone" ? !1 : f || !1), Q.chainCap && Qr(s, r, !0)); } function jo(s?: any, r?: any) { let f = Ya && !(r && r.has(Ya)) ? Ya : as(s.x, s.y, s.yaw, Math.min(Math.PI, 1 * Q.assistMul), 1100 * Q.lockRange, r); return f || (f = as(s.x, s.y, s.yaw, Math.PI, 700 * Q.lockRange, r) || Ya), f; } function Ol(s?: any, r?: any, f?: any) { let u = f || Ma + Ft, [g, i, y] = Ga(s, 0, ha - 9, 0), [A, E, D] = Jh(s, g, i, y, u); if (r) {
    let nt = A * Math.cos(r) - E * Math.sin(r), ht = A * Math.sin(r) + E * Math.cos(r);
    A = nt, E = ht;
} let [O, C, I] = Ga(s, 0, ha - 9, 0); return { x: O, y: C, z: I, dx: A, dy: E, dz: D, bs: u }; } function Nr(s?: any) { let r = Xa[s]?.kind, f = r === "gun" ? p.specGunLv : r === "missile" ? p.specMslLv : r === "craft" ? p.specCraftLv : p.specShieldLv; return Th(f); } let e5 = { cannon: "cannonStart", wave: "waveStart", scatter: "scatterStart", fireball: "fireballStart", plasma: "plasmaStart", laser: "laserStart", spirit: "spiritStart", circus: "circusStart", lumen: "lumenStart", helix: "helixStart", bits: "bitsStart", rail: "railStart", chakram: "chakramStart", swarm: "swarmStart", torpedo: "torpStart", singularity: "singStart", cluster: "clusterStart", catcher: "craftStart", bounty: "craftStart", tide: "craftStart", augur: "craftStart" }; function ki(s?: any) { return 1 + (Q[e5[s]] || 0) + (Q.achieveStartLv || 0); } function nm(s?: any) { let r = Q.gateRadiusMul || 1; return p.specCraft === "catcher" && (r *= 1 + .08 * (p.specCraftLv || 1)), ((s && s.r || $h) + 18) * r; } function qe(s?: any, r?: any, f?: any) { let u = cA(tl, s, r ?? 1, f || "add"); if (u.length) {
    Zu(tl);
    let g = u[u.length - 1];
    p.achieveToast = a1(g.def, g.tier), p.achieveBonus = g.row.bonusText || "", p.achieveToastT = 3.4;
    try {
        E1();
    }
    catch { }
} return u; } function lm(s?: any, r?: any) { let f = Xa[s]; if (!f)
    return !1; let u = !!(r && r.echo), g = r && r.bonusLv || 0; u || (p.gatesGot = (p.gatesGot | 0) + 1, qe("gates", 1)); let i = PA[s], y = f.kind !== "shield", A = (E?: any, D?: any) => Math.min($f(f), (E ? E + 1 : D) + g); return f.kind === "gun" ? (p.specGun === s ? p.specGunLv = A(p.specGunLv || 1, ki(s)) : (p.specGun = s, p.specGunLv = A(0, ki(s))), p.specGunT = y ? 1e9 : Xu(f.dur, Q[i] || 0, p.specGunLv), p.plasmaCh = 0, p.toast = f.name.toUpperCase() + "  LV" + p.specGunLv, s === "cannon" && qe("use_cannon", 1), f.anime && qe("use_anime", 1), p.specGunLv >= 8 && qe("maxGun", 1, "max")) : f.kind === "missile" ? (p.specMsl === s ? p.specMslLv = A(p.specMslLv || 1, ki(s)) : (p.specMsl = s, p.specMslLv = A(0, ki(s))), p.specMslT = y ? 1e9 : Xu(f.dur, Q[i] || 0, p.specMslLv), p.toast = f.name.toUpperCase() + "  LV" + p.specMslLv, qe("use_specmsl", 1)) : f.kind === "craft" ? (p.specCraft === s ? p.specCraftLv = A(p.specCraftLv || 1, ki(s)) : (p.specCraft = s, p.specCraftLv = A(0, ki(s))), p.specCraftT = 1e9, p.toast = f.name.toUpperCase() + "  LV" + p.specCraftLv) : (p.specShield === s ? p.specShieldLv = Math.min(5, (p.specShieldLv || 1) + 1 + g) : (p.specShield = s, p.specShieldLv = 1 + g), p.specShieldT = Xu(f.dur, Q[i] || 0, p.specShieldLv) * (Q.shieldDurMul || 1), p.absorbStored = 0, p.toast = f.name.toUpperCase() + "  LV" + p.specShieldLv, qe("use_shield", 1)), p.specGun && p.specMsl && p.specShield && p.specShieldT > 0 && qe("fullHouse", 1, "max"), p.toastT = 2.4, p.toastRgb = (f.color || [255, 224, 96]).slice(), !u && Q.gateEcho && l5(f.kind), n5(), !0; } function a5(s?: any) { return s.kind === "gun" ? [p.specGun, p.specGunLv] : s.kind === "missile" ? [p.specMsl, p.specMslLv] : s.kind === "craft" ? [p.specCraft, p.specCraftLv] : [p.specShield, p.specShieldLv]; } function _i(s?: any) { if (!s)
    return !1; let [r, f] = a5(s); return r === s.id && (f || 1) >= $f(s); } function n5() { let s = p.wave || 1; for (let r of M) {
    let f = Xa[r.type];
    if (!_i(f))
        continue;
    let u = null;
    for (let i = 0; i < 16; i++) {
        let y = T1(s, r.kind);
        if (y && y.id !== r.type && !_i(y)) {
            u = y;
            break;
        }
    }
    if (!u) {
        let i = Object.values(Xa).filter((y?: any) => !_i(y) && s >= (y.fromWave || 1));
        i.length && (u = i[at() * i.length | 0]);
    }
    if (!u)
        continue;
    let g = No(u);
    r.type = u.id, r.kind = u.kind, r.shape = u.shape, r.rgb = g.variant, r.col = mt(g.variant[0], g.variant[1], g.variant[2]), r.baseRgb = g.base, r.baseCol = mt(g.base[0], g.base[1], g.base[2]);
} } function l5(s?: any) { if (at() > .5)
    return; let r = Object.values(Xa).filter((A?: any) => A.kind === s && !_i(A)); if (!r.length)
    return; let f = r[at() * r.length | 0], u = Yt[0]; if (!u)
    return; let g = at() * Math.PI * 2, i = 90 + at() * 50; rm(f.id, u.x + Math.sin(g) * i, u.y - Math.cos(g) * i); let y = M[M.length - 1]; y && (y.appear = .35); } let s5 = 280, o5 = 220, sm = 230, om = 620, i5 = 5.2; function T1(s?: any, r?: any) { let f = []; for (let u of Object.values(Xa)) {
    if (s < (u.fromWave || 1) || r && u.kind !== r || _i(u))
        continue;
    let g = u.kind === "craft", i = g ? Q.craftFreq || 1 : Q[Ph[u.id] || Ph[(u as any).type]] || 1, y = Math.max(1, Math.round(i * (g ? 3 : 10)));
    for (let A = 0; A < y; A++)
        f.push(u);
} return f.length ? f[at() * f.length | 0] : null; } function c5(s?: any, r?: any, f?: any, u?: any) { let g = u * .4; for (let y = 0; y < 48; y++) {
    let A = y < 24 ? 1 : 1 + (y - 24) * .06, E = f + (at() - .5) * g, D = (sm + at() * (om - sm)) * A, O = s.x + Math.sin(E) * D, C = s.y - Math.cos(E) * D;
    if (!(Math.hypot(s.x - O, s.y - C) < o5) && !r.some((I?: any) => Math.hypot(I.x - O, I.y - C) < s5 * (y < 32 ? 1 : .85)))
        return { x: O, y: C };
} let i = om + 80 + r.length * 40; return { x: s.x + Math.sin(f) * i, y: s.y - Math.cos(f) * i }; } function im(s?: any, r?: any, f?: any, u?: any) { let g = Ie(r, f), i = No(s), y = 0, A = (Q.gateGradeChance || 0) + (p.specCraft === "augur" ? .12 * (p.specCraftLv || 1) : 0); return A > 0 && at() < A && (y = 2), { x: r, y: f, z: g, r: $h, h: em(g), type: s.id, kind: s.kind, shape: s.shape, rgb: i.variant, col: mt(i.variant[0], i.variant[1], i.variant[2]), baseRgb: i.base, baseCol: mt(i.base[0], i.base[1], i.base[2]), bonusLv: y, pulse: at(), appear: u || 0 }; } function r5() { let s = [], r = p.specGun || "cannon", f = Xa[r]; if (f && f.kind === "gun" && !_i(f) && s.push(f), p.specMsl) {
    let u = Xa[p.specMsl];
    u && u.kind === "missile" && !_i(u) && s.push(u);
} return s; } function cm(s?: any, r?: any) { M = []; let f = p.wave || 1, u = (Q.gateCount | 0) + (p.specCraft === "bounty" ? 1 + Math.floor(((p.specCraftLv || 1) - 1) / 3) : 0), g = 5 + u, i = r5(), y = s ?? Math.min(g, 2 + (f >= 2 ? 1 : 0) + (f >= 5 ? 1 : 0) + u); s == null && (y = Math.min(g, Math.max(y, i.length + (y > i.length ? y - i.length : 1)))); let A = Yt[0], E = [], D = at() * Math.PI * 2, O = Math.PI * 2 / Math.max(1, y), C = new Set(i.map((I?: any) => I.id)); for (let I = 0; I < y; I++) {
    let nt = I < i.length ? i[I] : T1(f);
    if (I >= i.length)
        for (let X = 0; X < 8 && nt && C.has(nt.id) && i.length < y; X++) {
            let Y = T1(f);
            Y && (nt = Y);
        }
    if (!nt)
        break;
    let ht = c5(A, E, D + I * O, O);
    E.push(ht);
    let yt = i5 * (Q.gateStaggerMul || 1);
    p.specCraft === "tide" && (yt *= Math.max(.4, 1 - .07 * (p.specCraftLv || 1)));
    let S = r ? 0 : I === 0 ? .15 : yt * I + (at() - .5) * .8;
    M.push(im(nt, ht.x, ht.y, S));
} } function u5() { for (let s of M)
    s.appear > 0 && (s.appear = 0, In(s.x, s.y, s.z + 10, !0)); } function rm(s?: any, r?: any, f?: any) { let u = Xa[s]; if (!u)
    return null; let g = Ie(r, f), i = im(u, r, f, 0); return i.z = g, i.h = em(g), M.push(i), i; } function f5(s?: any, r?: any) { let f = 0; for (let u of M) {
    if (u.appear > 0) {
        u.appear -= s, u.appear <= 0 && (u.appear = 0, In(u.x, u.y, u.z + 12, !0)), M[f++] = u;
        continue;
    }
    u.pulse += s;
    let g = Math.hypot(r.x - u.x, r.y - u.y), i = nm(u);
    if (!p.dead && !p.offer && g < i) {
        lm(u.type, { bonusLv: u.bonusLv || 0 }), In(u.x, u.y, Math.max(r.z, u.z + 8), !0);
        continue;
    }
    if (!p.dead && !p.offer && (Q.gateMagnet || 0) > 0 && g > 1 && g < i * (1.55 + .25 * Q.gateMagnet)) {
        let y = 1 - (g - i) / (i * (.55 + .25 * Q.gateMagnet)), A = 14 * Q.gateMagnet * Math.max(0, y) * Math.max(0, y) * s;
        r.x += (u.x - r.x) / g * A, r.y += (u.y - r.y) / g * A;
    }
    M[f++] = u;
} M.length = f; } function gl(s?: any, r?: any) { let f = $A[s]; return r * (Q[f] || 1) * Nr(s); } function d5(s?: any, r?: any) { let f = Q.gunDamage; if (r === "wave") {
    let u = Q.waveCap ? 2 : 1, g = gl("wave", f * .9);
    for (let i = 0; i < u; i++) {
        let y = Ol(s, 0, 420 + Ft);
        Ye.push({ x: y.x, y: y.y, z: y.z, vx: y.dx * y.bs, vy: y.dy * y.bs, vz: y.dz * y.bs, age: 0, life: 1.15, own: 0, dmg: g, col: 6219775, special: "wave", phase: i * Math.PI, amp: 14 * (Q.waveWide || 1), pierce: !!Q.waveCap, hits: 0, ox: y.x, oy: y.y, oz: y.z });
    }
}
else if (r === "scatter") {
    let u = 7 + (Q.scatterPellets | 0), g = gl("scatter", f * .32), i = .38;
    for (let y = 0; y < u; y++) {
        let A = u === 1 ? 0 : y / (u - 1) - .5, E = Ol(s, A * i, 390 + Ft);
        Ye.push({ x: E.x, y: E.y, z: E.z, vx: E.dx * E.bs, vy: E.dy * E.bs, vz: E.dz * E.bs + (Math.random() - .5) * 8, age: 0, life: .7, own: 0, dmg: g, col: 16764006, special: "scatter", burst: !!Q.scatterCap });
    }
}
else if (r === "fireball") {
    let u = Ol(s, 0, 210 + Ft * .4);
    Ye.push({ x: u.x, y: u.y, z: u.z, vx: u.dx * u.bs, vy: u.dy * u.bs, vz: u.dz * u.bs + 2, age: 0, life: 1.6, own: 0, dmg: gl("fireball", f * 1.85), col: 16738850, special: "fireball", splash: 30 * (Q.fireballRad || 1), burn: 2.2, napalm: !!Q.fireballCap, size: 3.2 }), p.muzzleStyle = "fireball";
}
else {
    if (r === "plasma")
        return !1;
    if (r === "cannon")
        p5(s);
    else if (r === "helix")
        m5(s);
    else if (r === "rail")
        y5(s);
    else if (r === "chakram")
        x5(s);
    else if (r === "bits")
        g5(s);
    else if (r === "spirit" || r === "lumen")
        return !1;
} return p.muzzleT = .07, p.muzzleStyle = r, !0; } function ws(s?: any) { return p.specGun === s ? p.specGunLv || 1 : p.specMsl === s && p.specMslLv || 1; } function p5(s?: any) { let r = ws("cannon"), u = 2 + Math.min(4, Math.floor((r - 1) / 2)), g = gl("cannon", Q.gunDamage * (1 + .08 * (r - 1))), i = r >= 3, y = .028 * Math.max(.35, 1 - .1 * r); for (let A = 0; A < u; A++) {
    let E = u === 1 ? 0 : A / (u - 1) - .5, D = Ol(s, E * y, Ma + Ft + 20 * r);
    Ye.push({ x: D.x, y: D.y, z: D.z, vx: D.dx * D.bs, vy: D.dy * D.bs, vz: D.dz * D.bs, age: 0, life: 1.5 + .06 * r, own: 0, dmg: g, col: 13687008, special: "cannon", pierce: i, hits: 0, splash: r >= 5 ? 14 + r : 0, burn: r >= 7 ? 1.2 : 0, size: .85 + .08 * r });
} if (Q.cannonCap && r >= 4) {
    let A = Ol(s, 0, Ma + Ft + 80);
    Ye.push({ x: A.x, y: A.y, z: A.z, vx: A.dx * A.bs, vy: A.dy * A.bs, vz: A.dz * A.bs, age: 0, life: 1.2, own: 0, dmg: g * .6, col: 16772778, special: "cannon", pierce: !0, hits: 0, size: 1.2 });
} } function um(s?: any, r?: any) { let f = Vt(r, .3, 1), u = ws("spirit"), g = Ol(s, 0, 240 + 90 * f + Ft * .25); Ye.push({ x: g.x, y: g.y, z: g.z, vx: g.dx * g.bs, vy: g.dy * g.bs, vz: g.dz * g.bs, age: 0, life: 1.35 + .08 * u, own: 0, dmg: gl("spirit", Q.gunDamage * 3.8 * Math.pow(f, 1.1) * (1 + .1 * (u - 1))), col: 5294335, special: "spirit", size: 2.4 + f * 2.8 + .14 * u, pierce: !0, hits: 0, splash: Q.spiritCap && f > .9 ? 40 + 4 * u : 10 + 2 * u, waveW: 4 + 3 * f, ox: g.x, oy: g.y, oz: g.z }), p.muzzleT = .16, p.muzzleTint = [80, 220, 255], p.muzzleStyle = "spirit", p.plasmaCh = 0; } function h5(s?: any, r?: any, f?: any) { let u = ws("circus"), g = 4 + Math.min(2, Math.floor((u - 1) / 2)), i = (r ?? 9 * io().hp * Q.missileDmgMul) * .7 * (Q.circusDmg || 1) * (f ?? Nr("circus")) * (1 + .06 * (u - 1)), y = new Set; for (let A = 0; A < g; A++) {
    let E = jo(s, y);
    E && y.add(E);
    let [D, O, C] = Ga(s, (A - (g - 1) / 2) * 2.2, ha - 16, 1);
    Ta.push({ x: D, y: O, z: C, yaw: s.yaw, vz: 4, sp: Math.max(80, Ft + 30 + 4 * u), age: -A * .02, puffT: 0, target: E, special: "circus", dmg: i, turn: 8 + .4 * u, col: 16723624, size: .62, spiral: A / g * Math.PI * 2, hx: 0, hy: 0, hz: 0, split: !!(Q.circusCap && u >= 5) });
} p.muzzleT = .1, p.muzzleTint = [255, 70, 180], p.muzzleStyle = "circus"; } function m5(s?: any) { let r = ws("helix"), f = Ol(s, 0, 300 + Ft + 15 * r); Ye.push({ x: f.x, y: f.y, z: f.z, vx: f.dx * f.bs, vy: f.dy * f.bs, vz: f.dz * f.bs, age: 0, life: 1.4, own: 0, dmg: gl("helix", Q.gunDamage * 1.6 * (1 + .1 * (r - 1))), col: 16747560, special: "helix", pierce: !0, hits: 0, size: 2.6 + .16 * r, phase: 0, amp: 8 + r, stun: !!(Q.helixCap && r >= 5), ox: f.x, oy: f.y, oz: f.z }), p.muzzleT = .1, p.muzzleTint = [255, 140, 40], p.muzzleStyle = "helix"; } function y5(s?: any) { let r = ws("rail"), f = Q.railCap && r >= 5 ? 2 : 1, u = gl("rail", Q.gunDamage * 2.4 * (1 + .12 * (r - 1))); for (let g = 0; g < f; g++) {
    let i = Ol(s, g ? .03 : 0, 620 + Ft + 20 * r), y = 480 + 24 * r;
    Ye.push({ x: i.x, y: i.y, z: i.z, vx: i.dx * i.bs, vy: i.dy * i.bs, vz: i.dz * i.bs, age: 0, life: .9, own: 0, dmg: u, col: 16770640, special: "rail", pierce: !0, hits: 0, size: 1.6 + .1 * r, coin: !0, ox: i.x, oy: i.y, oz: i.z }), je.push({ x: i.x, y: i.y, z: i.z, ex: i.x + i.dx * y, ey: i.y + i.dy * y, ez: i.z + i.dz * y, age: 0, life: .22, tint: "rail" }), qn.push({ x: i.x, y: i.y, z: i.z, age: 0, life: .22, r0: 4, r1: 28 + 2 * r, rgb: [255, 170, 40] });
} p.muzzleT = .12, p.muzzleTint = [255, 200, 80], p.muzzleStyle = "rail"; } function x5(s?: any) { let r = ws("chakram"), f = Ol(s, 0, 340 + Ft); Ye.push({ x: f.x, y: f.y, z: f.z, vx: f.dx * f.bs, vy: f.dy * f.bs, vz: f.dz * f.bs, age: 0, life: 1.8 + .1 * r, own: 0, dmg: gl("chakram", Q.gunDamage * 1.15 * (1 + .08 * (r - 1))), col: 11832575, special: "chakram", bounce: 1 + Math.min(4, Math.floor(r / 2)) + (Q.chakramCap ? 2 : 0), hits: 0, size: 2.8 + .14 * r, pierce: r >= 6, home: r >= 4, spin: 14 }), p.muzzleT = .08, p.muzzleTint = [200, 140, 255], p.muzzleStyle = "chakram"; } function g5(s?: any) { let r = ws("bits"), f = 2 + Math.min(2, Math.floor((r - 1) / 3)) + (Q.bitsCap ? 1 : 0); for (; Ka.length < f;)
    Ka.push({ ang: Ka.length * 1.7, r: 22 + Ka.length * 4, zOff: 4, cd: 0, col: 10551240 }); let u = Ol(s, 0, 400 + Ft); Ye.push({ x: u.x, y: u.y, z: u.z, vx: u.dx * u.bs, vy: u.dy * u.bs, vz: u.dz * u.bs, age: 0, life: 1.1, own: 0, dmg: gl("bits", Q.gunDamage * .7), col: 10551240, special: "bits", size: .9 }), p.muzzleT = .06, p.muzzleTint = [140, 255, 200], p.muzzleStyle = "bits"; } function b5(s?: any, r?: any) { if (p.lumenT = (p.lumenT || 0) - s, p.lumenT > 0)
    return; p.lumenT = Math.max(.12, .28 - .02 * ws("lumen")); let f = ws("lumen"), u = Ol(r, 0, 520 + Ft); Ye.push({ x: u.x, y: u.y, z: u.z, vx: u.dx * u.bs, vy: u.dy * u.bs, vz: u.dz * u.bs, age: 0, life: .85, own: 0, dmg: gl("lumen", Q.gunDamage * 1.35 * (1 + .1 * (f - 1))), col: 16734920, special: "lumen", size: 1.5, pierce: f >= 4, hits: 0, ox: u.x, oy: u.y, oz: u.z }), p.saberT = .16, p.muzzleT = .08, p.muzzleTint = [255, 80, 200], p.muzzleStyle = "lumen", Q.lumenCap && f >= 5 && A5(r, gl("lumen", Q.gunDamage * 2.2)), p.muzzleT = .08, p.muzzleTint = [255, 80, 200]; } function A5(s?: any, r?: any) { let [f, u, g] = Ga(s, 0, ha - 8, 2), [i, y] = [Math.sin(s.yaw), -Math.cos(s.yaw)]; for (let A of ce) {
    if (A.dying >= 0)
        continue;
    let E = A.x - f, D = A.y - u, O = A.z - g, C = E * i + D * y, I = Math.abs(E * -y + D * i);
    C > 0 && C < 70 && I < 28 + 4 * ws("lumen") && Math.abs(O) < 24 && (xl(A, r, !1), In(A.x, A.y, A.z, !0));
} } function M5(s?: any, r?: any) { if (p.specGun !== "bits") {
    Ka = [];
    return;
} let f = ws("bits"), u = 2 + Math.min(2, Math.floor((f - 1) / 3)) + (Q.bitsCap ? 1 : 0); for (; Ka.length < u;)
    Ka.push({ ang: Ka.length * 1.7, r: 22 + Ka.length * 4, zOff: 4, cd: 0, col: 10551240 }); Ka.length > u && (Ka.length = u); for (let g = 0; g < Ka.length; g++) {
    let i = Ka[g];
    if (i.ang += s * (1.8 + .15 * f), i.x = r.x + Math.cos(i.ang) * i.r, i.y = r.y + Math.sin(i.ang) * i.r, i.z = r.z + i.zOff + Math.sin(i.ang * 2) * 3, i.cd -= s, i.cd <= 0 && p.firing && !p.overheated && !p.dead) {
        i.cd = Math.max(.18, .45 - .03 * f);
        let y = jo(r, null) || (Q.bitsCap ? ce.find((I?: any) => I.dying < 0) : null), A, E, D, O;
        y ? (A = y.x - i.x, E = y.y - i.y, D = y.z - i.z, O = Math.hypot(A, E, D) || 1) : (A = Math.sin(r.yaw), E = -Math.cos(r.yaw), D = 0, O = 1);
        let C = 420;
        Ye.push({ x: i.x, y: i.y, z: i.z, vx: A / O * C, vy: E / O * C, vz: D / O * C, age: 0, life: 1, own: 0, dmg: gl("bits", Q.gunDamage * .55 * (1 + .08 * (f - 1))), col: 10551240, special: "bits", size: .9 });
    }
} } function fm(s?: any, r?: any) { let f = Vt(r, .3, 1), u = Ol(s, 0, 280 + 80 * f + Ft * .3); Ye.push({ x: u.x, y: u.y, z: u.z, vx: u.dx * u.bs, vy: u.dy * u.bs, vz: u.dz * u.bs, age: 0, life: 1.4, own: 0, dmg: gl("plasma", Q.gunDamage * 3.4 * Math.pow(f, 1.15)), col: 16734874, special: "plasma", size: 2.2 + f * 1.8, pierce: !!(Q.plasmaCap && f > .92), hits: 0 }), p.muzzleT = .1, p.muzzleTint = [255, 90, 160], p.muzzleStyle = "plasma", p.plasmaCh = 0; } function v5(s?: any, r?: any) { if (p.ammo < 1)
    return !1; p.ammo--, p.missileSide = -(p.missileSide || 1); let f = Nr(r), u = 9 * io().hp * Q.missileDmgMul; if (r === "swarm") {
    let g = 5 + (Q.swarmCount | 0), i = new Set;
    for (let y = 0; y < g; y++) {
        let A = jo(s, i);
        A && i.add(A);
        let [E, D, O] = Ga(s, p.missileSide * (6 + y % 4 * 2), ha - 20, -1);
        Ta.push({ x: E, y: D, z: O, yaw: s.yaw + (y - (g - 1) / 2) * .12, vz: 4, sp: Math.max(70, Ft + 20), age: -y * .04, puffT: 0, target: A, special: "swarm", hive: !!Q.swarmCap, dmg: u * .45 * (Q.swarmDmg || 1) * f, turn: 7 * (Q.swarmTurn || 1), col: 8978414, size: .85 });
    }
}
else if (r === "torpedo") {
    let g = jo(s, null), [i, y, A] = Ga(s, p.missileSide * 8, ha - 22, -2);
    Ta.push({ x: i, y, z: A, yaw: s.yaw, vz: 0, sp: Math.max(50, Ft * .85), age: 0, puffT: 0, target: g, special: "torpedo", bloom: !!Q.torpCap, dmg: u * 2.15 * (Q.torpDmg || 1) * f, turn: 3.4 * (Q.torpTurn || 1), col: 5636010, size: 1.65, trailDmg: Q.torpCap ? u * .25 * f : 0 });
}
else if (r === "singularity") {
    let g = jo(s, null), [i, y, A] = Ga(s, p.missileSide * 8, ha - 22, -2);
    Ta.push({ x: i, y, z: A, yaw: s.yaw, vz: 0, sp: Math.max(58, Ft), age: 0, puffT: 0, target: g, special: "singularity", dmg: u * 1.4 * (Q.singDmg || 1) * f, turn: 4.2, col: 11167487, size: 1.3, wellR: 95 * (Q.singPull || 1), wellT: 1.6 });
}
else if (r === "cluster") {
    let g = jo(s, null), [i, y, A] = Ga(s, p.missileSide * 8, ha - 22, -2);
    Ta.push({ x: i, y, z: A, yaw: s.yaw, vz: 2, sp: Math.max(64, Ft), age: 0, puffT: 0, target: g, special: "cluster", gen: 0, maxGen: Q.clusterCap ? 2 : 1, dmg: u * .85 * (Q.clusterDmg || 1) * f, turn: 3.8, col: 16755268, size: 1.1, splits: 4 + (Q.clusterSplits | 0) });
}
else if (r === "circus")
    h5(s, u, f);
else
    return !1; return !0; } function B1(s?: any) { let r = s.splits || 4, f = (s.gen || 0) + 1; for (let u = 0; u < r; u++) {
    let g = s.yaw + (u - (r - 1) / 2) * .32 + (at() - .5) * .1;
    Ta.push({ x: s.x, y: s.y, z: s.z, yaw: g, vz: s.vz + (at() - .5) * 12, sp: s.sp * .95, age: 0, puffT: 0, target: s.target, special: "cluster", gen: f, maxGen: s.maxGen, dmg: s.dmg * .7, turn: 6, col: 16764006, size: .7, splits: Math.max(3, r - 1) });
} In(s.x, s.y, s.z, !0), s.age = 99; } function C1(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any, y?: any) { wt.push({ x: s, y: r, z: f, r: u, age: 0, life: g, dmg: i, horizon: !!y, pulled: !1 }); } function w5(s?: any) { let r = 0; for (let f of wt) {
    f.age += s;
    let u = Math.min(1, f.age / .2) * Math.max(0, 1 - f.age / f.life);
    for (let g of ce) {
        if (g.dying >= 0)
            continue;
        let i = Math.hypot(g.x - f.x, g.y - f.y, g.z - f.z);
        if (i < 4 || i > f.r)
            continue;
        let y = (1 - i / f.r) * 70 * u * s;
        g.x += (f.x - g.x) / i * y, g.y += (f.y - g.y) / i * y, g.z += (f.z - g.z) / i * y * .5;
    }
    if (f.horizon)
        for (let g of Ye) {
            if (g.own !== 1)
                continue;
            let i = Math.hypot(g.x - f.x, g.y - f.y, g.z - f.z);
            if (i < 4 || i > f.r * 1.1)
                continue;
            let y = (1 - i / (f.r * 1.1)) * 90 * u * s;
            g.x += (f.x - g.x) / i * y, g.y += (f.y - g.y) / i * y, g.z += (f.z - g.z) / i * y;
        }
    if (f.age >= f.life) {
        kn(f.x, f.y, f.z, 1.1);
        for (let g of ce)
            g.dying >= 0 || Math.hypot(g.x - f.x, g.y - f.y, g.z - f.z) < f.r * .55 && (xl(g, f.dmg, !1), Q.singCap && Qr(g, f.dmg, !0));
        continue;
    }
    wt[r++] = f;
} wt.length = r; } function S5(s?: any) { let r = 0; for (let f of be)
    if (f.age += s, f.age < f.life) {
        for (let u of ce)
            u.dying >= 0 || Math.hypot(u.x - f.x, u.y - f.y, (u.z || 0) - f.z) < f.r && xl(u, f.dps * s, !1);
        be[r++] = f;
    } be.length = r; } function E5(s?: any, r?: any, f?: any) { s.burnT = Math.max(s.burnT || 0, f), s.burnDps = Math.max(s.burnDps || 0, r / f); } function vc(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any, y?: any) { for (let A of ce) {
    if (A.dying >= 0)
        continue;
    let E = Math.hypot(A.x - s, A.y - r, A.z - f);
    E < u && (xl(A, g * (1 - E / u * .4), !1), i && E5(A, i, 2.4));
} y && be.push({ x: s, y: r, z: f - 2, r: u * .85, age: 0, life: 2.8, dps: g * .35, col: 16733474 }); } function Qr(s?: any, r?: any, f?: any) { !s || s.dying >= 0 && !f || Q.chainChance <= 0 && !f || !f && at() > Q.chainChance || dm(s, r * .85 * (Q.chainDmg || 1), Q.chainJumps | 0 || 2); } function dm(s?: any, r?: any, f?: any) { qe("chains", 1); let u = new Set([s]), g = s, i = Math.max(1, f); for (Q.chainCap && (i += 2); i-- > 0;) {
    let y = null, A = Q.chainRange || 140;
    for (let E of ce) {
        if (E.dying >= 0 || u.has(E))
            continue;
        let D = Math.hypot(E.x - g.x, E.y - g.y, E.z - g.z);
        D < A && (y = E, A = D);
    }
    if (!y)
        break;
    qt.push({ ax: g.x, ay: g.y, az: g.z, bx: y.x, by: y.y, bz: y.z, age: 0, life: .18, col: 10083839 }), xl(y, r, !1), r *= .82, u.add(y), g = y;
} } function z5(s?: any) { let r = 0; for (let f of qt)
    f.age += s, f.age < f.life && (qt[r++] = f); qt.length = r; } function T5(s?: any, r?: any) { let f = Ol(r, 0, 400), u = 340 + (Q.laserWidth || 1) * 40, g = gl("laser", Q.gunDamage * 7.2), i = Math.hypot(f.dx, f.dy, f.dz) || 1, y = f.dx / i, A = f.dy / i, E = f.dz / i, D = f.x + y * u, O = f.y + A * u, C = f.z + E * u, I = null, nt = 1, ht = null; for (let S of ce) {
    if (S.dying >= 0)
        continue;
    let X = D - f.x, Y = O - f.y, F = C - f.z, ot = X * X + Y * Y + F * F || 1, H = ((S.x - f.x) * X + (S.y - f.y) * Y + (S.z - f.z) * F) / ot;
    H = H < 0 ? 0 : H > 1 ? 1 : H;
    let j = f.x + X * H - S.x, W = f.y + Y * H - S.y, ct = f.z + F * H - S.z, Z = 9 * (Q.laserWidth || 1);
    j * j + W * W + ct * ct < Z * Z && H < nt ? (I && Q.laserCap && (ht = I), I = S, nt = H) : Q.laserCap && !ht && j * j + W * W + ct * ct < Z * Z * 4 && (ht = S);
} I && (xl(I, g * s, !1), Qr(I, g * .2, !1)), ht && ht !== I && xl(ht, g * .55 * s, !1); let yt = I ? nt : 1; je = [{ x: f.x, y: f.y, z: f.z, ex: f.x + y * u * yt, ey: f.y + A * u * yt, ez: f.z + E * u * yt, fork: ht ? { x: ht.x, y: ht.y, z: ht.z } : null, col: 16724821, age: 0, life: .05 }], p.muzzleT = .05, p.muzzleStyle = "laser", p.muzzleTint = [255, 40, 70]; } function f6() { return p.specShield && p.specShieldT > 0; } function B5(s?: any) { let r = p.absorbStored; if (p.absorbStored = 0, r <= .2)
    return; let f = 70; kn(s.x, s.y, s.z, 1.3); for (let u of ce)
    u.dying >= 0 || Math.hypot(u.x - s.x, u.y - s.y, u.z - s.z) < f && (xl(u, r * 1.15, !1), Q.absorbCap && (u.stun = Math.max(u.stun || 0, 1.6), u.fireT = .8)); } function C5(s?: any, r?: any) { let f = Math.sin(s.yaw), u = -Math.cos(s.yaw), g = r.x - s.x, i = r.y - s.y, y = Math.hypot(g, i) || 1; return (g * f + i * u) / y > .15 * (2 - (Q.mirrorArc || 1)); } function pm(s?: any, r?: any, f?: any) { if (s.own = 0, s.vx = -s.vx, s.vy = -s.vy, s.vz = -s.vz * .4, s.age = 0, s.life = Math.max(.4, s.life * .7), s.col = p.specShield === "mirror" ? 8969727 : 16772744, s.dmg = (s.dmg || 6) * (Q.deflectMul || 1) * Nr(p.specShield || "deflect"), Q.deflectCap && p.specShield === "deflect") {
    let u = jo(r, null);
    u && (s._home = u);
} if (f && Q.mirrorCap) {
    let g = s.vx * Math.cos(.28) - s.vy * Math.sin(.28), i = s.vx * Math.sin(.28) + s.vy * Math.cos(.28);
    Ye.push({ x: s.x, y: s.y, z: s.z, vx: g, vy: i, vz: s.vz, age: 0, life: s.life, own: 0, dmg: s.dmg * .7, col: s.col, special: "mirror" });
} } function D5(s?: any, r?: any) { Am(), p.specGunT > 0 && p.specGunT < 1e3 && (p.specGunT -= s, p.specGunT <= 0 && (p.specGunT = 0, p.specGun = null, p.specGunLv = 0, p.plasmaCh = 0)), p.specMslT > 0 && p.specMslT < 1e3 && (p.specMslT -= s, p.specMslT <= 0 && (p.specMslT = 0, p.specMsl = null, p.specMslLv = 0)), p.specShieldT > 0 && (p.specShieldT -= s, p.specShieldT <= 0 && (p.specShield === "absorb" && B5(r), p.specShieldT = 0, p.specShield = null, p.specShieldLv = 0)); for (let f of ce)
    f.dying >= 0 || f.burnT > 0 && (f.burnT -= s, xl(f, (f.burnDps || 0) * s, !1)); if (f5(s, r), w5(s), S5(s), z5(s), je.length) {
    let f = 0;
    for (let u of je)
        u.age += s, u.age < u.life && (je[f++] = u);
    je.length = f;
} p.saberT > 0 && (p.saberT = Math.max(0, p.saberT - s)); } let hm = [{ side: 1, ahead: 16, up: 3 }, { side: -1, ahead: 16, up: 3 }, { side: .9, ahead: -14, up: 9 }, { side: -.9, ahead: -14, up: 9 }], mm = 14; function D1(s?: any, r?: any) { let f = hm[r] || hm[0], u = 34 * 1.15 * Fe() + 6, g = Fe(), i = Math.sin(s.yaw), y = Math.cos(s.yaw); return { x: s.x + y * f.side * u + i * f.ahead * g, y: s.y + i * f.side * u - y * f.ahead * g, z: s.z + f.up }; } function ym(s?: any, r?: any) { let f = D1(s, r), u = fc(f.x, f.y, f.z, s.yaw); return Object.assign(u, { slot: r, scale: .52, pals: _r, hp: mm, hpMax: mm, dead: !1, dying: -1, respawnT: 0, gunT: at() * .3, mslT: 2 + at() * 4, muzzleT: 0, flash: 0, target: null, kamikaze: null, puffT: 0 }), u; } function xm(s?: any) { let r = Vt(Q.drones | 0, 0, 4); for (; xa.length < r;)
    xa.push(ym(s, xa.length)); xa.length > r && (xa.length = r); for (let f = 0; f < xa.length; f++)
    xa[f].slot = f; } function k1(s?: any, r?: any, f?: any) { let u = null, g = f; for (let i of ce) {
    if (i.dying >= 0)
        continue;
    let y = Math.hypot(i.x - s, i.y - r);
    y < g && y > 4 && (g = y, u = i);
} return u; } function k5(s?: any) { let r = s.target, f = Ma * .85 + Ft, [u, g, i] = Ga(s, 0, ha - 9, 0), y, A, E; if (r) {
    let C = Math.hypot(r.x - u, r.y - g, r.z - i) / f;
    y = r.x + r.vx * C - u, A = r.y + r.vy * C - g, E = r.z + (r.vz || 0) * C - i;
}
else {
    let O = Ss(s);
    y = O.fx, A = O.fy, E = O.fz;
} let D = Math.hypot(y, A, E) || 1; Ye.push({ x: u, y: g, z: i, vx: y / D * f, vy: A / D * f, vz: E / D * f, age: 0, life: 1.3, own: 0, dmg: Q.droneDamage, drone: !0, special: "drone" }), s.muzzleT = .05; } function _5(s?: any) { let r = s.target || k1(s.x, s.y, Q.droneRange * 1.4); if (!r)
    return; let [f, u, g] = Ga(s, 0, ha - 16, -1); Ta.push({ x: f, y: u, z: g, yaw: s.yaw, vz: 0, sp: Math.max(80, Ft * .8), age: 0, puffT: 0, target: r, mini: !0 }); } function R5(s?: any) { if (!s.dead) {
    if (kn(s.x, s.y, s.z, .45), Q.dronePhoenix) {
        let r = k1(s.x, s.y, 900);
        if (r) {
            s.kamikaze = r, s.dead = !1, s.dying = -1, s.hp = 0;
            return;
        }
    }
    s.dead = !0, s.kamikaze = null, s.dying = -1, s.respawnT = (Q.dronePhoenix ? 6 : 10) * (Q.droneRespawn || 1);
} } function N5(s?: any, r?: any) { if (Q.drones <= 0) {
    xa = [];
    return;
} xm(r); let f = Fe(); for (let u of xa) {
    if (u.flash = Math.max(0, u.flash - s), u.muzzleT -= s, u.dead) {
        if (u.respawnT -= s, u.respawnT <= 0 && !p.dead) {
            let E = D1(r, u.slot);
            u.x = E.x, u.y = E.y, u.z = E.z, u.yaw = r.yaw, u.roll = r.roll, u.pitch = r.pitch, u.hp = u.hpMax, u.dead = !1, u.dying = -1, u.kamikaze = null, u.gunT = .2, u.mslT = 3, u.trailLen = 0;
        }
        continue;
    }
    if (u.kamikaze) {
        let E = u.kamikaze;
        if (E.dying >= 0 || E.dead) {
            u.kamikaze = null, u.dead = !0, u.respawnT = 6 * (Q.droneRespawn || 1);
            continue;
        }
        let D = Math.atan2(E.x - u.x, -(E.y - u.y));
        u.yaw += Fn(D - u.yaw) * (1 - Math.exp(-s * 8));
        let O = 280;
        u.x += Math.sin(u.yaw) * O * s, u.y -= Math.cos(u.yaw) * O * s, u.z += (E.z - u.z) * (1 - Math.exp(-s * 6)), u.puffT -= s, u.puffT <= 0 && (u.puffT = .04, Ha(u.x, u.y, u.z, 1.2 * f * u.scale, .8, .6, 30)), Math.hypot(E.x - u.x, E.y - u.y, E.z - u.z) < 34 * .7 * f * E.scale && (E.hp -= 8 * io().hp, E.flash = .1, E.hp <= 0 && Or(E, !1), kn(u.x, u.y, u.z, .85), u.kamikaze = null, u.dead = !0, u.respawnT = 6 * (Q.droneRespawn || 1));
        continue;
    }
    if (p.dead) {
        u.x += u.vx * s, u.y += u.vy * s;
        continue;
    }
    let g = D1(r, u.slot), i = 1 - Math.exp(-s * 3.4), y = u.x, A = u.y;
    u.x += r.vx * s + (g.x - (u.x + r.vx * s)) * i, u.y += r.vy * s + (g.y - (u.y + r.vy * s)) * i, u.vx = (u.x - y) / Math.max(s, 1e-4), u.vy = (u.y - A) / Math.max(s, 1e-4), u.yaw += Fn(r.yaw - u.yaw) * (1 - Math.exp(-s * 4.2)), u.roll += (r.roll - u.roll) * (1 - Math.exp(-s * 3.2)), u.pitch = r.pitch, u.z += (g.z + Math.sin(Lt * 1.3 + u.slot * 1.7) * 1.1 - u.z) * (1 - Math.exp(-s * 3.2)), u.z = Math.max(u.z, Ie(u.x, u.y) + 3), u.target = k1(u.x, u.y, Q.droneRange), u.gunT -= s, u.target && u.gunT <= 0 && !p.offer && (k5(u), u.gunT += 1 / Math.max(.6, Q.droneRate)), Q.dronePhoenix && (u.mslT -= s, u.target && u.mslT <= 0 && !p.offer && (_5(u), u.mslT = 10));
} } function Q5(s?: any) { let r = 0; for (let f of ml)
    f.age += s, f.x += f.vx * s, f.y += f.vy * s, f.z += f.vz * s, f.vz -= 8 * s, f.age < f.life && f.z > Ie(f.x, f.y) && ((f.age * 20 | 0) !== ((f.age - s) * 20 | 0) && Ha(f.x, f.y, f.z, 1.6, 1.1, .55, 40, f.vx * .2, f.vy * .2), ml[r++] = f); ml.length = r, nn && (nn.age += s, nn.age >= nn.life && (nn = null)); } function O5() { if (p.dead || p.offer || Q.flareMax <= 0 || p.flare <= 0 || Ze < 1.9)
    return !1; Gs(), p.flare--; let s = Yt[0]; for (let r = -1; r <= 1; r += 2) {
    let [f, u, g] = Ga(s, r * 6, ha - 28, -1);
    ml.push({ x: f, y: u, z: g, vx: s.vx * .25 + r * 14, vy: s.vy * .25, vz: 6, age: 0, life: 2.4 });
} return p.banner = "Flares", p.bannerT = .9, !0; } function L5() { if (p.dead || p.offer || Q.empMax <= 0 || p.emp <= 0 || Ze < 1.9)
    return !1; Gs(), p.emp--; let s = Yt[0]; nn = { x: s.x, y: s.y, z: s.z, age: 0, life: .75 }; let r = 340, f = Q.thunderstrike ? 4 * io().hp : 0; for (let u of ce)
    u.dying >= 0 || Math.hypot(u.x - s.x, u.y - s.y, u.z - s.z) > r || (u.stun = 2.5, u.flash = .25, u.burst = 0, f && (u.hp -= f, u.hp <= 0 && Or(u, !1))); return p.banner = Q.thunderstrike ? "Thunderstrike" : "EMP", p.bannerT = 1.3, p.shake = Math.max(p.shake, .35), !0; } function U5(s?: any, r?: any, f?: any, u?: any) { let g = Yn[r]; if (g && g.kind) {
    let ht = g.kind, S = co(s, ht === "ground" ? "land" : ht === "sea" ? "water" : "air", g.boss ? 700 : 400, g.boss ? 1100 : 900);
    S && Ys(r, S.x, S.y, S.z);
    return;
} let i = io(), y = s.yaw + (at() - .5) * 2.4 + (f - (u - 1) / 2) * .35, A = (g.boss ? 900 : 620) + at() * 260, E = s.x + Math.sin(y) * A, D = s.y - Math.cos(y) * A, O = Ie(E, D), C = Math.max(O + 20, s.z + (at() - .5) * 30), I = fc(E, D, C, Math.atan2(s.x - E, -(s.y - D))), nt = g.hp * i.hp * (g.boss ? 1 + .25 * Math.floor(p.wave / 5 - 1) : 1); Object.assign(I, { type: r, T: g, pals: Ql[r], scale: g.scale, vz: 0, hp: nt, hpMax: nt, dying: -1, dead: !1, flash: 0, mode: "attack", modeT: 0, side: 1, altOff: (at() - .5) * 24, altT: 3, cd: (g.boss ? 2 : 3.5) + at() * 2.5, burst: 0, burstT: 0, spin: 0, puffT: 0, stun: 0, spd: i.speed * g.speed * (.94 + at() * .12) }), ce.push(I); } function co(s?: any, r?: any, f?: any, u?: any) { for (let g = 0; g < 56; g++) {
    let i = at() * Math.PI * 2, y = (f || 280) + at() * ((u || 780) - (f || 280)), A = s.x + Math.sin(i) * y, E = s.y - Math.cos(i) * y, D = Ie(A, E);
    if (r === "land" && D >= 4)
        return { x: A, y: E, z: D };
    if (r === "water" && D === 0)
        return { x: A, y: E, z: 0 };
    if (r === "air")
        return { x: A, y: E, z: Math.max(D + 40, s.z + 10 + at() * 30) };
} return null; } function Ys(s?: any, r?: any, f?: any, u?: any) { let g = Yn[s]; if (!g)
    return null; let i = io(), y = Yt[0], A = g.kind || "fly", E = u; E == null && (A === "ground" ? E = Ie(r, f) + 4 : A === "sea" ? E = 3 : E = Math.max(Ie(r, f) + 40, y.z + 8)); let D = fc(r, f, E, Math.atan2(y.x - r, -(y.y - f))), O = g.hp * i.hp * (g.boss ? 1 + .2 * Math.floor(p.wave / 10) : 1); return Object.assign(D, { type: s, T: g, pals: Ql[s], scale: g.scale, kind: A, vz: 0, hp: O, hpMax: O, dying: -1, dead: !1, flash: 0, mode: "attack", modeT: 0, side: 1, altOff: 0, altT: 3, cd: 1.6 + at() * 1.4, burst: 0, burstT: 0, spin: 0, puffT: 0, stun: 0, spd: i.speed * g.speed * (.94 + at() * .12), beamT: 0, beamOn: !1 }), A === "airship" && (D.turrets = Sh(s), D.heading = y.yaw + Math.PI / 2 + (at() - .5) * .8, D.yaw = D.heading, D.yawRate = 0, D.pitch = 0, D.roll = 0, D.modeT = 5 + at() * 4, D.launchT = 6 + at() * 6, D.launched = 0, u == null && (D.z = Math.max(Ie(r, f) + 48, 56 + at() * 22))), D.trailLen = 0, ce.push(D), D; } function G5(s?: any, r?: any) { let f = gm(r); for (let i = 0; i < f.buildings; i++) {
    let y = r >= 10 && at() < .4 ? "bunker" : "turret", A = co(s, "land", 240, 720);
    A && Ys(y, A.x, A.y, A.z + (y === "bunker" ? 6 : 4));
} for (let i = 0; i < f.boats; i++) {
    let y = r >= 13 && at() < .4 ? "gunboat" : "boat", A = co(s, "water", 260, 760);
    A && Ys(y, A.x, A.y, 3);
} for (let i = 0; i < f.ufos; i++) {
    let y = co(s, "air", 400, 900);
    y && Ys("ufo", y.x, y.y, y.z);
} let u = (f.steampunk || 0) + (f.alien || 0) + (f.carrier ? 1 : 0), g = Math.max(0, f.dirigibles - (u > 0 ? 1 : 0)); for (let i = 0; i < g; i++) {
    let y = co(s, "air", 480, 920);
    y && Ys("dirigible", y.x, y.y, Math.max(y.z, 58));
} for (let i = 0; i < (f.steampunk || 0); i++) {
    let y = co(s, "air", 520, 980);
    y && Ys("steampunk", y.x, y.y, Math.max(y.z, 60));
} for (let i = 0; i < (f.alien || 0); i++) {
    let y = co(s, "air", 560, 1020);
    y && Ys("alien", y.x, y.y, Math.max(y.z, 66));
} if (f.carrier) {
    let i = co(s, "air", 640, 1080);
    i && Ys("carrier", i.x, i.y, Math.max(i.z, 70));
} if (f.mothership) {
    let i = co(s, "air", 700, 1100);
    i && Ys("mothership", i.x, i.y, Math.max(i.z, 80));
} } function Y5() { let s = Yt[0]; p.waveHit = !1; let r = H5(p.wave); return r.forEach((f?: any, u?: any) => U5(s, f, u, r.length)), G5(s, p.wave), cm(), p.waveLive = !0, r; } function kn(s?: any, r?: any, f?: any, u?: any) { let g = Fe() / .6; Hs.push({ x: s, y: r, z: f, age: 0, life: .55 + .35 * u, size: 7 * u * g, seed: at() * 9999 | 0 }); let i = Math.round(3 + 3 * u); for (let y = 0; y < i; y++) {
    let A = 6 * u * g;
    Hs.push({ x: s + (at() - .5) * A * 2, y: r + (at() - .5) * A * 2, z: f + (at() - .5) * A, age: -at() * .25 * u, life: .35 + at() * .35 * u, size: (2.5 + at() * 3.5) * u * g, seed: at() * 9999 | 0 });
} for (let y = 0; y < 6 + 6 * u; y++)
    Ha(s + (at() - .5) * 10 * u, r + (at() - .5) * 10 * u, f + (at() - .5) * 4, (2 + at() * 2.5) * u * g * .6, 1.8 + at() * 1.6, .75, 30 + at() * 24, (at() - .5) * 30, (at() - .5) * 30); for (let y = 0; y < 10 * u; y++) {
    let A = at() * Math.PI * 2, E = 30 + at() * 90 * u;
    Ms.push({ x: s, y: r, z: f, vx: Math.cos(A) * E, vy: Math.sin(A) * E, vz: 20 + at() * 70, age: 0, life: .8 + at() * 1.4, c: at() * 4 | 0, puffT: 0 });
} if (!p.dead) {
    let y = Yt[0], A = Math.hypot(s - y.x, r - y.y);
    p.shake = Math.max(p.shake, Vt(1 - A / 400, 0, 1) * u);
} } function In(s?: any, r?: any, f?: any, u?: any) { Hs.push({ x: s, y: r, z: f, age: 0, life: u ? .22 : .14, size: u ? 2.6 : 1.6, seed: at() * 9999 | 0 }); } function q5(s?: any, r?: any, f?: any, u?: any, g?: any) { let i = u || "cannon", y = Lh(i); if (qn.push({ x: s, y: r, z: f, age: 0, life: i === "fireball" ? .3 : i === "plasma" ? .22 : .16, r0: i === "fireball" ? 5 : 3, r1: (g ? 24 : 14) * (i === "fireball" ? 1.25 : 1), rgb: y, kind: i }), i === "fireball")
    for (let A = 0; A < 4; A++)
        Ha(s + (at() - .5) * 6, r + (at() - .5) * 6, f + at() * 3, 1.6, .9, .5, 40); } function Or(s?: any, r?: any) { if (s.dying >= 0)
    return; s.dying = 0, s.spin = (at() < .5 ? -1 : 1) * (3 + at() * 3), s.vz = 10, p.kills++, p.score += Math.round((100 * Math.max(1, p.wave) + (r ? 0 : 50)) * (s.T.xp / 20)); let f = !!(s.T && s.T.boss) || s.kind === "airship"; p.shake = Math.max(p.shake, f ? .9 : s.type === "bomber" || s.type === "gunboat" || s.type === "bunker" ? .5 : .25), z1(f ? "big" : "kill"), kn(s.x, s.y, s.z, (s.kind === "airship" ? .55 : .8) * s.scale), p.streak = Lt - p.lastKillT < 4 ? p.streak + 1 : 1, p.lastKillT = Lt; let u = Math.round(s.T.xp * (1 + .1 * (p.wave - 1)) * (r ? 1.25 : 1)), g = p.streak >= 2 ? 10 * p.streak : 0; if (o0(u + g, s.T.boss ? "ace down" : p.streak >= 2 ? "streak \xD7" + p.streak : r ? "missile kill" : ""), s.T.boss && s.type === "ace" && (p.banner = "Ace down", p.bannerT = 2.4, p.aces++), s.T.boss && s.type === "mothership" && (p.banner = "Mothership down", p.bannerT = 2.6), s.kind === "airship") {
    if (p.banner = s.type === "carrier" ? "Carrier down" : s.type === "steampunk" ? "Steampunk down" : s.type === "alien" ? "Alien airship down" : "Dirigible down", p.bannerT = 2.4, qe("airships", 1), s.type === "carrier" && qe("carriers", 1, "max"), s.type === "steampunk" && qe("steampunks", 1), s.type === "alien" && qe("alienships", 1), s.type === "steampunk") {
        for (let i = 0; i < 14; i++) {
            let y = at() * Math.PI * 2, A = 24 + at() * 70;
            Ms.push({ x: s.x, y: s.y, z: s.z + 4, vx: Math.cos(y) * A, vy: Math.sin(y) * A, vz: 30 + at() * 50, age: 0, life: 1.1 + at() * 1.2, c: 0, puffT: 0, shape: "gear" });
        }
        for (let i = 0; i < 6; i++)
            Ha(s.x + (at() - .5) * 16, s.y + (at() - .5) * 16, s.z + 8, 4, 1.4, .7, 40);
    }
    if (s.type === "alien") {
        for (let y = 0; y < 16; y++) {
            let A = at() * Math.PI * 2, E = 30 + at() * 90;
            Ms.push({ x: s.x, y: s.y, z: s.z + 4, vx: Math.cos(A) * E, vy: Math.sin(A) * E, vz: 25 + at() * 60, age: 0, life: .7 + at() * .8, c: 3, puffT: 0, shape: "glow" });
        }
        kn(s.x, s.y, s.z, 1.1 * s.scale);
        let i = Yt[0];
        qt.push({ ax: s.x, ay: s.y, az: s.z, bx: s.x + (at() - .5) * 40, by: s.y + (at() - .5) * 40, bz: s.z + 20, age: 0, life: .55, col: 11176191 });
    }
} if (qe("kills", 1), qe("bestStreak", p.streak, "max"), s.type === "ace") {
    qe("aces", 1);
    let i = Yt[0];
    Math.hypot(s.x - i.x, s.y - i.y, s.z - i.z) < 55 && qe("closeAce", 1, "max");
} s.kind === "ground" && qe("buildings", 1), s.kind === "sea" && qe("boats", 1), s.type === "ufo" && qe("ufos", 1), s.type === "mothership" && (qe("ufos", 1), qe("motherships", 1, "max")), s._killSrc === "drone" && qe("droneKills", 1), r === !0 && Q.killReload && p.ammo < Q.missileMax && (p.reload += Q.missileReload * .5, p.reload >= Q.missileReload && (p.reload -= Q.missileReload, p.ammo++)); } function _1(s?: any, r?: any) { if (!p.dead && !(p.boostIframe > 0 && r !== "crashed") && !(p.shield > 0 && r !== "crashed")) {
    if (r !== "crashed" && p.specShield && p.specShieldT > 0) {
        if (p.specShield === "phase")
            return;
        if (p.specShield === "absorb") {
            p.absorbStored += s * (Q.absorbMul || 1) * Nr("absorb"), p.hitT = 0;
            return;
        }
    }
    if (p.calmT = 0, r !== "crashed" && (s *= 1 - Q.armor, p.waveHit = !0), p.hp = Math.max(0, p.hp - s), p.hitT = 0, p.shake = Math.max(p.shake, Math.min(1, s / 20)), p.hp <= 0 && Q.secondWind && !p.secondWindUsed && r !== "crashed") {
        p.secondWindUsed = !0, p.hp = p.hpMax * .2, p.shield = 2, p.banner = "Second wind", p.bannerT = 2;
        return;
    }
    if (p.hp <= 0) {
        p.dead = !0, p.deadT = 0, p.cause = r, p.firing = !1, p.offer = null, p.pending = 0, Ea = !1;
        let f = Yt[0];
        kn(f.x, f.y, Math.max(f.z, Ie(f.x, f.y) + 1), 1.8), qe("runs", 1), qe("bestScore", p.score, "max"), qe("bestLevel", p.level, "max"), qe("spent", Qo({ ranks: Ra }), "max"), r === "crashed" && Ie(f.x, f.y) === 0 && qe("waterCrash", 1, "max");
    }
} } function bm() { let s = Yt[0]; vs(), Q = _s([], Ra, tl), Object.assign(p, { hp: Q.hullMax, hpMax: Q.hullMax, score: 0, wave: 0, kills: 0, heat: 0, overheated: !1, ammo: Q.missileMax, reload: 0, shield: 3, calmT: 0, dead: !1, deadT: 0, cause: "", banner: "", bannerT: 0, waveHelp: "", waveHelpT: 0, hitT: 9, pullUp: !1, started: !0, waveT: 3, waveLive: !1, firing: !1, gunT: 0, muzzleT: 0, shake: 0, level: 1, xp: 0, pending: 0, offer: null, taken: [], ranks: {}, streak: 0, lastKillT: -99, toast: "", toastT: 0, aces: 0, secondWindUsed: !1, flare: Q.flareMax, flareReload: 0, emp: Q.empMax, empReload: 0, specGun: null, specGunLv: 0, specGunT: 0, specMsl: null, specMslLv: 0, specMslT: 0, specShield: null, specShieldLv: 0, specShieldT: 0, specCraft: null, specCraftLv: 0, specCraftT: 0, absorbStored: 0, plasmaCh: 0, gatesGot: 0, toastRgb: null, boostFuel: Q.boostMax, boostBurn: !1, boostIframe: 0, boostCd: 0, achieveToast: "", achieveToastT: 0, achieveBonus: "", waveHit: !1, slowT: 0 }), Dn = [], qn = [], Ka = [], Vo = !1, ce = [], Ye = [], Ta = [], xa = [], ml = [], nn = null, Ya = null, M = [], qt = [], wt = [], be = [], je = [], Q.drones > 0 && xm(s), s.z = Math.max(s.z, e.altitude, Ie(s.x, s.y) + 20), zn = e.altitude, s.trailLen = 0, Mm(); try {
    $();
}
catch { } } function Am() { p.specGun === "circus" && (p.specMsl = "circus", p.specMslLv = p.specGunLv || 1, p.specMslT = 1e9, p.specGun = null, p.specGunLv = 0, p.specGunT = 0); } function Mm() { if (Am(), p.specGun)
    return; let s = Q.startGun; if (!s || !Xa[s])
    return; let r = Xa[s]; p.specGun = s, p.specGunLv = Math.min(zh, ki(s)), p.specGunT = r.kind === "shield" ? Xu(r.dur, 0, p.specGunLv) : 1e9; } function wc(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any, y?: any, A?: any, E?: any, D?: any) { let O = u - s, C = g - r, I = i - f, nt = O * O + C * C + I * I || 1e-9, ht = ((y - s) * O + (A - r) * C + (E - f) * I) / nt; ht = ht < 0 ? 0 : ht > 1 ? 1 : ht; let yt = s + O * ht - y, S = r + C * ht - A, X = f + I * ht - E; return yt * yt + S * S + X * X < D * D; } function i0(s?: any, r?: any) { let f = Fe() * (s.scale || 1), u = Ss(s), g = r.a * ko * f, i = r.b * ko * f, y = (r.y - _o) * ko * f; return { x: s.x + g * u.rx + i * u.fx + y * u.ux, y: s.y + g * u.ry + i * u.fy + y * u.uy, z: s.z + g * u.rz + i * u.fz + y * u.uz }; } function I5(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any, y?: any) { let A = Fe() * (y.scale || 1), E = Cs * ko * .42 * A, D = Ws * ko * .38 * A, O = Ds * ko * .38 * A, C = Math.sin(y.yaw), I = -Math.cos(y.yaw), nt = -I, ht = C; for (let yt = 0; yt <= 4; yt++) {
    let S = yt / 4, X = s + (u - s) * S - y.x, Y = r + (g - r) * S - y.y, F = f + (i - f) * S - y.z, ot = X * C + Y * I, H = X * nt + Y * ht, j = F;
    if (ot * ot / (E * E) + H * H / (D * D) + j * j / (O * O) <= 1)
        return !0;
} return !1; } function vm(s?: any, r?: any, f?: any, u?: any) { if (!r || r.dead || s.dying >= 0)
    return !1; let g = Q.airshipDmg || 1; if (r.hp -= f * g, r.flash = .08, s.flash = .04, r.hp > 0)
    return !1; r.dead = !0; let i = i0(s, r); kn(i.x, i.y, i.z, .45 * (s.scale || 1)); let y = Math.round(18 * (1 + .08 * (p.wave - 1)) * (u ? 1.25 : 1)); return o0(y, "turret"), p.score += 80 + 10 * (p.wave || 1), qe("airshipTurrets", 1), !0; } function V5(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any, y?: any, A?: any) { if (y.kind === "airship") {
    if (y.turrets)
        for (let E of y.turrets) {
            if (E.dead)
                continue;
            let D = i0(y, E);
            if (wc(s, r, f, u, g, i, D.x, D.y, D.z, Math.max(5.5, E.r * 1.4) * A * (y.scale || 1)))
                return { part: "turret", turret: E };
        }
    return I5(s, r, f, u, g, i, y) ? { part: "hull" } : null;
} return wc(s, r, f, u, g, i, y.x, y.y, y.z, 34 * .8 * A * y.scale) ? { part: "hull" } : null; } function X5(s?: any, r?: any, f?: any) { let u = Fe(); if (p.hitT += s, p.muzzleT -= s, p.shake = Math.max(0, p.shake - s * 2.5), p.bannerT > 0 && (p.bannerT -= s), p.waveHelpT > 0 && (p.waveHelpT -= s), p.toastT > 0 && (p.toastT -= s), p.achieveToastT > 0 && (p.achieveToastT -= s), p.slowT > 0 && (p.slowT = Math.max(0, p.slowT - s)), p.dead && (p.deadT += s), p.shield = Math.max(0, p.shield - s), p.calmT += s, !p.dead && p.calmT > Q.regenDelay && (p.hp = Math.min(p.hpMax, p.hp + Q.regenRate * s / (1 + .15 * Math.max(0, p.wave - 5)))), p.started && !p.dead && ce.length === 0 && !p.holdWaves && (p.waveLive && (p.waveLive = !1, o0(50 + 20 * p.wave, "wave " + p.wave + " clear"), p.banner = "WAVE " + p.wave + " CLEARED", p.bannerT = 2.2, z1("wave"), qe("waves", 1), p.waveHit || qe("cleanWaves", 1), qe("bestScore", p.score, "max"), qe("bestLevel", p.level, "max")), p.waveT -= s, p.waveT <= 0 && !p.offer)) {
    p.wave++;
    let y = Y5();
    p.banner = y.includes("ace") ? "Wave " + p.wave + " \xB7 ace inbound" : p.wave >= 15 && (p.wave - 15) % 10 === 0 ? "Wave " + p.wave + " \xB7 mothership" : p.wave >= 13 && (p.wave - 13) % 8 === 0 ? "Wave " + p.wave + " \xB7 zeppelin carrier" : p.wave === 14 ? "Wave " + p.wave + " \xB7 alien airship inbound" : p.wave === 10 ? "Wave " + p.wave + " \xB7 steampunk inbound" : p.wave === 7 ? "Wave " + p.wave + " \xB7 dirigible inbound" : "Wave " + p.wave, p.bannerT = 2.6, p.waveHelp = "Destroy every enemy \u2014 ground & sea targets count", p.waveHelpT = 3.6, p.waveT = 3.5, p.wave > 1 && (p.hp = Math.min(p.hpMax, p.hp + 30)), p.shield = Math.max(p.shield, 2);
} D5(s, r), M5(s, r), p.gunT -= s; let g = p.firing && !p.dead && !p.overheated && Ze > 1.9, i = p.specGun || null; if (i === "laser" || i === "lumen")
    g && (i === "lumen" ? b5(s, r) : T5(s, r), p.heat += Q.heatPerVolley * .55 * Q.fireRate * s, p.heat >= 1 && (p.heat = 1, p.overheated = !0));
else if (i === "plasma" || i === "spirit")
    if (g)
        p.plasmaCh = Math.min(1, (p.plasmaCh || 0) + s / Math.max(.25, .7 * (Q.plasmaCharge || 1))), p.plasmaCh >= 1 && (i === "spirit" ? um(r, 1) : fm(r, 1), p.heat += Q.heatPerVolley * 1.6, p.heat >= 1 && (p.heat = 1, p.overheated = !0));
    else if ((p.plasmaCh || 0) >= .3) {
        let y = p.plasmaCh;
        i === "spirit" ? um(r, y) : fm(r, y), p.heat += Q.heatPerVolley * (.6 + y), p.heat >= 1 && (p.heat = 1, p.overheated = !0);
    }
    else
        p.plasmaCh = 0;
else if (g && p.gunT <= 0) {
    i ? d5(r, i) : JA(r);
    let y = Q.fireRate;
    i === "fireball" ? y *= .42 : i === "wave" ? y *= .85 : i === "scatter" ? y *= .75 : i === "helix" ? y *= .48 : i === "rail" ? y *= .38 : i === "chakram" ? y *= .55 : i === "bits" ? y *= .7 : i === "cannon" && (y *= 1.05), p.gunT += 1 / y, p.gunT < 0 && (p.gunT = 0), p.heat += Q.heatPerVolley * (i === "fireball" ? 1.3 : 1), p.heat >= 1 && (p.heat = 1, p.overheated = !0);
} if (g ? p.heat = Math.max(0, p.heat - s * .12 * Q.coolMul) : p.heat = Math.max(0, p.heat - s * (p.overheated ? .42 : .55) * Q.coolMul), p.overheated && p.heat <= .3 && (p.overheated = !1), p.ammo < Q.missileMax ? (p.reload += s, p.reload >= Q.missileReload && (p.reload = 0, p.ammo++)) : p.reload = 0, Q.flareMax > 0 && (p.flare < Q.flareMax ? (p.flareReload += s, p.flareReload >= 16 * Q.specialCd && (p.flareReload = 0, p.flare++)) : p.flareReload = 0), Q.empMax > 0 && (p.emp < Q.empMax ? (p.empReload += s, p.empReload >= 20 * Q.specialCd && (p.empReload = 0, p.emp++)) : p.empReload = 0), Ya = p.dead ? null : as(r.x, r.y, r.yaw, Math.min(Math.PI * .6, 1 * Q.assistMul), 1100 * Q.lockRange), !p.dead && p.hp < p.hpMax * .4 && (p.dmgT -= s, p.dmgT <= 0)) {
    p.dmgT = .03 + p.hp / p.hpMax * .2;
    let [y, A, E] = Ga(r, (at() - .5) * 8, ha - 30, 2);
    Ha(y, A, E, 1.4 * u, 1.2, .55 + (.4 - p.hp / p.hpMax), p.hp < p.hpMax * .2 ? 22 : 60, -r.vx * .2, -r.vy * .2);
} K5(s, r, f), N5(s, r), Q5(s), Z5(s, r), F5(s), J5(s), p.pending > 0 && !p.offer && !p.dead && Fh(); } function wm(s?: any, r?: any, f?: any, u?: any, g?: any, i?: any, y?: any) { let A = s.T, E = s.aimAt && !s.aimAt.dead ? s.aimAt : r; if (!E || p.dead)
    return; let D = (es + (s.spd || 0) * e.speed) * (y === "bolt" ? .85 : 1), C = Math.hypot(E.x - u, E.y - g, E.z - i) / Math.max(40, D), I = E.x + (E.vx || 0) * C - u, nt = E.y + (E.vy || 0) * C - g, ht = E.z - i, yt = Math.hypot(I, nt, ht) || 1, S = f.spread * (A.turret ? 1.5 : 1.1); I = I / yt + (at() - .5) * S, nt = nt / yt + (at() - .5) * S, ht = ht / yt + (at() - .5) * S; let X = 2 * f.dmg * (A.boss ? 1.35 : A.turret ? 1.15 : 1), Y: Record<string, any> = { x: u, y: g, z: i, vx: I * D, vy: nt * D, vz: ht * D, age: 0, life: 1.8, own: 1, dmg: X }; y === "plasma" && (Y.col = 6750105, Y.special = "plasma", Y.size = 1.6, Y.dmg = X * 1.2), y === "bolt" && (Y.col = 13172582, Y.special = "bolt", Y._home = E, Y.dmg = X * 1.1), y === "flak" && (Y.col = 16764006, Y.special = "flak", Y.splash = 16, Y.dmg = X), y === "tracer" && (Y.col = 16769152, Y.special = "tracer", Y.size = 1.15, Y.dmg = X * .9), Ye.push(Y), p.foeShots++; } function j5(s?: any, r?: any, f?: any, u?: any) { let g = s.T, i = s.kind; s.flash -= r, s.stun > 0 && (s.stun -= r); let y = f.x - s.x, A = f.y - s.y, E = f.z - s.z, D = Math.hypot(y, A); if (D > 1800 && i !== "airship") {
    let C = f.yaw + (at() - .5) * 1.4;
    i === "ufo" && (s.x = f.x + Math.sin(C) * 700, s.y = f.y - Math.cos(C) * 700, s.z = Math.max(Ie(s.x, s.y) + 40, f.z + 8));
    return;
} if (i !== "airship" && (s.yaw = Math.atan2(y, -A), s.roll = 0, s.pitch = Vt(Math.atan2(E, D) * .4, -.5, .5)), i === "sea") {
    let C = e.speed * (s.spd || .25);
    s.vx = Math.sin(s.yaw + .7) * C, s.vy = -Math.cos(s.yaw + .7) * C, s.x += s.vx * r, s.y += s.vy * r, Ie(s.x, s.y) > 0 && (s.x -= s.vx * r * 2, s.y -= s.vy * r * 2), s.z = 3;
}
else if (i === "ground")
    s.vx = 0, s.vy = 0, s.z = Ie(s.x, s.y) + (s.type === "bunker" ? 6 : 4);
else if (i === "airship") {
    s.modeT = (s.modeT || 0) - r, s.modeT <= 0 && (s.heading = (s.heading || s.yaw) + (at() - .5) * .28, s.modeT = 6 + at() * 6);
    let C = s.heading || s.yaw, I = .16 + .1 * (g.turn || .2), nt = Vt(Fn(C - s.yaw) * .45, -I, I);
    s.yawRate = (s.yawRate || 0) + (nt - (s.yawRate || 0)) * (1 - Math.exp(-r * 1.15)), s.yaw += (s.yawRate || 0) * r;
    let ht = e.speed * (s.spd || .2);
    s.vx = Math.sin(s.yaw) * ht, s.vy = -Math.cos(s.yaw) * ht, s.x += s.vx * r, s.y += s.vy * r;
    let yt = Ie(s.x, s.y) + 48, S = Vt(62 + Math.sin(Lt * .25 + (s.altOff || 0)) * 10, yt, e.ceiling || 300), X = s.z;
    s.z += (S - s.z) * (1 - Math.exp(-r * .45));
    let Y = .016 * Math.sin(Lt * .35 + (s.altOff || 0)), F = Vt((s.z - X) / Math.max(r, 1e-4) * .008, -.04, .04), ot = Vt(Y + F, -.05, .05);
    s.pitch += (ot - (s.pitch || 0)) * (1 - Math.exp(-r * 2.2)), s.pitch = Vt(s.pitch, -.06, .06);
    let H = Vt((s.yawRate || 0) * 1.6, -.09, .09);
    if (s.roll += (H - (s.roll || 0)) * (1 - Math.exp(-r * 2)), s.roll = Vt(s.roll, -.1, .1), g.launch && (s.launchT = (s.launchT || 8) - r, s.launchT <= 0 && s.launched < (g.boss ? 4 : 2) && !p.dead)) {
        s.launchT = 8 + at() * 5, s.launched = (s.launched || 0) + 1;
        let j = Math.sin(s.yaw), W = -Math.cos(s.yaw);
        Om("fighter", s.x - j * 18, s.y - W * 18, s.z - 8);
    }
    if (D > 1600) {
        let j = f.yaw + (at() - .5) * 1.2 + Math.PI * .15;
        s.x = f.x + Math.sin(j) * 780, s.y = f.y - Math.cos(j) * 780, s.z = Math.max(Ie(s.x, s.y) + 50, 64), s.heading = f.yaw + (at() - .5) * .6;
    }
}
else {
    s.modeT -= r;
    let C = .55 + .15 * Math.sin(Lt + s.altOff), I = Math.atan2(y, -A) + (s.side || 1) * .9;
    s.yawRate = (s.yawRate || 0) + (Fn(I - s.yaw) * 1.8 - (s.yawRate || 0)) * (1 - Math.exp(-r * 3));
    let nt = e.speed * (s.spd || .9) * C;
    s.vx = Math.sin(s.yaw) * nt, s.vy = -Math.cos(s.yaw) * nt, s.x += s.vx * r, s.y += s.vy * r;
    let ht = Ie(s.x, s.y) + 28, yt = Vt(f.z + 16 + Math.sin(Lt * .7 + s.altOff) * 12, ht, e.ceiling || 300);
    if (s.z += (yt - s.z) * (1 - Math.exp(-r * 1.4)), D < (g.boss ? 160 : 90) && Math.abs(E) < 70) {
        p.slowT = Math.max(p.slowT, g.boss ? .7 : .4);
        let S = (g.boss ? 28 : 16) * r;
        f.x += (s.x - f.x) / Math.max(8, D) * S, f.y += (s.y - f.y) / Math.max(8, D) * S, s.beamOn = !0, s.beamT = .25;
    }
    else
        s.beamT = Math.max(0, (s.beamT || 0) - r), s.beamOn = s.beamT > 0;
} if (i === "airship" && s.turrets) {
    for (let C of s.turrets) {
        if (C.dead)
            continue;
        C.flash = Math.max(0, (C.flash || 0) - r), C.cd -= r;
        let I = D < (g.range || 440);
        if (!p.dead && s.stun <= 0 && I && C.cd <= 0 && (C.burst = g.burst[u.tier] || 3, C.cd = (g.cd + at() * 1.2) / u.fire), C.burst > 0 && s.stun <= 0 && (C.burstT -= r, C.burstT <= 0)) {
            C.burst--, C.burstT = .14;
            let nt = i0(s, C), ht = s.type === "alien" ? C.burst & 1 ? "plasma" : "bolt" : C.burst & 1 ? "flak" : "tracer";
            wm(s, f, u, nt.x, nt.y, nt.z, ht);
        }
    }
    return;
} s.cd -= r; let O = D < (g.range || 400); if (!p.dead && s.stun <= 0 && O && s.cd <= 0 && (s.burst = g.burst[u.tier] || 3, s.cd = (g.cd + at() * 1.4) / u.fire, s.aimAt = f), s.burst > 0 && s.stun <= 0 && (s.burstT -= r, s.burstT <= 0)) {
    s.burst--, s.burstT = g.boss ? .08 : .11;
    let C = i === "ufo" ? 6 * s.scale : i === "sea" ? 8 : 10, I = i === "ground" || i === "sea" ? "flak" : null;
    i === "ufo" && (I = s.burst & 1 ? "plasma" : "bolt"), wm(s, f, u, s.x, s.y, s.z + C, I);
} } function K5(s?: any, r?: any, f?: any) { let u = e.bank * Math.PI / 180, g = io(); for (let i of ce) {
    let y = Fe() * i.scale;
    if (i.kind === "ground" || i.kind === "sea" || i.kind === "ufo" || i.kind === "airship") {
        if (i.dying >= 0) {
            if (i.dying += s, i.kind === "ufo" && (i.vz = (i.vz || 0) - 40 * s, i.z += i.vz * s, i.yaw += s * 2), i.kind === "airship") {
                if (i.vz = (i.vz || 0) - 18 * s, i.x += (i.vx || 0) * s, i.y += (i.vy || 0) * s, i.z += i.vz * s, i.vx = (i.vx || 0) * (1 - s * .2), i.vy = (i.vy || 0) * (1 - s * .2), i.pitch = Vt((i.pitch || 0) + s * .35, -.2, 1.05), i.roll = Vt((i.roll || 0) + (i.spin || 1) * s * .45, -1.2, 1.2), i.yaw += (i.spin || 1) * s * .25, i.puffT = (i.puffT || 0) - s, i.puffT <= 0) {
                    i.puffT = i.type === "alien" ? .07 : .05;
                    let Rt = Fe() * i.scale;
                    if (i.type === "steampunk") {
                        if (Ha(i.x + (at() - .5) * 16 * i.scale, i.y + (at() - .5) * 16 * i.scale, i.z + 6, 3.4 * Rt, 1.8, .65, 50), at() < .4) {
                            let Jt = at() * Math.PI * 2;
                            Ms.push({ x: i.x, y: i.y, z: i.z + 4, vx: Math.cos(Jt) * 28, vy: Math.sin(Jt) * 28, vz: 16 + at() * 20, age: 0, life: .9, c: 0, puffT: 0, shape: "gear" });
                        }
                    }
                    else
                        i.type === "alien" ? (Ha(i.x + (at() - .5) * 12 * i.scale, i.y + (at() - .5) * 12 * i.scale, i.z, 2.6 * Rt, 1.2, .55, 80), at() < .5 && In(i.x + (at() - .5) * 12 * i.scale, i.y + (at() - .5) * 12 * i.scale, i.z, !0)) : (Ha(i.x + (at() - .5) * 16 * i.scale, i.y + (at() - .5) * 16 * i.scale, i.z, 3 * Rt, 2.4, .85, 20), at() < .55 && In(i.x + (at() - .5) * 14 * i.scale, i.y + (at() - .5) * 14 * i.scale, i.z, !0));
                }
                let Tt = Math.floor(i.dying / .55);
                Tt > (i._boomStage || 0) && (i._boomStage = Tt, kn(i.x + (at() - .5) * 18 * i.scale, i.y + (at() - .5) * 18 * i.scale, i.z, .7 * i.scale));
            }
            let Z = Ie(i.x, i.y);
            if (i.kind === "airship") {
                (i.z <= Z + 2 || i.dying > 3.6) && (kn(i.x, i.y, Math.max(i.z, Z + 1), 1.8 * i.scale), i.dead = !0);
                continue;
            }
            (i.dying > .35 || i.kind === "ufo" && i.z <= Ie(i.x, i.y) + 1) && (kn(i.x, i.y, Math.max(i.z, Ie(i.x, i.y) + 1), 1.1 * i.scale), i.dead = !0);
            continue;
        }
        j5(i, s, r, g);
        continue;
    }
    if (i.dying >= 0) {
        i.dying += s, i.vz -= 70 * s, i.x += i.vx * s, i.y += i.vy * s, i.z += i.vz * s, i.vx *= 1 - s * .3, i.vy *= 1 - s * .3, i.stunt = -1, i.roll += i.spin * s, i.yaw += i.yawRate * s, i.pitch = Vt(i.pitch - s * .9, -.9, .9), i.puffT -= s, i.puffT <= 0 && (i.puffT = .035, Ha(i.x, i.y, i.z, 2 * y, 2.2, .8, 24), at() < .5 && In(i.x + (at() - .5) * 6, i.y + (at() - .5) * 6, i.z, !0));
        let Z = Ie(i.x, i.y);
        (i.z <= Z + 1 || i.dying > 2.6) && (kn(i.x, i.y, Math.max(i.z, Z + 1), 1.3 * i.scale), i.dead = !0);
        continue;
    }
    let A = i.T;
    i.lostLock > 0 && (i.lostLock -= s);
    let E = Math.max(.1, e.agility) * A.turn * (i.stun > 0 ? .25 : 1) * (i.lostLock > 0 ? .22 : 1);
    i.flash -= s, i.stun > 0 && (i.stun -= s);
    let D = r.x - i.x, O = r.y - i.y, C = r.z - i.z, I = Math.hypot(D, O);
    if (I > 1500) {
        let Z = r.yaw + (at() - .5) * 2;
        i.x = r.x + Math.sin(Z) * 750, i.y = r.y - Math.cos(Z) * 750, i.z = Math.max(Ie(i.x, i.y) + 20, r.z), i.yaw = Math.atan2(r.x - i.x, -(r.y - i.y)), i.trailLen = 0, i.lastTrailX = i.x, i.lastTrailY = i.y;
        continue;
    }
    i.modeT -= s, i.mode === "attack" && I < 60 * i.scale ? (i.mode = "break", i.modeT = 1.4 + at() * 1.4, i.side = at() < .5 ? -1 : 1) : i.mode === "break" && i.modeT <= 0 && (i.mode = "attack");
    let nt = Vt(I / 380, 0, 1.2), ht = r.x + r.vx * nt - i.x, yt = r.y + r.vy * nt - i.y, S = p.dead ? i.yaw + Math.sin(Lt * .5 + i.altOff) * .6 : Math.atan2(ht, -yt);
    i.lostLock > 0 && (S = i.yaw + i.side * .15), i.mode === "break" && (S += i.side * 1.9);
    let X = Fn(S - i.yaw), Y = Vt(X * 2.4, -E, E);
    i.yawRate += (Y - i.yawRate) * (1 - Math.exp(-s * 2.6)), i.yaw += i.yawRate * s, i.roll += (Vt(i.yawRate / E, -1, 1) * u - i.roll) * (1 - Math.exp(-s * 5));
    let F = e.speed * i.spd * (I > 450 && i.mode === "attack" ? 1.4 : 1);
    i.vx = Math.sin(i.yaw) * F, i.vy = -Math.cos(i.yaw) * F, i.x += i.vx * s, i.y += i.vy * s, i.altT -= s, i.altT <= 0 && (i.altOff = (at() - .5) * 30, i.altT = 3 + at() * 4);
    let ot = N1(i, F) + f + 3 * i.scale, H = Vt(p.dead ? e.altitude : r.z + i.altOff, ot, Math.max(ot, Vt(e.ceiling, 20, 900))), j = Vt((H - i.z) * (1 - Math.exp(-s * 2)), -F * .5 * s, F * .5 * s);
    i.z += j, i.z = Math.max(i.z, Ie(i.x, i.y) + 3), i.vz = j / Math.max(s, 1e-4), i.pitch += (Vt(i.vz / Math.max(20, F) * 1.25, -.5, .5) - i.pitch) * (1 - Math.exp(-s * 4)), i.cd -= s;
    let W = Math.abs(Fn(Math.atan2(D, -O) - i.yaw)), ct = A.turret ? I < A.range : i.mode === "attack" && I < A.range && W < .15;
    if (!p.dead && i.stun <= 0 && !(i.lostLock > 0) && ct && Math.abs(C) < 40 * i.scale && i.cd <= 0) {
        i.burst = A.burst[g.tier], i.cd = (A.cd + at() * 1.6) / g.fire;
        let Z = xa.filter((Rt?: any) => !Rt.dead && !Rt.kamikaze && Math.hypot(Rt.x - i.x, Rt.y - i.y) < A.range + 60);
        p.specShield === "phase" && p.specShieldT > 0 && Q.phaseCap ? i.aimAt = Z.length ? Z[at() * Z.length | 0] : null : i.aimAt = Z.length && at() < .32 ? Z[at() * Z.length | 0] : r;
    }
    if (i.burst > 0 && i.stun <= 0 && (i.burstT -= s, i.burstT <= 0)) {
        i.burst--, i.burstT = A.boss ? .07 : .09;
        let Z = i.aimAt && !i.aimAt.dead ? i.aimAt : p.specShield === "phase" && p.specShieldT > 0 && Q.phaseCap ? null : r;
        if (!Z)
            continue;
        let [Tt, Rt, Jt] = A.turret ? Ga(i, 0, 0, 3) : Ga(i, (i.burst & 1 ? 1 : -1) * 4.5, ha - 9, 0), Xt = es + F, $t = Math.hypot(Z.x - Tt, Z.y - Rt, Z.z - Jt) / Xt, oe = Z.x + Z.vx * $t - Tt, he = Z.y + Z.vy * $t - Rt, Te = Z.z - Jt, ie = Math.hypot(oe, he, Te) || 1, Zt = g.spread * (A.turret ? 1.4 : 1);
        oe = oe / ie + (at() - .5) * Zt, he = he / ie + (at() - .5) * Zt, Te = Te / ie + (at() - .5) * Zt;
        let ft = 2 * g.dmg * (A.boss ? 1.3 : A.turret ? 1.2 : 1);
        Ye.push({ x: Tt, y: Rt, z: Jt, vx: oe * Xt, vy: he * Xt, vz: Te * Xt, age: 0, life: 1.6, own: 1, dmg: ft }), p.foeShots++;
    }
} ce.some((i?: any) => i.dead) && (ce = ce.filter((i?: any) => !i.dead)); } function Z5(s?: any, r?: any) { let f = Fe(), u = 34 * .3 * f, g = 0; for (let i of Ye) {
    let y = i.x, A = i.y, E = i.z;
    if (i._home && (i._home.dying >= 0 || i._home.dead) && (i._home = null), i._home) {
        let C = i._home, I = C.x - i.x, nt = C.y - i.y, ht = C.z - i.z, yt = Math.hypot(I, nt, ht) || 1, S = Math.hypot(i.vx, i.vy, i.vz);
        i.vx += (I / yt * S - i.vx) * 4 * s, i.vy += (nt / yt * S - i.vy) * 4 * s, i.vz += (ht / yt * S - i.vz) * 4 * s;
    }
    if (i.x += i.vx * s, i.y += i.vy * s, i.z += i.vz * s, i.age += s, i.special === "fireball" && (i.puffT = (i.puffT || 0) - s, i.puffT <= 0 && (i.puffT = .05, Ha(i.x - i.vx * .04, i.y - i.vy * .04, i.z, 1.4, .7, .45, 32))), i.special === "wave" || i.special === "helix" || i.special === "spirit") {
        let C = -i.vy, I = i.vx, nt = Math.hypot(C, I) || 1, ht = i.special === "spirit" ? (i.waveW || 4) * .5 : i.amp || i.waveW || 14, yt = i.special === "helix" ? 22 : 14, S = Math.sin((i.phase || 0) + i.age * yt) * ht, X = Math.sin((i.phase || 0) + Math.max(0, i.age - s) * yt) * ht;
        i.x += (S - X) * C / nt, i.y += (S - X) * I / nt, i.special === "helix" && (i.z += (S - X) * .35);
    }
    if (i.special === "chakram" && i.home && !i._home) {
        let C = jo(Yt[0], null);
        C && (i._home = C);
    }
    if (i.age > i.life) {
        i.special === "fireball" && vc(i.x, i.y, i.z, i.splash || 30, i.dmg, i.burn, i.napalm);
        continue;
    }
    let D = Ie(i.x, i.y);
    if (i.z <= D) {
        In(i.x, i.y, D + .5, !1), i.special === "fireball" && vc(i.x, i.y, D + 1, i.splash || 30, i.dmg, i.burn, i.napalm), at() < .3 && Ha(i.x, i.y, D + 1, 1.2 * f, .8, .35, D > 0 ? 150 : 210);
        continue;
    }
    let O = !1;
    if (i.own === 0)
        for (let C of ce) {
            if (C.dying >= 0)
                continue;
            let I = V5(y, A, E, i.x, i.y, i.z, C, f);
            if (I && (q5(i.x, i.y, i.z, i.special || (i.drone ? "drone" : "cannon"), !0), i.special === "helix" && kn(i.x, i.y, i.z, .45), i.special === "fireball" ? vc(i.x, i.y, i.z, i.splash || 30, i.dmg, i.burn, i.napalm) : (i.stun && (C.stun = Math.max(C.stun || 0, .55)), i.splash && vc(i.x, i.y, i.z, i.splash, i.dmg * .45, i.burn || 0, !1), I.part === "turret" ? vm(C, I.turret, i.dmg, i.drone ? "drone" : !1) : xl(C, i.dmg, i.drone ? "drone" : !1), i.special === "scatter" && i.burst && vc(i.x, i.y, i.z, 16, i.dmg * .7, 0, !1), Qr(C, i.dmg, !1)), !(i.pierce && (i.hits = (i.hits || 0) + 1) < (i.special === "rail" || i.special === "helix" ? 6 : 3))))
                if (i.bounce > 0)
                    i.bounce--, i.vx = -i.vx * .9 + (at() - .5) * 40, i.vy = -i.vy * .9 + (at() - .5) * 40, i._home = null;
                else {
                    O = !0;
                    break;
                }
        }
    else {
        if (!O) {
            for (let C of ml)
                if (wc(y, A, E, i.x, i.y, i.z, C.x, C.y, C.z, 18 * f)) {
                    In(i.x, i.y, i.z, !1), O = !0;
                    break;
                }
        }
        if (!O) {
            for (let C of xa)
                if (!(C.dead || C.kamikaze) && wc(y, A, E, i.x, i.y, i.z, C.x, C.y, C.z, 34 * .4 * f * C.scale)) {
                    C.hp -= i.dmg, C.flash = .08, In(i.x, i.y, i.z, !0), C.hp <= 0 && R5(C), O = !0;
                    break;
                }
        }
        if (!O && Q.droneScreen) {
            for (let C of xa)
                if (!(C.dead || C.kamikaze) && wc(y, A, E, i.x, i.y, i.z, C.x, C.y, C.z, 9 * f)) {
                    In(i.x, i.y, i.z, !1), O = !0;
                    break;
                }
        }
        !O && !p.dead && wc(y, A, E, i.x, i.y, i.z, r.x, r.y, r.z, u * (p.specShield === "mirror" && p.specShieldT > 0 ? 1.25 * (Q.mirrorArc || 1) : 1)) && (p.specShield === "phase" && p.specShieldT > 0 || (p.specShield === "deflect" && p.specShieldT > 0 ? (pm(i, r, !1), In(i.x, i.y, i.z, !0), Ye[g++] = i, O = !0) : p.specShield === "mirror" && p.specShieldT > 0 && C5(r, i) ? (pm(i, r, !0), In(i.x, i.y, i.z, !0), Ye[g++] = i, O = !0) : (_1(i.dmg, "shot down"), In(i.x, i.y, i.z, !0), O = !0)));
    }
    O || (Ye[g++] = i);
} Ye.length = g; } function F5(s?: any) { let r = Fe(), f = 0; for (let u of Ta) {
    if (u.age += s, u.age < 0) {
        Ta[f++] = u;
        continue;
    }
    u.sp = Math.min(360, u.sp + 280 * s), u.target && (u.target.dying >= 0 || u.target.dead) && (u.target = as(u.x, u.y, u.yaw, 1.6, 1e3));
    let g = u.target, i = Q.battleNet ? 0 : .2 * Q.lockDelay, y = u.turn || 4.6;
    if (g && u.age > i) {
        let D = Math.hypot(g.x - u.x, g.y - u.y) / u.sp, O = Math.atan2(g.x + g.vx * D * .6 - u.x, -(g.y + g.vy * D * .6 - u.y)), C = Fn(O - u.yaw);
        u.yaw += Vt(C, -y * s, y * s), u.vz = Vt((g.z - u.z) / Math.max(D, .15), -u.sp * .7, u.sp * .7);
    }
    else
        u.age < .2 ? u.vz = -25 : u.vz *= 1 - s * 2;
    if (u.special === "circus" && (u.x -= u.hx || 0, u.y -= u.hy || 0, u.z -= u.hz || 0), u.x += Math.sin(u.yaw) * u.sp * s, u.y -= Math.cos(u.yaw) * u.sp * s, u.z += u.vz * s, u.special === "circus" && u.age > 0) {
        let E = u.age * 16 + (u.spiral || 0), D = 6.5, O = Math.cos(u.yaw), C = Math.sin(u.yaw);
        u.hx = O * Math.cos(E) * D, u.hy = C * Math.cos(E) * D, u.hz = Math.sin(E) * D * .75, u.x += u.hx, u.y += u.hy, u.z += u.hz;
    }
    if (u.puffT -= s, u.puffT <= 0 && u.age > .15 && u.special !== "circus" && (u.puffT = u.special === "torpedo" ? .04 : .018, Ha(u.x - Math.sin(u.yaw) * 3, u.y + Math.cos(u.yaw) * 3, u.z, (u.size || 1) * 1.1 * r, 1.3, .55, u.special === "singularity" ? 260 : u.special === "torpedo" ? 160 : 206), u.trailDmg))
        for (let E of ce)
            E.dying >= 0 || Math.hypot(E.x - u.x, E.y - u.y, E.z - u.z) < 18 && xl(E, u.trailDmg * .15, !0);
    if (u.special === "cluster" && (u.gen || 0) < (u.maxGen || 1) && u.age > .5) {
        B1(u);
        continue;
    }
    let A = !1;
    for (let E of ce) {
        if (E.dying >= 0)
            continue;
        let D = (E.kind === "airship" ? Cs * ko * .42 * r * E.scale : 34 * .9 * r * E.scale) * (u.size || 1);
        if (Math.hypot(E.x - u.x, E.y - u.y, E.z - u.z) < D) {
            if (u.special === "cluster" && (u.gen || 0) < (u.maxGen || 1)) {
                B1(u), A = !0;
                break;
            }
            if (u.special === "singularity") {
                C1(u.x, u.y, u.z, u.wellR || 95, u.wellT || 1.6, u.dmg, !!Q.singCap), kn(u.x, u.y, u.z, .7), A = !0;
                break;
            }
            let O = u.dmg != null ? u.dmg : (u.mini ? 2.8 : 9) * io().hp * (u.mini ? 1 : Q.missileDmgMul) * (E.stun > 0 && Q.thunderstrike ? 1.25 : 1), C = !1;
            if (E.kind === "airship" && E.turrets)
                for (let I of E.turrets) {
                    if (I.dead)
                        continue;
                    let nt = i0(E, I);
                    if (Math.hypot(nt.x - u.x, nt.y - u.y, nt.z - u.z) < 10 * r * (E.scale || 1)) {
                        vm(E, I, O, !0), C = !0;
                        break;
                    }
                }
            C || (u.dmg != null ? xl(E, O, !0) : (E.hp -= O, E.flash = .1, E.hp <= 0 && Or(E, u.mini ? "mini" : !0))), u.special === "torpedo" && u.bloom && vc(u.x, u.y, u.z, 44, O * .45, 0, !1), Qr(E, O, !!Q.singCap && u.special === "singularity"), kn(u.x, u.y, u.z, u.mini ? .55 : (u.size || 1) * .9), A = !0;
            break;
        }
    }
    !A && u.z <= Ie(u.x, u.y) && (u.special === "singularity" ? C1(u.x, u.y, u.z, u.wellR || 95, u.wellT || 1.6, u.dmg || 8, !!Q.singCap) : u.special === "cluster" && (u.gen || 0) < (u.maxGen || 1) ? (B1(u), A = !0) : kn(u.x, u.y, Ie(u.x, u.y) + 1, .7), A = !0), !A && u.age > (u.mini ? 4 : 6) && (u.special === "singularity" && C1(u.x, u.y, u.z, u.wellR || 95, u.wellT || 1.6, u.dmg || 8, !!Q.singCap), kn(u.x, u.y, u.z, u.mini ? .35 : .5), A = !0), A || (Ta[f++] = u);
} Ta.length = f; } function J5(s?: any) { let r = 0; for (let f of Hs)
    f.age += s, f.age < f.life && (Hs[r++] = f); Hs.length = r, r = 0; for (let f of Ms)
    f.age += s, f.vz -= 90 * s, f.x += f.vx * s, f.y += f.vy * s, f.z += f.vz * s, f.puffT -= s, f.c === 2 && f.puffT <= 0 && (f.puffT = .06, Ha(f.x, f.y, f.z, .9, .9, .5, 34)), f.age < f.life && f.z > Ie(f.x, f.y) && (Ms[r++] = f); Ms.length = r; } function W5() { let s = { jets: 0, aces: 0, ufos: 0, airships: 0, motherships: 0, boats: 0, buildings: 0 }; for (let u of ce) {
    if (u.dying >= 0)
        continue;
    let g = u.kind || "fly";
    u.type === "ace" ? s.aces++ : u.type === "mothership" ? s.motherships++ : g === "ground" ? s.buildings++ : g === "sea" ? s.boats++ : g === "ufo" ? s.ufos++ : g === "airship" ? s.airships++ : s.jets++;
} let r = [], f = (u?: any, g?: any, i?: any) => { u && r.push(u + " " + (u === 1 ? g : i)); }; return f(s.jets, "JET", "JETS"), f(s.aces, "ACE", "ACES"), f(s.ufos, "UFO", "UFOS"), f(s.airships, "AIRSHIP", "AIRSHIPS"), f(s.motherships, "MOTHERSHIP", "MOTHERSHIPS"), f(s.boats, "BOAT", "BOATS"), f(s.buildings, "BUILDING", "BUILDINGS"), r; } function P5() { let s = 0, r = null; for (let u of ce)
    u.dying >= 0 || (s++, u.T.boss && (r = { name: u.T.name, frac: Math.max(0, u.hp / u.hpMax) })); let f = Object.keys(p.ranks).map((u?: any) => ({ id: u, name: l1[u].name, rank: p.ranks[u] })); return { hp: p.hp, hpMax: p.hpMax, shield: p.shield, score: p.score, wave: p.wave, kills: p.kills, heat: p.heat, overheated: p.overheated, ammo: p.ammo, ammoMax: Q.missileMax, reload: p.reload / Q.missileReload, dead: p.dead, deadT: p.deadT, cause: p.cause, banner: p.bannerT > 0 ? p.banner : "", bannerT: p.bannerT, hitT: p.hitT, pullUp: p.pullUp, waveHelp: p.waveHelpT > 0 ? p.waveHelp : "", waveHelpT: p.waveHelpT, leftLabel: W5(), lock: !!Ya, enemies: s, started: p.started, shake: p.shake, firing: p.firing, bullets: Ye.length, missiles: Ta.length, foeShots: p.foeShots, level: p.level, xp: p.xp, xpNeed: s1(p.level), offer: p.offer, taken: f, picks: p.taken.length, aces: p.aces, cleared: Math.max(0, p.wave - (p.waveLive ? 1 : 0)), secondWindUsed: p.secondWindUsed, treeUp: oo, stats: Q, toast: p.toastT > 0 ? p.toast : "", toastT: p.toastT, boss: r, streak: p.streak, types: ce.filter((u?: any) => u.dying < 0).map((u?: any) => u.type), drones: Q.drones, dronesAlive: xa.filter((u?: any) => !u.dead).length, flare: p.flare, flareMax: Q.flareMax, flareReload: Q.flareMax ? p.flareReload / (16 * Q.specialCd) : 0, emp: p.emp, empMax: Q.empMax, empReload: Q.empMax ? p.empReload / (20 * Q.specialCd) : 0, flares: ml.length, empWave: !!nn, specGun: p.specGun, specGunLv: p.specGunLv, specGunT: p.specGunT, specMsl: p.specMsl, specMslLv: p.specMslLv, specMslT: p.specMslT, specShield: p.specShield, specShieldLv: p.specShieldLv, specShieldT: p.specShieldT, specCraft: p.specCraft, specCraftLv: p.specCraftLv, specCraftT: p.specCraftT, toastRgb: p.toastRgb, absorbStored: p.absorbStored, plasmaCh: p.plasmaCh || 0, gates: p.gatesGot || 0, gateCount: M.filter((u?: any) => !(u.appear > 0)).length, gateQueued: M.length, zapCount: qt.length, wellCount: wt.length, gatesLive: M.filter((u?: any) => !(u.appear > 0)).map((u?: any) => u.type), px: Yt[0].x, py: Yt[0].y, pz: Yt[0].z, yaw: Yt[0].yaw, camYaw: ne.yaw, boostFuel: p.boostFuel, boostMax: Q.boostMax, boostBurn: !!p.boostBurn, boostIframe: p.boostIframe, boostSpeedMul: Q.boostSpeedMul, boostLock: Q.boostLock, boostCap: Q.boostCap, boostIframeOn: Q.boostIframe, pointerCount: Di.length, speed: Ft, invertY: !!Pl, achieveToast: p.achieveToastT > 0 ? p.achieveToast : "", achieveBonus: p.achieveToastT > 0 && p.achieveBonus || "", achieveToastT: p.achieveToastT || 0, chaseZoom: an, overheadZoom: $n, slowT: p.slowT || 0, funnelCount: Ka.length }; } function $5() { let s = vt, r = Hn, f = (S?: any, X?: any, Y?: any, F?: any) => { if (S |= 0, X |= 0, S < 0 || X < 0 || S >= V || X >= et)
    return; let ot = X * V + S; r[ot] < F - 1 || (s[ot] = Y); }, u = (S?: any, X?: any, Y?: any, F?: any, ot?: any, H?: any, j?: any) => { let W = Math.max(1, Math.ceil(Math.max(Math.abs(Y - S), Math.abs(F - X)))); if (!(W > 400))
    for (let ct = 0; ct <= W; ct++) {
        let Z = Math.round(S + (Y - S) * ct / W), Tt = Math.round(X + (F - X) * ct / W);
        f(Z, Tt, ot, j), H > 1 && (f(Z + 1, Tt, ot, j), f(Z, Tt + 1, ot, j), f(Z + 1, Tt + 1, ot, j));
    } }, g = S => Array.isArray(S) ? mt(S[0], S[1], S[2]) : mt(S >> 16 & 255, S >> 8 & 255, S & 255), i = (S?: any, X?: any, Y?: any, F?: any, ot?: any) => { let H = Math.ceil(Y); for (let j = -H; j <= H; j++)
    for (let W = -H; W <= H; W++)
        W * W + j * j <= Y * Y && f(S + W, X + j, F, ot); }, y = (S?: any, X?: any, Y?: any, F?: any, ot?: any) => { let H = []; if (S === "square") {
    let j = Math.cos(ot), W = Math.sin(ot);
    for (let [ct, Z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]])
        H.push([X + (ct * j - Z * W) * F, Y + (ct * W + Z * j) * F]);
}
else if (S === "triangle")
    for (let j = 0; j < 3; j++) {
        let W = ot + j * Math.PI * 2 / 3 - Math.PI / 2;
        H.push([X + Math.cos(W) * F, Y + Math.sin(W) * F]);
    }
else if (S === "pentagram") {
    let j = [];
    for (let W = 0; W < 5; W++) {
        let ct = ot - Math.PI / 2 + W * Math.PI * 2 / 5;
        j.push([X + Math.cos(ct) * F, Y + Math.sin(ct) * F]);
    }
    H.push(j[0], j[2], j[4], j[1], j[3]);
}
else
    for (let j = 0; j < 16; j++) {
        let W = ot + j * Math.PI * 2 / 16;
        H.push([X + Math.cos(W) * F, Y + Math.sin(W) * F]);
    } return H; }, A = { A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7], J: [7, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7], M: [5, 7, 7, 5, 5], N: [5, 7, 7, 7, 5], O: [2, 5, 5, 5, 2], P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 7, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2], U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5], Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7], 0: [7, 5, 5, 5, 7], 1: [2, 6, 2, 2, 7], 2: [7, 1, 7, 4, 7], 3: [7, 1, 7, 1, 7], 4: [5, 5, 7, 1, 1], 5: [7, 4, 7, 1, 7], 6: [7, 4, 7, 5, 7], 7: [7, 1, 2, 2, 2], 8: [7, 5, 7, 5, 7], 9: [7, 5, 7, 1, 7], " ": [0, 0, 0, 0, 0], ">": [4, 2, 1, 2, 4], "+": [0, 2, 7, 2, 0], "-": [0, 0, 7, 0, 0], ".": [0, 0, 0, 0, 2] }, E = (S?: any, X?: any, Y?: any, F?: any, ot?: any, H?: any, j?: any) => { let W = H || 1, ct = X | 0, Z = Y | 0; for (let Tt of S) {
    let Rt = A[Tt] || A[" "];
    for (let Jt = 0; Jt < 5; Jt++)
        for (let Xt = 0; Xt < 3; Xt++)
            if (Rt[Jt] & 4 >> Xt)
                for (let _e = 0; _e < W; _e++)
                    for (let $t = 0; $t < W; $t++) {
                        let oe = ct + Xt * W + $t, he = Z + Jt * W + _e;
                        j && (f(oe + 1, he, j, ot + 2), f(oe, he + 1, j, ot + 2)), f(oe, he, F, ot);
                    }
    ct += 4 * W;
} }; for (let S of M) {
    if (S.appear > 0)
        continue;
    let X = 1 + .1 * Math.sin((S.pulse || 0) * 5), Y = (S.r || 22) * X, F = No(S.type || S), ot = S.baseRgb || F.base, H = S.rgb || F.variant, j = S.baseCol || mt(ot[0], ot[1], ot[2]), W = mt(H[0], H[1], H[2]), ct = mt(255, 255, 255), Z = mt(Math.min(255, (H[0] || 120) + 80), Math.min(255, (H[1] || 200) + 80), Math.min(255, (H[2] || 255) + 80)), Tt = mt(Math.min(255, ot[0] + 70), Math.min(255, ot[1] + 70), Math.min(255, ot[2] + 70));
    for (let Et = 0; Et < 48; Et++) {
        let Ut = Et / 48 * Math.PI * 2, re = S.shape === "ring" ? Y * (.55 + .45 * (Et % 2)) : Y * .92;
    }
    let Rt = S.shape === "ring" ? 20 : S.shape === "square" ? 4 : S.shape === "pentagram" ? 5 : 3, Jt = 2;
    for (let Et = -Y; Et <= Y; Et += Jt)
        for (let Ut = -Y; Ut <= Y; Ut += Jt) {
            let re = !1, ae = !1;
            if (S.shape === "square")
                re = Math.abs(Ut) <= Y * .85 && Math.abs(Et) <= Y * .85, ae = re && (Math.abs(Ut) > Y * .7 || Math.abs(Et) > Y * .7);
            else if (S.shape === "pentagram") {
                let pe = Math.atan2(Et, Ut) + Math.PI / 2, Ae = Math.PI * 2 / 5, xe = (pe % Ae + Ae) % Ae;
                xe > Ae / 2 && (xe = Ae - xe);
                let ve = Y * .38, Qe = xe / (Ae / 2), ge = Y * (1 - Qe) + ve * Qe, Ce = Math.hypot(Ut, Et);
                re = Ce <= ge, ae = re && Ce > ge * .72;
            }
            else if (S.shape === "triangle") {
                let Ae = ((Math.atan2(Et, Ut) + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), xe = Y, ve = 0, Qe = -xe, ge = xe * .866, Ce = xe * .5, De = -xe * .866, ga = xe * .5, Ll = (Ce - ga) * (ve - De) + (De - ge) * (Qe - ga), na = ((Ce - ga) * (Ut - De) + (De - ge) * (Et - ga)) / Ll, ln = ((ga - Qe) * (Ut - De) + (ve - De) * (Et - ga)) / Ll, ll = 1 - na - ln;
                re = na >= 0 && ln >= 0 && ll >= 0, ae = re && (na < .16 || ln < .16 || ll < .16);
            }
            else {
                let pe = Ut * Ut + Et * Et;
                re = pe <= Y * Y && pe >= Y * .55 * (Y * .55), ae = re;
            }
            re && Se(S.x + Ut, S.y + Et, S.z + .6) && f(It, Gt, ae ? Tt : j, se);
        }
    let Xt = S.h || tm, _e = 36;
    for (let Et = 4; Et <= Xt; Et += 5) {
        let Ut = 1 - Et / (Xt + 8);
        if (Ut < .08)
            continue;
        let re = Y * (.85 + .08 * Math.sin(Et * .2 + (S.pulse || 0) * 4)), ae = y(S.shape, S.x, S.y, re, (S.pulse || 0) * .3), pe = ae.concat([ae[0]]), Ae = Et <= _e, xe, ve, Qe, ge = !1;
        for (let Ce = 0; Ce < pe.length; Ce++) {
            if (!Se(pe[Ce][0], pe[Ce][1], S.z + Et)) {
                ge = !1;
                continue;
            }
            let De;
            Ae ? De = Et < 14 ? Tt : j : De = Ut > .7 ? ct : Ut > .35 ? Z : W, ge && u(xe, ve, It, Gt, De, Ae || Ut > .5 ? 2 : 1, se), xe = It, ve = Gt, Qe = se, ge = !0;
        }
        Se(S.x, S.y, S.z + Et) && f(It, Gt, Ae ? Tt : Ut > .5 ? ct : Z, se);
    }
    let $t = S.kind === "gun" ? p.specGun : S.kind === "missile" ? p.specMsl : S.kind === "craft" ? p.specCraft : p.specShield, oe = S.kind === "gun" ? p.specGunLv : S.kind === "missile" ? p.specMslLv : S.kind === "craft" ? p.specCraftLv : p.specShieldLv, he = Bh(S.type, $t, oe), Te = he && he.text || Zb(S.type) || S.type || "", ie = String(Te).toUpperCase().replace(/→/g, ">").replace(/[^A-Z0-9 >+\-.]/g, " "), Zt = he && he.mode === "up" ? mt(255, 230, 80) : Z, ft = Ne + ke > .25, Ct = Yt[0], Qt = Ct ? Math.hypot(Ct.x - S.x, Ct.y - S.y) : 999, Be = S.z + (ft ? Math.min(Xt * .48, 200) : 16);
    if (ie && Se(S.x, S.y, Be)) {
        let Et = It, Ut = Gt, re = se, ae = ua, pe = Qt < 36, Ae = ft || ke > .4 ? 1 : 2, xe = ie.length * 4 * Ae, ve = Et - (xe >> 1), Qe = Ut - 5 * Ae, ge = (Ce?: any, De?: any, ga?: any) => { let Ll = ve + xe / 2, na = Qe + 2.5 * Ae; return Math.abs(Ce - Ll) < xe / 2 + ga && Math.abs(De - na) < 3 * Ae + ga; };
        if (!pe && ft && Ct && Se(Ct.x, Ct.y, Ct.z) && ge(It, Gt, 16) && (pe = !0), !pe && ft) {
            for (let Ce of xa)
                if (!Ce.dead && Se(Ce.x, Ce.y, Ce.z) && ge(It, Gt, 10)) {
                    pe = !0;
                    break;
                }
        }
        if (!pe) {
            if (!ft)
                for (let Ce = -1; Ce < 5 * Ae + 3; Ce++)
                    for (let De = -1; De < xe + 1; De++)
                        f(ve + De, Qe + Ce, mt(8, 10, 20), re - 4);
            if (E(ie, ve, Qe, Zt, re - 6, Ae, mt(8, 10, 20)), he && he.mode === "up") {
                let Ce = Qe + 5 * Ae + 1;
                for (let De = 0; De < xe; De++)
                    f(ve + De, Ce, mt(255, 230, 80), re - 5);
            }
        }
    }
} let D = (S?: any, X?: any, Y?: any, F?: any, ot?: any, H?: any, j?: any, W?: any) => { if (!Se(S, X, Y))
    return; let ct = It, Z = Gt, Tt = se; Se(F, ot, H) && u(ct, Z, It, Gt, j, W, Math.max(Tt, se) - 1); }, O = (S?: any, X?: any, Y?: any, F?: any, ot?: any, H = 1.2) => Se(S, X, Y) ? (i(It, Gt, Math.max(H, ot * ua), F, se), !0) : !1, C = (S?: any, X?: any, Y?: any) => { let F = Math.hypot(S, X, Y) || 1, ot = S / F, H = X / F, j = Y / F, W = -H, ct = ot, Z = 0, Tt = Math.hypot(W, ct, Z) || 1; W /= Tt, ct /= Tt; let Rt = H * Z - j * ct, Jt = j * W - ot * Z, Xt = ot * ct - H * W; return { fx: ot, fy: H, fz: j, rx: W, ry: ct, rz: Z, ux: Rt, uy: Jt, uz: Xt }; }, I = { time: Lt, put: f, line: u, disk: i, project: Se, worldLine: D, worldDisk: O, prX: () => It, prY: () => Gt, prM: () => ua, prV: () => se }; for (let S of Ye)
    Nh(I, S); for (let S of Ta)
    f1(I, S); for (let S of Ka) {
    if (S.x == null)
        continue;
    let X = Yt[0], Y = X ? Math.sin(X.yaw) : 0, F = X ? -Math.cos(X.yaw) : -1;
    if (Se(S.x - Y * 3, S.y - F * 3, S.z)) {
        let ot = It, H = Gt;
        Se(S.x + Y * 4, S.y + F * 4, S.z) && (u(ot, H, It, Gt, mt(80, 200, 160), 2, se), i((ot + It) / 2, (H + Gt) / 2, Math.max(2, 2.6 * ua), mt(100, 255, 190), se), i((ot + It) / 2, (H + Gt) / 2, Math.max(1, 1.1 * ua), mt(255, 255, 255), se), i(It, Gt, Math.max(1, 1.2 * ua), mt(180, 255, 220), se));
    }
} for (let S of wt) {
    let X = S.age / S.life, Y = S.r * (.35 + .65 * Math.sin(Math.min(1, X * 3) * Math.PI)) * (1 - X * .3);
    if (!Se(S.x, S.y, S.z))
        continue;
    let F = mt(40, 20, 90), ot = mt(160, 120, 255);
    i(It, Gt, Math.max(2, Y * ua * .12), F, se);
    let H = Math.max(3, Y * ua * .18), j = It, W = Gt, ct = se;
    for (let Z = 0; Z < 24; Z++) {
        let Tt = Z * Math.PI * 2 / 24, Rt = (Z + 1) * Math.PI * 2 / 24;
        u(j + Math.cos(Tt) * H, W + Math.sin(Tt) * H, j + Math.cos(Rt) * H, W + Math.sin(Rt) * H, ot, 1, ct);
    }
} for (let S of be) {
    if (!Se(S.x, S.y, S.z))
        continue;
    let X = (S.r || 20) * ua * .25;
    i(It, Gt, X, mt(255, 80, 20), se), i(It, Gt, X * .45, mt(255, 200, 40), se);
} for (let S of qt)
    Oh(I, S); for (let S of je)
    Qh(I, S); if (p.specShield && p.specShieldT > 0 && !p.dead && Ls > .4) {
    let S = Xa[p.specShield] && Xa[p.specShield].color || [120, 200, 255], X = mt(S[0], S[1], S[2]), Y = mt(255, 255, 255), F = Yt[0], ot = 1 + .07 * Math.sin(Lt * 8), H = 18 * Fe() * ot * (p.specShield === "absorb" ? 1 + Math.min(.55, (p.absorbStored || 0) / 40) : 1), j = Math.sin(F.yaw), W = -Math.cos(F.yaw), ct = -W, Z = j, Tt = (Rt?: any, Jt?: any, Xt?: any, _e?: any, $t?: any, oe?: any, he?: any, Te?: any, ie?: any) => { let Zt, ft, Ct = !1; for (let Qt = 0; Qt <= he; Qt++) {
        if (Te && Qt & 1) {
            Ct = !1;
            continue;
        }
        let Be = Qt / he * Math.PI * 2 + Lt * .5, Et = Rt + Math.cos(Be) * _e, Ut = Jt + Math.sin(Be) * $t, re = Xt + Math.sin(Be) * oe;
        if (!Se(Et, Ut, re)) {
            Ct = !1;
            continue;
        }
        Ct && u(Zt, ft, It, Gt, Qt & 1 ? Y : X, ie, se - 1), Zt = It, ft = Gt, Ct = !0;
    } };
    if (p.specShield === "mirror") {
        let Rt = F.x + j * 12 * Fe(), Jt = F.y + W * 12 * Fe(), Xt = F.z;
        for (let _e of [.45, .7, 1]) {
            let $t, oe, he = !1;
            for (let Te = 0; Te <= 20; Te++) {
                let ie = Te / 20 * Math.PI * 2, Zt = Rt + Math.cos(ie) * ct * H * _e, ft = Jt + Math.cos(ie) * Z * H * _e, Ct = Xt + Math.sin(ie) * H * _e;
                if (!Se(Zt, ft, Ct)) {
                    he = !1;
                    continue;
                }
                he && u($t, oe, It, Gt, Te % 3 ? X : Y, 2, se - 1), $t = It, oe = Gt, he = !0;
            }
        }
    }
    else {
        let Rt = p.specShield === "phase";
        Tt(F.x, F.y, F.z, H, H, 0, 28, Rt, 2), Tt(F.x, F.y, F.z + H * .45, H * .75, H * .75, 0, 22, Rt, 1), Tt(F.x, F.y, F.z - H * .35, H * .8, H * .8, 0, 22, Rt, 1);
        for (let Jt = 0; Jt < 2; Jt++) {
            let Xt, _e, $t = !1;
            for (let oe = 0; oe <= 24; oe++) {
                if (Rt && oe & 1) {
                    $t = !1;
                    continue;
                }
                let he = oe / 24 * Math.PI * 2, Te = Math.cos(he), ie = Math.sin(he), Zt, ft, Ct;
                if (Jt === 0 ? (Zt = F.x + Te * H, ft = F.y, Ct = F.z + ie * H * .7) : (Zt = F.x, ft = F.y + Te * H, Ct = F.z + ie * H * .7), !Se(Zt, ft, Ct)) {
                    $t = !1;
                    continue;
                }
                $t && u(Xt, _e, It, Gt, X, 1, se - 1), Xt = It, _e = Gt, $t = !0;
            }
        }
    }
} let nt = Yt[0]; if (p.muzzleT > 0 && !p.dead && Ls > .5) {
    let S = p.muzzleStyle || p.specGun || "cannon";
    for (let [X, Y] of Wh[Vt(Q.barrels, 2, 4)]) {
        let [F, ot, H] = Ga(nt, X, ha - 7 + Y, 0);
        if (!Se(F, ot, H))
            continue;
        let j = Math.max(1, 1.15 * Q.flashSize * ua * Fe());
        Uh(I, It, Gt, se - 2, j, S, p.muzzleTint, Lt);
    }
    p.muzzleT < .02 && (p.muzzleTint = null, p.muzzleStyle = null);
} if (p.specGun === "spirit" && p.plasmaCh > .04 && !p.dead && Ls > .25) {
    let [S, X, Y] = Ga(nt, 0, ha - 8, 0), F = p.plasmaCh;
    O(S, X, Y, mt(30, 140, 255), 3.2 + F * 10, 2), O(S, X, Y, mt(140, 230, 255), 1.8 + F * 6, 1.5), O(S, X, Y, mt(255, 255, 255), .7 + F * 2.4, 1);
} if ((p.saberT || 0) > 0 && !p.dead && Ls > .2) {
    let S = 1 - p.saberT / .16, [X, Y, F] = Ga(nt, 0, ha - 6, 1), ot = nt.yaw - .95 + S * 1.9;
    for (let H = 0; H < 8; H++) {
        let j = ot + (H - 3.5) * .06, W = 26 + 8 * Math.sin(H / 7 * Math.PI);
        D(X, Y, F, X + Math.sin(j) * W, Y - Math.cos(j) * W, F + 2 + H * .3, mt(255, 60, 190), 2), D(X, Y, F, X + Math.sin(j) * W, Y - Math.cos(j) * W, F + 2 + H * .3, mt(255, 220, 250), 1);
    }
} for (let S of Hs) {
    if (S.age < 0 || !Se(S.x, S.y, S.z + S.age * 6))
        continue;
    let X = S.age / S.life, Y = S.size * (.45 + .75 * Math.sqrt(X)) * ua;
    if (Y > 160 || Y < .3)
        continue;
    let F = Math.ceil(Y), ot = It, H = Gt;
    for (let j = -F; j <= F; j++) {
        let W = Math.round(H + j);
        if (!(W < 0 || W >= et))
            for (let ct = -F; ct <= F; ct++) {
                let Z = Math.round(ot + ct);
                if (Z < 0 || Z >= V)
                    continue;
                let Tt = Math.sqrt(ct * ct + j * j) / Math.max(.5, Y);
                if (Tt > 1)
                    continue;
                let Rt = W * V + Z;
                if (r[Rt] < se - 1)
                    continue;
                let Jt = to((Z >> 1) * 73 + (W >> 1) * 151 + S.seed | 0) / 255, Xt = Tt * .75 + X * 1.15 + Jt * .3 - .15;
                X > .55 && (1 - X) / .45 * 16 < x1[(W & 3) << 2 | Z & 3] + Jt * 6 || (s[Rt] = it[Xt < .3 ? 0 : Xt < .52 ? 1 : Xt < .74 ? 2 : Xt < .96 ? 3 : Xt < 1.2 ? 4 : 5]);
            }
    }
} for (let S of Ms) {
    if (!Se(S.x, S.y, S.z))
        continue;
    if (S.shape === "gear") {
        let Y = mt(180, 140, 70), F = mt(60, 40, 20);
        f(It, Gt, Y, se), f(It + 1, Gt, Y, se), f(It - 1, Gt, Y, se), f(It, Gt + 1, Y, se), f(It, Gt - 1, Y, se), f(It + 2, Gt, F, se), f(It - 2, Gt, F, se), f(It, Gt + 2, F, se), f(It, Gt - 2, F, se);
        continue;
    }
    if (S.shape === "glow") {
        let F = (Lt * 18 + S.vx | 0) & 1 ? mt(180, 120, 255) : mt(80, 255, 210);
        f(It, Gt, mt(230, 230, 255), se), f(It + 1, Gt, F, se), f(It, Gt + 1, F, se), f(It - 1, Gt, F, se), f(It, Gt - 1, F, se);
        continue;
    }
    let X = S.c === 2 ? it[(Lt * 20 + S.vx | 0) & 1 ? 1 : 2] : hl[S.c];
    f(It, Gt, X, se), ua > 2 && (f(It + 1, Gt, X, se), f(It, Gt + 1, X, se), f(It + 1, Gt + 1, X, se));
} for (let S of xa) {
    if (S.dead || S.muzzleT <= 0 || S.kamikaze)
        continue;
    let [X, Y, F] = Ga(S, 0, ha - 7, 0);
    Se(X, Y, F) && Uh(I, It, Gt, se - 2, Math.max(1, 1.1 * ua * Fe() * S.scale), "bits", [140, 255, 200], Lt);
} for (let S of ml) {
    if (!Se(S.x, S.y, S.z))
        continue;
    let X = Math.max(1.4, 2.2 * ua * (1 - S.age / S.life * .4)), Y = Math.ceil(X), F = (Lt * 24 + S.x | 0) & 1;
    for (let ot = -Y; ot <= Y; ot++)
        for (let H = -Y; H <= Y; H++)
            H * H + ot * ot <= X * X && f(It + H, Gt + ot, s0[F ? 0 : 1], se - 1);
} if (nn) {
    let S = nn.age / nn.life, X = 20 + 340 * Math.sqrt(S), Y = 48;
    for (let F = 0; F < Y; F++) {
        let ot = F / Y * Math.PI * 2;
        Se(nn.x + Math.cos(ot) * X, nn.y + Math.sin(ot) * X, nn.z) && (f(It, Gt, S < .4 ? mt(200, 255, 255) : mt(80, 200, 255), -1e9), f(It + 1, Gt, mt(180, 240, 255), -1e9));
    }
} if (Q.battleNet && !p.dead) {
    let S = mt(120, 255, 200);
    for (let X of ce) {
        if (X.dying >= 0 || !Se(X.x, X.y, X.z) || It >= 3 && Gt >= 3 && It < V - 3 && Gt < et - 3)
            continue;
        let Y = Vt(Math.round(It), 2, V - 3), F = Vt(Math.round(Gt), 2, et - 3);
        f(Y, F, S, -1e9), f(Y + 1, F, S, -1e9), f(Y, F + 1, S, -1e9), f(Y - 1, F, S, -1e9), f(Y, F - 1, S, -1e9);
    }
} if (Ya && !p.dead && p.started && Se(Ya.x, Ya.y, Ya.z)) {
    let S = Math.max(5, 34 * .55 * Fe() * Ya.scale * ua + 2), X = Math.max(2, Math.round(S * .4)), Y = ke > .5 ? aa : ca;
    if (p.ammo > 0 || (Lt * 4 | 0) & 1)
        for (let [ot, H] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            let j = It + ot * S, W = Gt + H * S;
            u(j, W, j - ot * X, W, Y, 1, -1e9), u(j, W, j, W - H * X, Y, 1, -1e9);
        }
} function ht() { let S = mt(255, 220, 140), X = mt(255, 140, 40), Y = mt(255, 70, 20); for (let F of Dn) {
    if (!Se(F.x, F.y, F.z))
        continue;
    let ot = 1 - F.age / F.life, H = Math.min(5.5, (p.boostBurn ? 2.2 : 1.5) * ot * Math.min(ua, 1.8));
    i(It, Gt, Math.max(1.2, H), ot > .6 ? S : ot > .3 ? X : Y, se - 2);
} for (let F of qn)
    wA(I, F); if (p.boostBurn && ke > .45) {
    let F = mt(255, 120, 30);
    for (let ot = 2; ot < V - 2; ot += 2) {
        let H = et - 3 - (ot * 3 + Lt * 40 | 0) % 3;
        f(ot, H, F, -1e9), f(ot, et - 2, mt(255, 80, 20), -1e9);
    }
} } function yt() { if (Di = [], p.dead)
    return; let S = Yt[0], X, Y; ke > .55 ? (X = V * .5, Y = et * .5) : Se(S.x, S.y, S.z) ? (X = It, Y = Gt) : (X = V * .5, Y = et * .55); let F = 26 + 10 * Ne + 8 * ke, ot = { fighter: mt(255, 72, 64), interceptor: mt(255, 200, 70), bomber: mt(255, 140, 50), ace: mt(255, 230, 120), turret: mt(210, 170, 90), bunker: mt(180, 200, 110), boat: mt(80, 200, 255), gunboat: mt(40, 160, 255), ufo: mt(120, 255, 170), mothership: mt(200, 255, 90), dirigible: mt(230, 200, 130), carrier: mt(210, 170, 80), steampunk: mt(210, 150, 60), alien: mt(170, 110, 255) }, H = []; for (let ct of ce) {
    if (ct.dying >= 0)
        continue;
    let Z = Math.hypot(ct.x - S.x, ct.y - S.y);
    H.push({ e: ct, dist: Z });
} H.sort((ct?: any, Z?: any) => ct.dist - Z.dist); let j = Math.min(16, H.length); for (let ct = 0; ct < j; ct++) {
    let Z = H[ct].e, Tt, Rt;
    if (Se(Z.x, Z.y, Z.z))
        Tt = It - X, Rt = Gt - Y;
    else {
        let Et = Z.x - ne.x, Ut = Z.y - ne.y;
        Tt = Et * Za - Ut * Fa;
        let re = -(Et * Fa + Ut * Za);
        Rt = -(Z.z - ne.alt + kl * re);
    }
    let Jt = Math.hypot(Tt, Rt);
    if (Jt < .2)
        continue;
    Tt /= Jt, Rt /= Jt;
    let Xt = X + Tt * F, _e = Y + Rt * F, $t = ot[Z.type] || ot.fighter, oe = H.length <= 3, he = oe ? .5 + .5 * Math.abs(Math.sin(Lt * 9)) : 0;
    if (oe) {
        let Et = $t & 255, Ut = $t >> 8 & 255, re = $t >> 16 & 255, ae = .35 + .5 * he;
        $t = mt(Et + (255 - Et) * ae, Ut + (255 - Ut) * ae, re + (255 - re) * ae);
    }
    let Te = mt(20, 10, 8), ie = Vt(1.3 - H[ct].dist / 1200, .75, 1.35) * (oe ? 1.2 + .25 * he : 1), Zt = (Et?: any, Ut?: any) => ({ x: Xt + (Tt * Et - Rt * Ut) * ie, y: _e + (Rt * Et + Tt * Ut) * ie }), ft = (Et?: any, Ut?: any, re?: any, ae?: any) => { let pe = (ae || 1) + (oe ? 1 : 0); u(Et.x, Et.y, Ut.x, Ut.y, Te, pe + 1, -1e9), u(Et.x, Et.y, Ut.x, Ut.y, re, pe, -1e9); }, Ct = (Et?: any, Ut?: any, re?: any) => { for (let ae = 0; ae < Et.length; ae++) {
        let pe = Et[ae], Ae = Et[(ae + 1) % Et.length];
        ft(Zt(pe[0], pe[1]), Zt(Ae[0], Ae[1]), Ut, re);
    } }, Qt = Z.kind || "fly";
    if (Qt === "ground")
        Ct([[8, 0], [-1, 3.5], [-1, -3.5]], $t, 2), ft(Zt(-1, 0), Zt(-6.2, 0), $t, 2), ft(Zt(-6.2, 2.6), Zt(-6.2, -2.6), $t, 2);
    else if (Qt === "sea")
        Ct([[8, 0], [-2.5, 4.2], [-2.5, -4.2]], $t, 2), ft(Zt(-2.5, 3.2), Zt(-5.8, 1.4), $t, 1), ft(Zt(-5.8, 1.4), Zt(-2.8, 0), $t, 1), ft(Zt(-2.8, 0), Zt(-5.8, -1.4), $t, 1), ft(Zt(-5.8, -1.4), Zt(-2.5, -3.2), $t, 1);
    else if (Z.type === "mothership") {
        let Et = Ut => { let re = []; for (let ae = 0; ae < 8; ae++) {
            let pe = ae * Math.PI / 4;
            re.push([Math.cos(pe) * Ut, Math.sin(pe) * Ut]);
        } Ct(re, $t, 1); };
        Et(6.4), Et(3.7), ft(Zt(6.4, 0), Zt(8.6, 0), $t, 2);
    }
    else if (Qt === "ufo")
        Ct([[6.4, 0], [0, 3.4], [-6.4, 0], [0, -3.4]], $t, 2), ft(Zt(-5.2, 0), Zt(5.2, 0), $t, 1);
    else if (Qt === "airship") {
        let Et = Z.type === "carrier" ? 8.6 : 7.4, Ut = Z.type === "carrier" ? 3.1 : 2.55;
        Ct([[Et, 0], [2.2, Ut], [-Et, Ut], [-Et - .2, 0], [-Et, -Ut], [2.2, -Ut]], $t, 2);
    }
    else
        ft(Zt(-2, 4.6), Zt(7.5, 0), $t, 2), ft(Zt(-2, -4.6), Zt(7.5, 0), $t, 2);
    let Be = Qt === "ground" ? "pin" : Qt === "sea" ? "hull" : Z.type === "mothership" ? "rings" : Qt === "ufo" ? "saucer" : Qt === "airship" ? "capsule" : "arrow";
    Di.push({ x: Xt, y: _e, dx: Tt, dy: Rt, dist: H[ct].dist, type: Z.type, kind: Z.kind || "fly", glyph: Be, scale: ie, onScreen: Jt > 0 });
} let W = F + 8; for (let ct of M) {
    if (ct.appear > 0)
        continue;
    let Z, Tt;
    if (Se(ct.x, ct.y, ct.z + 12))
        Z = It - X, Tt = Gt - Y;
    else {
        let ie = ct.x - ne.x, Zt = ct.y - ne.y;
        Z = ie * Za - Zt * Fa;
        let ft = -(ie * Fa + Zt * Za);
        Tt = -(ct.z - ne.alt + kl * ft);
    }
    let Rt = Math.hypot(Z, Tt);
    if (Rt < .2)
        continue;
    Z /= Rt, Tt /= Rt;
    let Jt = No(ct.type), Xt = mt(Jt.variant[0], Jt.variant[1], Jt.variant[2]), _e = mt(16, 12, 8), $t = X + Z * W, oe = Y + Tt * W, he = (ie?: any, Zt?: any) => { for (let ft = 0; ft < ie.length; ft++) {
        let Ct = ie[ft], Qt = ie[(ft + 1) % ie.length];
        u(Ct[0], Ct[1], Qt[0], Qt[1], _e, Zt + 1, -1e9), u(Ct[0], Ct[1], Qt[0], Qt[1], Xt, Zt, -1e9);
    } }, Te = ct.shape;
    if (Te === "square")
        he([[$t - 3.2, oe - 3.2], [$t + 3.2, oe - 3.2], [$t + 3.2, oe + 3.2], [$t - 3.2, oe + 3.2]], 1);
    else if (Te === "triangle")
        he([[$t, oe - 3.6], [$t + 3.4, oe + 2.2], [$t - 3.4, oe + 2.2]], 1);
    else if (Te === "pentagram") {
        let ie = [];
        for (let Zt = 0; Zt < 5; Zt++) {
            let ft = -Math.PI / 2 + Zt * Math.PI * 2 / 5;
            ie.push([$t + Math.cos(ft) * 4.2, oe + Math.sin(ft) * 4.2]);
        }
        he([ie[0], ie[2], ie[4], ie[1], ie[3]], 1);
    }
    else {
        let ie, Zt, ft = !1;
        for (let Ct = 0; Ct <= 10; Ct++) {
            let Qt = Ct / 10 * Math.PI * 2, Be = $t + Math.cos(Qt) * 3.4, Et = oe + Math.sin(Qt) * 3.4;
            ft && (u(ie, Zt, Be, Et, _e, 2, -1e9), u(ie, Zt, Be, Et, Xt, 1, -1e9)), ie = Be, Zt = Et, ft = !0;
        }
    }
} } ht(), yt(); } function Sm() { let s = Vt((ke - .16) / .84, 0, 1); return s * s * s * (s * (s * 6 - 15) + 10); } function Lr() { let s = Fe(), r = Yt[0], f = 1 - Ne - ke; if (el = V >> 1, M1 = ke, ne.x = oa.x, ne.y = oa.y, ne.alt = oa.alt, Ne === 0 && ke === 0 || !r)
    Cn = 0, kl = 1, Bi = 1, _l = 1 / $n, gn = et >> 1, so = gn, Rl = 0, Ls = 1, qo = ne.yaw;
else {
    let u = Vt(e.chaseDistance, 1, 14) * 46 * s * (1 - .16 * Ke), g = Vt(e.chaseDistance * an, 1, 14) * 46 * s * (1 - .16 * Ke), y = Math.max(1, Vt(e.chaseSize, .05, .6) * V / (34 * s)) * (u / Math.max(1e-6, g)), A = V * .6 * (1 - .1 * Ke), E = Ih * ke, D = Math.sin(r.yaw), O = Math.cos(r.yaw);
    ne.x += (r.x + D * E - oa.x) * ke, ne.y += (r.y - O * E - oa.y) * ke, ne.alt += (r.z + Fw * s - oa.alt) * ke, Cn = Ne / g + ke / Ih, _l = Math.exp(Ne * Math.log(Math.max(1e-6, y)) + ke * Math.log(A / Ih));
    let C = (45 * f + Vt(e.chaseAngle, 2, 40) * Ne) * (Math.PI / 180);
    Bi = Math.tan(C) - .5 * xs * Ne;
    let I = 1 - ke;
    kl = Math.max(Bi + gc * Cn * I, (Io - ne.alt) * Cn * I, (2 - ne.alt) * Cn);
    let nt = _l / Cn, ht = (et >> 1) + et * (.14 - .03 * Ke), yt = ye + nt * Math.tan(Vt(r.pitch * .8, -.6, .6));
    gn = f * (et >> 1) + Ne * ht + ke * yt, so = f * (et >> 1) + Ne * ht + ke * et * .34, Rl = r.roll * ke + zm(r) * yc;
    let S = ne.yaw + Us;
    qo = ne.yaw + Us * (Ne + ke) + Fn(-r.yaw - S) * ke;
    let X = Vt((ke - .12) / .4, 0, 1);
    Ls = 1 - X * X * (3 - 2 * X);
} Za = Math.cos(qo), Fa = Math.sin(qo); } function R1() { return (.07 + .17 * e.afterburner) * 46 * xn * Vt(1.6 - ze * .6, 0, 1) * (1 + 1.6 * Ke) * (p.boostBurn ? 1.5 : 1); } function Em() { let s = Yt[0]; return s ? Vt(s.yawRate / Math.max(.1, e.agility), -1, 1) * .36 : 0; } function zm(s?: any) { if (s.stunt < 0 || s.stuntDelay > 0)
    return 0; let r = s.stunt; return s.stuntDir * Math.PI * 2 * (r < .5 ? 2 * r * r : 1 - Math.pow(-2 * r + 2, 2) / 2); } function tM(s?: any) { return s.roll + zm(s); } let Ie = (s?: any, r?: any) => lt[((r | 0) & Sn) << Rs | (s | 0) & Sn]; function N1(s?: any, r?: any) { let f = Math.sin(s.yaw), u = Math.cos(s.yaw), g = 0; for (let i = 0; i <= 4; i++) {
    let y = r * .16 * i;
    for (let A = -1; A <= 1; A++) {
        let E = Ie(s.x + f * y + u * A * 7, s.y - u * y + f * A * 7);
        E > g && (g = E);
    }
} return g; } let Fe = () => Vt(e.jetScale || 1, .4, 2), c0 = () => 34 * 1.2 * Fe() + 2, r0 = () => 46 * .74 * Fe(); function eM() { Yt = [fc(K, G, e.altitude, .9)], ne.x = oa.x = K, ne.y = oa.y = G, ne.yaw = -.9 * e.cameraFollow, ne.alt = oa.alt = e.altitude, gc = 0, Io = 0, Nl = 0, Ti = -.9, Us = Fn(Ti - ne.yaw), Ze = e.intro ? 0 : 99, xn = e.intro ? 0 : 1, Cl = 7, zn = e.altitude, Os = 0, xs = 0, Ke = 0; } function Tm() { let s = 1 + Vt(Math.round(e.wingmen), 0, 2), r = Yt[0]; for (; Yt.length < s;) {
    let f = Yt.length === 1 ? -1 : 1, u = fc(r.x + Math.cos(r.yaw) * f * c0() - Math.sin(r.yaw) * r0(), r.y + Math.sin(r.yaw) * f * c0() + Math.cos(r.yaw) * r0(), r.z, r.yaw);
    Yt.push(u);
} Yt.length > s && (Yt.length = s); } $(), st(), eM(), Tm(); let jX = 0, jY = 0, jAct = !1; function jM(s?: any, r?: any, f?: any) { jX = Vt(s || 0, -1, 1), jY = Vt(r || 0, -1, 1), jAct = !!f, jAct && (Math.abs(jX) > .04 || Math.abs(jY) > .04) && (dl = !0, pn = !1, Gs()); } function aM(s?: any) { let r = e; e = { ...s }, r.seed !== e.seed && (gs = .2, zi = !0), r.land !== e.land && (gs = .2), (r.timeOfDay !== e.timeOfDay || r.bodyColor !== e.bodyColor || r.accentColor !== e.accentColor || r.canopyColor !== e.canopyColor) && $(), r.intro !== e.intro && e.intro && (Ze = 0, xn = 0), r.view !== e.view && (Gn = kr(e.view)), Tm(); } function nM(s?: any, r?: any) { V = Math.max(8, s | 0), et = Math.max(8, r | 0); let f = new ArrayBuffer(V * et * 4); vt = new Uint32Array(f), Ot = new Uint8ClampedArray(f), le = new Uint8Array(V * et), no = new Int32Array(V), Hn = new Float32Array(V * et), ye = Math.round(et * .34), $l = null, Go = .3; let u = Math.max(ye, et - ye); ia = (Math.ceil(Math.sqrt(V / 2 * (V / 2) + u * u)) + 2) * 2, Cr = new Uint32Array(ia * ia), Dl = new Uint8Array(ia * ia), hc = new Int32Array(ia), Dr = new Float32Array(ia * ia), lo = new Uint32Array(V * et), mc = new Uint32Array(ia * ia), Lr(); } function lM(s?: any, r?: any) { Gs(), dl = !1, pn = !0, Wn = s, Pn = r, La = 0; } function sM() { pn = !1, Ea = !1; } function oM() { Ea = !0, En = 0; } function iM() { Ea && En < CA && Q1(), Ea = !1; } function cM(s?: any) { Pl = !!s; } function rM() { return soundSynth.isMuted(); } function uM(s?: any, r?: any, f?: any, u?: any) { pc = Vt(s, -1, 1), Ho = Vt(r, -1, 1), dc = f, u !== void 0 && (Vo = !!u), (pc !== 0 || Ho !== 0 || Vo) && (dl = !0, Gs()); } function fM(s?: any) { Vo = !!s, s && Gs(); } function dM(s?: any) { qe("boosts", 1), Q.boostIframe && (p.boostIframe = .38, s && s.stunt < 0 && Q1()), Q.boostLock && pM(), Q.boostCap && p.boostFuel >= Q.boostMax * .8 && hM(s); } function pM() { for (let s of ce)
    s.dying >= 0 || (s.aimAt = null, s.burst = 0, s.lostLock = 1.35, s.mode = "break", s.modeT = 1.4, s.side = s.side || (at() < .5 ? -1 : 1)); } function hM(s?: any) { if (s) {
    qn.push({ x: s.x, y: s.y, z: s.z, age: 0, life: .5, r0: 10, r1: 95 }), p.shake = Math.max(p.shake, .45), p.banner = "Sonic boom", p.bannerT = 1.1;
    for (let r of ce)
        r.dying >= 0 || Math.hypot(r.x - s.x, r.y - s.y, r.z - s.z) < 95 && (xl(r, 7 * Q.gunDamage, !1), r.stun = Math.max(r.stun || 0, .45), r.lostLock = Math.max(r.lostLock || 0, 1.1));
    for (let r = 0; r < 14; r++) {
        let f = r / 14 * Math.PI * 2;
        In(s.x + Math.cos(f) * 12, s.y + Math.sin(f) * 12, s.z, !0);
    }
} } function mM(s?: any, r?: any) { p.boostIframe > 0 && (p.boostIframe = Math.max(0, p.boostIframe - s)), p.boostCd > 0 && (p.boostCd = Math.max(0, p.boostCd - s)); let f = Math.max(.2, Q.boostMax || 1); if (p.boostFuel == null && (p.boostFuel = f), !p.dead && Ze > 1.9 && Vo && p.boostFuel > .05) {
    p.boostBurn || dM(r), p.boostBurn = !0, p.boostFuel = Math.max(0, p.boostFuel - (Q.boostDrain || .48) * s), p.boostCd = Q.boostDelay || .4, p.boostFuel <= 0 && (p.boostFuel = 0, p.boostBurn = !1);
    let g = Ss(r), i = Fe(), y = (ha - d1 - 8) * i, A = r.x + y * g.fx, E = r.y + y * g.fy, D = r.z + y * g.fz;
    if (Dn.push({ x: A, y: E, z: D, age: 0, life: .55 }), Dn.length > 48 && Dn.splice(0, Dn.length - 48), Q.boostCap) {
        for (let O of ce)
            if (!(O.dying >= 0)) {
                if ((O.trailHit || 0) > 0) {
                    O.trailHit -= s;
                    continue;
                }
                for (let C of Dn)
                    if (Math.hypot(O.x - C.x, O.y - C.y, O.z - C.z) < 16) {
                        xl(O, 10 * Q.gunDamage * s, !1), O.trailHit = .05;
                        break;
                    }
            }
    }
}
else
    p.boostBurn = !1, p.boostCd <= 0 && p.boostFuel < f && (p.boostFuel = Math.min(f, p.boostFuel + (Q.boostRegen || .22) * s)); if (Dn.length) {
    let g = 0;
    for (let i of Dn)
        i.age += s, i.age < i.life && (Dn[g++] = i);
    Dn.length = g;
} if (qn.length) {
    let g = 0;
    for (let i of qn)
        i.age += s, i.age < i.life && (qn[g++] = i);
    qn.length = g;
} } function Q1() { let s = Yt[0]; if (s.stunt >= 0)
    return; let r = s.yawRate >= 0 ? 1 : -1; yc = ke > .5 ? 1 : 0, Yt.forEach((f?: any, u?: any) => { f.stunt = 0, f.stuntDir = r, f.stuntDelay = u * .16; }); } function yM() { Gn = (Gn + 1) % 3; } function xM() { Ze = 0, xn = 0; } function gM(s?: any) { if (p.offer) {
    Lr();
    return;
} let r = Vt(s, 0, .05); if (Lt += r, Ze += r, La += r, Ea && (En += r), gs > 0 && (gs -= r, gs <= 0 && (st(), zi))) {
    let ft = K - Yt[0].x, Ct = G - Yt[0].y;
    for (let Qt of Yt)
        Qt.x += ft, Qt.y += Ct, Qt.trailLen = 0, Qt.lastTrailX = Qt.x, Qt.lastTrailY = Qt.y;
    oa.x += ft, oa.y += Ct, zi = !1;
} !$l && V > 0 && (Go -= r, Go <= 0 && Qm()); let f = Ze > 1.9; xn += ((f ? 1 : 0) - xn) * (1 - Math.exp(-r * 5)); let u = Yt[0]; mM(r, u); let g = f && (Ea && En >= CA || dc || p.boostBurn); Ke += ((g ? 1 : 0) - Ke) * (1 - Math.exp(-r * (g ? 5 : 2.4))), p.boostBurn && (Ke = Math.max(Ke, .88)), Ke < 5e-4 && !g && (Ke = 0); let i = e.speed * Q.speedMul * (1 + (Vt(e.boost, 1, 4) * Q.boostMul - 1) * Ke); p.boostBurn && (i *= Q.boostSpeedMul || 1.72), p.specShield === "phase" && p.specShieldT > 0 && (i *= 1 + (Q.phaseSpeed || 0)), p.slowT > 0 && (i *= .55), p.dead && (i = 0), Ft = i, ze += (e.spread - ze) * (1 - Math.exp(-r * 11)); let y = Yt[0], A = Math.max(.1, e.agility * Q.turnMul) * (p.specShield === "phase" && p.specShieldT > 0 ? 1 + (Q.phaseSpeed || 0) : 1), E = Vt(e.clearance, 2, 60), D = N1(y, i) + E; Nl === 0 && (Nl = D), Nl += (D - Nl) * (1 - Math.exp(-r * (D > Nl ? 9 : 3))); let O = Ne + ke > .5, C = e.crash !== !1 && O && !p.dead && f, I = C ? E : Nl, nt = Math.max(I, e.altitude, Vt(e.ceiling, 20, 900)), ht = Math.max(i, 1) * .55, yt = 0, S = !1, X = e.followPointer && pn && La < 5; if (!f)
    yt = 0;
else if (jAct) {
    let jMag = Math.hypot(jX, jY);
    if (jMag > .06) {
        if (O) {
            yt = jX * A, zn += (Pl ? -jY : jY) * ht * r, S = !0;
        } else {
            let sx = jX, sy = -jY, Qt = sx * Za + sy * Fa, Be = -sx * Fa + sy * Za, Et = Fn(Math.atan2(Qt, -Be) - y.yaw);
            yt = Vt(Et * 2.8, -A, A) * Vt(jMag, .25, 1), S = !0;
        }
    } else {
        yt = 0, S = !0;
    }
}
else if (dl)
    yt = pc * A, zn += (Pl ? -Ho : Ho) * ht * r, S = !0;
else if (X && (O || Se(y.x, y.y, y.z))) {
    let ft = Wn - It, Ct = Pn - Gt;
    if (O) {
        let Qt = Vt((Wn - el) / (V * .26), -1, 1);
        Math.abs(Qt) > .06 && (yt = Qt * A);
        let Be = Pn < so ? (so - Pn) / Math.max(1, so) : -(Pn - so) / Math.max(1, et - so), Et = (Pl ? -1 : 1) * Math.sign(Be) * Math.max(0, Math.abs(Be) - .08) / .92;
        zn = Et >= 0 ? e.altitude + Et * (nt - e.altitude) : e.altitude + Et * (e.altitude - I), S = !0;
    }
    else if (S = !0, ft * ft + Ct * Ct > 324) {
        let Qt = ft * Za + Ct * Fa, Be = -ft * Fa + Ct * Za, Et = Fn(Math.atan2(Qt, -Be) - y.yaw);
        yt = Vt(Et * 2.6, -A, A);
    }
}
else
    yt = A * (.62 * Math.sin(Lt * .31 + 1.3) + .38 * Math.sin(Lt * .73 + .4) + .22 * Math.sin(Lt * .17)), yt = Vt(yt, -A, A), e.stunts && (Cl -= r, Cl <= 0 && (Q1(), Cl = 9 + to(Lt * 10 | 0) / 255 * 7)); y.yawRate += (yt - y.yawRate) * (1 - Math.exp(-r * 2.6)), y.yaw += y.yawRate * r; let Y = e.bank * Math.PI / 180, F = Vt(y.yawRate / A, -1, 1) * Y; y.roll += (F - y.roll) * (1 - Math.exp(-r * 5)), y.vx = Math.sin(y.yaw) * i, y.vy = -Math.cos(y.yaw) * i, y.x += y.vx * r, y.y += y.vy * r, S || (zn += (e.altitude - zn) * (1 - Math.exp(-r * .9))), zn = Vt(zn, I, nt); let ot = (zn + Math.sin(Lt * .9) * 1.5 - y.z) * (1 - Math.exp(-r * 3)); ot = Vt(ot, -ht * r, ht * r), y.z += ot; let H = Ie(y.x, y.y) + E * .7; C ? y.z < Ie(y.x, y.y) + 1.2 && _1(999, "crashed") : y.z < H && (y.z += (H - y.z) * (1 - Math.exp(-r * 22))), p.pullUp = C && !p.dead && N1(y, i) > y.z - 4, Os += (ot / Math.max(r, 1e-4) - Os) * (1 - Math.exp(-r * 6)); let j = Math.sign(Os) * Math.max(0, Math.abs(Os) - 3); xs = Vt(j / Math.max(20, i) * 1.25, -.5, .5); let W = Math.abs(y.yawRate / A) * .1 + xs; y.pitch += (W - y.pitch) * (1 - Math.exp(-r * 4)); let ct = Vt(y.yawRate / A, -1, 1) * 6.4 + Math.sin(Lt * .53) * .3, Z = Vt(xs / .5, -1, 1) * 3.4 + Ke * 1.6 + Math.sin(Lt * .71 + 1) * .25; As += ((ct - Ci) * 64 - As * 11) * r, k += ((Z - bc) * 64 - k * 11) * r, Ci = Vt(Ci + As * r, -8, 8), bc = Vt(bc + k * r, -5, 5); for (let ft = 1; ft < Yt.length; ft++) {
    let Ct = Yt[ft], Qt = ft === 1 ? -1 : 1, Be = y.x + Math.cos(y.yaw) * Qt * c0() - Math.sin(y.yaw) * r0(), Et = y.y + Math.sin(y.yaw) * Qt * c0() + Math.cos(y.yaw) * r0(), Ut = 1 - Math.exp(-r * 3.2), re = Ct.x, ae = Ct.y;
    Ct.x += y.vx * r + (Be - (Ct.x + y.vx * r)) * Ut, Ct.y += y.vy * r + (Et - (Ct.y + y.vy * r)) * Ut, Ct.vx = (Ct.x - re) / Math.max(r, 1e-4), Ct.vy = (Ct.y - ae) / Math.max(r, 1e-4), Ct.yaw += Fn(y.yaw - Ct.yaw) * (1 - Math.exp(-r * 4)), Ct.roll += (y.roll - Ct.roll) * (1 - Math.exp(-r * 3.2)), Ct.pitch = y.pitch, Ct.z += (y.z + Math.sin(Lt * 1.1 + ft * 2) * 1.2 - Ct.z) * (1 - Math.exp(-r * 3)), Ct.z = Math.max(Ct.z, Ie(Ct.x, Ct.y) + E * .7);
} X5(r, y, E); for (let ft of Yt.concat(ce, xa.filter((Ct?: any) => !Ct.dead))) {
    if (ft.kind === "ground" || ft.kind === "sea" || ft.kind === "ufo" || ft.kind === "airship")
        continue;
    let Ct = Vt(Math.abs(y.yawRate) / A + (ft.stunt >= 0 ? .7 : 0) + Ke * .9 + Math.abs(xs), 0, 1);
    ft.g += (Ct - ft.g) * (1 - Math.exp(-r * 2.5)), ft.stunt >= 0 && (ft.stuntDelay > 0 ? ft.stuntDelay -= r : (ft.stunt += r / .85, ft.stunt >= 1 && (ft.stunt = -1)));
    let Qt = ft.x - ft.lastTrailX, Be = ft.y - ft.lastTrailY;
    if (Qt * Qt + Be * Be > 6.25) {
        ft.lastTrailX = ft.x, ft.lastTrailY = ft.y;
        let Et = Ss(ft);
        for (let Ut = 0; Ut < 2; Ut++) {
            let re = Fe() * (ft.scale || 1), ae = (Ut === 0 ? -p1 : p1) * re, pe = (ha - EA) * re, Ae = (zA - uc) * re, xe = ft.trailHead * 4;
            ft.trail[Ut][xe] = ft.x + ae * Et.rx + pe * Et.fx + Ae * Et.ux, ft.trail[Ut][xe + 1] = ft.y + ae * Et.ry + pe * Et.fy + Ae * Et.uy, ft.trail[Ut][xe + 2] = ft.z + ae * Et.rz + pe * Et.fz + Ae * Et.uz, ft.trail[Ut][xe + 3] = Lt;
        }
        ft.trailHead = (ft.trailHead + 1) % Si, ft.trailLen < Si && ft.trailLen++;
    }
} xc += r; let Tt = .034 - .012 * Ke; if (xc >= Tt && xn > .6 && e.afterburner > .05 && ze < 2) {
    xc = 0;
    let ft = R1(), Ct = Fe();
    for (let Qt = 0; Qt < Yt.length; Qt++) {
        let Be = Yt[Qt];
        if (Qt === 0 && p.dead)
            continue;
        let Et = Ss(Be), Ut = al + Qt & 1 ? 1 : -1, re = ft * .78, ae = (Ut * Gh + Em() * (re * re / Math.max(1, ft))) * Ct, pe = (ha - d1 - re) * Ct, Ae = (Yh - uc) * Ct, xe = al * m1;
        Ue[xe] = Be.x + ae * Et.rx + pe * Et.fx + Ae * Et.ux, Ue[xe + 1] = Be.y + ae * Et.ry + pe * Et.fy + Ae * Et.uy, Ue[xe + 2] = Be.z + ae * Et.rz + pe * Et.fz + Ae * Et.uz, Ue[xe + 3] = Lt, Ue[xe + 4] = (1.3 + to(al * 31 + 7) / 255 * 1.2) * Ct, Ue[xe + 5] = -y.vx * .3 + (to(al * 17 + 3) - 128) * .05, Ue[xe + 6] = -y.vy * .3 + (to(al * 13 + 5) - 128) * .05, Ue[xe + 7] = (.46 + .36 * Ke) * Vt(e.afterburner * 1.4, 0, 1), Ue[xe + 8] = .75 + .5 * Ke + to(al * 5) / 255 * .3, Ue[xe + 9] = 26, al = (al + 1) % h1;
    }
} let Rt = Gn === 1 ? 1 : 0, Jt = Gn === 2 ? 1 : 0, Xt = 1 - Math.exp(-r * 7.6 / Vt(e.transition, .2, 8)), _e = !0; for (let ft = 0; ft < 3; ft++)
    pl[ft] += ((ft === 0 ? Rt : pl[ft - 1]) - pl[ft]) * Xt, ts[ft] += ((ft === 0 ? Jt : ts[ft - 1]) - ts[ft]) * Xt, (Math.abs(pl[ft] - Rt) > 4e-4 || Math.abs(ts[ft] - Jt) > 4e-4) && (_e = !1); _e && (pl.fill(Rt), ts.fill(Jt)), Ne = pl[2], ke = ts[2]; let $t = (22 + 16 * Ke) * (1 - Ne - ke), oe = y.x + Math.sin(y.yaw) * $t, he = y.y - Math.cos(y.yaw) * $t, Te = 1 - Math.exp(-r * 3.5); oa.x += y.vx * r + (oe - (oa.x + y.vx * r)) * Te, oa.y += y.vy * r + (he - (oa.y + y.vy * r)) * Te, ne.yaw += (-y.yaw * Vt(e.cameraFollow, 0, 1) - ne.yaw) * (1 - Math.exp(-r * 1.6)), oa.alt += (y.z - oa.alt) * (1 - Math.exp(-r * 3)); let ie = 0; if (Io = 0, Ne > .3 && Cn > 1e-4) {
    let ft = 1 / Cn, Ct = ne.x + Fa * ft, Qt = ne.y + Za * ft, Be = 0;
    for (let re = -1; re <= 1; re++)
        for (let ae = -1; ae <= 1; ae++)
            Be = Math.max(Be, Ie(Ct + ae * 9, Qt + re * 9));
    Io = Be + 5;
    let Et = oa.alt + Bi * ft, Ut = Math.max(Et, Io);
    Ut > Qs - 3 && Ut < wr + 3 && (Ut = y.z < Qs - 8 ? Math.max(Io, Qs - 3) : wr + 3), ie = Ut - Et;
} gc += (ie - gc) * (1 - Math.exp(-r * 7)), Ti += (-y.yaw - Ti) * (1 - Math.exp(-r * 3.4)); let Zt = Ti - ne.yaw; Ne === 0 && ke === 0 ? Us = Fn(Zt) : Us += Fn(Zt - Us), Lr(); } function Ss(s?: any) { let r = Math.cos(s.yaw), f = Math.sin(s.yaw), u = tM(s), g = Math.cos(u), i = Math.sin(u), y = r * g, A = f * g, E = -i, D = r * i, O = f * i, C = g, I = Math.cos(s.pitch), nt = Math.sin(s.pitch), ht = f * I + D * nt, yt = -r * I + O * nt, S = C * nt, X = D * I - f * nt, Y = O * I + r * nt, F = C * I; return { rx: y, ry: A, rz: E, fx: ht, fy: yt, fz: S, ux: X, uy: Y, uz: F, cr: g }; } let Bm = new Float64Array(12), Cm = new Float64Array(12), Dm = new Float64Array(12), km = new Float64Array(12), _m = new Float64Array(12), Rm = new Float64Array(12), Nm = new Float64Array(12), Sc = new Int32Array(64), Ec = new Int32Array(64), u0 = new Float32Array(64), f0 = new Float32Array(64), Ri = new Int32Array(13), O1 = new Float64Array(13), It = 0, Gt = 0, ua = 0, se = 0; function Se(s?: any, r?: any, f?: any) { let u = s - ne.x, g = r - ne.y, i = -(u * Fa + g * Za), y = 1 + Cn * i; return y < .12 ? !1 : (se = i, ua = _l / y, It = el + ua * (u * Za - g * Fa), Gt = gn - ua * (f - ne.alt + kl * i), !0); } function bM() { let s = vt, r = Hn; if (Ua === 0 && Bn === et && Tn === 0 && bs === V)
    s.fill(0), r.fill(1e9);
else
    for (let ve = Ua; ve < Bn; ve++)
        s.fill(0, ve * V + Tn, ve * V + bs), r.fill(1e9, ve * V + Tn, ve * V + bs); no.fill(Bn); let f = Za, u = Fa, g = Cn, i = _l, y = kl, A = el, E = gn, D = ne.alt, O = ne.x - Math.floor(ne.x / ma) * ma + ma * 2, C = ne.y - Math.floor(ne.y / ma) * ma + ma * 2, I = Math.round(Vt(e.clouds, 0, 1) * 16), nt = I > 0, ht = Lt * 7 % Ns, yt = Lt * 3 % Ns, S = Nt * Qs - ht + Ns, X = zt * Qs - yt + Ns, Y = (Lt * 6 | 0) & 1023, F = (Lt * 4 | 0) & 1023, ot = Lt * 36 | 0, H = Nt, j = zt, W = 1 / Fe(), ct = 46 * .75 * Fe() + 3, Z = 0; if (e.shadow && Ze > .3) {
    let ve = Yt.slice(p.dead ? 1 : 0, 3).concat(ce).slice(0, 12);
    for (let Qe = 0; Qe < ve.length; Qe++) {
        let ge = ve[Qe], Ce = Ss(ge);
        Bm[Qe] = O + (ge.x - ne.x) + H * ge.z, Cm[Qe] = C + (ge.y - ne.y) + j * ge.z;
        let De = Math.cos(ge.yaw), ga = Math.sin(ge.yaw);
        Dm[Qe] = De, km[Qe] = ga, _m[Qe] = ga, Rm[Qe] = -De, Nm[Qe] = 1 / (Math.max(.3, Math.abs(Ce.cr)) * Fe()), Z++;
    }
} let Tt = lt, Rt = ut, Jt = R, Xt = N, _e = no, $t = P & 255, oe = P >> 8 & 255, he = P >> 16 & 255, Te = (ve?: any, Qe?: any, ge?: any) => (255 << 24 | (ve >> 16 & 255) * Qe + he * ge >> 8 << 16 | (ve >> 8 & 255) * Qe + oe * ge >> 8 << 8 | (ve & 255) * Qe + $t * ge >> 8) >>> 0, ie = Bn - E, Zt = g > 0 ? -.85 / g : -1e9, ft = g > 0 ? D + y / g : 1e9, Ct = i * y + g * ie, Qt = ft > wr + 1 && Ct > 1e-6 ? Math.max(Zt, (i * (D - wr) - ie) / Ct - 2) : Zt, Be = Kw + 3 * D, Et = Zw + 2 * D, Ut = E - Ua + 2, re = Be; i * y > g * Ut && (re = Math.min(Be, (i * D + Ut) / (i * y - g * Ut))); let ae = 1 + g * Qt, pe = i / ae, Ae = E - pe * (y * Qt - D) + BA; for (let ve = 0; ve <= wr; ve++)
    Sc[ve] = Math.floor(Ae - pe * ve); let xe = i * (y + g * D); for (let ve = 0; Qt < re && ve < 4e3; ve++) {
    let Qe = ae * ae / xe, ge = 2.5 * ae / i;
    Qe > ge && (Qe = ge), Qe < .5 && (Qe = .5), Qt += Qe, ae = 1 + g * Qt, pe = i / ae, Ae = E - pe * (y * Qt - D) + BA;
    for (let va = 0; va <= wr; va++)
        Ec[va] = Sc[va], Sc[va] = Math.floor(Ae - pe * va);
    let Ce = ae / i, De = f * Ce, ga = -u * Ce, Ll = O - A * De - Qt * u, na = C - A * ga - Qt * f, ln = 0;
    if (g > 0 && Qt > Et) {
        let va = (Qt - Et) / (Be - Et);
        ln = Math.min(256, (Math.sqrt(va) * TA + .5 | 0) * (256 / TA)) | 0;
    }
    let ll = 256 - ln, zc = Ce < 1.8;
    Ll += De * Tn, na += ga * Tn;
    for (let va = Tn; va < bs; va++, Ll += De, na += ga) {
        if (nt) {
            let _t = Jt[((na - yt + Ns | 0) & vr) << Hh | (Ll - ht + Ns | 0) & vr];
            if (_t !== 0 && _t >> 4 < I) {
                let ue = _t & 15, fe = Qs + ue - 1, ta = Sc[fe], He = Ec[fe];
                if (ta < Ua && (ta = Ua), He > Bn && (He = Bn), ta < He) {
                    let de = bt[ue - 1];
                    ln > 0 && (de = Te(de, ll, ln));
                    for (let Ja = ta, wa = ta * V + va; Ja < He; Ja++, wa += V)
                        s[wa] !== 0 || ue === 1 && (va + Ja & 1) === 0 || (s[wa] = de, r[wa] = Qt);
                }
                let ea = Ec[Qs], Je = Sc[Qs];
                if (ea < Je) {
                    ea < Ua && (ea = Ua), Je > Bn && (Je = Bn);
                    let de = ln > 0 ? Te(Ht, ll, ln) : Ht;
                    for (let Ja = ea, wa = ea * V + va; Ja < Je; Ja++, wa += V)
                        s[wa] !== 0 || ue === 1 && (va + Ja & 1) === 0 || (s[wa] = de, r[wa] = Qt);
                }
                for (let de = ue - 2; de >= 0; de--) {
                    let Ja = Ec[Qs + de + 1], wa = Ec[Qs + de];
                    if (Ja < Ua && (Ja = Ua), wa > Bn && (wa = Bn), Ja >= wa)
                        continue;
                    let _n = Dt[de];
                    ln > 0 && (_n = Te(_n, ll, ln));
                    for (let jn = Ja, Ul = Ja * V + va; jn < wa; jn++, Ul += V)
                        s[Ul] === 0 && (s[Ul] = _n, r[Ul] = Qt);
                }
            }
        }
        let te = Ll | 0, jt = na | 0, Ve = (jt & Sn) << Rs | te & Sn, Me = Tt[Ve], fa = _e[va], bn = Sc[Me], Na = Ec[Me];
        if (bn >= fa && Na >= fa)
            continue;
        let sn = Rt[Ve], Vn = 0;
        if (nt) {
            let _t = Jt[((jt + X | 0) & vr) << Hh | (te + S | 0) & vr];
            (_t & 15) > 1 && _t >> 4 < I && (Vn = 1);
        }
        if (Vn === 0 && Z > 0)
            for (let _t = 0; _t < Z; _t++) {
                let ue = te - Bm[_t] + H * Me, fe = jt - Cm[_t] + j * Me;
                if (ue > -ct && ue < ct && fe > -ct && fe < ct) {
                    let ta = (ue * Dm[_t] + fe * km[_t]) * Nm[_t], He = (ue * _m[_t] + fe * Rm[_t]) * W, ea = Math.floor(ta + 34 / 2), Je = Math.floor(ha - He + .5);
                    if (ea >= 0 && ea < 34 && Je >= 0 && Je < 46 && c[Je * 34 + ea] === 1) {
                        Vn = 1;
                        break;
                    }
                }
            }
        let Xn, Wt;
        if (sn < 4) {
            if (Xn = Vn ? B[sn] : v[sn], sn === 3)
                (Xt[(jt & 255) << 8 | te & 255] + ot & 255) < 120 && (Xn = Vn ? B[2] : kt);
            else if (Vn === 0 && zc) {
                let _t = Xt[(jt & 255) << 8 | te + Y >> 2 & 255];
                _t > 243 && Xt[(jt + 91 & 255) << 8 | te + 1024 - F >> 2 & 255] > 128 && (Xn = _t > 252 ? pt : Bt);
            }
            Wt = Xn;
        }
        else
            Xn = Vn ? B[sn] : v[sn], Wt = Vn ? q[sn] : _[sn];
        if (ln > 0 && (Xn = Te(Xn, ll, ln), Wt = Te(Wt, ll, ln)), Na < fa) {
            Na < Ua && (Na = Ua);
            for (let _t = Na, ue = Na * V + va; _t < fa; _t++, ue += V)
                s[ue] === 0 && (s[ue] = Wt, r[ue] = Qt);
            fa = Na;
        }
        if (bn < fa) {
            let _t = bn < Ua ? Ua : bn;
            for (let ue = _t, fe = _t * V + va; ue < fa; ue++, fe += V)
                s[fe] === 0 && (s[fe] = Xn, r[fe] = Qt);
            fa = bn;
        }
        _e[va] = fa;
    }
} } function AM() { if (Ne === 0 && ke === 0)
    return; let s = vt, r = Cn, f = r > 1e-7 ? gn - _l * kl / r : -1e9, u = f > et ? et : Math.floor(f), g = r > 1e-7 ? _l / r : 1e9, i = e.timeOfDay; if (u > 0 && i !== "day") {
    let D = Math.sqrt(Nt * Nt + zt * zt) || 1, O = -Nt / D, C = -zt / D, I = O * Za - C * Fa, nt = -(O * Fa + C * Za);
    if (nt > .2) {
        let ht = i === "sunset" ? V * .05 : V * .022, yt = el + g * I / nt, S = f - g * (i === "sunset" ? .12 : .3) / nt, X = ht * 1.9, Y = Math.max(0, Math.floor(yt - X)), F = Math.min(V - 1, Math.ceil(yt + X)), ot = Math.max(0, Math.floor(S - X)), H = Math.min(u - 1, Math.ceil(S + X));
        for (let j = ot; j <= H; j++)
            for (let W = Y; W <= F; W++) {
                let ct = j * V + W;
                if (s[ct] !== 0)
                    continue;
                let Z = Math.sqrt((W - yt) * (W - yt) + (j - S) * (j - S)) / ht;
                Z < 1 ? s[ct] = T : Z < 1.9 && (1.9 - Z) * 14 > x1[(j & 3) << 2 | W & 3] && (s[ct] = xt);
            }
    }
} let y = Yo * .75, A = (qo * g | 0) & 4095, E = i === "night"; for (let D = Ua; D < Bn; D++) {
    let O = D * V;
    if (O += Tn, D < u) {
        let C = (u - D) / y * (Sr - 1);
        for (let I = Tn; I < bs; I++, O++) {
            if (s[O] !== 0)
                continue;
            let nt = C | 0, ht = (C - nt - .7) * 3.4;
            ht > 0 && ht * 16 > x1[(D & 3) << 2 | I & 3] && nt++, nt >= Sr && (nt = Sr - 1), s[O] = E && nt > 1 && to((I + A & 4095) * 73 + D * 9973) < 2 ? T : Kt[nt];
        }
    }
    else
        for (let C = Tn; C < bs; C++, O++)
            s[O] === 0 && (s[O] = P);
} } function MM() { if (!e.trails)
    return; let s = 2.6, r = vt, f = Hn; for (let u of Yt.concat(ce, xa.filter((g?: any) => !g.dead))) {
    if (u === Yt[0] && (Ls < .5 || p.dead))
        continue;
    let g = u.g;
    for (let i = 0; i < 2; i++) {
        let y = u.trail[i], A = 0, E = 0, D = !1;
        for (let O = 0; O < u.trailLen; O++) {
            let C = (u.trailHead - 1 - O + Si * 2) % Si * 4, I = (Lt - y[C + 3]) / (s * (.3 + .7 * g));
            if (I >= 1)
                break;
            if (!Se(y[C], y[C + 1], y[C + 2])) {
                D = !1;
                continue;
            }
            let nt = It, ht = Gt;
            if (D) {
                let yt = Math.max(Math.abs(nt - A), Math.abs(ht - E));
                if (yt < 600) {
                    let S = Math.max(1, Math.ceil(yt)), X = I < .5 ? 1 : (1 - I) * 2, Y = I < .25 ? Mt[0] : I < .6 ? Mt[1] : Mt[2], F = ua > 2.4 ? 2 : 1;
                    for (let ot = 0; ot < S; ot++) {
                        let H = Math.round(A + (nt - A) * ot / S), j = Math.round(E + (ht - E) * ot / S);
                        for (let W = j; W < j + F; W++)
                            for (let ct = H; ct < H + F; ct++)
                                ct < 0 || W < 0 || ct >= V || W >= et || f[W * V + ct] < se - 1 || X * 16 > x1[(W & 3) << 2 | ct & 3] && (r[W * V + ct] = Y);
                    }
                }
            }
            A = nt, E = ht, D = !0;
        }
    }
} } function vM() { let s = vt, r = Hn, f = e.timeOfDay === "night" ? .55 : 1; for (let u = 0; u < h1; u++) {
    let g = u * m1, i = Ue[g + 8];
    if (i <= 0)
        continue;
    let y = Lt - Ue[g + 3];
    if (y < 0 || y >= i)
        continue;
    let A = y / i, E = (1 - Math.exp(-y * 5)) / 5;
    if (!Se(Ue[g] + Ue[g + 5] * E, Ue[g + 1] + Ue[g + 6] * E, Ue[g + 2] + y * 2.5))
        continue;
    let D = Math.max(.8, Ue[g + 4] * (1 + 2.4 * A) * ua);
    if (D > 60)
        continue;
    let O = Ue[g + 7] * (1 - A) * (1 - A) * (A < .08 ? A / .08 : 1) * f, C = Ue[g + 9], I = Math.min(240, C + (C < 100 ? 70 : 34) * A), nt = I, ht = Math.min(255, I + 1), yt = Math.min(255, I + 7), S = Math.max(0, Math.floor(It - D)), X = Math.min(V - 1, Math.ceil(It + D)), Y = Math.max(0, Math.floor(Gt - D)), F = Math.min(et - 1, Math.ceil(Gt + D)), ot = 1 / (D * D);
    for (let H = Y; H <= F; H++)
        for (let j = S; j <= X; j++) {
            let W = ((j - It) * (j - It) + (H - Gt) * (H - Gt)) * ot;
            if (W > 1)
                continue;
            let ct = H * V + j;
            if (r[ct] < se - 1)
                continue;
            let Z = O * (1 - W * .7) * 256 | 0, Tt = s[ct], Rt = (Tt & 255) * (256 - Z) + nt * Z >> 8, Jt = (Tt >> 8 & 255) * (256 - Z) + ht * Z >> 8, Xt = (Tt >> 16 & 255) * (256 - Z) + yt * Z >> 8;
            s[ct] = (255 << 24 | Xt << 16 | Jt << 8 | Rt) >>> 0;
        }
} } function d0(s?: any, r?: any, f?: any, u?: any) { if (s |= 0, r |= 0, s < 0 || r < 0 || s >= V || r >= et)
    return; let g = r * V + s; Hn[g] < u - 1 || (Hn[g] = u, vt[g] = f); } function Ur(s?: any, r?: any, f?: any, u?: any, g?: any) { let i = Math.ceil(f); for (let y = -i; y <= i; y++)
    for (let A = -i; A <= i; A++)
        A * A + y * y <= f * f && d0(s + A, r + y, u, g); } function L1(s?: any, r?: any) { let f = eo(s, r || [180, 160, 120]); return mt(f[0], f[1], f[2]); } function wM(s?: any) { let r = s.T || Yn[s.type] || {}, f = r.colors || ["#6a5a48", "#c8a060", "#3a3028"], u = L1(f[0], [100, 90, 70]), g = L1(f[1], [200, 180, 80]), i = L1(f[2], [200, 80, 40]), y = s.flash > 0 ? mt(255, 255, 230) : g, A = Fe() * (s.scale || 1), E = s.kind; if (E === "ufo") {
    let j = r.boss ? 9 : 5, W = (r.boss ? 22 : 11) * A / .6;
    for (let Z = 0; Z < j; Z++) {
        let Tt = Z / (j - 1), Rt = W * (.35 + Math.sin(Tt * Math.PI) * .85), Jt = s.z + (Tt - .45) * (r.boss ? 14 : 7) * A / .6;
        if (!Se(s.x, s.y, Jt))
            continue;
        let Xt = Z === 0 || Z === j - 1 ? i : Z === (j / 2 | 0) ? y : u;
        Ur(It, Gt, Math.max(1.4, Rt * ua * .55), Xt, se);
    }
    let ct = r.boss ? 10 : 6;
    for (let Z = 0; Z < ct; Z++) {
        let Tt = s.yaw + Z * Math.PI * 2 / ct + Lt * .8, Rt = W * .85;
        Se(s.x + Math.cos(Tt) * Rt, s.y + Math.sin(Tt) * Rt, s.z + 1) && Ur(It, Gt, Math.max(1, 1.6 * ua), mt(180, 255, 160), se);
    }
    if (s.beamOn && Se(s.x, s.y, s.z - 2)) {
        let Z = It, Tt = Gt, Rt = se, Jt = Ie(s.x, s.y);
        if (Se(s.x, s.y, Jt + 1)) {
            let Xt = mt(80, 255, 160), _e = Math.max(4, Math.ceil(Math.abs(Gt - Tt) / 2));
            for (let $t = 0; $t <= _e; $t++) {
                let oe = $t / _e, he = Z + (It - Z) * oe, Te = Tt + (Gt - Tt) * oe, ie = 1 + oe * (r.boss ? 10 : 5) * ua * .4;
                for (let Zt = -ie; Zt <= ie; Zt++)
                    d0(he + Zt, Te, Xt, Rt + (se - Rt) * oe);
            }
        }
    }
    return;
} let D = E === "sea", O = s.type === "bunker", C = (D ? s.type === "gunboat" ? 22 : 16 : O ? 16 : 11) * A / .6, I = (D ? s.type === "gunboat" ? 9 : 6.5 : O ? 16 : 11) * A / .6, nt = (D ? 7 : O ? 22 : 16) * A / .6, ht = D ? s.yaw + .7 : 0, yt = Math.cos(ht), S = Math.sin(ht), X = Math.max(4, Math.round(nt)), Y = 1.15; for (let j = 0; j < X; j++) {
    let W = s.z + j * 1.15, ct = j > X - 3 ? .5 : 1;
    for (let Z = -I * ct; Z <= I * ct; Z += Y)
        for (let Tt = -C * ct; Tt <= C * ct; Tt += Y) {
            let Rt = s.x + Tt * yt - Z * S, Jt = s.y + Tt * S + Z * yt;
            if (!Se(Rt, Jt, W))
                continue;
            let Xt = Math.abs(Tt) > C * ct * .72 || Math.abs(Z) > I * ct * .72, _e = j >= X - 2;
            d0(It, Gt, _e ? y : Xt ? g : u, se), s.flash > 0 && d0(It, Gt, y, se);
        }
} let F = s.z + X * 1.15 + 2; Se(s.x, s.y, F) && Ur(It, Gt, Math.max(2, 4.2 * ua * A / .6), i, se); let ot = Math.sin(s.yaw), H = -Math.cos(s.yaw); for (let j = 2; j <= 16; j += 1.4)
    Se(s.x + ot * j * A / .6, s.y + H * j * A / .6, F + 1 + j * .2) && Ur(It, Gt, Math.max(1, 1.5 * ua), g, se); D && Se(s.x, s.y, 1.2) && Ur(It, Gt, Math.max(2, 5 * ua), mt(220, 230, 240), se); } function SM(s?: any) { let r = Za, f = Fa, u = Cn, g = _l, i = kl, y = Ss(s), A = Fe() * (s.scale || 1), E = (y.rx * r - y.ry * f) * A, D = -(y.rx * f + y.ry * r) * A, O = y.rz * A, C = (y.fx * r - y.fy * f) * A, I = -(y.fx * f + y.fy * r) * A, nt = y.fz * A, ht = (y.ux * r - y.uy * f) * A, yt = -(y.ux * f + y.uy * r) * A, S = y.uz * A, X = s.x - ne.x, Y = s.y - ne.y, F = X * r - Y * f, ot = -(X * f + Y * r), H = s.z - ne.alt, j = 1 + u * ot; if (j < .2)
    return; let W = g / j, ct = el + W * F, Z = gn - W * (H + i * ot), Tt = ko, Rt = Cs * Tt * A * W + 50; if (ct < -Rt || Z < -Rt - et || ct > V + Rt || Z > et + Rt)
    return; let Jt = W * E, Xt = -W * (O + i * D), _e = W * C, $t = -W * (nt + i * I), oe = vt, he = le, Te = Hn, ie = -Nt, Zt = -zt, ft = 1.1, Ct = Math.sqrt(ie * ie + Zt * Zt + ft * ft), Qt = e.timeOfDay === "night", Be = Qt ? .74 : .9, Et = Qt ? .4 : .66, Ut = te => { let jt = y.ux + te * .4 * y.rx, Ve = y.uy + te * .4 * y.ry, Me = y.uz + te * .4 * y.rz, fa = (jt * ie + Ve * Zt + Me * ft) / (Ct * Math.sqrt(jt * jt + Ve * Ve + Me * Me)); return s.flash > 0 ? Mc : fa > Be ? s.pals.lit : fa < Et ? s.pals.dim : s.pals.base; }, re = Ut(-1), ae = Ut(1), pe = V, Ae = et, xe = -1, ve = -1, Qe = A * Tt * g / Math.max(.2, j - u * Cs * Tt * .6 * A), ge = Vt(Math.ceil(Qe * 2 - .24), 2, 6); for (let te = 0; te < ge; te++)
    for (let jt = 0; jt < ge; jt++) {
        let Ve = (te + .5) / ge - .5, Me = (jt + .5) / ge - .5;
        u0[te * ge + jt] = (Ve * Jt + Me * _e) * Tt, f0[te * ge + jt] = (Ve * Xt + Me * $t) * Tt;
    } let Ce = ge * ge, De; u < 1e-6 ? De = i * S - yt >= 0 ? 1e9 : -1e9 : De = (-F * ht + (-1 / u - ot) * yt + (i / u - H) * S) / (A * A); for (let te = 0; te < Ds; te++)
    x[te] = te, b[te] = Math.abs((te - _o) * Tt * ze - De); for (let te = 1; te < Ds; te++) {
    let jt = x[te], Ve = b[jt], Me = te - 1;
    for (; Me >= 0 && b[x[Me]] < Ve;)
        x[Me + 1] = x[Me], Me--;
    x[Me + 1] = jt;
} let ga = (s.turrets || []).filter((te?: any) => te.dead), Ll = (te?: any, jt?: any, Ve?: any) => { for (let Me of ga) {
    let fa = te - Me.a, bn = jt - Me.b, Na = Ve - Me.y;
    if (fa * fa + bn * bn + Na * Na < (Me.r + .8) * (Me.r + .8))
        return Me;
} return null; }, na = (te?: any, jt?: any, Ve?: any, Me?: any, fa?: any) => { let bn = te * Tt, Na = jt * Tt, sn = ot + (Ve - _o) * Tt * ze * yt + bn * D + Na * I, Vn = 1 + u * sn; if (Vn < .2)
    return; let Xn = g / Vn, Wt = (Ve - _o) * Tt * ze, _t = fa[Me], ue = el + Xn * (F + Wt * ht + bn * E + Na * C), fe = gn - Xn * (H + Wt * S + bn * O + Na * nt + i * sn), ta = Xn / W, He = 0, ea = 0; for (let Je = 0; Je < Ce; Je++) {
    if (He = Math.round(ue + u0[Je] * ta), ea = Math.round(fe + f0[Je] * ta), He < 0 || ea < 0 || He >= V || ea >= et)
        continue;
    let de = ea * V + He;
    Te[de] < sn - 1 || (oe[de] = _t, he[de] = 1, Te[de] = sn);
} He < pe && (pe = He), He > xe && (xe = He), ea < Ae && (Ae = ea), ea > ve && (ve = ea); }, ln = ac(s.type), ll = m[ln] || m.linen; for (let te = 0; te < Ds; te++) {
    let jt = x[te], Ve = ll.C[jt].length;
    if (Ve === 0)
        continue;
    let Me = re, fa = ae, bn = ln, Na = ll, sn = Na.A[jt], Vn = Na.B[jt], Xn = Na.C[jt];
    for (let Wt = 0; Wt < Ve; Wt++) {
        let _t = sn[Wt], ue = Vn[Wt], fe = Ll(_t, ue, jt);
        if (fe) {
            let ta = _t - fe.a, He = ue - fe.b, ea = jt - fe.y, Je = ta * ta + He * He + ea * ea, de = fe.r * fe.r;
            if (Je < de * .45)
                continue;
            Je < de * .85 ? na(_t, ue, jt, 3, Me) : na(_t, ue, jt, (Wt + (Lt * 9 | 0) & 3) === 0 ? 51 : 4, Me);
            continue;
        }
        na(_t, ue, jt, Xn[Wt], _t < 0 ? Me : fa);
    }
} let zc = Yb(s.type, Lt * 22 + (s.x || 0) * .01); for (let te of zc)
    na(te.a, te.b, te.y, te.v, ae); let va = qb(s.type, Lt * 6 + (s.x || 0) * .02); for (let te of va)
    na(te.a, te.b, te.y, te.v, ae); if (s.dying >= 0) {
    let te = ac(s.type);
    if (te === "alien") {
        let jt = .5 + .5 * Math.sin(Lt * 14);
        for (let Ve = 0; Ve < 14; Ve++) {
            let Me = Ve * .45 + Lt * 2, fa = 4 + Ve % 5 * 3, bn = Math.cos(Me) * fa, Na = Math.sin(Me * .7) * 18, sn = _o + Math.sin(Me + Lt * 3) * 6;
            na(bn, Na, sn, jt > .5 ? 53 : 37, ae);
        }
    }
    else if (te === "steampunk") {
        for (let jt = 0; jt < 8; jt++) {
            let Ve = Math.sin(Lt * 4 + jt) * 6, Me = 8 + jt * 3, fa = _o + 10 + jt % 3 * 3;
            na(Ve, Me, fa, 7 - jt % 3, ae);
        }
        for (let jt = 0; jt < 6; jt++) {
            let Ve = Math.sin(Lt * 6 + jt * 1.3) * 5, Me = Math.cos(Lt * 3 + jt) * 10;
            na(Ve, Me, _o + 2, 50 + jt % 3, ae);
        }
    }
    else
        for (let jt = 0; jt < 8; jt++) {
            let Ve = Math.sin(Lt * 5 + jt) * 5, Me = 18 + Math.cos(Lt * 3 + jt) * 8, fa = _o + 4 + Math.sin(Lt * 7 + jt) * 3;
            na(Ve, Me, fa, 51 + jt % 3, ae);
        }
} pe = Math.max(1, pe - 4), Ae = Math.max(1, Ae - 4), xe = Math.min(V - 2, xe + 4), ve = Math.min(et - 2, ve + 4); for (let te = Ae; te <= ve; te++) {
    let jt = te * V + pe;
    for (let Ve = pe; Ve <= xe; Ve++, jt++)
        he[jt] === 0 && ((he[jt - 1] | he[jt + 1] | he[jt - V] | he[jt + V]) & 1) === 1 && Te[jt] >= ot - 2 && (oe[jt] = dt, Te[jt] > ot && (Te[jt] = ot));
} for (let te = Ae - 1; te <= ve + 1; te++)
    he.fill(0, te * V + pe - 1, te * V + xe + 2); } function EM(s?: any, r?: any, f = 0) { if (s.kind === "ground" || s.kind === "sea" || s.kind === "ufo") {
    wM(s);
    return;
} if (s.kind === "airship") {
    SM(s);
    return;
} let u = f === 1, g = Za, i = Fa, y = Cn, A = _l, E = kl, D = Ss(s), O = Fe() * (s.scale || 1), C = (D.rx * g - D.ry * i) * O, I = -(D.rx * i + D.ry * g) * O, nt = D.rz * O, ht = (D.fx * g - D.fy * i) * O, yt = -(D.fx * i + D.fy * g) * O, S = D.fz * O, X = (D.ux * g - D.uy * i) * O, Y = -(D.ux * i + D.uy * g) * O, F = D.uz * O, ot = s.x - ne.x, H = s.y - ne.y, j = ot * g - H * i, W = -(ot * i + H * g), ct = s.z - ne.alt, Z = r === 0 ? Ls : 1; if (Z < .004)
    return; let Tt = Z < 1, Rt = lo, Jt = 1 + y * W; if (Jt < .2)
    return; let Xt = A / Jt, _e = el + Xt * j, $t = gn - Xt * (ct + E * W), oe = 46 * O * Xt + 40; if (_e < -oe || $t < -oe - et || _e > V + oe || $t > et + oe)
    return; let he = Xt * C, Te = -Xt * (nt + E * I), ie = Xt * ht, Zt = -Xt * (S + E * yt), ft = vt, Ct = le, Qt = Hn, Be = -Nt, Et = -zt, Ut = 1.1, re = Math.sqrt(Be * Be + Et * Et + Ut * Ut), ae = e.timeOfDay === "night", pe = ae ? .74 : .9, Ae = ae ? .4 : .66, xe = Wt => { let _t = D.ux + Wt * .4 * D.rx, ue = D.uy + Wt * .4 * D.ry, fe = D.uz + Wt * .4 * D.rz, ta = (_t * Be + ue * Et + fe * Ut) / (re * Math.sqrt(_t * _t + ue * ue + fe * fe)); return u ? s.flash > 0 ? Mc : ta > pe ? s.pals.lit : ta < Ae ? s.pals.dim : s.pals.base : r === 0 && p.shield > 0 && (Lt * 10 | 0) % 2 === 1 ? Mc : ta > pe ? L : ta < Ae ? U : z; }, ve = xe(-1), Qe = xe(1), ge = V, Ce = et, De = -1, ga = -1, Ll = O * A / Math.max(.2, Jt - y * 46 * .6 * O), na = Vt(Math.ceil(Ll * 2 - .24), 2, 8); for (let Wt = 0; Wt < na; Wt++)
    for (let _t = 0; _t < na; _t++) {
        let ue = (Wt + .5) / na - .5, fe = (_t + .5) / na - .5;
        u0[Wt * na + _t] = ue * he + fe * ie, f0[Wt * na + _t] = ue * Te + fe * Zt;
    } let ln = na * na, ll; y < 1e-6 ? ll = E * F - Y >= 0 ? 1e9 : -1e9 : ll = (-j * X + (-1 / y - W) * Y + (E / y - ct) * F) / (O * O); for (let Wt = 0; Wt < 13; Wt++)
    Ri[Wt] = Wt, O1[Wt] = Math.abs((Wt - uc) * ze - ll); for (let Wt = 1; Wt < 13; Wt++) {
    let _t = Ri[Wt], ue = O1[_t], fe = Wt - 1;
    for (; fe >= 0 && O1[Ri[fe]] < ue;)
        Ri[fe + 1] = Ri[fe], fe--;
    Ri[fe + 1] = _t;
} let zc = Ze - r * .25, va = xn > .02 && e.afterburner > .01 && ze < 2.6, te = .82 + .18 * Math.sin(Lt * 47 + r * 2) * Math.sin(Lt * 31), jt = (u ? (.07 + .17 * e.afterburner) * 46 * .8 * (s.dying >= 0 ? 0 : 1) : R1()) * te, Ve = 1.15 * (1 + .22 * Ke), Me = Ne + ke > .5, fa = u ? 0 : Em(), bn = u ? 0 : xs * .35, Na = e.flameStyle === "realistic" && !u, sn = Wt => { if (zc >= 2)
    return 0; let _t = (zc - (Wt - h) * .07) / .36; return _t <= 0 ? NaN : _t < 1 ? -(1 - _t * _t) * ((et >> 1) + 44) : 0; }, Vn = (Wt?: any, _t?: any, ue?: any, fe?: any, ta?: any) => { let He = (Wt + .5 - Yh) / (qh * 1.25); if (He <= -1 || He >= 1 || jt <= .5)
    return; let ea = Math.sqrt(1 - He * He); for (let Je = -1; Je <= 1; Je += 2)
    for (let de = 0; de < jt; de += .5) {
        let Ja = de / jt, wa = qh * Ve * Math.pow(1 - Ja, .75) * ea * (.9 + .2 * Math.sin(de * 1.9 - Lt * 40 + Je));
        if (wa < .2)
            continue;
        let _n = ha - d1 - de, jn = de * de / jt, Ul = fa * jn, ba = bn * jn;
        for (let bl = -wa; bl <= wa; bl += .5) {
            let Hl = Je * Gh + bl + Ul, ns = ue + Hl * I + _n * yt + ba * Y, qs = 1 + y * ns;
            if (qs < .2)
                continue;
            let ls = A / qs, sl = Ja * .9 + Math.abs(bl) / (wa + .01) * .55 + Math.abs(He) * .3 - .16 * Ke, qa = it[sl < .28 ? 0 : sl < .5 ? 1 : sl < .75 ? 2 : sl < 1 ? 3 : sl < 1.25 ? 4 : 5], hn = Math.round(el + ls * (_t + Hl * C + _n * ht + ba * X)), ol = Math.round(gn - ls * (fe + Hl * nt + _n * S + ba * F + E * ns) + ta), Al = Math.max(1, Math.ceil(ls * O * .55));
            for (let Gr = ol; Gr < ol + Al; Gr++)
                for (let Yr = hn; Yr < hn + Al; Yr++) {
                    if (Yr < 0 || Gr < 0 || Yr >= V || Gr >= et)
                        continue;
                    let Ni = Gr * V + Yr;
                    Qt[Ni] < ns - 1 || (Tt && Ct[Ni] === 0 && (Rt[Ni] = ft[Ni]), ft[Ni] = qa, Ct[Ni] = 2, Qt[Ni] = ns);
                }
            hn < ge && (ge = hn), hn + Al > De && (De = hn + Al), ol < Ce && (Ce = ol), ol + Al > ga && (ga = ol + Al);
        }
    } }, Xn = () => { let Wt = R1() * (.94 + .3 * (te - .82)) * Jw, _t = qh * (1 + .12 * Ke) * 1.5, ue = Z * (1 - Sm()); if (Wt <= .6 || ue < .01)
    return; let fe = (Yh - .5 - uc) * ze, ta = j + fe * X, He = W + fe * Y, ea = ct + fe * F; for (let Je = -1; Je <= 1; Je += 2) {
    if (ee.count >= y1)
        return;
    let de = ee.count * Vh, Ja = !0, wa = 0, _n = 0;
    for (let ba = 0; ba < 3; ba++) {
        let bl = ba === 2 ? Wt : 0, Hl = Je * Gh + fa * bl, ns = ha - d1 - ba * .5 * Wt, qs = bn * bl, ls = He + Hl * I + ns * yt + qs * Y, sl = 1 + y * ls;
        if (sl < .2) {
            Ja = !1;
            break;
        }
        let qa = A / sl;
        tt[de + ba * 2] = el + qa * (ta + Hl * C + ns * ht + qs * X), tt[de + ba * 2 + 1] = gn - qa * (ea + Hl * nt + ns * S + qs * F + E * ls), za[ba] = ls, ba === 0 ? wa = qa : ba === 2 && (_n = qa);
    }
    if (!Ja)
        continue;
    let jn = _t * O * wa, Ul = (r * 2 + (Je > 0 ? 1 : 0)) % y1;
    for (let ba = 0; ba < 3; ba++) {
        let bl = ba === 1, Hl = bl ? .25 * tt[de] + .5 * tt[de + 2] + .25 * tt[de + 4] : tt[de + ba * 2], ns = bl ? .25 * tt[de + 1] + .5 * tt[de + 3] + .25 * tt[de + 5] : tt[de + ba * 2 + 1], qs = bl ? .25 * za[0] + .5 * za[1] + .25 * za[2] : za[ba], ls = 0;
        for (let qa = 0; qa < 5; qa++) {
            let hn = Math.round(Hl + (qa === 1 ? -jn : qa === 2 ? jn : 0)), ol = Math.round(ns + (qa === 3 ? -jn : qa === 4 ? jn : 0));
            (hn < 0 || ol < 0 || hn >= V || ol >= et || Qt[ol * V + hn] >= qs - 1) && ls++;
        }
        let sl = Ul * 3 + ba;
        rt[sl] += (ls / 5 - rt[sl]) * .3, tt[de + 10 + ba] = rt[sl];
    }
    tt[de + 6] = jn, tt[de + 7] = _n / wa, tt[de + 8] = Ke, tt[de + 9] = ue, tt[de + 13] = Ul, tt[de + 14] = Vt(e.afterburner, 0, 1), tt[de + 15] = Wt / _t, ee.count++;
} }; for (let Wt = 0; Wt < 13; Wt++) {
    let _t = Ri[Wt], ue = o[_t].length;
    if (ue === 0)
        continue;
    let fe = sn(_t);
    if (fe !== fe)
        continue;
    let ta = (_t - uc) * ze, He = j + ta * X, ea = W + ta * Y, Je = ct + ta * F, de = n[_t], Ja = l[_t], wa = o[_t];
    for (let _n = 0; _n < ue; _n++) {
        let jn = de[_n], Ul = Ja[_n], ba = ea + jn * I + Ul * yt, bl = 1 + y * ba;
        if (bl < .2)
            continue;
        let Hl = A / bl, ns = jn < 0 ? ve[wa[_n]] : Qe[wa[_n]], qs = el + Hl * (He + jn * C + Ul * ht), ls = gn - Hl * (Je + jn * nt + Ul * S + E * ba) + fe, sl = Hl / Xt, qa = 0, hn = 0;
        for (let ol = 0; ol < ln; ol++) {
            if (qa = Math.round(qs + u0[ol] * sl), hn = Math.round(ls + f0[ol] * sl), qa < 0 || hn < 0 || qa >= V || hn >= et)
                continue;
            let Al = hn * V + qa;
            Qt[Al] < ba - 1 || (Tt && Ct[Al] === 0 && (Rt[Al] = ft[Al]), ft[Al] = ns, Ct[Al] = 1, Qt[Al] = ba);
        }
        qa < ge && (ge = qa), qa > De && (De = qa), hn < Ce && (Ce = hn), hn > ga && (ga = hn);
    }
    va && !Na && !Me && Vn(_t, He, ea, Je, fe);
} if (va && Na && Xn(), va && !Na && Me)
    for (let Wt = 0; Wt < 13; Wt++) {
        let _t = sn(Wt);
        if (_t !== _t)
            continue;
        let ue = (Wt - uc) * ze;
        Vn(Wt, j + ue * X, W + ue * Y, ct + ue * F, _t);
    } ge = Math.max(1, ge - 4), Ce = Math.max(1, Ce - 4), De = Math.min(V - 2, De + 4), ga = Math.min(et - 2, ga + 4); for (let Wt = Ce; Wt <= ga; Wt++) {
    let _t = Wt * V + ge;
    for (let ue = ge; ue <= De; ue++, _t++)
        if (Tt) {
            if (Ct[_t] !== 0) {
                let fe = Rt[_t], ta = ft[_t], He = Z * 256 | 0, ea = (fe & 255) * (256 - He) + (ta & 255) * He >> 8, Je = (fe >> 8 & 255) * (256 - He) + (ta >> 8 & 255) * He >> 8, de = (fe >> 16 & 255) * (256 - He) + (ta >> 16 & 255) * He >> 8;
                ft[_t] = (255 << 24 | de << 16 | Je << 8 | ea) >>> 0;
            }
        }
        else
            Ct[_t] === 0 && ((Ct[_t - 1] | Ct[_t + 1] | Ct[_t - V] | Ct[_t + V]) & 1) === 1 && Qt[_t] >= W - 2 && (ft[_t] = dt, Qt[_t] > W && (Qt[_t] = W));
} for (let Wt = Ce - 1; Wt <= ga + 1; Wt++)
    Ct.fill(0, Wt * V + ge - 1, Wt * V + De + 2); } function zM() { let s = Math.cos(Rl), r = Math.sin(Rl), f = ia >> 1, u = V >> 1, g = vt, i = Cr, y = ia; for (let A = 0; A < et; A++) {
    let E = A - ye, D = f - s * u - r * E + .5, O = f - r * u + s * E + .5, C = A * V;
    for (let I = 0; I < V; I++, C++, D += s, O += r)
        g[C] = i[(O | 0) * y + (D | 0)];
} } function Qm() { if (!$l || $l.W !== V || $l.H !== et) {
    let s = [], r = [];
    for (let f = 0; f < 9; f++)
        s.push(z[1 + f]);
    for (let f = 0; f < 6; f++)
        r.push(z[17 + f]);
    $l = Xb(V, et, { body: s, hot: r });
} return $l; } let TM = (s?: any, r?: any) => { let f = Yt[0], u = Math.sin(f.yaw), g = Math.cos(f.yaw), i = ut[((f.y + s * u - r * g | 0) & Sn) << Rs | (f.x + s * g + r * u | 0) & Sn]; return i >= 12 ? 3 : i >= 4 ? 2 : i >= 2 ? 1 : 0; }, Hr = []; function BM() { let s = Yt[0], r = Sm(); if (r <= 0)
    return; let f = Vt((ke - .72) / .28, 0, 1), u = Math.sin(s.yaw), g = Math.cos(s.yaw); Hr.length = 0; for (let D = 1; D < Yt.length; D++) {
    let O = Yt[D].x - s.x, C = Yt[D].y - s.y;
    Hr.push(O * g + C * u, O * u - C * g);
} for (let D of xa) {
    if (D.dead)
        continue;
    let O = D.x - s.x, C = D.y - s.y;
    Hr.push(O * g + C * u, O * u - C * g);
} for (let D of ce) {
    let O = D.x - s.x, C = D.y - s.y;
    Hr.push(O * g + C * u, O * u - C * g);
} let i = e.timeOfDay, y = Math.sqrt(Nt * Nt + zt * zt) || 1, A = (-Nt * u + zt * g) / y, E = (-Nt * g - zt * u) / y; jb(vt, Qm(), { time: Lt, inPlace: r, hud: f * f * (3 - 2 * f), roll: Rl, pitch: s.pitch, heading: s.yaw, speed: Ft, speedMax: e.speed * Vt(e.boost, 1, 4) * 1.08, alt: s.z, altMax: Math.max(e.altitude, Vt(e.ceiling, 20, 900)), climb: Vt(xs / .5, -1, 1), turn: Vt(s.yawRate / Math.max(.1, e.agility), -1, 1), boost: Ke, pivotY: ye, horizonY: gn, focal: _l / Cn, headX: Ci, headY: bc + (Ke > .2 ? (((Lt * 30 | 0) & 1) - .5) * 1.5 * Ke : 0), sunSide: E, sunReach: .72 - .28 * A, sunColor: i === "sunset" ? Pw : i === "night" ? $w : Ww, sunPower: i === "sunset" ? 1.1 : i === "night" ? .45 : 1, land: TM, blips: Hr, jet: w }); } function CM() { if (V === 0)
    return Ot; Lr(), Yo = et, ee.count = 0; let s = ke > 0 || Rl !== 0, r = V, f = et, u = vt, g = no, i = le, y = Hn, A = lo, E = gn; if (s) {
    V = ia, et = ia, vt = Cr, no = hc, le = Dl, Hn = Dr, lo = mc;
    let O = ia >> 1;
    el = O, gn = O + (E - ye);
    let C = Math.abs(Math.cos(Rl)), I = Math.abs(Math.sin(Rl));
    Tn = Math.max(0, O - Math.ceil(C * (r / 2) + I * Math.max(ye, f - ye)) - 2), bs = Math.min(ia, O + Math.ceil(C * (r / 2) + I * Math.max(ye, f - ye)) + 2), Ua = Math.max(0, O - Math.ceil(C * ye + I * (r / 2)) - 2), Bn = Math.min(ia, O + Math.ceil(C * (f - ye) + I * (r / 2)) + 2);
}
else
    Tn = 0, bs = V, Ua = 0, Bn = et; bM(), AM(), MM(), vM(); let D = Yt.map((O?: any, C?: any) => ({ j: O, i: C, k: 0, d: (O.x - ne.x) * Fa + (O.y - ne.y) * Za })); p.dead && D.shift(); for (let O of ce)
    D.push({ j: O, i: 1, k: 1, d: (O.x - ne.x) * Fa + (O.y - ne.y) * Za }); for (let O of xa)
    O.dead || D.push({ j: O, i: 2 + O.slot, k: 1, d: (O.x - ne.x) * Fa + (O.y - ne.y) * Za }); D.sort((O?: any, C?: any) => O.d - C.d); for (let O of D)
    EM(O.j, O.i, O.k); if ($5(), s) {
    V = r, et = f, vt = u, no = g, le = i, Hn = y, lo = A, el = V >> 1, gn = E, zM();
    let O = ia >> 1, C = Math.cos(Rl), I = Math.sin(Rl);
    for (let nt = 0; nt < ee.count; nt++)
        for (let ht = 0; ht < 3; ht++) {
            let yt = nt * Vh + ht * 2, S = tt[yt] - O, X = tt[yt + 1] - O;
            tt[yt] = (V >> 1) + C * S + I * X, tt[yt + 1] = ye - I * S + C * X;
        }
    BM();
} return Ot; } function Om(s?: any, r?: any, f?: any, u?: any) { let g = Yn[s] || Yn.fighter; if (g.kind)
    return Ys(s, r, f, u); let i = io(), y = Yt[0], A = fc(r, f, u ?? Math.max(Ie(r, f) + 20, y.z), Math.atan2(y.x - r, -(y.y - f))), E = g.hp * i.hp; return Object.assign(A, { type: s, T: g, pals: Ql[s] || Ql.fighter, scale: g.scale, kind: g.kind, vz: 0, hp: E, hpMax: E, dying: -1, dead: !1, flash: 0, mode: "attack", modeT: 0, side: 1, altOff: 0, altT: 3, cd: 2.5, burst: 0, burstT: 0, spin: 0, puffT: 0, stun: 0, lostLock: 0, spd: i.speed * g.speed }), ce.push(A), A; } let Lm = ["x", "y", "z", "yaw", "pitch", "roll", "vx", "vy", "vz", "yawRate", "stunt", "stuntDir", "stuntDelay"]; function p0(s?: any): Record<string, any> { let r: Record<string, any> = {}; for (let f of Lm)
    r[f] = s[f] || 0; return r; } function Um(s?: any, r?: any) { if (!r)
    return s; for (let f of Lm)
    r[f] != null && (s[f] = r[f]); return s.trailLen = 0, s.lastTrailX = s.x, s.lastTrailY = s.y, s; } function nl(s?: any, r?: any): Record<string, any> { let f: Record<string, any> = {}; if (!s)
    return f; for (let u in s) {
    if (r && r[u])
        continue;
    let g = s[u], i = typeof g;
    (g == null || i === "number" || i === "string" || i === "boolean") && (f[u] = g);
} return f; } let Hm = { T: 1, pals: 1, aimAt: 1, target: 1, pal: 1 }; function DM(s?: any) { let r: Record<string, any> = { ...p0(s), ...nl(s, { ...Hm, trail: 1, trailHead: 1, trailLen: 1, lastTrailX: 1, lastTrailY: 1, turrets: 1 }) }; return s.turrets && (r.turrets = s.turrets.map((f?: any) => nl(f))), r; } function kM(s?: any) { let r = Yn[s.type] ? s.type : "fighter", f = Yn[r], u = fc(s.x, s.y, s.z, s.yaw); return Object.assign(u, s, { type: r, T: f, pals: Ql[r] || Ql.fighter, kind: f.kind || s.kind, aimAt: null, dead: !!s.dead, dying: s.dying == null ? -1 : s.dying }), u.kind === "airship" && !u.turrets && (u.turrets = Sh(r)), u.trailLen = 0, u; } function _M(s?: any): Record<string, any> { return { ...p0(s), ...nl(s, { ...Hm, trail: 1, trailHead: 1, trailLen: 1, lastTrailX: 1, lastTrailY: 1 }), targetIdx: s.target ? ce.indexOf(s.target) : -1 }; } function RM(s?: any): Record<string, any> { let r = Yt[0], f = ym(r, s.slot || 0); return Object.assign(f, s, { pals: _r, target: null, kamikaze: null }), f.trailLen = 0, f; } function NM(s?: any): Record<string, any> { return { ...nl(s, { target: 1 }), targetIdx: s.target && s.target !== Yt[0] ? ce.indexOf(s.target) : s.target === Yt[0] ? -2 : -1 }; } function QM(s?: any): Record<string, any> { let r: Record<string, any> = { ...s }; return delete r.targetIdx, s.targetIdx === -2 ? r.target = Yt[0] : s.targetIdx >= 0 ? r.target = ce[s.targetIdx] || null : r.target = null, r; } function OM() { vs(); let s = Yt[0]; return { v: 9, achieve: tl, chaseZoom: an, overheadZoom: $n, funnels: Ka.map((r?: any) => nl(r)), time: Lt, introT: Ze, altGoal: zn, boost: Ke, burn: xn, speedNow: Ft, viewTarget: Gn, camYaw: ne.yaw, follow: { x: oa.x, y: oa.y, alt: oa.alt }, lead: p0(s), jets: Yt.map(p0), G: JSON.parse(JSON.stringify(p)), enemies: ce.map(DM), bullets: Ye.map((r?: any) => nl(r)), missiles: Ta.map(NM), drones: xa.map(_M), flares: ml.map((r?: any) => nl(r)), empWave: nn ? nl(nn) : null, gates: M.map((r?: any) => nl(r)), zaps: qt.map((r?: any) => nl(r)), wells: wt.map((r?: any) => nl(r)), patches: be.map((r?: any) => nl(r)), laserBeams: je.map((r?: any) => nl(r)), boostTrail: Dn.map((r?: any) => nl(r)), shocks: qn.map((r?: any) => nl(r)), lockIdx: Ya ? ce.indexOf(Ya) : -1, treeRanks: Ra }; } function LM(s?: any) { if (!s || typeof s != "object")
    return !1; if (vs(), Lt = s.time || 0, Ze = s.introT == null ? 99 : s.introT, zn = s.altGoal != null ? s.altGoal : zn, Ke = s.boost || 0, xn = s.burn == null ? 1 : s.burn, s.viewTarget != null && (Gn = s.viewTarget), s.camYaw != null && (ne.yaw = s.camYaw), s.follow && (oa.x = s.follow.x, oa.y = s.follow.y, oa.alt = s.follow.alt), Array.isArray(s.jets))
    for (let r = 0; r < Yt.length && r < s.jets.length; r++)
        Um(Yt[r], s.jets[r]);
else
    s.lead && Um(Yt[0], s.lead); ce = Array.isArray(s.enemies) ? s.enemies.map(kM) : [], Ye = Array.isArray(s.bullets) ? s.bullets.map((r?: any) => ({ ...r })) : [], Ta = Array.isArray(s.missiles) ? s.missiles.map(QM) : [], xa = Array.isArray(s.drones) ? s.drones.map(RM) : []; for (let r of xa)
    r.targetIdx >= 0 && (r.target = ce[r.targetIdx] || null), delete r.targetIdx; return ml = Array.isArray(s.flares) ? s.flares.map((r?: any) => ({ ...r })) : [], nn = s.empWave ? { ...s.empWave } : null, M = Array.isArray(s.gates) ? s.gates.map((r?: any) => { let f = No(r.type); return { ...r, rgb: r.rgb || f.variant, baseRgb: r.baseRgb || f.base, col: r.col || mt(f.variant[0], f.variant[1], f.variant[2]), baseCol: r.baseCol || mt(f.base[0], f.base[1], f.base[2]) }; }) : [], qt = Array.isArray(s.zaps) ? s.zaps.map((r?: any) => ({ ...r })) : [], wt = Array.isArray(s.wells) ? s.wells.map((r?: any) => ({ ...r })) : [], be = Array.isArray(s.patches) ? s.patches.map((r?: any) => ({ ...r })) : [], je = Array.isArray(s.laserBeams) ? s.laserBeams.map((r?: any) => ({ ...r })) : [], Dn = Array.isArray(s.boostTrail) ? s.boostTrail.map((r?: any) => ({ ...r })) : [], qn = Array.isArray(s.shocks) ? s.shocks.map((r?: any) => ({ ...r })) : [], Ka = Array.isArray(s.funnels) ? s.funnels.map((r?: any) => ({ ...r })) : [], Number.isFinite(+s.chaseZoom) && (an = Math.max(.7, Math.min(2.5, +s.chaseZoom))), Number.isFinite(+s.overheadZoom) && ($n = Math.max(.85, Math.min(1.45, +s.overheadZoom))), s.achieve && typeof s.achieve == "object" && (tl = s.achieve, Zu(tl)), s.G && typeof s.G == "object" && (Object.assign(p, s.G), Array.isArray(p.taken) || (p.taken = []), (!p.ranks || typeof p.ranks != "object") && (p.ranks = {})), Q = _s(p.taken, Ra, tl), p.hpMax = Q.hullMax, Ya = s.lockIdx >= 0 && ce[s.lockIdx] || null, dl = !0, !0; } function UM() { bm(), p.started = !1, p.wave = 0, p.waveLive = !1, p.waveT = 3.5, p.banner = "", p.bannerT = 0; } return { setParams: aM, resize: nM, pointerMove: lM, pointerLeave: sM, press: oM, release: iM, replayIntro: xM, toggleView: yM, setKeys: uM, setJoystick: jM, setInvertY: cM, setMuted: t5, getMuted: rM, setBurn: fM, step: gM, render: CM, get width() { return V; }, get height() { return et; }, get flames() { return ee; }, get view() { return Gn === 2 ? "cockpit" : Gn === 1 ? "chase" : "top"; }, setFire: KA, fireMissile: WA, fireFlare: O5, fireEmp: L5, restart: bm, chooseUpgrade: FA, treeStats: () => (vs(), _s([], Ra, tl)), upgrades: n1, startCombat: Gs, get combat() { return P5(); }, grantSpecial: lm, spawnGateAt: rm, spawnGates: cm, revealGates: u5, weaponSheet(s?: any, r?: any) { return SA(s || 1280, r || 760, Lt); }, previewShot(s?: any, r?: any, f?: any, u?: any, g?: any) { let i = g || {}, y = Yt[0], A = Math.sin(i.yaw != null ? i.yaw : y.yaw), E = -Math.cos(i.yaw != null ? i.yaw : y.yaw), D = i.vx != null ? i.vx : A * 80, O = i.vy != null ? i.vy : E * 80, C = i.vz || 0; if (s === "circus") {
        let I = i.yaw != null ? i.yaw : y.yaw, nt = 5;
        for (let ht = 0; ht < nt; ht++) {
            let yt = ht / nt * Math.PI * 2, S = 6.5, X = Math.cos(I), Y = Math.sin(I);
            Ta.push({ x: r + X * Math.cos(yt) * S, y: f + Y * Math.cos(yt) * S, z: u + Math.sin(yt) * S * .75, yaw: I, vz: C, sp: i.sp || 80, age: .55, puffT: 0, target: null, special: "circus", size: .62, spiral: yt, hx: X * Math.cos(yt) * S, hy: Y * Math.cos(yt) * S, hz: Math.sin(yt) * S * .75 });
        }
        return Ta.length;
    } return i.as === "missile" || s === "swarm" || s === "torpedo" || s === "singularity" || s === "cluster" || s === "missile" || s === "mini" ? (Ta.push({ x: r, y: f, z: u, yaw: i.yaw != null ? i.yaw : y.yaw, vz: C, sp: i.sp || 80, age: .3, puffT: 0, target: null, special: s === "missile" || s === "mini" ? null : s, mini: s === "mini" || !!i.mini, size: i.size || (s === "torpedo" ? 1.3 : 1) }), Ta.length) : s === "laser" ? (je.push({ x: r, y: f, z: u, ex: r + A * 80, ey: f + E * 80, ez: u, age: 0, life: .4, tint: i.tint || null, fork: null }), je.length) : s === "chain" || s === "zap" ? (qt.push({ ax: r, ay: f, az: u, bx: r + A * 70, by: f + E * 70, bz: u + 4, age: 0, life: .5, col: 10083839 }), qt.length) : (Ye.push({ x: r, y: f, z: u, vx: D, vy: O, vz: C, age: i.age || .2, life: i.life || 2, own: i.own || 0, dmg: i.dmg || 1, special: s, drone: s === "drone", size: i.size, splash: i.splash, col: i.col, phase: i.phase || 0, spin: i.spin || 14 }), Ye.length); }, clearShots() { Ye = [], Ta = [], je = [], qt = [], qn = []; }, get gates() { return M; }, clearGates() { M = []; }, gateList() { return M.map((s?: any) => { let r = s.kind === "gun" ? p.specGun : s.kind === "missile" ? p.specMsl : s.kind === "craft" ? p.specCraft : p.specShield, f = s.kind === "gun" ? p.specGunLv : s.kind === "missile" ? p.specMslLv : s.kind === "craft" ? p.specCraftLv : p.specShieldLv, u = Bh(s.type, r, f); return { x: s.x, y: s.y, type: s.type, kind: s.kind, appear: s.appear || 0, label: u && u.text, mode: u && u.mode }; }); }, demoChain() { let s = ce.filter((y?: any) => y.dying < 0); s.length >= 2 && dm(s[0], 8, Math.max(3, s.length - 1)); let r = Yt[0], f = Math.sin(r.yaw), u = -Math.cos(r.yaw), g = -u, i = f; for (let y = 0; y < 3; y++) {
        let A = 40 + y * 28, E = A + 36;
        qt.push({ ax: r.x + f * A + g * (y - 1) * 18, ay: r.y + u * A + i * (y - 1) * 18, az: r.z + 2, bx: r.x + f * E + g * (2 - y) * 22, by: r.y + u * E + i * (2 - y) * 22, bz: r.z + 6 + y * 3, age: 0, life: .7, col: 10083839 });
    } return s.length; }, spawnEnemyAt: Om, clearEnemies() { ce = [], Ya = null; }, debugEnemy(s?: any, r?: any) { let f = ce.find((u?: any) => !s || u.type === s); return f ? (r && Object.assign(f, r), { type: f.type, x: f.x, y: f.y, z: f.z, yaw: f.yaw, pitch: f.pitch, roll: f.roll, dying: f.dying, turrets: (f.turrets || []).length }) : null; }, forceDie(s?: any, r?: any) { let f = ce.find((u?: any) => !s || u.type === s); return f ? (f.dying < 0 && (r ? (f.dying = 0, f.xp = 0) : Or(f)), f.dying = 1.35, f.pitch = .5, f.roll = .65, f.vz = -14, r && (p.bannerT = 0, p.toastT = 0), !0) : !1; }, clearHUD() { return p.bannerT = 0, p.toastT = 0, p.offer = null, !0; }, setShield(s?: any) { return p.shield = Math.max(0, +s || 0), p.shield; }, clearTrails() { for (let s of Yt)
        s.trailLen = 0, s.trailHead = 0; return !0; }, holdWaves(s?: any) { return p.holdWaves = !!s, s && (p.waveT = 99, p.bannerT = 0, p.toastT = 0), !!p.holdWaves; }, setAttitude(s?: any, r?: any) { let f = Yt[0]; return Number.isFinite(s) && (f.pitch = s), Number.isFinite(r) && (f.roll = r), { pitch: f.pitch, roll: f.roll }; }, setBoostFuel: s => { p.boostFuel = Vt(s, 0, Q.boostMax || 1); }, exportRun: OM, importRun: LM, quitRun: UM, pointers: () => Di.slice(), damage: _1, addXP: o0, setAlt(s?: any) { let r = Yt[0], f = Number(s); Number.isFinite(f) && (r.z = f, zn = f); }, wingtipSamples() { let s = [], r = [Yt[0], ...xa.filter((f?: any) => !f.dead)]; for (let f of r) {
        let u = Ss(f), g = Fe() * (f.scale || 1), i = [], y = [];
        for (let A = 0; A < 2; A++) {
            let E = (A === 0 ? -p1 : p1) * g, D = (ha - EA) * g, O = (zA - uc) * g;
            if (i.push({ x: f.x + E * u.rx + D * u.fx + O * u.ux, y: f.y + E * u.ry + D * u.fy + O * u.uy, z: f.z + E * u.rz + D * u.fz + O * u.uz }), f.trailLen > 0) {
                let C = (f.trailHead - 1 + Si) % Si * 4;
                y.push({ x: f.trail[A][C], y: f.trail[A][C + 1], z: f.trail[A][C + 2] });
            }
        }
        s.push({ who: f === Yt[0] ? "player" : "drone", scale: f.scale || 1, yaw: f.yaw, roll: f.roll, pitch: f.pitch, x: f.x, y: f.y, z: f.z, tips: i, last: y });
    } return s; }, getInvertY: () => !!Pl, adjustZoom(s?: any) { if (Gn === 2 || typeof ke == "number" && ke > .7)
        return { chaseZoom: an, overheadZoom: $n }; if (Gn === 1 || typeof Ne == "number" && Ne > .4) {
        let u = s > 0 ? .9 : 1.12;
        an = Math.max(.7, Math.min(2.5, an * u));
    }
    else {
        let u = s > 0 ? .94 : 1.06;
        $n = Math.max(.85, Math.min(1.45, $n * u));
    } try {
        localStorage.setItem("fighter-guns-zoom", JSON.stringify({ chase: an, overhead: $n }));
    }
    catch { } return { chaseZoom: an, overheadZoom: $n }; }, setChaseZoom(s?: any) { return an = Math.max(.7, Math.min(2.5, +s || 1)), an; }, getChaseZoom: () => an, viewMetrics() { Lr(); let s = Yt[0], r = 0; return s && Se(s.x, s.y, s.z) && (r = ua), { chaseZoom: an, overheadZoom: $n, vS: _l, vQ: Cn, jetM: r, vC: Ne, vK: ke }; }, getOverheadZoom: () => $n, getAchievements: () => tl, reloadAchievements() { tl = Jl(), E1(); try {
        $();
    }
    catch { } return tl; }, structurePlan: gm, pickupRadius: nm, gateColors: No, clearToast() { p.achieveToast = null, p.achieveToastT = 0, p.toast = null, p.toastT = 0, p.bannerT = 0; }, nearestEnemyOnScreen() { let s = Yt[0], r = null, f = 1e9; for (let i of ce) {
        if (i.dying >= 0)
            continue;
        let y = Math.hypot(i.x - s.x, i.y - s.y);
        y < f && (f = y, r = i);
    } if (!r)
        return null; let u = Fn(Math.atan2(r.x - s.x, -(r.y - s.y)) - s.yaw), g = r.z - s.z; return ke > 0 || !Se(r.x, r.y, r.z) ? [null, null, f, u, g] : [It, Gt, f, u, g]; } }; }

