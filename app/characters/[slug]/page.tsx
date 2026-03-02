import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { characters, getCharacterBySlug } from '@/data/characters';
import MoveTable from '@/components/MoveTable';

export async function generateStaticParams() {
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = getCharacterBySlug(slug);
  if (!character) return {};
  return {
    title: `${character.name} — Third Strike Gallery`,
    description: character.bio.slice(0, 150),
  };
}

export default async function CharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = getCharacterBySlug(slug);
  if (!character) notFound();

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <Link
          href="/characters"
          className="inline-block mb-6 text-sm tracking-widest uppercase"
          style={{ color: 'var(--accent)' }}
        >
          ← Back to Roster
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
          {/* Left column: artwork + identity */}
          <div className="flex flex-col gap-4">
            <div
              className="relative w-full h-110 rounded overflow-hidden"
            // style={{ aspectRatio: '1/1', borderColor: 'var(--border)' }}
            >
              <Image
                src={character.artworkImage}
                alt={`${character.name} artwork`}
                fill
                className="object-cover object-top"
                style={{ imageRendering: 'pixelated' }}
                sizes="280px"
                priority
              />
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-wide uppercase"
                style={{ color: 'var(--text-primary)' }}
              >
                {character.name}
              </h1>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt style={{ color: 'var(--text-secondary)' }}>Origin</dt>
                  <dd style={{ color: 'var(--text-primary)' }}>{character.nationality}</dd>
                </div>
                <div className="flex gap-2">
                  <dt style={{ color: 'var(--text-secondary)' }}>Style</dt>
                  <dd style={{ color: 'var(--text-primary)' }}>{character.fightingStyle}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right column: bio + moves */}
          <div className="flex flex-col gap-8">
            <section>
              <h2
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: 'var(--accent)' }}
              >
                Bio
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {character.bio}
              </p>
            </section>

            <section>
              <h2
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: 'var(--accent)' }}
              >
                Move List
              </h2>
              <MoveTable moves={character.moves} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
