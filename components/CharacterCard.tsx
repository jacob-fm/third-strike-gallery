import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character
  onHover?: (c: Character | null) => void
  onSelect?: (c: Character) => void
}

export default function CharacterCard({ character, onHover, onSelect }: CharacterCardProps) {
  return (
    <Link
      href={`/characters/${character.slug}`}
      className="block group"
      onClick={(e) => {
        if (onSelect) {
          e.preventDefault()
          onSelect(character)
        }
      }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col items-center rounded overflow-hidden cursor-pointer group-hover:border-[var(--accent)] transition-colors duration-100"
        onMouseEnter={() => onHover?.(character)}
        onMouseLeave={() => onHover?.(null)}
      >
        <motion.div layoutId={`char-portrait-${character.slug}`}>
          <Image
            src={character.portraitImage}
            alt={character.name}
            width={200}
            height={200}
            unoptimized
            className="w-full h-auto [image-rendering:pixelated]"
          />
        </motion.div>
        <motion.span
          layoutId={`char-name-${character.slug}`}
          className="mt-1 text-xs tracking-widest uppercase text-text-secondary truncate w-full text-center px-1"
        >
          {character.name}
        </motion.span>
      </motion.div>
    </Link>
  );
}
