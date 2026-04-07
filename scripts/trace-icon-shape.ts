/**
 * Traces the outer alpha contour of a reference icon PNG and outputs
 * axis-aligned pixel-edge coordinates as a TypeScript data file.
 *
 * Algorithm: collect all boundary edges between opaque and transparent
 * pixels, then chain them into a closed polygon. Each edge is between
 * two pixel-corner vertices, producing axis-aligned segments that
 * preserve hard pixel staircase edges.
 *
 * Usage: npx tsx scripts/trace-icon-shape.ts
 */

import sharp from "sharp";
import { writeFileSync } from "fs";
import { resolve } from "path";

const INPUT = resolve(__dirname, "../public/characters/icons/ryu.png");
const OUTPUT = resolve(__dirname, "../data/iconShapeContour.ts");

async function main() {
  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;

  const filled = (x: number, y: number): boolean => {
    if (x < 0 || x >= W || y < 0 || y >= H) return false;
    return data[(y * W + x) * 4 + 3] >= 128;
  };

  // Collect all boundary edges.
  // Pixel corners use coords (0..W, 0..H). Pixel (px,py) has corners:
  //   TL=(px,py), TR=(px+1,py), BR=(px+1,py+1), BL=(px,py+1)
  //
  // For each opaque pixel, check its 4 neighbors. If the neighbor is
  // transparent (or out of bounds), there's a boundary edge on that side.
  // Edges are directed clockwise around the opaque region.

  type Edge = { x1: number; y1: number; x2: number; y2: number };
  const edges: Edge[] = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!filled(x, y)) continue;

      // Top edge: if pixel above is empty, edge from (x,y) → (x+1,y)
      if (!filled(x, y - 1)) edges.push({ x1: x, y1: y, x2: x + 1, y2: y });
      // Right edge: (x+1,y) → (x+1,y+1)
      if (!filled(x + 1, y))
        edges.push({ x1: x + 1, y1: y, x2: x + 1, y2: y + 1 });
      // Bottom edge: (x+1,y+1) → (x,y+1)
      if (!filled(x, y + 1))
        edges.push({ x1: x + 1, y1: y + 1, x2: x, y2: y + 1 });
      // Left edge: (x,y+1) → (x,y)
      if (!filled(x - 1, y)) edges.push({ x1: x, y1: y + 1, x2: x, y2: y });
    }
  }

  console.log(`Collected ${edges.length} boundary edges`);

  // Build adjacency: for each vertex, list outgoing edges
  const key = (x: number, y: number) => `${x},${y}`;
  const adj = new Map<string, Edge[]>();

  for (const e of edges) {
    const k = key(e.x1, e.y1);
    if (!adj.has(k)) adj.set(k, []);
    adj.get(k)!.push(e);
  }

  // Chain edges into the outer contour starting from the topmost-leftmost edge
  // (which is guaranteed to be on the outer boundary)
  const startEdge = edges.reduce((best, e) => {
    if (e.y1 < best.y1 || (e.y1 === best.y1 && e.x1 < best.x1)) return e;
    return best;
  });

  const contour: [number, number][] = [];
  const usedEdges = new Set<Edge>();

  let current = startEdge;
  do {
    contour.push([current.x1, current.y1]);
    usedEdges.add(current);

    // Find next edge: starts where this one ends
    const nextKey = key(current.x2, current.y2);

    // Check if we've completed the loop (next vertex is start of start edge)
    if (current.x2 === startEdge.x1 && current.y2 === startEdge.y1) {
      break;
    }

    const candidates = adj.get(nextKey);
    if (!candidates) throw new Error(`No edges from ${nextKey}`);

    const inDx = current.x2 - current.x1;
    const inDy = current.y2 - current.y1;

    // Pick the rightmost turn. For axis-aligned edges, direction is one of
    // 4 cardinals. Encode as: right=0, down=1, left=2, up=3.
    // For the outer contour, prefer: right turn (priority 0), straight (1),
    // left turn (2), U-turn (3).
    const dirIndex = (dx: number, dy: number): number => {
      if (dx === 1) return 0;
      if (dy === 1) return 1;
      if (dx === -1) return 2;
      return 3; // dy === -1
    };

    const inDir = dirIndex(inDx, inDy);

    // Turn priority: right=0, straight=1, left=2, uturn=3
    const turnPriority = (outDir: number): number => {
      const diff = ((outDir - inDir) % 4 + 4) % 4;
      // diff: 0=straight, 1=right turn (CW), 2=u-turn, 3=left turn (CCW)
      // For outer contour, prefer right turn first
      if (diff === 1) return 0; // right turn
      if (diff === 0) return 1; // straight
      if (diff === 3) return 2; // left turn
      return 3; // u-turn
    };

    let bestEdge: Edge | null = null;
    let bestPriority = Infinity;

    for (const cand of candidates) {
      if (usedEdges.has(cand)) continue;
      const outDx = cand.x2 - cand.x1;
      const outDy = cand.y2 - cand.y1;
      const outDir = dirIndex(outDx, outDy);
      const p = turnPriority(outDir);
      if (p < bestPriority) {
        bestPriority = p;
        bestEdge = cand;
      }
    }

    if (!bestEdge) throw new Error(`Dead end at ${nextKey}`);
    current = bestEdge;
  // eslint-disable-next-line no-constant-condition
  } while (true);

  // Simplify: remove colinear points
  const simplified: [number, number][] = [];
  const N = contour.length;
  for (let i = 0; i < N; i++) {
    const prev = contour[(i - 1 + N) % N];
    const curr = contour[i];
    const next = contour[(i + 1) % N];

    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];

    if (dx1 !== dx2 || dy1 !== dy2) {
      simplified.push(curr);
    }
  }

  console.log(
    `Traced contour: ${contour.length} raw → ${simplified.length} simplified points for ${W}×${H} image`,
  );

  // Write output
  const lines = [
    "// Auto-generated by scripts/trace-icon-shape.ts — do not edit",
    `export const ICON_W = ${W};`,
    `export const ICON_H = ${H};`,
    "",
    "export const ICON_CONTOUR: [number, number][] = [",
    ...simplified.map(([x, y]) => `  [${x}, ${y}],`),
    "];",
    "",
  ];

  writeFileSync(OUTPUT, lines.join("\n"));
  console.log(`Written to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
