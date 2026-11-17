import React, { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_ENGINE_PARAMS,
  DESKTOP_VIEW_HINTS,
  ENGINE_PARAM_KEYS,
  HUD_BAR_SEGMENTS,
  normalizeViewMode,
  TOUCH_VIEW_HINTS,
} from '../config/defaults';
import { loadAchievements, saveAchievements } from '../data/achievements';
import {
  assignKeybind,
  findActionForKey,
  loadKeybinds,
  MOVEMENT_KEY_MAP,
  resetKeybinds,
  saveKeybinds,
} from '../data/keybinds';
import {
  loadBestRun,
  loadSaveSlots,
  saveBestRun,
  saveSaveSlots,
} from '../data/saveSlots';
import {
  awardRunSkillPoints,
  getAvailableSkillPoints,
  loadSkillTree,
  respecSkillTree,
  saveSkillTree,
  SKILL_TABS,
  upgradeSkillNode,
} from '../data/skillTree';
import { ROMAN_NUMERALS } from '../data/upgrades';
import { getGateColors, rgbToCss, SPECIAL_WEAPONS } from '../data/weapons';
import { createGameEngine } from '../engine/createGameEngine';
import { createThrusterRenderer } from '../rendering/thrusterShader';
import {
  AchievementState,
  GameEngineAPI,
  GameParams,
  KeybindMap,
  MobileControlMode,
  SaveSlotData,
  SkillTreeState,
  ThrusterRenderer,
  TouchControlsMode,
  UpgradeOfferState,
  ViewMode,
} from '../types/game';
import { AchievementsModal } from './AchievementsModal';
import { HudOverlay } from './HudOverlay';
import { LevelUpModal } from './LevelUpModal';
import { PauseModal } from './PauseModal';
import { SkillTreeModal } from './SkillTreeModal';
import { TouchControls } from './TouchControls';

const INVERT_Y_STORAGE_KEY = 'fighter-guns-invert-y';
const MUTE_STORAGE_KEY = 'fighter-guns-mute';
const QUICKTIP_STORAGE_KEY = 'fighter-guns-quicktip';
const MOBILE_CONTROL_STORAGE_KEY = 'fighter-guns-mobile-control';
const TOUCH_HUD_STORAGE_KEY = 'fighter-guns-touch-hud';

export const FighterGame: React.FC<Partial<GameParams>> = ({
  pixelSize = 0,
  showHint = true,
  touchControls = 'auto',
  ...restProps
}) => {
  const [webglLost, setWebglLost] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  const [touchHudMode, setTouchHudMode] = useState<TouchControlsMode>(() => {
    if (touchControls === 'on' || touchControls === 'off') return touchControls;
    try {
      const saved = localStorage.getItem(TOUCH_HUD_STORAGE_KEY);
      if (saved === 'on' || saved === 'off' || saved === 'auto') return saved;
    } catch {
      // ignore
    }
    return touchControls;
  });

  const [mobileControlMode, setMobileControlMode] = useState<MobileControlMode>(() => {
    try {
      const saved = localStorage.getItem(MOBILE_CONTROL_STORAGE_KEY);
      if (saved === 'joystick' || saved === 'touch') return saved;
    } catch {
      // ignore
    }
    return 'touch';
  });
  const mobileControlModeRef = useRef<MobileControlMode>(mobileControlMode);
  mobileControlModeRef.current = mobileControlMode;

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      setCoarsePointer(true);
    }
  }, []);

  const isTouch = touchHudMode === 'on' || (touchHudMode === 'auto' && coarsePointer);
  const [touchThrust, setTouchThrust] = useState(false);
  const [touchBurn, setTouchBurn] = useState(false);
  const [touchFire, setTouchFire] = useState(false);

  const activeKeysRef = useRef<Set<string>>(new Set());
  const syncKeysRef = useRef<() => void>(() => {});
  const touchTrackRef = useRef<{
    id: number;
    t: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const hudRefs = useRef<Record<string, HTMLElement | null>>({});

  const [levelOffer, setLevelOffer] = useState<UpgradeOfferState | null>(null);
  const [skillTree, setSkillTree] = useState<SkillTreeState>(() => loadSkillTree());
  const [treeOpen, setTreeOpen] = useState(false);
  const treeOpenRef = useRef(false);
  treeOpenRef.current = treeOpen;

  const [summaryMode, setSummaryMode] = useState('');
  const summaryModeRef = useRef('');
  const [confirmRespec, setConfirmRespec] = useState(false);
  const [lastAward, setLastAward] = useState<{ pts: number } | null>(null);
  const [activeTreeTab, setActiveTreeTab] = useState('core');
  const activeTreeTabRef = useRef('core');
  activeTreeTabRef.current = activeTreeTab;

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const [invertY, setInvertYState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(INVERT_Y_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const invertYRef = useRef(invertY);
  invertYRef.current = invertY;

  const [muted, setMutedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const [showQuickTip, setShowQuickTip] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(QUICKTIP_STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const quickTipTimerRef = useRef<number>(0);
  const quickTipDismissedRef = useRef(false);

  const [pauseSubView, setPauseSubView] = useState('main');
  const [keybinds, setKeybinds] = useState<KeybindMap>(() => loadKeybinds());
  const keybindsRef = useRef(keybinds);
  keybindsRef.current = keybinds;

  const [rebindingSlot, setRebindingSlot] = useState<{ action: string; slot: number } | null>(null);
  const rebindingSlotRef = useRef<{ action: string; slot: number } | null>(null);
  rebindingSlotRef.current = rebindingSlot;

  const autoPauseRef = useRef(typeof navigator !== 'undefined' && !navigator.webdriver);
  const [saveSlots, setSaveSlots] = useState<Array<SaveSlotData | null>>(() => loadSaveSlots());
  const [confirmAction, setConfirmAction] = useState('');
  const [importText, setImportText] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const achievementsOpenRef = useRef(false);
  achievementsOpenRef.current = achievementsOpen;
  const [achievements, setAchievements] = useState<AchievementState>(() => loadAchievements());

  const selectTabCallbackRef = useRef<(tabId: string) => void>(() => {});
  selectTabCallbackRef.current = setActiveTreeTab;
  const openTreeCallbackRef = useRef<(force?: boolean) => void>(() => {});
  const closeTreeCallbackRef = useRef<() => void>(() => {});

  const resolvedParams: GameParams = { ...DEFAULT_ENGINE_PARAMS };
  for (const key of ENGINE_PARAM_KEYS) {
    const val = (restProps as any)[key];
    if (val != null) {
      (resolvedParams as any)[key] = val;
    }
  }
  if (webglLost) {
    resolvedParams.flameStyle = 'pixel';
  }

  const paramsSerialized = JSON.stringify(resolvedParams);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngineAPI | null>(null);
  const latestParamsRef = useRef(resolvedParams);
  const pixelSizeRef = useRef(pixelSize);
  const currentPixelScaleRef = useRef(4);
  const resizeCallbackRef = useRef<() => void>(() => {});

  const [viewBanner, setViewBanner] = useState<{ mode: ViewMode; on: boolean }>({
    mode: normalizeViewMode(resolvedParams.view),
    on: true,
  });
  const viewBannerTimerRef = useRef<number>(0);

  const showViewHintBanner = (mode: ViewMode, durationSec: number) => {
    setViewBanner({ mode, on: true });
    window.clearTimeout(viewBannerTimerRef.current);
    viewBannerTimerRef.current = window.setTimeout(() => {
      setViewBanner((prev) => ({ ...prev, on: false }));
    }, durationSec * 1000);
  };
  const showViewHintBannerRef = useRef(showViewHintBanner);
  showViewHintBannerRef.current = showViewHintBanner;

  latestParamsRef.current = resolvedParams;
  pixelSizeRef.current = pixelSize;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const engine = createGameEngine(latestParamsRef.current);
    engineRef.current = engine;

    let imageData: ImageData | null = null;
    const glCanvas = webglCanvasRef.current;
    let thrusterRenderer: ThrusterRenderer | null = null;
    let glFailed = false;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      thrusterRenderer = null;
      glFailed = true;
      setWebglLost(true);
    };
    glCanvas?.addEventListener('webglcontextlost', handleContextLost);

    const handleResize = () => {
      const clientW = container.clientWidth;
      const clientH = container.clientHeight;
      if (!clientW || !clientH) return;
      const autoScale = Math.min(12, Math.max(2, Math.round(Math.sqrt((clientW * clientH) / 1e5))));
      const pxScale =
        pixelSizeRef.current > 0 ? Math.round(pixelSizeRef.current) : autoScale;
      const bufW = Math.ceil(clientW / pxScale);
      const bufH = Math.ceil(clientH / pxScale);

      if (canvas.width !== bufW || canvas.height !== bufH) {
        canvas.width = bufW;
        canvas.height = bufH;
        engine.resize(bufW, bufH);
        imageData = null;
      }
      canvas.style.width = `${bufW * pxScale}px`;
      canvas.style.height = `${bufH * pxScale}px`;
      canvas.style.left = `${Math.round((clientW - bufW * pxScale) / 2)}px`;
      canvas.style.top = `${Math.round((clientH - bufH * pxScale) / 2)}px`;

      if (glCanvas) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const glW = Math.round(bufW * pxScale * dpr);
        const glH = Math.round(bufH * pxScale * dpr);
        if (glCanvas.width !== glW || glCanvas.height !== glH) {
          glCanvas.width = glW;
          glCanvas.height = glH;
        }
        glCanvas.style.width = canvas.style.width;
        glCanvas.style.height = canvas.style.height;
        glCanvas.style.left = canvas.style.left;
        glCanvas.style.top = canvas.style.top;
      }
      currentPixelScaleRef.current = pxScale;
    };

    resizeCallbackRef.current = handleResize;
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let rafId = 0;
    let lastTime = performance.now();
    const domCache: Record<string, any> = {};

    const updateText = (el: HTMLElement | null | undefined, key: string, text: string) => {
      if (el && domCache[key] !== text) {
        domCache[key] = text;
        el.textContent = text;
      }
    };

    const updateStyle = (
      el: HTMLElement | null | undefined,
      key: string,
      prop: string,
      value: string
    ) => {
      if (el && domCache[key] !== value) {
        domCache[key] = value;
        (el.style as any)[prop] = value;
      }
    };

    const syncHud = (combat: Record<string, any>, nowMs: number) => {
      const refs = hudRefs.current;
      if (!refs) return;

      const hpFilled = Math.ceil((combat.hp / combat.hpMax) * HUD_BAR_SEGMENTS);
      updateText(
        refs.hp,
        'hp',
        '\u25AE'.repeat(hpFilled) + '\u25AF'.repeat(HUD_BAR_SEGMENTS - hpFilled)
      );
      updateStyle(
        refs.hp,
        'hpc',
        'color',
        combat.hp <= combat.hpMax * 0.3
          ? ((nowMs / 250) | 0) % 2
            ? '#ff5a3c'
            : '#ffb0a0'
          : 'inherit'
      );

      const heatFilled = Math.round(combat.heat * HUD_BAR_SEGMENTS);
      updateText(
        refs.heat,
        'heat',
        combat.overheated
          ? ((nowMs / 200) | 0) % 2
            ? 'OVERHEAT'
            : ''
          : '\u25AE'.repeat(heatFilled) + '\u25AF'.repeat(HUD_BAR_SEGMENTS - heatFilled)
      );
      updateStyle(
        refs.heat,
        'heatc',
        'color',
        combat.overheated || combat.heat > 0.75 ? '#ff8a3c' : 'inherit'
      );

      updateText(
        refs.msl,
        'msl',
        '\u25C6'.repeat(combat.ammo) +
          '\u25C7'.repeat(combat.ammoMax - combat.ammo) +
          (combat.lock ? '  LOCK' : '')
      );
      updateStyle(refs.msl, 'mslc', 'color', combat.lock && combat.ammo > 0 ? '#ffe060' : 'inherit');

      updateStyle(refs.drnWrap, 'drnvis', 'display', combat.drones > 0 ? 'block' : 'none');
      updateText(
        refs.drn,
        'drn',
        '\u25C6'.repeat(combat.dronesAlive) +
          '\u25C7'.repeat(Math.max(0, (combat.drones || 0) - (combat.dronesAlive || 0)))
      );

      updateStyle(refs.flrWrap, 'flrvis', 'display', combat.flareMax > 0 ? 'block' : 'none');
      updateText(
        refs.flr,
        'flr',
        '\u25C6'.repeat(combat.flare) + '\u25C7'.repeat(Math.max(0, combat.flareMax - combat.flare))
      );

      updateStyle(refs.empWrap, 'empvis', 'display', combat.empMax > 0 ? 'block' : 'none');
      updateText(
        refs.emp,
        'emp',
        '\u25C6'.repeat(combat.emp) + '\u25C7'.repeat(Math.max(0, combat.empMax - combat.emp))
      );

      const formatSpecialLabel = (
        id: string,
        lv: number,
        timeLeft: number,
        suffix?: string
      ) => {
        const def = SPECIAL_WEAPONS[id];
        const isPersistent = !def || def.kind !== 'shield' || (timeLeft != null && timeLeft > 200);
        return (
          ((def && def.name) || id) +
          ' L' +
          lv +
          (isPersistent ? '' : ' ' + Math.ceil(timeLeft) + 's') +
          (suffix || '')
        );
      };

      const resolveSpecialColor = (id: string | null, fallback: string) => {
        try {
          return id ? getGateColors(id).cssVariant : fallback;
        } catch {
          return fallback;
        }
      };

      updateStyle(refs.spGunWrap, 'gvis', 'display', combat.specGun ? 'block' : 'none');
      updateText(
        refs.spGun,
        'spg',
        combat.specGun
          ? formatSpecialLabel(
              combat.specGun,
              combat.specGunLv,
              combat.specGunT,
              (combat.specGun === 'plasma' || combat.specGun === 'spirit') &&
                combat.plasmaCh > 0.05
                ? '  CHG ' + Math.round(combat.plasmaCh * 100) + '%'
                : ''
            )
          : ''
      );
      updateStyle(refs.spGun, 'spgc', 'color', resolveSpecialColor(combat.specGun, '#ff9a60'));

      updateStyle(refs.spMslWrap, 'mvis', 'display', combat.specMsl ? 'block' : 'none');
      updateText(
        refs.spMsl,
        'spm',
        combat.specMsl ? formatSpecialLabel(combat.specMsl, combat.specMslLv, combat.specMslT) : ''
      );
      updateStyle(refs.spMsl, 'spmc', 'color', resolveSpecialColor(combat.specMsl, '#50c8ff'));

      updateStyle(refs.spShdWrap, 'svis', 'display', combat.specShield ? 'block' : 'none');
      updateText(
        refs.spShd,
        'sps',
        combat.specShield
          ? formatSpecialLabel(combat.specShield, combat.specShieldLv, combat.specShieldT)
          : ''
      );
      updateStyle(refs.spShd, 'spsc', 'color', resolveSpecialColor(combat.specShield, '#c878ff'));

      updateStyle(refs.spCraftWrap, 'cvis', 'display', combat.specCraft ? 'block' : 'none');
      updateText(
        refs.spCraft,
        'spc',
        combat.specCraft
          ? formatSpecialLabel(combat.specCraft, combat.specCraftLv, combat.specCraftT)
          : ''
      );
      if (refs.spCraft) {
        updateStyle(refs.spCraft, 'spcc', 'color', resolveSpecialColor(combat.specCraft, '#ffd24a'));
      }

      updateText(refs.score, 'score', String(combat.score).padStart(6, '0'));
      const xpFilled = Math.min(
        HUD_BAR_SEGMENTS,
        Math.floor((combat.xp / combat.xpNeed) * HUD_BAR_SEGMENTS)
      );
      updateText(refs.lvl, 'lvl', String(combat.level));
      updateText(
        refs.xp,
        'xp',
        '\u25AE'.repeat(xpFilled) + '\u25AF'.repeat(HUD_BAR_SEGMENTS - xpFilled)
      );

      updateText(refs.toast, 'toast', combat.toast);
      updateStyle(
        refs.toast,
        'toasto',
        'opacity',
        combat.toast && !combat.offer ? String(Math.min(1, combat.toastT / 0.5)) : '0'
      );
      updateStyle(
        refs.toast,
        'toastc',
        'color',
        combat.toastRgb ? rgbToCss(combat.toastRgb) : '#ffe060'
      );

      if (refs.achToast) {
        const achTitle = combat.achieveToast;
        const achLabel = achTitle
          ? achTitle + (combat.achieveBonus ? '  \xB7  ' + combat.achieveBonus : '')
          : '';
        updateText(refs.achToast, 'acht', achLabel);
        updateStyle(
          refs.achToast,
          'achto',
          'opacity',
          achTitle ? String(Math.min(1, (combat.achieveToastT || 0) / 0.4)) : '0'
        );
      }

      updateStyle(refs.boss, 'bosso', 'opacity', combat.boss ? '1' : '0');
      if (combat.boss) {
        const bossSegs = Math.ceil(combat.boss.frac * 16);
        updateText(
          refs.bossBar,
          'bossbar',
          combat.boss.name + ' ' + '\u25AE'.repeat(bossSegs) + '\u25AF'.repeat(16 - bossSegs)
        );
      }

      const offerSig = combat.offer
        ? combat.level + ':' + combat.offer.map((o: any) => o.id + o.rank).join(',')
        : '';
      if (offerSig !== domCache.offerSig) {
        domCache.offerSig = offerSig;
        setLevelOffer(combat.offer ? { level: combat.level, items: combat.offer } : null);
      }

      const remainingLabel =
        combat.leftLabel && combat.leftLabel.length
          ? combat.leftLabel.join(' \xB7 ')
          : combat.waveLive || combat.enemies > 0
            ? '0 left'
            : 'cleared';
      updateText(
        refs.wave,
        'wave',
        combat.started
          ? combat.wave > 0
            ? `Wave ${combat.wave} · ${remainingLabel}`
            : 'Get ready'
          : 'Steer or fire to start'
      );

      updateText(refs.banner, 'banner', combat.banner);
      updateStyle(
        refs.banner,
        'bannero',
        'opacity',
        combat.banner && !combat.offer ? String(Math.min(1, combat.bannerT / 0.6)) : '0'
      );

      updateText(refs.waveHelp, 'wh', combat.waveHelp || '');
      updateStyle(
        refs.waveHelp,
        'who',
        'opacity',
        combat.waveHelp && !combat.offer && !combat.dead
          ? String(Math.min(1, (combat.waveHelpT || 0) / 0.5))
          : '0'
      );

      if (
        showQuickTip &&
        !quickTipDismissedRef.current &&
        ((skillTree && skillTree.runs > 0) || (combat.started && !quickTipTimerRef.current))
      ) {
        if (skillTree && skillTree.runs > 0) {
          quickTipDismissedRef.current = true;
          setShowQuickTip(false);
        } else if (combat.started && !quickTipTimerRef.current) {
          quickTipTimerRef.current = window.setTimeout(() => {
            if (!quickTipDismissedRef.current) {
              quickTipDismissedRef.current = true;
              setShowQuickTip(false);
              try {
                localStorage.setItem(QUICKTIP_STORAGE_KEY, '1');
              } catch {
                // ignore
              }
            }
          }, 9000);
        }
      }

      if (
        showQuickTip &&
        !quickTipDismissedRef.current &&
        (combat.dead || (combat.kills || 0) > 0 || (combat.gates || 0) > 0)
      ) {
        quickTipDismissedRef.current = true;
        if (quickTipTimerRef.current) window.clearTimeout(quickTipTimerRef.current);
        setShowQuickTip(false);
        try {
          localStorage.setItem(QUICKTIP_STORAGE_KEY, '1');
        } catch {
          // ignore
        }
      }

      updateStyle(
        refs.pull,
        'pullo',
        'opacity',
        combat.pullUp && ((nowMs / 180) | 0) % 2 ? '1' : '0'
      );
      updateStyle(
        refs.flash,
        'flasho',
        'opacity',
        String(Math.max(0, 0.5 - combat.hitT * 2.2))
      );

      const boostMax = Math.max(0.001, combat.boostMax || 1);
      const boostFilled = Math.round(
        (Math.max(0, combat.boostFuel || 0) / boostMax) * HUD_BAR_SEGMENTS
      );
      updateText(
        refs.bst,
        'bst',
        '\u25AE'.repeat(boostFilled) +
          '\u25AF'.repeat(HUD_BAR_SEGMENTS - boostFilled) +
          (combat.boostBurn ? '  BURN' : '')
      );
      updateStyle(
        refs.bst,
        'bstc',
        'color',
        combat.boostBurn
          ? '#ffe060'
          : (combat.boostFuel || 0) < boostMax * 0.25
            ? '#ff8a3c'
            : '#ffb44a'
      );

      updateStyle(refs.focus, 'focuso', 'opacity', document.hasFocus() || isTouch ? '0' : '1');
      updateStyle(refs.over, 'overo', 'opacity', combat.dead && combat.deadT > 1 ? '1' : '0');

      if (combat.dead) {
        updateText(refs.overTitle, 'ot', combat.cause === 'crashed' ? 'Crashed' : 'Shot down');
        updateText(
          refs.overScore,
          'os',
          `Score ${combat.score} · Level ${combat.level} · Wave ${combat.wave}`
        );
        updateText(
          refs.overRecap,
          'or',
          `${combat.cleared || 0} wave${(combat.cleared || 0) === 1 ? '' : 's'} cleared · ${
            combat.kills
          } kills · ${combat.aces || 0} ace${(combat.aces || 0) === 1 ? '' : 's'} · ${
            combat.gates || 0
          } gate${(combat.gates || 0) === 1 ? '' : 's'}${
            (combat.streak || 0) >= 2 ? ' · streak ×' + combat.streak : ''
          }`
        );
        updateText(
          refs.overUps,
          'ou',
          combat.taken.length
            ? 'Upgrades: ' +
                combat.taken.map((u: any) => `${u.name} ${ROMAN_NUMERALS[u.rank]}`).join(' · ')
            : 'No upgrades taken'
        );

        if (!domCache.saved) {
          domCache.saved = true;
          const prevBest = loadBestRun();
          const isNewBest = combat.score > (prevBest.score || 0);
          const nextBest = {
            score: Math.max(prevBest.score || 0, combat.score),
            level: Math.max(prevBest.level || 1, combat.level),
            wave: Math.max(prevBest.wave || 0, combat.wave),
          };
          saveBestRun(nextBest);
          updateText(
            refs.overBest,
            'ob',
            (isNewBest && combat.score > 0 ? 'New best! · ' : '') +
              `Best: score ${nextBest.score} · level ${nextBest.level} · wave ${nextBest.wave}`
          );
        }

        if (!domCache.awarded) {
          domCache.awarded = true;
          const { tree: updatedTree, pts } = awardRunSkillPoints(loadSkillTree(), {
            cleared: combat.cleared,
            level: combat.level,
            aces: combat.aces,
            gates: combat.gates || 0,
          });
          setSkillTree(updatedTree);
          setLastAward({ pts });
          updateText(
            refs.overPts,
            'opts',
            `+${pts} skill point${pts === 1 ? '' : 's'} · ${getAvailableSkillPoints(
              updatedTree
            )} to spend`
          );
        }
      } else {
        domCache.saved = false;
        domCache.awarded = false;
      }

      const nextSummaryMode = combat.dead && combat.deadT > 1 ? 'summary' : '';
      if (nextSummaryMode !== summaryModeRef.current) {
        summaryModeRef.current = nextSummaryMode;
        setSummaryMode(nextSummaryMode);
      }

      const shakePx = combat.shake * 4;
      const shakeTransform =
        shakePx > 0.3
          ? `translate(${Math.round((Math.random() - 0.5) * shakePx)}px,${Math.round(
              (Math.random() - 0.5) * shakePx
            )}px)`
          : '';
      updateStyle(canvas, 'shake', 'transform', shakeTransform);
      updateStyle(glCanvas, 'shakef', 'transform', shakeTransform);
    };

    const tick = (nowMs: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0, (nowMs - lastTime) / 1000));
      lastTime = nowMs;
      if (!engine.width) return;

      if (!treeOpenRef.current && !pausedRef.current) {
        engine.step(dt);
      }
      const pixels = engine.render();
      if (!imageData) {
        imageData = new ImageData(pixels as any, engine.width, engine.height);
      }
      ctx2d.putImageData(imageData, 0, 0);

      const flames = engine.flames;
      if (glCanvas && flames.count > 0 && !thrusterRenderer && !glFailed) {
        thrusterRenderer = createThrusterRenderer(glCanvas);
        if (!thrusterRenderer) {
          glFailed = true;
          setWebglLost(true);
        }
      }
      if (glCanvas && thrusterRenderer) {
        thrusterRenderer.draw(
          flames.count,
          flames.data,
          glCanvas.width / engine.width,
          nowMs / 1000
        );
      }

      syncHud(engine.combat, nowMs);
    };

    rafId = requestAnimationFrame(tick);

    const heldKeys = activeKeysRef.current;
    heldKeys.clear();

    const applyHeldKeys = () => {
      let dx = 0;
      let dy = 0;
      let thrust = false;
      let burn = false;
      const binds = keybindsRef.current;
      heldKeys.forEach((code) => {
        const dir = MOVEMENT_KEY_MAP[code];
        if (dir === 'left') dx -= 1;
        else if (dir === 'right') dx += 1;
        else if (dir === 'up') dy += 1;
        else if (dir === 'down') dy -= 1;
        if (code === 'TouchBoost' || findActionForKey(binds, code) === 'thrust') thrust = true;
        if (code === 'TouchBurn' || findActionForKey(binds, code) === 'boost') burn = true;
      });
      engine.setKeys(dx, dy, thrust, burn);
    };
    syncKeysRef.current = applyHeldKeys;

    const isInteractiveElement = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      return (
        !!target &&
        target !== container &&
        (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName) || target.isContentEditable)
      );
    };

    const isViewKey = (e: KeyboardEvent, binds: KeybindMap) =>
      !!(
        findActionForKey(binds, e.code) === 'view' ||
        ((binds.view || []).includes('Space') &&
          (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar' || e.keyCode === 32))
      );

    const handleKeyDown = (e: KeyboardEvent) => {
      const binds = keybindsRef.current;
      if (rebindingSlotRef.current) {
        e.preventDefault();
        if (e.code === 'Escape') {
          setRebindingSlot(null);
          return;
        }
        if (e.repeat) return;
        const { action, slot } = rebindingSlotRef.current;
        const nextBinds = assignKeybind(binds, action, e.code, slot);
        setKeybinds(nextBinds);
        keybindsRef.current = nextBinds;
        setRebindingSlot(null);
        return;
      }

      if (achievementsOpenRef.current) {
        if (findActionForKey(binds, e.code) === 'pause' || e.code === 'Escape') {
          setAchievementsOpen(false);
          e.preventDefault();
        }
        if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
        return;
      }

      if (treeOpenRef.current) {
        if (
          findActionForKey(binds, e.code) === 'pause' ||
          findActionForKey(binds, e.code) === 'tree' ||
          e.code === 'Escape' ||
          e.code === 'KeyT'
        ) {
          closeTreeCallbackRef.current();
        }
        const tabMatch = /^(Digit|Numpad)([1-6])$/.exec(e.code);
        if (tabMatch) {
          const tab = SKILL_TABS[Number(tabMatch[2]) - 1];
          if (tab) {
            selectTabCallbackRef.current(tab.id);
            e.preventDefault();
          }
        }
        if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
        return;
      }

      if (isInteractiveElement(e)) return;

      if (findActionForKey(binds, e.code) === 'pause') {
        e.preventDefault();
        if (!e.repeat && (window as any).__togglePause) {
          (window as any).__togglePause();
        }
        return;
      }

      if (pausedRef.current) {
        if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
        return;
      }

      if (isViewKey(e, binds) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (e.repeat) return;
        engine.toggleView();
        showViewHintBannerRef.current(engine.view, 7);
        return;
      }

      const action = findActionForKey(binds, e.code);
      if (action === 'fire' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!e.repeat) engine.setFire(true);
        return;
      }
      if (action === 'missile' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!e.repeat) engine.fireMissile();
        return;
      }
      if (action === 'flare' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!e.repeat) engine.fireFlare();
        return;
      }
      if (action === 'emp' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!e.repeat) engine.fireEmp();
        return;
      }
      if ((action === 'zoomIn' || action === 'zoomOut') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (!e.repeat) engine.adjustZoom(action === 'zoomIn' ? 1 : -1);
        return;
      }

      const cardMatch = /^(Digit|Numpad)([123])$/.exec(e.code);
      if (cardMatch && engine.combat.offer) {
        engine.chooseUpgrade(Number(cardMatch[2]) - 1);
        return;
      }

      if (action === 'restart' && engine.combat.dead && engine.combat.deadT > 1) {
        engine.restart();
        return;
      }

      if (
        (MOVEMENT_KEY_MAP[e.code] || action === 'thrust' || action === 'boost') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        if (e.code.startsWith('Arrow') || action === 'boost' || action === 'thrust') {
          e.preventDefault();
        }
        heldKeys.add(e.code);
        applyHeldKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (findActionForKey(keybindsRef.current, e.code) === 'fire' || e.code === 'KeyF') {
        engine.setFire(false);
      }
      if (heldKeys.delete(e.code)) {
        applyHeldKeys();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (treeOpenRef.current || pausedRef.current) return;
      if (e.button === 2) {
        engine.setFire(true);
        e.preventDefault();
      } else if (e.button === 1) {
        engine.fireMissile();
        e.preventDefault();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) engine.setFire(false);
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('contextmenu', handleContextMenu);

    // Attach global debug & automation hooks
    const win = window as any;
    win.__game = () => engine.combat;
    win.__treeStats = () => engine.treeStats();
    win.__grantSpecial = (id: string) => engine.grantSpecial(id);
    win.__spawnGateAt = (id: string, x: number, y: number) => engine.spawnGateAt(id, x, y);
    win.__revealGates = () => engine.revealGates();
    win.__clearGates = () => engine.clearGates();
    win.__gateList = () => engine.gateList();
    win.__spawnGates = (count?: number, immediate?: boolean) => engine.spawnGates(count, immediate);
    win.__weaponSheet = (w?: number, h?: number) => engine.weaponSheet(w, h);
    win.__weaponSheetPNG = (w?: number, h?: number) => {
      const sheet = engine.weaponSheet(w, h);
      const offCanvas = document.createElement('canvas');
      offCanvas.width = sheet.width;
      offCanvas.height = sheet.height;
      offCanvas
        .getContext('2d')!
        .putImageData(new ImageData(sheet.data as any, sheet.width, sheet.height), 0, 0);
      return offCanvas.toDataURL('image/png');
    };
    win.__previewShot = (type: string, x: number, y: number, z: number, opts?: any) =>
      engine.previewShot(type, x, y, z, opts);
    win.__clearShots = () => engine.clearShots();
    win.__demoChain = () => engine.demoChain();
    win.__spawnEnemyAt = (type: string, x: number, y: number, z?: number) =>
      engine.spawnEnemyAt(type, x, y, z);
    win.__clearEnemies = () => engine.clearEnemies();
    win.__debugEnemy = (type?: string, patch?: any) => engine.debugEnemy(type, patch);
    win.__forceDie = (type?: string, silent?: boolean) => engine.forceDie(type, silent);
    win.__clearHUD = () => engine.clearHUD();
    win.__setShield = (sec: number) => engine.setShield(sec);
    win.__setAttitude = (pitch?: number, roll?: number) => engine.setAttitude(pitch, roll);
    win.__holdWaves = (hold: boolean) => engine.holdWaves(hold);
    win.__clearTrails = () => engine.clearTrails();
    win.__setBoostFuel = (fuel: number) => engine.setBoostFuel(fuel);
    win.__setBurn = (burn: boolean) => engine.setBurn(burn);
    win.__pointers = () => engine.pointers();
    win.__openTree = () => openTreeCallbackRef.current(true);
    win.__closeTree = () => closeTreeCallbackRef.current();
    win.__damage = (amt: number, cause?: string) => engine.damage(amt, cause || 'crashed');
    win.__addXP = (xp: number) => engine.addXP(xp);
    win.__setAlt = (alt: number) => engine.setAlt(alt);
    win.__setInvertY = (inv: boolean) => updateInvertY(inv);
    win.__invertY = () => invertYRef.current;

    engine.setInvertY(invertYRef.current);
    engine.setMuted(mutedRef.current);

    win.__exportRun = () => ({
      v: 9,
      savedAt: Date.now(),
      tree: loadSkillTree(),
      achieve: engine.getAchievements ? engine.getAchievements() : loadAchievements(),
      run: engine.exportRun(),
    });
    win.__adjustZoom = (dir: number) => engine.adjustZoom(dir);
    win.__setChaseZoom = (z: number) => engine.setChaseZoom(z);
    win.__viewMetrics = () => engine.viewMetrics();
    win.__getChaseZoom = () => engine.getChaseZoom();
    win.__wingtipSamples = () => engine.wingtipSamples();
    win.__achievements = () =>
      engine.getAchievements ? engine.getAchievements() : loadAchievements();
    win.__structurePlan = (w: number) => engine.structurePlan(w);
    win.__pickupRadius = (gate?: any) => engine.pickupRadius(gate || { r: 22 });
    win.__gateColors = (id: string) => engine.gateColors(id);
    win.__setFire = (on: boolean) => engine.setFire(!!on);
    win.__fireMissile = () => engine.fireMissile();
    win.__clearToast = () => engine.clearToast && engine.clearToast();
    win.__openAchievements = () => {
      setAchievements(engine.getAchievements ? engine.getAchievements() : loadAchievements());
      setAchievementsOpen(true);
    };
    win.__closeAchievements = () => setAchievementsOpen(false);
    win.__importRun = (save: any) => win.__applySave && win.__applySave(save);
    win.__view = () => engine.view;
    win.__aim = () => {
      const res = engine.nearestEnemyOnScreen();
      if (!res) return null;
      const rect = canvas.getBoundingClientRect();
      const onScreen =
        res[0] !== null &&
        res[0] >= 0 &&
        res[1] !== null &&
        res[1] >= 0 &&
        res[0] < engine.width &&
        res[1] < engine.height;
      return {
        x: res[0] === null ? null : rect.left + res[0] * currentPixelScaleRef.current,
        y: res[1] === null ? null : rect.top + res[1]! * currentPixelScaleRef.current,
        dist: res[2],
        bearing: res[3],
        dz: res[4],
        onScreen,
        view: engine.view,
      };
    };

    const handleBlur = () => {
      engine.setFire(false);
      heldKeys.clear();
      applyHeldKeys();
      setTouchThrust(false);
      setTouchBurn(false);
      if (autoPauseRef.current && !treeOpenRef.current && !pausedRef.current) {
        const combat = engine.combat;
        if (combat && combat.started && !combat.dead && win.__togglePause) {
          win.__togglePause(true);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleBlur();
    };

    const handleWheel = (e: WheelEvent) => {
      if (
        pausedRef.current ||
        treeOpenRef.current ||
        achievementsOpenRef.current ||
        !engine ||
        engine.view === 'cockpit'
      ) {
        return;
      }
      e.preventDefault();
      engine.adjustZoom(e.deltaY < 0 ? 1 : -1);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, true);
    container.focus({ preventScroll: true });
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('contextmenu', handleContextMenu);
      window.clearTimeout(viewBannerTimerRef.current);
      glCanvas?.removeEventListener('webglcontextlost', handleContextLost);
      thrusterRenderer?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setParams(latestParamsRef.current);
  }, [paramsSerialized]);

  useEffect(() => {
    resizeCallbackRef.current();
  }, [pixelSize]);

  const initialViewMountRef = useRef(true);
  useEffect(() => {
    if (initialViewMountRef.current) {
      initialViewMountRef.current = false;
      return;
    }
    showViewHintBannerRef.current(normalizeViewMode(resolvedParams.view), 7);
  }, [resolvedParams.view]);

  const toCanvasCoords = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [
      (e.clientX - rect.left) / currentPixelScaleRef.current,
      (e.clientY - rect.top) / currentPixelScaleRef.current,
    ];
  };

  const isTouchPointer = (e: React.PointerEvent) =>
    touchHudMode !== 'off' && e.pointerType === 'touch';

  const endTouchTrack = (e: React.PointerEvent, allowTapRoll: boolean) => {
    const track = touchTrackRef.current;
    if (!track || track.id !== e.pointerId) return;
    touchTrackRef.current = null;
    const engine = engineRef.current;
    if (engine) {
      if (allowTapRoll && !track.moved && performance.now() - track.t < 260) {
        engine.press();
        engine.release();
      }
      engine.pointerLeave();
    }
  };

  const handleTouchChangeView = () => {
    const engine = engineRef.current;
    if (engine) {
      engine.toggleView();
      engine.pointerLeave();
      engine.setJoystick(0, 0, false);
      showViewHintBanner(engine.view, 7);
      containerRef.current?.focus({ preventScroll: true });
    }
  };

  const handleTouchRollTap = () => {
    const engine = engineRef.current;
    if (engine) {
      engine.press();
      engine.release();
      containerRef.current?.focus({ preventScroll: true });
    }
  };

  const handleJoystickChange = (dx: number, dy: number, active: boolean) => {
    engineRef.current?.setJoystick(dx, dy, active);
  };

  const handleTouchThrustDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    activeKeysRef.current.add('TouchBoost');
    syncKeysRef.current();
    setTouchThrust(true);
  };

  const handleTouchThrustUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    activeKeysRef.current.delete('TouchBoost');
    syncKeysRef.current();
    setTouchThrust(false);
    containerRef.current?.focus({ preventScroll: true });
  };

  const handleTouchBurnDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    activeKeysRef.current.add('TouchBurn');
    syncKeysRef.current();
    setTouchBurn(true);
  };

  const handleTouchBurnUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    activeKeysRef.current.delete('TouchBurn');
    syncKeysRef.current();
    setTouchBurn(false);
    containerRef.current?.focus({ preventScroll: true });
  };

  const handleTouchFireDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const engine = engineRef.current;
    if (engine && engine.combat.dead) {
      if (engine.combat.deadT > 1) engine.restart();
      return;
    }
    engine?.setFire(true);
    setTouchFire(true);
  };

  const handleTouchFireUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    engineRef.current?.setFire(false);
    setTouchFire(false);
  };

  const handleTouchMissileDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    engineRef.current?.fireMissile();
  };

  const handleTouchFlareDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    engineRef.current?.fireFlare();
  };

  const handleTouchEmpDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    engineRef.current?.fireEmp();
  };

  const openSkillTree = (force?: boolean) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!force && !summaryModeRef.current) return;
    engine.setFire(false);
    activeKeysRef.current.clear();
    syncKeysRef.current();
    setSkillTree(loadSkillTree());
    setConfirmRespec(false);
    setTreeOpen(true);
  };

  const closeSkillTree = () => {
    setTreeOpen(false);
    setConfirmRespec(false);
    const engine = engineRef.current;
    if (
      engine &&
      !engine.combat.dead &&
      engine.combat.kills === 0 &&
      (engine.combat.wave || 0) <= 1
    ) {
      engine.restart();
    }
    containerRef.current?.focus({ preventScroll: true });
  };

  openTreeCallbackRef.current = openSkillTree;
  closeTreeCallbackRef.current = closeSkillTree;

  const updateInvertY = (val: boolean) => {
    const next = !!val;
    invertYRef.current = next;
    setInvertYState(next);
    try {
      localStorage.setItem(INVERT_Y_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore
    }
    engineRef.current?.setInvertY(next);
  };

  const updateMuted = (val: boolean) => {
    const next = !!val;
    mutedRef.current = next;
    setMutedState(next);
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore
    }
    engineRef.current?.setMuted(next);
  };

  const toggleMobileControlMode = () => {
    const next: MobileControlMode = mobileControlModeRef.current === 'touch' ? 'joystick' : 'touch';
    mobileControlModeRef.current = next;
    setMobileControlMode(next);
    engineRef.current?.setJoystick(0, 0, false);
    engineRef.current?.pointerLeave();
    try {
      localStorage.setItem(MOBILE_CONTROL_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const cycleTouchHudMode = () => {
    setTouchHudMode((prev) => {
      const next: TouchControlsMode = prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto';
      try {
        localStorage.setItem(TOUCH_HUD_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const togglePause = (explicitState?: boolean) => {
    if (treeOpenRef.current) return;
    const next = typeof explicitState === 'boolean' ? explicitState : !pausedRef.current;
    if (next) {
      engineRef.current?.setFire(false);
      engineRef.current?.setBurn?.(false);
      engineRef.current?.setJoystick(0, 0, false);
      activeKeysRef.current.clear();
      syncKeysRef.current();
      setTouchThrust(false);
      setTouchBurn(false);
      setTouchFire(false);
      setPauseSubView('main');
      setConfirmAction('');
      setRebindingSlot(null);
      setSaveMessage('');
      setSaveSlots(loadSaveSlots());
    }
    pausedRef.current = next;
    setPaused(next);
    containerRef.current?.focus({ preventScroll: true });
  };

  const applySaveObject = (saveObj: any): boolean => {
    if (!saveObj || typeof saveObj !== 'object') {
      setSaveMessage('That file is not a save');
      return false;
    }
    const treeData = saveObj.tree;
    const runData = saveObj.run || (saveObj.G ? saveObj : null);
    if (!runData || typeof runData !== 'object') {
      setSaveMessage('That file has no run');
      return false;
    }
    if (treeData && typeof treeData === 'object') {
      saveSkillTree({
        earned: Math.max(0, Number(treeData.earned) || 0),
        ranks: treeData.ranks || {},
        runs: Math.max(0, treeData.runs | 0),
      });
      setSkillTree(loadSkillTree());
    }
    const achData = saveObj.achieve || (runData && runData.achieve);
    if (achData && typeof achData === 'object') {
      saveAchievements(achData);
      setAchievements(achData);
    }
    const ok = engineRef.current?.importRun(runData);
    if (engineRef.current?.reloadAchievements) {
      engineRef.current.reloadAchievements();
    }
    if (ok) {
      setSaveMessage('Loaded');
      togglePause(true);
      setPauseSubView('saves');
      return true;
    }
    setSaveMessage('Could not load that run');
    return false;
  };

  const handleSaveSlot = (slotIdx: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const combat = engine.combat;
    const payload: SaveSlotData = {
      v: 9,
      savedAt: Date.now(),
      tree: loadSkillTree(),
      achieve: engine.getAchievements ? engine.getAchievements() : loadAchievements(),
      run: engine.exportRun(),
      meta: {
        wave: combat.wave,
        level: combat.level,
        score: combat.score,
        dead: !!combat.dead,
        savedAt: Date.now(),
      },
    };
    const slots = loadSaveSlots();
    slots[slotIdx] = payload;
    setSaveSlots(saveSaveSlots(slots));
    setSaveMessage(`Saved slot ${slotIdx + 1}`);
  };

  const handleLoadSlot = (slotIdx: number) => {
    const slot = loadSaveSlots()[slotIdx];
    if (!slot) {
      setSaveMessage(`Slot ${slotIdx + 1} is empty`);
      return;
    }
    applySaveObject(slot);
  };

  const handleExportJson = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const combat = engine.combat;
    const payload: SaveSlotData = {
      v: 9,
      savedAt: Date.now(),
      tree: loadSkillTree(),
      achieve: engine.getAchievements ? engine.getAchievements() : loadAchievements(),
      run: engine.exportRun(),
      meta: {
        wave: combat.wave,
        level: combat.level,
        score: combat.score,
        dead: !!combat.dead,
        savedAt: Date.now(),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fighter-guns-save.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  };

  const handleImportJsonString = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      applySaveObject(parsed);
    } catch {
      setSaveMessage('That was not valid JSON');
    }
  };

  // Expose pause/binds/save hooks on window
  const win = window as any;
  win.__togglePause = togglePause;
  win.__paused = () => pausedRef.current;
  win.__autoPause = (val: boolean) => {
    autoPauseRef.current = !!val;
  };
  win.__binds = () => keybindsRef.current;
  win.__setBinds = (next: KeybindMap) => {
    const saved = saveKeybinds(next);
    setKeybinds(saved);
    keybindsRef.current = saved;
  };
  win.__applySave = applySaveObject;
  win.__saveSlot = handleSaveSlot;
  win.__loadSlot = handleLoadSlot;

  const handleUpgradeSkillNode = (nodeId: string) => {
    setSkillTree((prev) => upgradeSkillNode(prev, nodeId));
  };

  const handleRespecClick = () => {
    if (!confirmRespec) {
      setConfirmRespec(true);
      return;
    }
    setSkillTree((prev) => respecSkillTree(prev));
    setConfirmRespec(false);
  };

  const modalEventHandlers = {
    onPointerDown: (e: React.SyntheticEvent) => e.stopPropagation(),
    onPointerUp: (e: React.SyntheticEvent) => e.stopPropagation(),
    onPointerMove: (e: React.SyntheticEvent) => e.stopPropagation(),
    onMouseDown: (e: React.SyntheticEvent) => e.stopPropagation(),
    onContextMenu: (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
  };

  const bindHudRef = (key: string) => (el: HTMLElement | null) => {
    hudRefs.current[key] = el;
  };

  const openAchievementsModal = () => {
    const engine = engineRef.current;
    setAchievements(
      engine && engine.getAchievements ? engine.getAchievements() : loadAchievements()
    );
    setAchievementsOpen(true);
  };

  const hintDict = isTouch ? TOUCH_VIEW_HINTS : DESKTOP_VIEW_HINTS;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="relative h-screen min-h-[320px] w-full touch-none select-none overflow-hidden bg-[#2468b4] outline-none"
      style={{
        cursor: 'crosshair',
        height: '100dvh',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onContextMenu={(e) => {
        if (coarsePointer) e.preventDefault();
      }}
      onPointerEnter={() => containerRef.current?.focus({ preventScroll: true })}
      onPointerMove={(e) => {
        if (isTouchPointer(e)) {
          const track = touchTrackRef.current;
          if (!track || track.id !== e.pointerId) return;
          if (Math.hypot(e.clientX - track.x, e.clientY - track.y) > 12) {
            track.moved = true;
          }
          const currentView = engineRef.current?.view || viewBanner.mode;
          if (mobileControlModeRef.current === 'joystick' || currentView !== 'top') {
            return;
          }
        }
        const [cx, cy] = toCanvasCoords(e);
        engineRef.current?.pointerMove(cx, cy);
      }}
      onPointerDown={(e) => {
        const [cx, cy] = toCanvasCoords(e);
        const engine = engineRef.current;
        if (isTouchPointer(e)) {
          if (!coarsePointer) setCoarsePointer(true);
          if (engine && engine.combat.dead) {
            if (engine.combat.deadT > 1) engine.restart();
            return;
          }
          if (touchTrackRef.current) return;
          touchTrackRef.current = {
            id: e.pointerId,
            t: performance.now(),
            x: e.clientX,
            y: e.clientY,
            moved: false,
          };
          const currentView = engine?.view || viewBanner.mode;
          if (mobileControlModeRef.current === 'touch' && currentView === 'top') {
            engine?.pointerMove(cx, cy);
          }
        } else {
          engine?.pointerMove(cx, cy);
          if (engine && engine.combat.dead) {
            if (engine.combat.deadT > 1 && e.button === 0) engine.restart();
          } else if (e.button === 0) {
            engine?.press();
          }
        }
        containerRef.current?.focus({ preventScroll: true });
        if (!viewBannerTimerRef.current) {
          viewBannerTimerRef.current = window.setTimeout(() => {
            setViewBanner((prev) => ({ ...prev, on: false }));
          }, 9000);
        }
      }}
      onPointerUp={(e) => {
        if (isTouchPointer(e)) {
          endTouchTrack(e, true);
        } else if (e.button === 0) {
          engineRef.current?.release();
        }
      }}
      onPointerLeave={(e) => {
        if (isTouchPointer(e)) {
          endTouchTrack(e, false);
        } else {
          engineRef.current?.pointerLeave();
        }
      }}
      onPointerCancel={(e) => {
        if (isTouchPointer(e)) {
          endTouchTrack(e, false);
        } else {
          engineRef.current?.pointerLeave();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="A pixel-art fighter jet, built from stacked slices, flying over islands. Space moves between the overhead view, the view from behind the jet and the cockpit; arrow keys fly it, hold for thrusters, and Shift fires a metered boost. Esc or P pauses."
        role="img"
        className="absolute block"
        style={{ imageRendering: 'pixelated' }}
      />
      <canvas
        ref={webglCanvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute block"
      />

      {isTouch && (
        <TouchControls
          accentColor={resolvedParams.accentColor}
          thrustActive={touchThrust}
          burnActive={touchBurn}
          fireActive={touchFire}
          skillTree={skillTree}
          controlMode={mobileControlMode}
          viewMode={viewBanner.mode}
          onChangeView={handleTouchChangeView}
          onRollTap={handleTouchRollTap}
          onJoystickChange={handleJoystickChange}
          onThrustDown={handleTouchThrustDown}
          onThrustUp={handleTouchThrustUp}
          onBurnDown={handleTouchBurnDown}
          onBurnUp={handleTouchBurnUp}
          onFireDown={handleTouchFireDown}
          onFireUp={handleTouchFireUp}
          onMissileDown={handleTouchMissileDown}
          onFlareDown={handleTouchFlareDown}
          onEmpDown={handleTouchEmpDown}
        />
      )}

      <HudOverlay
        bindRef={bindHudRef}
        isTouch={isTouch}
        viewMode={viewBanner.mode}
        mobileControlMode={mobileControlMode}
        paused={paused}
        showHint={!!showHint}
        hintVisible={viewBanner.on && !treeOpen && !paused}
        hintText={hintDict[viewBanner.mode]}
        showQuickTip={showQuickTip && !treeOpen && !paused && !(skillTree && skillTree.runs > 0)}
        summaryMode={summaryMode}
        treeOpen={treeOpen}
        onOpenPauseMenu={() => togglePause(true)}
        onOpenSkillTree={() => openSkillTree()}
        onOpenAchievements={openAchievementsModal}
        modalEventHandlers={modalEventHandlers}
      />

      {levelOffer && (
        <LevelUpModal
          offer={levelOffer}
          isTouch={isTouch}
          onSelectUpgrade={(idx) => {
            engineRef.current?.chooseUpgrade(idx);
            containerRef.current?.focus({ preventScroll: true });
          }}
        />
      )}

      {treeOpen && (
        <SkillTreeModal
          tree={skillTree}
          activeTab={activeTreeTab}
          lastAward={lastAward}
          confirmRespec={confirmRespec}
          onSelectTab={setActiveTreeTab}
          onUpgradeNode={handleUpgradeSkillNode}
          onRespecClick={handleRespecClick}
          onClose={closeSkillTree}
          modalEventHandlers={modalEventHandlers}
        />
      )}

      {achievementsOpen && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setAchievementsOpen(false)}
          modalEventHandlers={modalEventHandlers}
        />
      )}

      {paused && (
        <PauseModal
          pauseSubView={pauseSubView}
          setPauseSubView={setPauseSubView}
          invertY={invertY}
          muted={muted}
          mobileControlMode={mobileControlMode}
          touchHudMode={touchHudMode}
          confirmAction={confirmAction}
          setConfirmAction={setConfirmAction}
          keybinds={keybinds}
          rebindingSlot={rebindingSlot}
          setRebindingSlot={setRebindingSlot}
          saveSlots={saveSlots}
          importText={importText}
          setImportText={setImportText}
          saveMessage={saveMessage}
          onResume={() => togglePause(false)}
          onToggleInvertY={() => updateInvertY(!invertYRef.current)}
          onToggleMute={() => updateMuted(!mutedRef.current)}
          onToggleMobileControlMode={toggleMobileControlMode}
          onCycleTouchHudMode={cycleTouchHudMode}
          onOpenAchievements={openAchievementsModal}
          onOpenSaves={() => {
            setPauseSubView('saves');
            setSaveSlots(loadSaveSlots());
            setSaveMessage('');
          }}
          onRestartConfirm={() => {
            engineRef.current?.restart();
            togglePause(false);
          }}
          onQuitConfirm={() => {
            engineRef.current?.quitRun();
            togglePause(false);
          }}
          onResetKeybinds={() => {
            const defaults = resetKeybinds();
            setKeybinds(defaults);
            keybindsRef.current = defaults;
            setRebindingSlot(null);
          }}
          onSaveToSlot={handleSaveSlot}
          onLoadFromSlot={handleLoadSlot}
          onExportJson={handleExportJson}
          onImportJsonString={handleImportJsonString}
          modalEventHandlers={modalEventHandlers}
        />
      )}
    </div>
  );
};
