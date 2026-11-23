import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import {
  DEFAULT_STATE,
  MAX_HISTORY,
  type HistoryEntry,
  type Mode,
  type OutputFormatKind,
  type ToolState,
} from './types';

const VALID_MODES: Mode[] = ['paragraphs', 'sentences', 'words'];
const VALID_FORMATS: OutputFormatKind[] = ['text', 'html'];

/** Serialize tool state into a compact JSON string for share/import. */
export function serializeState(state: ToolState): string {
  return JSON.stringify({
    mode: state.mode,
    amount: state.amount,
    seed: state.seed,
    startWithLorem: state.startWithLorem,
    outputFormat: state.outputFormat,
    history: state.history,
  });
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function validHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is HistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as HistoryEntry).text === 'string' &&
        typeof (entry as HistoryEntry).createdAt === 'string'
    )
    .slice(0, MAX_HISTORY);
}

/** Validate and recover tool state from an arbitrary payload. */
export function deserializeState(data: unknown): DeserializeResult<ToolState> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      success: false,
      error: 'Invalid data format: expected lorem ipsum generator state object',
    };
  }
  const v = data as Record<string, unknown>;
  const mode: Mode = VALID_MODES.includes(v.mode as Mode) ? (v.mode as Mode) : DEFAULT_STATE.mode;
  const outputFormat: OutputFormatKind = VALID_FORMATS.includes(v.outputFormat as OutputFormatKind)
    ? (v.outputFormat as OutputFormatKind)
    : DEFAULT_STATE.outputFormat;
  const amount =
    typeof v.amount === 'string' && /^\d+$/.test(v.amount.trim()) ? v.amount : DEFAULT_STATE.amount;
  const startWithLorem =
    typeof v.startWithLorem === 'boolean' ? v.startWithLorem : DEFAULT_STATE.startWithLorem;
  const state: ToolState = {
    mode,
    amount,
    seed: stringOr(v.seed, DEFAULT_STATE.seed),
    startWithLorem,
    outputFormat,
    history: validHistory(v.history),
  };
  return { success: true, data: state };
}

/** Append a history entry to state, capped at MAX_HISTORY, newest first. */
export function withHistory(state: ToolState, text: string, now = new Date()): ToolState {
  const entry: HistoryEntry = { text, createdAt: now.toISOString() };
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY) };
}

/** True when a serialized string round-trips back to the same state. */
export function roundTrips(state: ToolState): boolean {
  try {
    const restored = deserializeState(JSON.parse(serializeState(state)));
    return restored.success && JSON.stringify(restored.data) === JSON.stringify(state);
  } catch {
    return false;
  }
}

export const loremIpsumGeneratorTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: { ...DEFAULT_STATE },
  serialize: serializeState,
  deserialize: deserializeState,
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};
