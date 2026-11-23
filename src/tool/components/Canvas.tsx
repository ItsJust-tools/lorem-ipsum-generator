'use client';

import React from 'react';
import { generateResult } from '../shared';
import { MODES, type ToolState } from '../types';

interface CanvasProps {
  state: ToolState;
  onChange?: (state: ToolState) => void;
  onSaveHistory?: (text: string) => void;
  onRegenerate?: () => void;
}

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';

function CopyButton({ value, testid }: { value: string; testid?: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }, [value]);
  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid={testid}
      className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Copy value"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange, onSaveHistory, onRegenerate }) => {
  const update = (patch: Partial<ToolState>) => onChange?.({ ...state, ...patch });
  const result = generateResult(
    state.mode,
    state.amount,
    state.seed,
    state.startWithLorem,
    state.outputFormat
  );
  const wordCount = result ? result.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full" data-testid="lorem-canvas">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Generation mode"
        data-testid="mode-tabs"
      >
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={state.mode === mode.value}
            data-testid={`mode-tab-${mode.value}`}
            title={mode.hint}
            onClick={() => onChange?.({ ...state, mode: mode.value })}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              state.mode === mode.value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2" data-testid="generator-inputs">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {state.mode === 'words' ? 'Word count' : `${state.mode} count`}
          <input
            type="text"
            inputMode="numeric"
            value={state.amount}
            onChange={(e) => update({ amount: e.target.value })}
            data-testid="input-amount"
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Seed (optional, deterministic output)
          <input
            type="text"
            value={state.seed}
            onChange={(e) => update({ seed: e.target.value })}
            data-testid="input-seed"
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={state.startWithLorem}
            onChange={(e) => update({ startWithLorem: e.target.checked })}
            data-testid="input-start-lorem"
          />
          Start with &quot;Lorem ipsum dolor sit amet&quot;
        </label>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Output format
          <select
            value={state.outputFormat}
            onChange={(e) => update({ outputFormat: e.target.value === 'html' ? 'html' : 'text' })}
            data-testid="input-format"
            className={inputClass}
          >
            <option value="text">Plain text</option>
            <option value="html">HTML</option>
          </select>
        </label>
      </div>

      <div
        className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        data-testid="result-card"
        role="status"
      >
        <span className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Generated text
        </span>
        <div
          className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200"
          data-testid="generated-text"
        >
          {result && result.length > 0 ? result : 'Enter a valid count (0-999) to generate text.'}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="word-count">
            {wordCount} word{wordCount === 1 ? '' : 's'}
          </span>
          <span className="flex items-center gap-2">
            {onRegenerate ? (
              <button
                type="button"
                data-testid="btn-regenerate"
                onClick={onRegenerate}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Regenerate
              </button>
            ) : null}
            {result && result.length > 0 ? (
              <>
                <button
                  type="button"
                  data-testid="btn-save-history"
                  onClick={() => onSaveHistory?.(result)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Save to history
                </button>
                <CopyButton value={result} testid="copy-result" />
              </>
            ) : null}
          </span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          History
        </h3>
        {state.history.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="history-empty">
            No saved snippets yet.
          </p>
        ) : (
          <ul className="space-y-1" data-testid="history-list">
            {state.history.map((entry, i) => (
              <li
                key={`${entry.createdAt}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs dark:border-gray-800"
              >
                <span className="truncate text-gray-700 dark:text-gray-300">{entry.text}</span>
                <CopyButton value={entry.text} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        All generation runs locally in your browser; nothing is uploaded.
      </p>
    </div>
  );
};
