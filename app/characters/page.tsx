'use client'
import { getCharacterBySlug } from '@/data/characters'
import CharacterCard from '@/components/CharacterCard'
import CharacterModal from '@/components/CharacterModal'
import Image from 'next/image'
import { useState } from 'react'
import { Character } from '@/types/character'
import { AnimatePresence, motion } from 'framer-motion'

// Character grid rows in original game order
const GRID_ROWS = [
  ['akuma', 'yun', 'ryu'],
  ['urien', 'remy', 'oro'],
  ['necro', 'q', 'dudley'],
  ['ibuki', 'chun-li', 'elena'],
  ['sean', 'makoto', 'hugo'],
  ['alex', 'twelve', 'ken'],
  ['yang'],
]

// Diagonal cascade: each row shifts 20px further left going down
const ROW_OFFSETS = [120, 100, 80, 60, 40, 20, 0]

export default function CharactersPage() {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [hoveredChar, setHoveredChar] = useState<Character | null>(null)

  // Portrait shows hovered character first, falls back to selected
  const activeChar = hoveredChar ?? selectedChar

  return (
    <main className="w-screen h-screen overflow-hidden bg-bg relative">

      {/* Large oval portrait — left side */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[4%] w-[50%] h-[80vh] rounded-[50%] border border-border bg-surface overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeChar ? (
            <motion.div
              key={activeChar.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full relative"
            >
              <Image
                src={activeChar.artworkImage}
                alt={activeChar.name}
                fill
                unoptimized
                className="object-contain object-center [image-rendering:pixelated]"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Character icon grid — right side, overlaps portrait edge */}
      <div className="absolute top-[4vh] right-10 flex flex-col gap-[0px] w-[650px]">
        {GRID_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-start"
            style={rowIdx < GRID_ROWS.length - 1
              ? { marginLeft: `${ROW_OFFSETS[rowIdx]}px` }
              : { justifyContent: 'center' }
            }
          >
            {row.map((slug, colIdx) => {
              const character = getCharacterBySlug(slug)
              if (!character) return null
              return (
                // Outer columns elevated by margin-top, middle column sits higher
                <div key={slug} style={{
                  transform: colIdx === 0 ? 'translateY(22px) translateX(10px)'
                    : colIdx === 2 ? 'translateY(22px) translateX(-12px)'
                      : undefined
                }}>
                  <CharacterCard
                    character={character}
                    onHover={setHoveredChar}
                    onSelect={setSelectedChar}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Character name — bottom left */}
      <div className="absolute bottom-8 left-8 h-16 flex items-end">
        <AnimatePresence mode="wait">
          {activeChar && (
            <motion.p
              key={activeChar.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-5xl font-bold tracking-widest uppercase text-text-primary"
            >
              {activeChar.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Character detail modal */}
      <AnimatePresence>
        {selectedChar && (
          <CharacterModal
            key={selectedChar.slug}
            character={selectedChar}
            onClose={() => setSelectedChar(null)}
          />
        )}
      </AnimatePresence>

    </main>
  )
}
