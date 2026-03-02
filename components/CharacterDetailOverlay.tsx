'use client';

import { createContext, useContext, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { characters } from '@/data/characters';

const ExitContext = createContext<() => void>(() => {});
export const useCharacterExit = () => useContext(ExitContext);

export function CharacterDetailOverlay({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();
  const router = useRouter();

  useEffect(() => {
    controls.start({ x: 0, transition: { duration: 0.3, ease: 'easeInOut' } });
  }, [controls]);

  function exit() {
    controls
      .start({ x: '100%', transition: { duration: 0.3, ease: 'easeInOut' } })
      .then(() => router.push('/characters'));
  }

  return (
    <ExitContext.Provider value={exit}>
      <div className="min-h-screen px-6 py-10" style={{ background: 'var(--bg)' }}>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 max-w-5xl mx-auto mt-16">
          {characters.map((c) => (
            <Image
              key={c.slug}
              src={c.portraitImage}
              alt={c.name}
              width={200}
              height={200}
              className="w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          ))}
        </div>
      </div>
      <motion.div
        className="fixed inset-0 overflow-y-auto"
        style={{ background: 'var(--bg)', zIndex: 10 }}
        initial={{ x: '100%' }}
        animate={controls}
      >
        {children}
      </motion.div>
    </ExitContext.Provider>
  );
}
