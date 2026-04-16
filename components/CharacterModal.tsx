"use client";
import { Character } from "@/types/character";
import TiltCard from "@/components/TiltCard";

interface CharacterModalProps {
  character: Character;
  onClose: () => void;
}

export default function CharacterModal({
  character,
  onClose,
}: CharacterModalProps) {
  return (
    <div className="fixed inset-0 overflow-y-auto z-10">
      <video
        src={character.stageImage}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover brightness-30 contrast-80 saturate-70 blur-xs -z-10"
      />
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="">
            <button
              onClick={onClose}
              className="text-sm tracking-widest uppercase cursor-pointer text-accent"
            >
              ← Back to Roster
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex relative w-full justify-center h-[66dvh] overflow-visible ">
              <TiltCard
                imageSrc={character.artworkImage}
                alt={`${character.name} artwork`}
                className="w-100 h-full cursor-crosshair"
              />
            </div>

            <div className="flex items-center justify-center text-center gap-3 mx-8 font-orbitron">
              <div>
                <h1 className="text-6xl font-bold tracking-wide uppercase text-text-primary">
                  {character.name}
                </h1>
                <dl className="mt-1 space-y-0.5 text-md">
                  <div className="flex gap-2">
                    <dt className="text-accent">Origin</dt>
                    <dd className="text-text-primary">
                      {character.nationality}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-accent">Style</dt>
                    <dd className="text-text-primary">
                      {character.fightingStyle}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
