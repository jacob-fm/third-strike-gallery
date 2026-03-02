'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Character } from '@/types/character'
import MoveTable from '@/components/MoveTable'

interface CharacterModalProps {
  character: Character
  onClose: () => void
}

export default function CharacterModal({ character, onClose }: CharacterModalProps) {
  return (
    <motion.div
      className="fixed inset-0 overflow-y-auto z-10"
      style={{ background: 'var(--bg)' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-sm tracking-widest uppercase cursor-pointer"
              style={{ color: 'var(--accent)' }}
            >
              ← Back to Roster
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
            {/* Left column: artwork + identity */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-110 rounded overflow-hidden">
                <Image
                  src={character.artworkImage}
                  alt={`${character.name} artwork`}
                  fill
                  unoptimized
                  className="object-cover object-top"
                  style={{ imageRendering: 'pixelated' }}
                  sizes="280px"
                  priority
                />
              </div>
              <div>
                <h1
                  className="text-3xl font-bold tracking-wide uppercase"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {character.name}
                </h1>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt style={{ color: 'var(--text-secondary)' }}>Origin</dt>
                    <dd style={{ color: 'var(--text-primary)' }}>{character.nationality}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt style={{ color: 'var(--text-secondary)' }}>Style</dt>
                    <dd style={{ color: 'var(--text-primary)' }}>{character.fightingStyle}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right column: bio + moves */}
            <div className="flex flex-col gap-8">
              <section>
                <h2
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: 'var(--accent)' }}
                >
                  Bio
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {character.bio}
                </p>
              </section>

              <section>
                <h2
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: 'var(--accent)' }}
                >
                  Move List
                </h2>
                <MoveTable moves={character.moves} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  )
}
