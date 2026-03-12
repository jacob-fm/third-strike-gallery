import Image from 'next/image';
import { motion } from 'framer-motion';
import { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character
  onHover?: (c: Character | null) => void
  onSelect?: (c: Character) => void
}

export default function CharacterCard({ character, onHover, onSelect }: CharacterCardProps) {
  return (
    <motion.div
      animate={{ filter: 'drop-shadow(0 0 0px transparent) drop-shadow(0 0 0px transparent)' }}
      whileHover={{ filter: 'drop-shadow(0 0 8px blue) drop-shadow(0 0 20px blue)' }}
      transition={{ duration: 0.12 }}
      className="w-[150px] cursor-pointer"
      onMouseEnter={() => onHover?.(character)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(character)}
    >
      <motion.div layoutId={`char-icon-${character.slug}`}>
        <Image
          src={character.iconImage}
          alt={character.name}
          width={160}
          height={95}
          unoptimized
          className="w-full h-auto [image-rendering:pixelated]"
        />
      </motion.div>
    </motion.div>
  )
}
