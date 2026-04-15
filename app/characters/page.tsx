"use client";
import CharacterModal from "@/components/CharacterModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Character } from "@/types/character";
import { characters } from "@/data/characters";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";

const IconGrid3D = dynamic(() => import("@/components/IconGrid3D"), {
  ssr: false,
});

const CharacterName3D = dynamic(() => import("@/components/CharacterName3D"), {
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

  // Prefetch all stage webps (image) + artwork videos after mount
  useEffect(() => {
    characters.forEach((c) => {
      const stageWebp = c.stageImage
        .replace("/stages/webm/", "/stages/webp/")
        .replace(".webm", ".webp");

      const stageLink = document.createElement("link");
      stageLink.rel = "prefetch";
      stageLink.as = "image";
      stageLink.href = stageWebp;
      document.head.appendChild(stageLink);

      const artworkLink = document.createElement("link");
      artworkLink.rel = "prefetch";
      artworkLink.as = "video";
      artworkLink.href = c.artworkImage;
      document.head.appendChild(artworkLink);
    });
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      <Image
        src="/bg.png"
        alt="character select background"
        fill={true}
        unoptimized
        className="[image-rendering:pixelated] -z-21"
      />
      <AnimatePresence>
        {portraitChar && (
          <motion.div
            key={portraitChar.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 -z-20"
          >
            <img
              src={portraitChar.stageImage
                .replace("/stages/webm/", "/stages/webp/")
                .replace(".webm", ".webp")}
              alt=""
              className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-80 saturate-80 blur-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-[45%] -translate-y-1/2 left-[4%] w-[50%] h-[65%] flex items-center justify-center">
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
                alt={`${portraitChar.name} idle animation`}
                src={portraitChar.artworkImage}
                className="w-full h-full object-contain object-center [image-rendering:pixelated]"
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

      {/* 3D character name — left side */}
      <div className="absolute bottom-8 z-10 left-8 w-180 h-40">
        <CharacterName3D character={portraitChar} />
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
