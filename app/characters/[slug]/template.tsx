'use client';

import { CharacterDetailOverlay } from '@/components/CharacterDetailOverlay';

export default function Template({ children }: { children: React.ReactNode }) {
  return <CharacterDetailOverlay>{children}</CharacterDetailOverlay>;
}
