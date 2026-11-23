import { DEFAULT_STATE, MODES, type Mode, type ToolState } from './types';

export { MODES };

export function isState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return typeof v.mode === 'string' && typeof v.amount === 'string';
}

export const MODE_VALUES: Mode[] = MODES.map((m) => m.value);

export { DEFAULT_STATE };
