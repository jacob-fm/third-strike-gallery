import { Move, MoveCategory } from '@/types/character';

const CATEGORY_LABELS: Record<MoveCategory, string> = {
  normal: 'Normal Moves',
  special: 'Special Moves',
  super: 'Super Arts',
};

function SuperArtLabel({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span
      className="ml-2 text-xs px-1.5 py-0.5 rounded font-bold tracking-widest uppercase"
      style={{ background: 'var(--accent)', color: '#fff' }}
    >
      SA{n}
    </span>
  );
}

function MovesSection({ title, moves, showSA }: { title: string; moves: Move[]; showSA: boolean }) {
  if (moves.length === 0) return null;
  return (
    <div className="mb-6">
      <h3
        className="text-xs font-bold tracking-widest uppercase mb-2 pb-1"
        style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}
      >
        {title}
      </h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ color: 'var(--text-secondary)' }}>
            <th className="text-left font-normal pb-1 pr-4 w-2/5">Move</th>
            <th className="text-left font-normal pb-1 pr-4 w-2/5">Input</th>
            <th className="text-left font-normal pb-1">Notes</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move, i) => (
            <tr
              key={i}
              className="border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <td className="py-1.5 pr-4" style={{ color: 'var(--text-primary)' }}>
                {move.name}
                {showSA && move.superArt && <SuperArtLabel n={move.superArt} />}
              </td>
              <td
                className="py-1.5 pr-4 font-mono text-xs"
                style={{ color: 'var(--accent-hover)' }}
              >
                {move.input}
              </td>
              <td className="py-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {move.description ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MoveTable({ moves }: { moves: Move[] }) {
  const grouped = moves.reduce<Record<MoveCategory, Move[]>>(
    (acc, move) => {
      acc[move.category].push(move);
      return acc;
    },
    { normal: [], special: [], super: [] }
  );

  return (
    <div>
      <MovesSection title={CATEGORY_LABELS.normal} moves={grouped.normal} showSA={false} />
      <MovesSection title={CATEGORY_LABELS.special} moves={grouped.special} showSA={false} />
      <MovesSection title={CATEGORY_LABELS.super} moves={grouped.super} showSA={true} />
    </div>
  );
}
