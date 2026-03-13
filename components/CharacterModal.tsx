'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Character } from '@/types/character'
import MoveTable from '@/components/MoveTable'

interface CharacterModalProps {
  character: Character
  onClose: () => void
}

export default function CharacterModal({ character, onClose }: CharacterModalProps) {
  return (
    <motion.div
      className="fixed inset-0 overflow-y-auto z-10 bg-bg"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={onClose}
              className="text-sm tracking-widest uppercase cursor-pointer text-accent"
            >
              ← Back to Roster
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
            {/* Left column: artwork + identity */}
            <div className="flex flex-col gap-4">
              <motion.div
                layoutId={`char-idle-${character.name}`}
                className="relative w-full aspect-square rounded"
              >
                <Image
                  src={character.artworkImage}
                  alt={`${character.name} artwork`}
                  fill
                  unoptimized
                  className="object-contain object-center [image-rendering:pixelated]"
                  priority
                />
              </motion.div>

              {/* Identity: icon thumbnail + name animate from grid card */}
              <div className="flex items-center gap-3">
                <div>
                  <motion.h1
                    layoutId={`char-name-${character.slug}`}
                    className="text-3xl font-bold tracking-wide uppercase text-text-primary"
                  >
                    {character.name}
                  </motion.h1>
                  <motion.dl
                    className="mt-1 space-y-0.5 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex gap-2">
                      <dt className="text-text-secondary">Origin</dt>
                      <dd className="text-text-primary">{character.nationality}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-text-secondary">Style</dt>
                      <dd className="text-text-primary">{character.fightingStyle}</dd>
                    </div>
                  </motion.dl>
                </div>
              </div>
            </div>

            {/* Right column: bio + moves */}
            <motion.div
              className="flex flex-col gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <section>
                <h2
                  className="text-xs font-bold tracking-widest uppercase mb-3 text-accent"
                >
                  Bio
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {character.bio}
                </p>
              </section>

              <section>
                <h2
                  className="text-xs font-bold tracking-widest uppercase mb-3 text-accent"
                >
                  Move List
                </h2>
                <MoveTable moves={character.moves} />
              </section>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  )
}
