'use client';

import { useCharacterExit } from './CharacterDetailOverlay';

export function BackButton() {
  const exit = useCharacterExit();
  return (
    <button
      onClick={exit}
      className="inline-flex items-center gap-2 text-sm mb-8 transition-colors duration-200 hover:text-[var(--accent)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      ← Back to Roster
    </button>
  );
}
