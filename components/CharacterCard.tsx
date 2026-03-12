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
      className="block"
      onClick={(e) => {
        if (onSelect) {
          e.preventDefault()
          onSelect(character)
        }
      }}
    >
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.12 }}
        className="w-[160px] cursor-pointer"
        onMouseEnter={() => onHover?.(character)}
        onMouseLeave={() => onHover?.(null)}
      >
        <motion.div layoutId={`char-icon-${character.slug}`}>
          <Image
            src={character.iconImage}
            alt={character.name}
<<<<<<< HEAD
            width={160}
            height={95}
            unoptimized
            className="w-full h-auto [image-rendering:pixelated]"
          />
        </motion.div>
      </motion.div>
    </Link>
  )
}
