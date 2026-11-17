import { KeybindActionDef, KeybindMap } from '../types/game';

export const KEYBINDS_STORAGE_KEY = 'fighter-guns-keys';

export const KEYBIND_ACTIONS: KeybindActionDef[] = [
  { id: 'boost', name: 'Power boost', defaults: ['ShiftLeft', 'ShiftRight'] },
  { id: 'thrust', name: 'Thrusters', defaults: [] },
  { id: 'fire', name: 'Guns', defaults: ['KeyF'] },
  { id: 'missile', name: 'Missile', defaults: ['KeyR'] },
  { id: 'flare', name: 'Flares', defaults: ['KeyE'] },
  { id: 'emp', name: 'EMP', defaults: ['KeyQ'] },
  { id: 'view', name: 'Cycle view', defaults: ['Space', 'KeyV'] },
  { id: 'zoomOut', name: 'Zoom out', defaults: ['Minus', 'NumpadSubtract'] },
  { id: 'zoomIn', name: 'Zoom in', defaults: ['Equal', 'NumpadAdd'] },
  { id: 'pause', name: 'Pause', defaults: ['Escape', 'KeyP'] },
  { id: 'restart', name: 'Fly again', defaults: ['Enter'] },
];

export const MOVEMENT_KEY_MAP: Record<string, 'left' | 'right' | 'up' | 'down'> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
};

export function createDefaultKeybinds(): KeybindMap {
  const map: KeybindMap = {};
  for (const act of KEYBIND_ACTIONS) {
    map[act.id] = act.defaults.slice();
  }
  return map;
}

export function loadKeybinds(): KeybindMap {
  try {
    const raw = JSON.parse(localStorage.getItem(KEYBINDS_STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return createDefaultKeybinds();
    const map = createDefaultKeybinds();
    for (const act of KEYBIND_ACTIONS) {
      const list = raw[act.id];
      if (!Array.isArray(list)) continue;
      const valid = list.filter((code) => typeof code === 'string' && code && !MOVEMENT_KEY_MAP[code]);
      map[act.id] = [...new Set(valid)];
    }
    return map;
  } catch {
    return createDefaultKeybinds();
  }
}

export function saveKeybinds(map: KeybindMap): KeybindMap {
  try {
    localStorage.setItem(KEYBINDS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
  return map;
}

export function findActionForKey(map: KeybindMap, keyCode: string): string {
  if (!keyCode) return '';
  for (const act of KEYBIND_ACTIONS) {
    if ((map[act.id] || []).includes(keyCode)) return act.id;
  }
  return '';
}

export function assignKeybind(
  currentMap: KeybindMap,
  actionId: string,
  keyCode: string,
  slotIndex = 0
): KeybindMap {
  if (!actionId || !keyCode || MOVEMENT_KEY_MAP[keyCode]) return currentMap;
  const next = createDefaultKeybinds();
  for (const act of KEYBIND_ACTIONS) {
    next[act.id] = (currentMap[act.id] || []).slice();
  }
  for (const act of KEYBIND_ACTIONS) {
    next[act.id] = next[act.id].filter((k) => k !== keyCode);
  }
  const list = next[actionId];
  const clampedSlot = Math.max(0, Math.min(1, slotIndex | 0));
  if (list[clampedSlot] === undefined) {
    list.push(keyCode);
  } else {
    list[clampedSlot] = keyCode;
  }
  next[actionId] = [...new Set(list.filter(Boolean))];
  return saveKeybinds(next);
}

export function resetKeybinds(): KeybindMap {
  return saveKeybinds(createDefaultKeybinds());
}

export function formatKeyCode(code?: string): string {
  if (!code) return '\u2014';
  if (code === 'Space') return 'Space';
  if (code === 'Escape') return 'Esc';
  if (code === 'Enter' || code === 'NumpadEnter') return 'Enter';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl';
  if (code === 'AltLeft' || code === 'AltRight') return 'Alt';
  if (code === 'MetaLeft' || code === 'MetaRight') return 'Meta';
  if (code.startsWith('Arrow')) return code.slice(5);
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  if (code.startsWith('Minus')) return '-';
  if (code === 'Equal') return '=';
  if (code === 'BracketLeft') return '[';
  if (code === 'BracketRight') return ']';
  if (code === 'Backslash') return '\\';
  if (code === 'Semicolon') return ';';
  if (code === 'Quote') return "'";
  if (code === 'Comma') return ',';
  if (code === 'Period') return '.';
  if (code === 'Slash') return '/';
  if (code === 'Backquote') return '`';
  if (code === 'Tab') return 'Tab';
  if (code === 'CapsLock') return 'Caps';
  return code;
}
