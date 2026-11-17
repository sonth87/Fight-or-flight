import React from 'react';
import { HUD_PILL_CLASS } from '../config/defaults';
import { formatKeyCode, KEYBIND_ACTIONS } from '../data/keybinds';
import { formatSaveSlotSummary } from '../data/saveSlots';
import {
  KeybindMap,
  MobileControlMode,
  SaveSlotData,
  TouchControlsMode,
} from '../types/game';

interface PauseModalProps {
  pauseSubView: string;
  setPauseSubView: (view: string) => void;
  invertY: boolean;
  muted: boolean;
  mobileControlMode: MobileControlMode;
  touchHudMode: TouchControlsMode;
  confirmAction: string;
  setConfirmAction: (act: string) => void;
  keybinds: KeybindMap;
  rebindingSlot: { action: string; slot: number } | null;
  setRebindingSlot: (slot: { action: string; slot: number } | null) => void;
  saveSlots: Array<SaveSlotData | null>;
  importText: string;
  setImportText: (text: string) => void;
  saveMessage: string;
  onResume: () => void;
  onToggleInvertY: () => void;
  onToggleMute: () => void;
  onToggleMobileControlMode: () => void;
  onCycleTouchHudMode: () => void;
  onOpenAchievements: () => void;
  onOpenSaves: () => void;
  onRestartConfirm: () => void;
  onQuitConfirm: () => void;
  onResetKeybinds: () => void;
  onSaveToSlot: (slotIdx: number) => void;
  onLoadFromSlot: (slotIdx: number) => void;
  onExportJson: () => void;
  onImportJsonString: (json: string) => void;
  modalEventHandlers: Record<string, any>;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  pauseSubView,
  setPauseSubView,
  invertY,
  muted,
  mobileControlMode,
  touchHudMode,
  confirmAction,
  setConfirmAction,
  keybinds,
  rebindingSlot,
  setRebindingSlot,
  saveSlots,
  importText,
  setImportText,
  saveMessage,
  onResume,
  onToggleInvertY,
  onToggleMute,
  onToggleMobileControlMode,
  onCycleTouchHudMode,
  onOpenAchievements,
  onOpenSaves,
  onRestartConfirm,
  onQuitConfirm,
  onResetKeybinds,
  onSaveToSlot,
  onLoadFromSlot,
  onExportJson,
  onImportJsonString,
  modalEventHandlers,
}) => {
  return (
    <div
      data-pause="screen"
      className="absolute inset-0 z-20 flex items-center justify-center overflow-auto bg-[#0b1a33]/75 py-4"
      style={{ cursor: 'default' }}
      {...modalEventHandlers}
    >
      <div
        className="flex w-[36rem] max-w-[94vw] flex-col items-center gap-2.5 px-3 font-mono uppercase leading-none text-white/90"
        style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
      >
        <p className="rounded-[3px] bg-[#0b1a33]/70 px-4 py-2 text-[18px] tracking-[0.3em] text-[#ffe060]">
          Paused · Config
        </p>

        {pauseSubView === 'main' && (
          <>
            <p className={HUD_PILL_CLASS}>The world is frozen · Tap Resume or press Esc / P</p>

            <button
              type="button"
              data-pause="resume"
              onClick={(e) => {
                e.stopPropagation();
                onResume();
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-[#ffe060]/60 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-[#ffe060] outline-none hover:border-[#ffe060] focus-visible:border-white"
            >
              Resume
            </button>

            <button
              type="button"
              data-pause="mobile-control"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMobileControlMode();
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-[#7ed0ff]/45 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-[#9fe0ff] outline-none hover:border-[#7ed0ff] focus-visible:border-white"
            >
              {mobileControlMode === 'touch'
                ? 'Mobile Steering · Touch (Top) + HUD Stick (Chase/Cockpit)'
                : 'Mobile Steering · HUD Virtual Joystick (All Views)'}
            </button>

            <button
              type="button"
              data-pause="touch-hud"
              onClick={(e) => {
                e.stopPropagation();
                onCycleTouchHudMode();
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-white/70 focus-visible:border-white"
            >
              {touchHudMode === 'auto'
                ? 'On-Screen HUD Controls · Auto (Mobile/Tablet)'
                : touchHudMode === 'on'
                  ? 'On-Screen HUD Controls · Always On'
                  : 'On-Screen HUD Controls · Off'}
            </button>

            <button
              type="button"
              data-pause="invert-y"
              onClick={(e) => {
                e.stopPropagation();
                onToggleInvertY();
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-white/70 focus-visible:border-white"
            >
              {invertY ? 'Invert Y · On' : 'Invert Y · Off'}
            </button>

            <button
              type="button"
              data-pause="mute"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-white/70 focus-visible:border-white"
            >
              {muted ? 'Sound · Off' : 'Sound · On'}
            </button>

            <button
              type="button"
              data-pause="keybinds"
              onClick={(e) => {
                e.stopPropagation();
                setPauseSubView('keys');
                setRebindingSlot(null);
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-white/70 focus-visible:border-white"
            >
              Keybinds
            </button>

            <button
              type="button"
              data-pause="achievements"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAchievements();
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-white/70 focus-visible:border-white"
            >
              Achievements
            </button>

            <button
              type="button"
              data-pause="saves"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSaves();
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-white/70 focus-visible:border-white"
            >
              Save / Load
            </button>

            <button
              type="button"
              data-pause="restart"
              onClick={(e) => {
                e.stopPropagation();
                if (confirmAction !== 'restart') {
                  setConfirmAction('restart');
                  return;
                }
                setConfirmAction('');
                onRestartConfirm();
              }}
              className={
                'w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] outline-none hover:border-[#ff9a7a] focus-visible:border-white ' +
                (confirmAction === 'restart' ? 'text-[#ff9a7a]' : 'text-white/90')
              }
            >
              {confirmAction === 'restart' ? 'Click again to restart the run' : 'Restart run'}
            </button>

            <button
              type="button"
              data-pause="quit"
              onClick={(e) => {
                e.stopPropagation();
                if (confirmAction !== 'quit') {
                  setConfirmAction('quit');
                  return;
                }
                setConfirmAction('');
                onQuitConfirm();
              }}
              className={
                'w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] outline-none hover:border-[#ff9a7a] focus-visible:border-white ' +
                (confirmAction === 'quit' ? 'text-[#ff9a7a]' : 'text-white/90')
              }
            >
              {confirmAction === 'quit' ? 'Click again to quit to the start' : 'Quit to start'}
            </button>

            <div
              data-pause="pointer-legend"
              className="mt-1 w-full rounded-[3px] border border-white/20 bg-[#0b1a33]/80 px-3 py-2 text-left font-mono uppercase leading-[1.55] tracking-[0.08em] text-[9px] text-white/80"
            >
              <p className="mb-1 text-[10px] tracking-[0.16em] text-[#ffe060]">Pointer legend</p>
              <p>Jets keep the arrow · Buildings a ground pin · Boats a hull wedge</p>
              <p>UFOs a saucer diamond · Mothership a double ring</p>
              <p>Airships an elongated capsule, tinted per type (linen · brass · violet · carrier)</p>
            </div>
          </>
        )}

        {pauseSubView === 'keys' && (
          <>
            <p className={HUD_PILL_CLASS}>
              {rebindingSlot
                ? `Press a key for ${rebindingSlot.action}\u2026 · Esc cancels`
                : 'Click a bind, then press a key · WASD and arrows always fly'}
            </p>
            {KEYBIND_ACTIONS.map((act) => {
              const codes = keybinds[act.id] || [];
              return (
                <div key={act.id} className="flex w-full items-center gap-2" data-bind-row={act.id}>
                  <p className="w-[9rem] shrink-0 text-[11px] tracking-[0.12em] text-white/80">
                    {act.name}
                  </p>
                  {[0, 1].map((slotIdx) => {
                    const isListening =
                      rebindingSlot &&
                      rebindingSlot.action === act.id &&
                      rebindingSlot.slot === slotIdx;
                    return (
                      <button
                        key={`${act.id}-${slotIdx}`}
                        type="button"
                        data-bind={act.id}
                        data-bind-slot={String(slotIdx)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRebindingSlot({ action: act.id, slot: slotIdx });
                        }}
                        className={
                          'flex-1 cursor-pointer rounded-[3px] border font-mono uppercase px-2 py-1.5 text-[11px] tracking-[0.12em] outline-none ' +
                          (isListening
                            ? 'border-[#ffe060] bg-[#3a3410]/70 text-[#ffe060]'
                            : 'border-white/30 bg-[#0b1a33]/80 text-white/90 hover:border-white/70')
                        }
                      >
                        {formatKeyCode(codes[slotIdx])}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            <div className="mt-1 flex w-full gap-2">
              <button
                type="button"
                data-bind="reset"
                onClick={(e) => {
                  e.stopPropagation();
                  onResetKeybinds();
                }}
                className="flex-1 cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 outline-none hover:border-[#ff9a7a] focus-visible:border-white"
              >
                Reset defaults
              </button>
              <button
                type="button"
                data-pause="back"
                onClick={(e) => {
                  e.stopPropagation();
                  setRebindingSlot(null);
                  setPauseSubView('main');
                }}
                className="flex-1 cursor-pointer rounded-[3px] border font-mono uppercase border-[#ffe060]/60 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-[#ffe060] outline-none hover:border-[#ffe060]"
              >
                Back
              </button>
            </div>
          </>
        )}

        {pauseSubView === 'saves' && (
          <>
            <p className={HUD_PILL_CLASS}>
              Three mid-run slots · JSON export and import of the flight and the tree
            </p>
            {[0, 1, 2].map((slotIdx) => (
              <div
                key={`slot-${slotIdx}`}
                className="flex w-full items-center gap-2"
                data-slot-row={String(slotIdx)}
              >
                <p
                  className="flex-1 truncate text-[10px] tracking-[0.1em] text-white/80"
                  data-slot-label={String(slotIdx)}
                >
                  Slot {slotIdx + 1} · {formatSaveSlotSummary(saveSlots[slotIdx])}
                </p>
                <button
                  type="button"
                  data-slot-save={String(slotIdx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveToSlot(slotIdx);
                  }}
                  className="cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-2 py-1.5 text-[10px] tracking-[0.12em] text-white/90 hover:border-[#ffe060]"
                >
                  Save
                </button>
                <button
                  type="button"
                  data-slot-load={String(slotIdx)}
                  disabled={!saveSlots[slotIdx]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadFromSlot(slotIdx);
                  }}
                  className="cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-2 py-1.5 text-[10px] tracking-[0.12em] text-white/90 hover:border-[#ffe060] disabled:cursor-default disabled:opacity-40"
                >
                  Load
                </button>
              </div>
            ))}
            <div className="flex w-full gap-2">
              <button
                type="button"
                data-export="json"
                onClick={(e) => {
                  e.stopPropagation();
                  onExportJson();
                }}
                className="flex-1 cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 hover:border-white/70"
              >
                Export JSON
              </button>
              <label className="flex-1 cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-center text-[11px] tracking-[0.14em] text-white/90 hover:border-white/70">
                Import file
                <input
                  type="file"
                  accept="application/json,.json"
                  data-import="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => onImportJsonString(String(reader.result || ''));
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <textarea
              data-import="text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Or paste a save here"
              className="h-20 w-full resize-y rounded-[3px] border border-white/20 bg-[#0b1a33]/80 p-2 font-mono text-[10px] normal-case tracking-[0.04em] text-white/90 outline-none focus:border-[#ffe060]"
            />
            <button
              type="button"
              data-import="apply"
              onClick={(e) => {
                e.stopPropagation();
                onImportJsonString(importText);
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-white/90 hover:border-[#ffe060]"
            >
              Import pasted JSON
            </button>
            {saveMessage && (
              <p data-import="msg" className={`${HUD_PILL_CLASS} text-[#ffe060]`}>
                {saveMessage}
              </p>
            )}
            <button
              type="button"
              data-pause="back"
              onClick={(e) => {
                e.stopPropagation();
                setPauseSubView('main');
              }}
              className="w-full cursor-pointer rounded-[3px] border font-mono uppercase border-[#ffe060]/60 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-[#ffe060] outline-none hover:border-[#ffe060]"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};
