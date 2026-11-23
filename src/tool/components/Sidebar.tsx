'use client';

import React from 'react';
import { MODES, type ToolState } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange: (next: ToolState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  return (
    <div className="p-4 space-y-6 text-sm overflow-y-auto h-full" data-testid="lorem-sidebar">
      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Modes</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          {MODES.map((mode) => (
            <li key={mode.value} className="flex justify-between gap-2">
              <span>{mode.label}</span>
              <span className="text-gray-500 dark:text-gray-400">{mode.hint}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Output options</h3>
        <label
          className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300"
          htmlFor="sidebar-start-lorem"
        >
          Start with &quot;Lorem ipsum&quot;
          <input
            id="sidebar-start-lorem"
            type="checkbox"
            checked={state.startWithLorem}
            onChange={(e) => onChange({ ...state, startWithLorem: e.target.checked })}
            data-testid="sidebar-start-lorem"
          />
        </label>
        <label
          className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300"
          htmlFor="sidebar-format"
        >
          Format
          <select
            id="sidebar-format"
            value={state.outputFormat}
            onChange={(e) =>
              onChange({
                ...state,
                outputFormat: e.target.value === 'html' ? 'html' : 'text',
              })
            }
            data-testid="sidebar-format"
          >
            <option value="text">Plain text</option>
            <option value="html">HTML</option>
          </select>
        </label>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Saved snippets</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300" data-testid="sidebar-history-count">
          {state.history.length} entr{state.history.length === 1 ? 'y' : 'ies'} in history
          {state.history.length > 0 ? ' (newest first)' : ''}
        </p>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Keyboard shortcuts</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <li>
            <kbd>P</kbd> — Paragraphs mode
          </li>
          <li>
            <kbd>S</kbd> — Sentences mode
          </li>
          <li>
            <kbd>W</kbd> — Words mode
          </li>
          <li>
            <kbd>Y</kbd> — Copy result
          </li>
          <li>
            <kbd>G</kbd> — Regenerate
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Share</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Use the toolbar share button to create a URL containing the current inputs; open it to
          restore this configuration.
        </p>
      </div>
    </div>
  );
};
