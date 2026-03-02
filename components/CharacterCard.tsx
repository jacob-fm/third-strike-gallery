import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Character } from '@/types/character';

export default function CharacterCard({ character, onHover }: { character: Character; onHover?: (c: Character | null) => void }) {
  return (
    <Link href={`/characters/${character.slug}`} className="block group">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col items-center rounded overflow-hidden cursor-pointer group-hover:border-[var(--accent)] transition-colors duration-200"
        onMouseEnter={() => onHover?.(character)}
        onMouseLeave={() => onHover?.(null)}
      >
        <Image
          src={character.portraitImage}
          alt={character.name}
          width={200}
          height={200}
          className="w-full h-auto transition-all duration-200 group-hover:brightness-110"
          style={{ imageRendering: 'pixelated' }}
        />
      </motion.div>
    </Link>
  );
}
