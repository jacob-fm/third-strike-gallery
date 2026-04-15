"use client";
import { Character } from "@/types/character";
import MoveTable from "@/components/MoveTable";
import SlantedTabs from "@/components/SlantedTabs";
import TiltCard from "@/components/TiltCard";
import { useState } from "react";

type Pane = "bio" | "supers" | "specials";

interface CharacterModalProps {
  character: Character;
  onClose: () => void;
}

const paneTabs: { value: Pane; label: string }[] = [
  { value: "bio", label: "Bio" },
  { value: "supers", label: "Super Arts" },
  { value: "specials", label: "Special Moves" },
];

function CharacterBio({ bio }: { bio: Character["bio"] }) {
  return (
    <section>
      <h2 className="text-xs font-bold tracking-widest uppercase mb-3 text-accent">
        Bio
      </h2>
      <p className="text-sm leading-relaxed text-text-secondary">{bio}</p>
    </section>
  );
}

export default function CharacterModal({
  character,
  onClose,
}: CharacterModalProps) {
  const [activePane, setActivePane] = useState<Pane | null>("bio");
  return (
    <div className="fixed inset-0 overflow-y-auto z-10">
      <video
        src={character.stageImage}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover brightness-50 contrast-80 saturate-70 blur-sm -z-10"
      />
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <button
              onClick={onClose}
              className="text-sm tracking-widest uppercase cursor-pointer text-accent"
            >
              ← Back to Roster
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-14">
            {/* Left column: bio + moves */}
            <div className="flex flex-col gap-8">
              <SlantedTabs
                tabs={paneTabs}
                activeTab={activePane ?? "bio"}
                onTabChange={setActivePane}
              />
              {activePane === "bio" && <CharacterBio bio={character.bio} />}
              {activePane === "supers" && (
                <MoveTable moves={character.moves} category="super" />
              )}
              {activePane === "specials" && (
                <MoveTable moves={character.moves} category="special" />
              )}
            </div>

            {/* Right column: artwork + identity */}
            <div className="flex flex-col gap-4 ">
              <div className="relative w-130 aspect-square overflow-visible">
                <TiltCard
                  imageSrc={character.artworkImage}
                  alt={`${character.name} artwork`}
                  className="w-full h-full"
                />
              </div>

              <div className="flex items-center gap-3 mx-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-wide uppercase text-text-primary">
                    {character.name}
                  </h1>
                  <dl className="mt-1 space-y-0.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-text-secondary">Origin</dt>
                      <dd className="text-text-primary">
                        {character.nationality}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-text-secondary">Style</dt>
                      <dd className="text-text-primary">
                        {character.fightingStyle}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
