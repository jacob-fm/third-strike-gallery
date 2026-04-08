"use client";
import CharacterModal from "@/components/CharacterModal";
import Image from "next/image";
import { useState } from "react";
import { Character } from "@/types/character";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

const IconGrid3D = dynamic(() => import("@/components/IconGrid3D"), {
  ssr: false,
});

// Character grid rows in original game order
const GRID_ROWS = [
  ["akuma", "yun", "ryu"],
  ["urien", "remy", "oro"],
  ["necro", "q", "dudley"],
  ["ibuki", "chun-li", "elena"],
  ["sean", "makoto", "hugo"],
  ["alex", "twelve", "ken"],
  ["yang"],
];

// Diagonal cascade: each row shifts 20px further left going down
const ROW_OFFSETS = [120, 100, 80, 60, 40, 20, 0];

export default function CharactersPage() {
  const [modalChar, setModalChar] = useState<Character | null>(null);
  const [hoveredChar, setHoveredChar] = useState<Character | null>(null);

  const portraitChar = hoveredChar;

  return (
    <main className="w-screen h-screen overflow-hidden bg-bg relative">
      {/* Large oval portrait — left side */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[4%] w-[50%] aspect-square flex items-center justify-center">
        <AnimatePresence>
          {portraitChar ? (
            <motion.div
              key={portraitChar.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full absolute inset-0"
            >
              <Image
                src={portraitChar.artworkImage}
                alt={portraitChar.name}
                fill
                unoptimized
                className="object-contain object-center [image-rendering:pixelated]"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* 3D character icon grid — right side */}
      <div className="absolute -top-4 right-10 w-200 h-full">
        <IconGrid3D
          gridRows={GRID_ROWS}
          rowOffsets={ROW_OFFSETS}
          onHover={setHoveredChar}
          onSelect={setModalChar}
        />
      </div>

      {/* Character name — bottom left */}
      <div className="absolute bottom-8 left-18 h-16">
        {portraitChar && (
          <h1
            key={portraitChar.slug}
            className="absolute bottom-0 left-0 text-7xl font-bold tracking-widest uppercase text-text-primary whitespace-nowrap"
          >
            {portraitChar.name}
          </h1>
        )}
      </div>

      {/* Character detail modal */}
      {modalChar && (
        <CharacterModal
          key={modalChar.slug}
          character={modalChar}
          onClose={() => setModalChar(null)}
        />
      )}
    </main>
  );
}
