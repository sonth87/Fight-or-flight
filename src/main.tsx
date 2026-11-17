import React from 'react';
import { createRoot } from 'react-dom/client';
import { FighterGame } from './components/FighterGame';
import { DEFAULT_STORY_VALUES } from './config/defaults';
import './styles/main.css';
import { GameParams } from './types/game';

const initialProps: GameParams = { ...DEFAULT_STORY_VALUES };

for (const [key, value] of new URLSearchParams(window.location.search)) {
  const existing = (initialProps as any)[key];
  (initialProps as any)[key] =
    typeof existing === 'number'
      ? Number(value)
      : typeof existing === 'boolean'
        ? value === 'true' || value === '1'
        : value;
}

(window as any).__fighterProps = initialProps;

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<FighterGame {...initialProps} />);
}
