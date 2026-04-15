"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Outline } from "@react-three/postprocessing";
// import { useControls } from "leva";
import * as THREE from "three";
import { getCharacterBySlug } from "@/data/characters";
import { Character } from "@/types/character";
import IconTile, { type IconTileControls } from "./IconTile";

// ── Camera controller ───────────────────────────────────────────────

function CameraController({
  target,
  cameraZ,
  fov,
}: {
  target: [number, number, number];
  cameraZ: number;
  fov: number;
}) {
  useFrame((state) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.x = target[0];
    cam.position.y = target[1];
    cam.position.z = cameraZ;
    cam.fov = fov;
    cam.updateProjectionMatrix();
  });

  return null;
}

// ── Grid position helpers ───────────────────────────────────────────

const CARD_W_PX = 150;
const CARD_H_PX = 89;

function computePositions(
  gridRows: string[][],
  rowOffsets: number[],
  scale: number,
  colGap: number,
  rowGap: number,
  lastRowOffsetX: number,
  lastRowOffsetY: number,
): { slug: string; position: [number, number, number] }[] {
  const colStep = (CARD_W_PX + colGap) * scale;
  const rowStep = (CARD_H_PX + rowGap) * scale;
  const items: { slug: string; position: [number, number, number] }[] = [];

  for (let rowIdx = 0; rowIdx < gridRows.length; rowIdx++) {
    const row = gridRows[rowIdx];
    const rowOffset = (rowOffsets[rowIdx] ?? 0) * scale;
    const isLastRow = rowIdx === gridRows.length - 1;

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      // X: center the row around 0, apply cascade offset + column nudge
      const baseX = (colIdx - (row.length - 1) / 2) * colStep + rowOffset;
      const colXNudge =
        colIdx === 0 ? 10 * scale : colIdx === 2 ? -12 * scale : 0;

      // Y: rows go downward (negative Y), apply column Y nudge
      const baseY = -rowIdx * rowStep;
      const colYNudge = colIdx === 0 || colIdx === 2 ? -22 * scale : 0;

      const lastRowNudgeX = isLastRow ? lastRowOffsetX * scale : 0;
      const lastRowNudgeY = isLastRow ? lastRowOffsetY * scale : 0;

      items.push({
        slug: row[colIdx],
        position: [
          baseX + colXNudge + lastRowNudgeX,
          baseY + colYNudge + lastRowNudgeY,
          0,
        ],
      });
    }
  }

  return items;
}

function computeCenter(
  positions: { position: [number, number, number] }[],
): [number, number, number] {
  let sx = 0,
    sy = 0;
  for (const p of positions) {
    sx += p.position[0];
    sy += p.position[1];
  }
  const n = positions.length;
  return [sx / n, sy / n, 0];
}

// ── Main component ──────────────────────────────────────────────────

interface IconGrid3DProps {
  gridRows: string[][];
  rowOffsets: number[];
  onHover: (c: Character | null) => void;
  onSelect: (c: Character) => void;
}

export default function IconGrid3D({
  gridRows,
  rowOffsets,
  onHover,
  onSelect,
}: IconGrid3DProps) {
  // const controls = useControls("Icon Grid", {
  //   extrudeDepth: { value: 0.25, min: 0.01, max: 0.6, step: 0.01 },
  //   tileColor: "#aaaaaa",
  //   glowColor: "#41d6ff",
  //   glowIntensity: { value: 5.0, min: 0, max: 20, step: 0.1 },
  //   metalness: { value: 0.5, min: 0, max: 1, step: 0.01 },
  //   roughness: { value: 0.4, min: 0, max: 1, step: 0.01 },
  //   cameraZ: { value: 8, min: 2, max: 30, step: 0.1 },
  //   fov: { value: 50, min: 10, max: 90, step: 1 },
  //   ambientLight: { value: 1.0, min: 0, max: 3, step: 0.1 },
  //   dirLight: { value: 0.5, min: 0, max: 3, step: 0.1 },
  //   gridScale: { value: 0.01, min: 0.005, max: 0.02, step: 0.001 },
  //   colGap: { value: 15, min: -50, max: 150, step: 1 },
  //   rowGap: { value: 4, min: -50, max: 150, step: 1 },
  //   lastRowOffsetX: { value: -21, min: -200, max: 200, step: 1 },
  //   lastRowOffsetY: { value: 15, min: -200, max: 200, step: 1 },
  //   baseRotationY: { value: -0.15, min: -1, max: 1, step: 0.01 },
  // });

  const controls = useMemo(
    () => ({
      extrudeDepth: 0.25,
      tileColor: "#000000",
      metalness: 0.5,
      roughness: 0.4,
      cameraZ: 8,
      fov: 50,
      ambientLight: 1.0,
      dirLight: 0.8,
      gridScale: 0.01,
      colGap: 15,
      rowGap: 4,
      lastRowOffsetX: -21,
      lastRowOffsetY: 15,
      baseRotationY: -0.15,
    }),
    [],
  );

  const tileControls: IconTileControls = controls;

  // Precompute grid positions
  const items = useMemo(
    () =>
      computePositions(
        gridRows,
        rowOffsets,
        controls.gridScale,
        controls.colGap,
        controls.rowGap,
        controls.lastRowOffsetX,
        controls.lastRowOffsetY,
      ),
    [
      gridRows,
      rowOffsets,
      controls.gridScale,
      controls.colGap,
      controls.rowGap,
      controls.lastRowOffsetX,
      controls.lastRowOffsetY,
    ],
  );

  const center = useMemo(() => computeCenter(items), [items]);

  // Resolve characters once
  const tiles = useMemo(
    () =>
      items
        .map((item) => ({
          character: getCharacterBySlug(item.slug),
          position: item.position,
        }))
        .filter(
          (
            t,
          ): t is {
            character: Character;
            position: [number, number, number];
          } => t.character !== undefined,
        ),
    [items],
  );

  const [hoveredMesh, setHoveredMesh] = useState<THREE.Mesh | null>(null);

  const handlePointerLeave = useCallback(() => {
    setHoveredMesh(null);
    onHover(null);
  }, [onHover]);

  return (
    <div className="w-full h-full" onPointerLeave={handlePointerLeave}>
      <Canvas
        gl={{ alpha: true, toneMapping: THREE.NoToneMapping }}
        style={{ overflow: "visible" }}
      >
        <CameraController
          target={center}
          cameraZ={controls.cameraZ}
          fov={controls.fov}
        />
        <ambientLight intensity={controls.ambientLight} />
        <directionalLight position={[0, 2, 10]} intensity={controls.dirLight} />
        <Suspense fallback={null}>
          {tiles.map(({ character, position }) => (
            <IconTile
              key={character.slug}
              character={character}
              position={position}
              controls={tileControls}
              onHover={onHover}
              onSelect={onSelect}
              onMeshHover={setHoveredMesh}
            />
          ))}
        </Suspense>
        <EffectComposer autoClear={false}>
          <Outline
            selection={hoveredMesh ? [hoveredMesh] : []}
            edgeStrength={10}
            pulseSpeed={0}
            visibleEdgeColor={0xffffff}
            hiddenEdgeColor={0xffffff}
            blur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
