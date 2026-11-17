import React from 'react';
import { HUD_PILL_CLASS } from '../config/defaults';
import { MobileControlMode, ViewMode } from '../types/game';

interface HudOverlayProps {
  bindRef: (key: string) => (el: HTMLElement | null) => void;
  isTouch: boolean;
  viewMode: ViewMode;
  mobileControlMode: MobileControlMode;
  paused: boolean;
  showHint: boolean;
  hintVisible: boolean;
  hintText: string;
  showQuickTip: boolean;
  summaryMode: string;
  treeOpen: boolean;
  onOpenPauseMenu: () => void;
  onOpenSkillTree: () => void;
  onOpenAchievements: () => void;
  modalEventHandlers: Record<string, any>;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  bindRef,
  isTouch,
  viewMode,
  mobileControlMode,
  paused,
  showHint,
  hintVisible,
  hintText,
  showQuickTip,
  summaryMode,
  treeOpen,
  onOpenPauseMenu,
  onOpenSkillTree,
  onOpenAchievements,
  modalEventHandlers,
}) => {
  const leftTopOffsetClass = isTouch || viewMode === 'cockpit' ? 'top-14' : 'top-4';
  const rightTopOffsetClass = 'top-14';
  const summaryButtonsActive = summaryMode === 'summary' && !treeOpen;
  const effectiveHudControl = mobileControlMode === 'joystick' || viewMode !== 'top';

  return (
    <>
      {showHint && (
        <div
          className={`pointer-events-none absolute inset-x-0 flex justify-center px-4 transition-opacity duration-700 ${
            isTouch || viewMode === 'cockpit' ? 'top-4' : 'bottom-4'
          }`}
          style={{ opacity: hintVisible ? 1 : 0 }}
        >
          <p
            className="max-w-[72vw] rounded-[3px] bg-[#0b1a33]/55 px-2.5 py-1.5 text-center font-mono text-[11px] uppercase leading-tight tracking-[0.14em] text-white/90"
            style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
          >
            {hintText}
          </p>
        </div>
      )}

      <div
        ref={bindRef('flash')}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0, boxShadow: 'inset 0 0 120px 30px rgba(255,40,20,.85)' }}
      />

      {showQuickTip && (
        <div
          className="pointer-events-none absolute inset-x-0 top-[18%] flex justify-center px-4 transition-opacity duration-700"
          data-tip="quickstart"
        >
          <p className={`${HUD_PILL_CLASS} max-w-[36rem] text-center leading-[1.55]`}>
            {isTouch
              ? 'Quick start · Use Guns & Msl to shoot · Fly through glowing gates for special weapons · Tap Menu to pause & configure controls'
              : 'Quick start · F fires · R missiles · fly through a glowing gate for a special gun · spend skill points after a run'}
          </p>
        </div>
      )}

      {/* Top-Right Menu / Config (Pause) Button */}
      {!paused && !treeOpen && (
        <div
          className=" absolute z-10 flex items-center gap-1.5"
          style={{
            top: 'max(12px, env(safe-area-inset-top))',
            right: 'max(14px, env(safe-area-inset-right))',
          }}
          {...modalEventHandlers}
        >
          {isTouch && (
            <span
              data-hud="control-badge"
              className="pointer-events-none rounded-[3px] border border-white/15 bg-[#0b1a33]/55 px-2 py-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.12em] text-[#9fe0ff]"
            >
              {effectiveHudControl ? 'HUD Stick' : 'Touch Fly'}
            </span>
          )}
          <button
            type="button"
            data-hud="menu-pause"
            aria-label="Open menu and config (Pause)"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPauseMenu();
            }}
            className="cursor-pointer select-none rounded-[4px] border border-white/35 bg-[#0b1a33]/75 px-3 py-1.5 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-[#ffe060] outline-none transition-colors hover:border-[#ffe060] active:bg-[#0b1a33] focus-visible:border-white"
            style={{ touchAction: 'none', textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
          >
            Menu ⚙
          </button>
        </div>
      )}

      {/* Left HUD Status Bars */}
      <div
        className={`pointer-events-none absolute left-4 flex flex-col items-start gap-1.5 ${leftTopOffsetClass}`}
        style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
      >
        <p className={HUD_PILL_CLASS}>
          Hull <span ref={bindRef('hp')} className="tracking-[0.02em]" />
        </p>
        <p className={HUD_PILL_CLASS}>
          Bst <span ref={bindRef('bst')} className="tracking-[0.02em] text-[#ffb44a]" />
        </p>
        <p className={HUD_PILL_CLASS}>
          Guns <span ref={bindRef('heat')} className="tracking-[0.02em]" />
        </p>
        <p className={HUD_PILL_CLASS}>
          Msl <span ref={bindRef('msl')} className="tracking-[0.1em]" />
        </p>
        <p ref={bindRef('drnWrap')} className={HUD_PILL_CLASS} style={{ display: 'none' }}>
          Drn <span ref={bindRef('drn')} className="tracking-[0.1em] text-[#7ef0d8]" />
        </p>
        <p ref={bindRef('flrWrap')} className={HUD_PILL_CLASS} style={{ display: 'none' }}>
          Flr <span ref={bindRef('flr')} className="tracking-[0.1em] text-[#ffb07a]" />
        </p>
        <p ref={bindRef('empWrap')} className={HUD_PILL_CLASS} style={{ display: 'none' }}>
          Emp <span ref={bindRef('emp')} className="tracking-[0.1em] text-[#9fe0ff]" />
        </p>
        <p ref={bindRef('spGunWrap')} className={HUD_PILL_CLASS} style={{ display: 'none' }}>
          <span ref={bindRef('spGun')} className="tracking-[0.06em] text-[#7ed0ff]" />
        </p>
        <p ref={bindRef('spMslWrap')} className={HUD_PILL_CLASS} style={{ display: 'none' }}>
          <span ref={bindRef('spMsl')} className="tracking-[0.06em] text-[#b8ff9a]" />
        </p>
        <p ref={bindRef('spShdWrap')} className={HUD_PILL_CLASS} style={{ display: 'none' }}>
          <span ref={bindRef('spShd')} className="tracking-[0.06em] text-[#c878ff]" />
        </p>
        <p ref={bindRef('spCraftWrap')} className={HUD_PILL_CLASS} style={{ display: 'none' }}>
          <span ref={bindRef('spCraft')} className="tracking-[0.06em] text-[#ffd24a]" />
        </p>
      </div>

      {/* Right HUD Score, Wave & Level */}
      <div
        className={`pointer-events-none absolute right-4 flex flex-col items-end gap-1.5 ${rightTopOffsetClass}`}
        style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
      >
        <p className={HUD_PILL_CLASS}>
          Score <span ref={bindRef('score')} />
        </p>
        <p ref={bindRef('wave')} className={HUD_PILL_CLASS} />
        <p className={HUD_PILL_CLASS}>
          Lv <span ref={bindRef('lvl')} />{' '}
          <span ref={bindRef('xp')} className="tracking-[0.02em] text-[#ffe060]" />
        </p>
      </div>

      {/* Center Banners & Toasts */}
      <div className="pointer-events-none absolute inset-x-0 top-[30%] flex justify-center">
        <p
          ref={bindRef('banner')}
          className="rounded-[3px] bg-[#0b1a33]/55 px-4 py-2.5 font-mono text-[18px] uppercase leading-none tracking-[0.3em] text-white/90 transition-opacity duration-300"
          style={{ opacity: 0, textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[36%] flex justify-center px-4">
        <p
          ref={bindRef('waveHelp')}
          className={`${HUD_PILL_CLASS} max-w-[36rem] text-center leading-[1.45] text-[11px] tracking-[0.08em] text-white/85 transition-opacity duration-300`}
          style={{ opacity: 0, textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center">
        <p
          ref={bindRef('toast')}
          className={`${HUD_PILL_CLASS} text-[#ffe060]`}
          style={{ opacity: 0, textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[46%] flex justify-center">
        <p
          ref={bindRef('achToast')}
          data-achieve="toast"
          className={`${HUD_PILL_CLASS} text-[#9fe0ff]`}
          style={{ opacity: 0, textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
        />
      </div>

      <div
        ref={bindRef('boss')}
        className={`pointer-events-none absolute inset-x-0 flex justify-center ${leftTopOffsetClass}`}
        style={{ opacity: 0 }}
      >
        <p
          ref={bindRef('bossBar')}
          className={`${HUD_PILL_CLASS} text-[#ff9a7a]`}
          style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[62%] flex justify-center">
        <p
          ref={bindRef('pull')}
          className="rounded-[3px] bg-[#5a0f0a]/70 px-3 py-2 font-mono text-[14px] uppercase leading-none tracking-[0.3em] text-[#ffd2c4]"
          style={{ opacity: 0 }}
        >
          Pull up
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[44%] flex justify-center">
        <p
          ref={bindRef('focus')}
          className={`${HUD_PILL_CLASS} transition-opacity duration-300`}
          style={{ opacity: 0, textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
        >
          Click the game to use the keyboard (Space / V views · Shift boost · F guns · R missile ·
          Esc pauses)
        </p>
      </div>

      {/* Game Over / Run Summary Overlay */}
      <div
        ref={bindRef('over')}
        className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: 0 }}
      >
        <div
          className="flex flex-col items-center gap-2 rounded-[3px] bg-[#0b1a33]/70 px-6 py-5 font-mono uppercase leading-none text-white/90"
          style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
        >
          <p ref={bindRef('overTitle')} className="text-[22px] tracking-[0.3em]" />
          <p ref={bindRef('overScore')} className="text-[11px] tracking-[0.14em]" />
          <p
            ref={bindRef('overRecap')}
            className="max-w-[34rem] text-center text-[11px] leading-[1.5] tracking-[0.12em] text-white/80"
          />
          <p
            ref={bindRef('overUps')}
            className="max-w-[34rem] text-center text-[10px] leading-[1.5] tracking-[0.1em] text-white/80"
          />
          <p ref={bindRef('overBest')} className="text-[11px] tracking-[0.14em] text-[#ffe060]" />
          <p ref={bindRef('overPts')} className="text-[11px] tracking-[0.14em] text-[#9fe0ff]" />

          <button
            type="button"
            data-tree-open="summary"
            {...modalEventHandlers}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSkillTree();
            }}
            className={
              'mt-1 cursor-pointer rounded-[3px] border font-mono uppercase border-[#ffe060]/60 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-[#ffe060] outline-none hover:border-[#ffe060] focus-visible:border-white ' +
              (summaryButtonsActive ? 'pointer-events-auto' : 'pointer-events-none')
            }
          >
            Skill tree
          </button>

          <button
            type="button"
            data-achieve-open="summary"
            {...modalEventHandlers}
            onClick={(e) => {
              e.stopPropagation();
              onOpenAchievements();
            }}
            className={
              'cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-[#9fe0ff] focus-visible:border-white ' +
              (summaryButtonsActive ? 'pointer-events-auto' : 'pointer-events-none')
            }
          >
            Achievements
          </button>

          <p className="text-[11px] tracking-[0.14em] text-white/60">
            {isTouch ? 'Tap to fly again' : 'Click or press Enter to fly again'}
          </p>
        </div>
      </div>
    </>
  );
};
