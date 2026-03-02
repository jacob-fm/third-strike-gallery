'use client'
import { characters } from '@/data/characters';
import CharacterCard from '@/components/CharacterCard';
import { useState } from 'react'
import { Character } from '@/types/character'

export default function CharactersPage() {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg)' }}>
      <header className="mb-8 text-center">
        <h1
          className="text-3xl font-bold tracking-widest uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          Street Fighter III
        </h1>
        <p
          className="mt-1 text-sm tracking-[0.3em] uppercase"
          style={{ color: 'var(--accent)' }}
        >
          Third Strike — Character Select
        </p>
      </header>
      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 max-w-5xl mx-auto">
        {characters.map((character) => (
          <CharacterCard key={character.slug} character={character} onHover={setSelectedChar} />
        ))}
      </div>
      <span>{selectedChar?.name}</span>
    </main>
  );
}
