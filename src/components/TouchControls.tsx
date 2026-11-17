import React, { useRef, useState } from 'react';
import { computeRunStats } from '../data/upgrades';
import { MobileControlMode, SkillTreeState, ViewMode } from '../types/game';

interface TouchControlsProps {
  accentColor: string;
  thrustActive: boolean;
  burnActive: boolean;
  fireActive: boolean;
  skillTree: SkillTreeState;
  controlMode: MobileControlMode;
  viewMode: ViewMode;
  onChangeView: () => void;
  onRollTap: () => void;
  onJoystickChange: (dx: number, dy: number, active: boolean) => void;
  onThrustDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onThrustUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onBurnDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onBurnUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onFireDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onFireUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onMissileDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onFlareDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onEmpDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
}

const TOUCH_BTN_BASE =
  'absolute flex h-14 w-[4.5rem] cursor-pointer select-none items-center justify-center rounded-[4px] border font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-white/90 outline-none transition-colors duration-100 focus-visible:border-white';

const JOYSTICK_MAX_RADIUS = 42;

export const TouchControls: React.FC<TouchControlsProps> = ({
  accentColor,
  thrustActive,
  burnActive,
  fireActive,
  skillTree,
  controlMode,
  viewMode,
  onChangeView,
  onRollTap,
  onJoystickChange,
  onThrustDown,
  onThrustUp,
  onBurnDown,
  onBurnUp,
  onFireDown,
  onFireUp,
  onMissileDown,
  onFlareDown,
  onEmpDown,
}) => {
  const stopProp = (e: React.SyntheticEvent) => e.stopPropagation();
  const preventCtx = (e: React.MouseEvent) => e.preventDefault();
  const treeStats = computeRunStats([], skillTree.ranks);

  // In Chase or Cockpit view, touch-to-fly does not apply, so HUD Joystick is always used.
  const showJoystick = controlMode === 'joystick' || viewMode !== 'top';

  const joyPadRef = useRef<HTMLDivElement | null>(null);
  const joyPointerIdRef = useRef<number | null>(null);
  const [joyKnob, setJoyKnob] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const updateJoystickFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const pad = joyPadRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rawX = e.clientX - cx;
    const rawY = e.clientY - cy;
    const dist = Math.hypot(rawX, rawY);
    const clampedDist = Math.min(JOYSTICK_MAX_RADIUS, dist);
    const angle = Math.atan2(rawY, rawX);
    const kx = dist > 0.5 ? Math.cos(angle) * clampedDist : 0;
    const ky = dist > 0.5 ? Math.sin(angle) * clampedDist : 0;
    const normX = Math.max(-1, Math.min(1, kx / JOYSTICK_MAX_RADIUS));
    // Invert screen Y so pushing UP on the stick is +1 (climb / up)
    const normY = Math.max(-1, Math.min(1, -ky / JOYSTICK_MAX_RADIUS));

    setJoyKnob({ x: kx, y: ky, active: true });
    onJoystickChange(normX, normY, true);
  };

  const handleJoyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joyPointerIdRef.current !== null) return;
    joyPointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateJoystickFromEvent(e);
  };

  const handleJoyPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joyPointerIdRef.current !== e.pointerId) return;
    updateJoystickFromEvent(e);
  };

  const handleJoyPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joyPointerIdRef.current !== e.pointerId) return;
    joyPointerIdRef.current = null;
    setJoyKnob({ x: 0, y: 0, active: false });
    onJoystickChange(0, 0, false);
  };

  return (
    <>
      {showJoystick && (
        <div
          ref={joyPadRef}
          data-touch="joystick"
          role="slider"
          aria-label="Flight HUD Joystick"
          aria-valuetext={`${Math.round((joyKnob.x / JOYSTICK_MAX_RADIUS) * 100)}%, ${Math.round(
            (-joyKnob.y / JOYSTICK_MAX_RADIUS) * 100
          )}%`}
          className="absolute flex h-28 w-28 select-none items-center justify-center rounded-full border border-[#7ed0ff]/45 bg-[#0b1a33]/65 shadow-[inset_0_0_18px_rgba(126,208,255,0.18)]"
          style={{
            left: 'max(16px, env(safe-area-inset-left))',
            bottom: 'max(16px, env(safe-area-inset-bottom))',
            touchAction: 'none',
          }}
          onPointerDown={handleJoyPointerDown}
          onPointerMove={handleJoyPointerMove}
          onPointerUp={handleJoyPointerUp}
          onPointerCancel={handleJoyPointerUp}
          onLostPointerCapture={handleJoyPointerUp}
          onContextMenu={preventCtx}
        >
          {/* Crosshair Axis Guides */}
          <div className="pointer-events-none absolute inset-x-3 h-[1px] bg-white/15" />
          <div className="pointer-events-none absolute inset-y-3 w-[1px] bg-white/15" />
          <div className="pointer-events-none absolute h-12 w-12 rounded-full border border-dashed border-white/20" />
          <span className="pointer-events-none absolute top-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[#9fe0ff]/70">
            {viewMode === 'top' ? '360°' : 'Pitch'}
          </span>
          <span className="pointer-events-none absolute bottom-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[#9fe0ff]/70">
            {viewMode === 'top' ? 'Steer' : 'Turn'}
          </span>

          {/* Movable Stick Knob */}
          <div
            className={`pointer-events-none flex h-11 w-11 items-center justify-center rounded-full border transition-transform duration-75 ${
              joyKnob.active
                ? 'border-white/90 bg-[#7ed0ff]/45 shadow-[0_0_12px_rgba(126,208,255,0.65)]'
                : 'border-white/45 bg-[#122b52]/80'
            }`}
            style={{
              transform: `translate3d(${Math.round(joyKnob.x)}px, ${Math.round(joyKnob.y)}px, 0)`,
            }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-white/85" />
          </div>
        </div>
      )}

      {/* View Button */}
      <button
        type="button"
        aria-label="Change view"
        className={`${TOUCH_BTN_BASE} border-white/30 bg-[#0b1a33]/60 active:bg-[#0b1a33]/90`}
        style={{
          left: 'max(14px, env(safe-area-inset-left))',
          bottom: showJoystick
            ? 'calc(max(16px, env(safe-area-inset-bottom)) + 7.6rem)'
            : 'max(14px, env(safe-area-inset-bottom))',
          touchAction: 'none',
        }}
        onClick={onChangeView}
        onPointerDown={stopProp}
        onPointerMove={stopProp}
        onPointerUp={stopProp}
      >
        View
      </button>

      {/* Barrel Roll Button when HUD Joystick is active */}
      {showJoystick && (
        <button
          type="button"
          data-touch="roll"
          aria-label="Barrel roll"
          className={`${TOUCH_BTN_BASE} border-white/30 bg-[#0b1a33]/60 active:bg-[#0b1a33]/90`}
          style={{
            left: 'calc(max(14px, env(safe-area-inset-left)) + 5rem)',
            bottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 7.6rem)',
            touchAction: 'none',
          }}
          onClick={onRollTap}
          onPointerDown={stopProp}
          onPointerMove={stopProp}
          onPointerUp={stopProp}
        >
          Roll
        </button>
      )}

      {/* Right Column: Thrusters, Burn, Guns, EMP */}
      <button
        type="button"
        aria-label="Thrusters: hold to fire"
        aria-pressed={thrustActive}
        className={`${TOUCH_BTN_BASE} ${
          thrustActive ? 'border-white/70' : 'border-white/30 bg-[#0b1a33]/60'
        }`}
        style={{
          right: 'max(14px, env(safe-area-inset-right))',
          bottom: 'max(14px, env(safe-area-inset-bottom))',
          touchAction: 'none',
          backgroundColor: thrustActive ? accentColor : undefined,
        }}
        onPointerDown={onThrustDown}
        onPointerMove={stopProp}
        onPointerUp={onThrustUp}
        onPointerCancel={onThrustUp}
        onLostPointerCapture={onThrustUp}
        onContextMenu={preventCtx}
      >
        Thrust
      </button>

      <button
        type="button"
        aria-label="Power boost: hold to burn"
        aria-pressed={burnActive}
        className={`${TOUCH_BTN_BASE} ${
          burnActive ? 'border-white/70' : 'border-white/30 bg-[#0b1a33]/60'
        }`}
        style={{
          right: 'max(14px, env(safe-area-inset-right))',
          bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 4rem)',
          touchAction: 'none',
          backgroundColor: burnActive ? '#ffb44a' : undefined,
        }}
        onPointerDown={onBurnDown}
        onPointerMove={stopProp}
        onPointerUp={onBurnUp}
        onPointerCancel={onBurnUp}
        onLostPointerCapture={onBurnUp}
        onContextMenu={preventCtx}
      >
        Burn
      </button>

      <button
        type="button"
        aria-label="Guns: hold to fire"
        aria-pressed={fireActive}
        className={`${TOUCH_BTN_BASE} ${
          fireActive ? 'border-white/70 bg-[#f0580e]' : 'border-white/30 bg-[#0b1a33]/60'
        }`}
        style={{
          right: 'max(14px, env(safe-area-inset-right))',
          bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 8rem)',
          touchAction: 'none',
        }}
        onPointerDown={onFireDown}
        onPointerMove={stopProp}
        onPointerUp={onFireUp}
        onPointerCancel={onFireUp}
        onLostPointerCapture={onFireUp}
        onContextMenu={preventCtx}
      >
        Guns
      </button>

      {/* Missile & Flare buttons: placed on inner-right column when Joystick is on left, or left column in Touch-Top mode */}
      <button
        type="button"
        aria-label="Fire a missile"
        className={`${TOUCH_BTN_BASE} border-white/30 bg-[#0b1a33]/60 active:bg-[#0b1a33]/90`}
        style={
          showJoystick
            ? {
                right: 'calc(max(14px, env(safe-area-inset-right)) + 5rem)',
                bottom: 'max(14px, env(safe-area-inset-bottom))',
                touchAction: 'none',
              }
            : {
                left: 'max(14px, env(safe-area-inset-left))',
                bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 4rem)',
                touchAction: 'none',
              }
        }
        onPointerDown={onMissileDown}
        onPointerMove={stopProp}
        onPointerUp={stopProp}
        onContextMenu={preventCtx}
      >
        Msl
      </button>

      {treeStats.flareMax > 0 && (
        <button
          type="button"
          aria-label="Pop flares"
          className={`${TOUCH_BTN_BASE} border-white/30 bg-[#0b1a33]/60 active:bg-[#0b1a33]/90`}
          style={
            showJoystick
              ? {
                  right: 'calc(max(14px, env(safe-area-inset-right)) + 5rem)',
                  bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 4rem)',
                  touchAction: 'none',
                }
              : {
                  left: 'max(14px, env(safe-area-inset-left))',
                  bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 8rem)',
                  touchAction: 'none',
                }
          }
          onPointerDown={onFlareDown}
          onPointerMove={stopProp}
          onPointerUp={stopProp}
          onContextMenu={preventCtx}
        >
          Flr
        </button>
      )}

      {treeStats.empMax > 0 && (
        <button
          type="button"
          aria-label="Fire EMP"
          className={`${TOUCH_BTN_BASE} border-white/30 bg-[#0b1a33]/60 active:bg-[#0b1a33]/90`}
          style={{
            right: 'max(14px, env(safe-area-inset-right))',
            bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 12rem)',
            touchAction: 'none',
          }}
          onPointerDown={onEmpDown}
          onPointerMove={stopProp}
          onPointerUp={stopProp}
          onContextMenu={preventCtx}
        >
          Emp
        </button>
      )}
    </>
  );
};
