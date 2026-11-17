import { SaveSlotData } from '../types/game';

export const SAVE_SLOTS_STORAGE_KEY = 'fighter-guns-slots';
export const SAVE_SLOT_COUNT = 3;
export const BEST_RUN_STORAGE_KEY = 'fighter-guns-best';

export function loadSaveSlots(): Array<SaveSlotData | null> {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_SLOTS_STORAGE_KEY) || 'null');
    const slots: Array<SaveSlotData | null> = [null, null, null];
    if (Array.isArray(raw)) {
      for (let i = 0; i < SAVE_SLOT_COUNT; i++) {
        if (raw[i] && typeof raw[i] === 'object' && raw[i].run && raw[i].tree) {
          slots[i] = raw[i];
        }
      }
    }
    return slots;
  } catch {
    return [null, null, null];
  }
}

export function saveSaveSlots(slots: Array<SaveSlotData | null>): Array<SaveSlotData | null> {
  try {
    localStorage.setItem(SAVE_SLOTS_STORAGE_KEY, JSON.stringify(slots));
  } catch {
    // ignore storage errors
  }
  return slots;
}

export function formatSaveSlotSummary(slot: SaveSlotData | null | undefined): string {
  if (!slot || !slot.run || !slot.meta) return 'Empty';
  const meta = slot.meta;
  const dateStr = meta.savedAt
    ? new Date(meta.savedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })
    : '';
  return (
    'Wave ' +
    (meta.wave || 0) +
    ' \xB7 Lv ' +
    (meta.level || 1) +
    ' \xB7 ' +
    (meta.score || 0) +
    ' pts' +
    (dateStr ? ' \xB7 ' + dateStr : '')
  );
}

export interface BestRunStats {
  score?: number;
  level?: number;
  wave?: number;
}

export function loadBestRun(): BestRunStats {
  try {
    return JSON.parse(localStorage.getItem(BEST_RUN_STORAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function saveBestRun(best: BestRunStats): void {
  try {
    localStorage.setItem(BEST_RUN_STORAGE_KEY, JSON.stringify(best));
  } catch {
    // ignore storage errors
  }
}
