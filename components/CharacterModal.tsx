'use client'
import { motion } from 'framer-motion'
import { Character } from '@/types/character'
import MoveTable from '@/components/MoveTable'
import SlantedTabs from '@/components/SlantedTabs'
import TiltCard from '@/components/TiltCard'
import { useState } from 'react'

type Pane = "bio" | "supers" | "specials"

interface CharacterModalProps {
  character: Character
  onClose: () => void
}

const paneTabs: { value: Pane; label: string }[] = [
  { value: 'bio', label: "Bio" },
  { value: 'supers', label: "Super Arts" },
  { value: 'specials', label: "Special Moves" }
]

function CharacterBio({ bio }: { bio: Character["bio"] }) {
  return (

    <section>
      <h2
        className="text-xs font-bold tracking-widest uppercase mb-3 text-accent"
      >
        Bio
      </h2>
      <p className="text-sm leading-relaxed text-text-secondary">
        {bio}
      </p>
    </section>
  )
}

export default function CharacterModal({ character, onClose }: CharacterModalProps) {
  const [activePane, setActivePane] = useState<Pane | null>("bio")
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

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-14">
            {/* Left column: bio + moves */}
            <motion.div
              className="flex flex-col gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <SlantedTabs
                tabs={paneTabs}
                activeTab={activePane ?? 'bio'}
                onTabChange={setActivePane}
              />
              {activePane === "bio" && <CharacterBio bio={character.bio} />}
              {activePane === "supers" && <MoveTable moves={character.moves} category="super" />}
              {activePane === "specials" && <MoveTable moves={character.moves} category="special" />}
            </motion.div>

            {/* Right column: artwork + identity */}
            <div className="flex flex-col gap-4 ">
              <motion.div
                layoutId={`char-idle-${character.name}`}
                className="relative w-130 aspect-square overflow-visible"
              >
                <TiltCard
                  imageSrc={character.artworkImage}
                  alt={`${character.name} artwork`}
                  className="w-full h-full"
                />
              </motion.div>

              {/* Identity: name animates from grid card */}
              <div className="flex items-center gap-3 mx-8">
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

          </div>
        </div>
      </main>
    </motion.div>
  )
}
