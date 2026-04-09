# Agents

## Commands

```bash
pnpm dev      # Start dev server (http://localhost:3000)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # ESLint only
```

Use `pnpm`, not npm/yarn (pnpm-lock.yaml is the lockfile).

## Architecture

- **Next.js App Router** (page.tsx files in `app/`)
- Home page (`app/page.tsx`) redirects to `/characters`
- `/characters` — 3D character select grid (React Three Fiber, client component, dynamic import with `ssr: false`)
- `/characters/[slug]` — Static-generated character detail pages (SSG via `generateStaticParams`)
- Character data: `data/characters.ts` (array + `getCharacterBySlug` helper), types in `types/character.ts`

## Tech Stack

- **Tailwind CSS v4** (`@tailwindcss/postcss` in postcss.config.mjs, no tailwind.config.js)
- **React Three Fiber** ecosystem (`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`)
- **motion/react** for UI animations
- **sharp** for image processing in build scripts

## Key Patterns

- `"use client"` required for all components using hooks or browser APIs
- `next/image` with pixel-art assets: always add `unoptimized` and `[image-rendering:pixelated]`
- Three.js canvas: wrap in `next/dynamic` with `ssr: false` at the page level
- Leva (`leva` in devDependencies) is available for debugging Three.js scenes — uncomment the `useControls` block in `IconGrid3D.tsx`

## One-off Scripts

```bash
npx tsx scripts/trace-icon-shape.ts
```
Traces a PNG's alpha contour using sharp and writes `data/iconShapeContour.ts`. Input/output paths are hardcoded in the script.

## Type Checking

No separate typecheck script — ESLint handles TypeScript via `eslint-config-next/typescript`. Run `pnpm lint` to check.

## Gotchas

- `app/globals.css` uses `@import "tailwindcss"` (v4 syntax), not the old `@tailwind base/components/utilities` directives
- `--font-char` CSS variable is set via `Orbitron` Google Font in `app/characters/page.tsx` — imported from `next/font/google`
- The `data/iconShapeContour.ts` file is auto-generated; do not edit manually
- No test framework is configured
