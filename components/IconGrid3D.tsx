"use client";

import { Suspense, useCallback, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import { getCharacterBySlug } from "@/data/characters";
import { Character } from "@/types/character";
import IconTile, { type IconTileControls } from "./IconTile";

// ── Cursor tracker ──────────────────────────────────────────────────
// Projects the pointer onto a z=0 plane every frame so all tiles can
// read the cursor's world-space position from a single shared ref.

const Z_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _intersection = new THREE.Vector3();

function CursorTracker({
  cursorWorldRef,
  isOverRef,
}: {
  cursorWorldRef: React.MutableRefObject<THREE.Vector3 | null>;
  isOverRef: React.RefObject<boolean>;
}) {
  useFrame((state) => {
    if (!isOverRef.current) {
      cursorWorldRef.current = null;
      return;
    }
    state.raycaster.setFromCamera(state.pointer, state.camera);
    if (state.raycaster.ray.intersectPlane(Z_PLANE, _intersection)) {
      if (!cursorWorldRef.current) {
        cursorWorldRef.current = _intersection.clone();
      } else {
        cursorWorldRef.current.copy(_intersection);
      }
    }
  });

  return null;
}

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
): { slug: string; position: [number, number, number] }[] {
  const tileW = CARD_W_PX * scale;
  const tileH = CARD_H_PX * scale;
  const items: { slug: string; position: [number, number, number] }[] = [];

  for (let rowIdx = 0; rowIdx < gridRows.length; rowIdx++) {
    const row = gridRows[rowIdx];
    const rowOffset = (rowOffsets[rowIdx] ?? 0) * scale;

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      // X: center the row around 0, apply cascade offset + column nudge
      const baseX = (colIdx - (row.length - 1) / 2) * tileW + rowOffset;
      const colXNudge =
        colIdx === 0 ? 10 * scale : colIdx === 2 ? -12 * scale : 0;

      // Y: rows go downward (negative Y), apply column Y nudge
      const baseY = -rowIdx * tileH;
      const colYNudge = colIdx === 0 || colIdx === 2 ? -22 * scale : 0;

      items.push({
        slug: row[colIdx],
        position: [baseX + colXNudge, baseY + colYNudge, 0],
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
  const cursorWorldRef = useRef<THREE.Vector3 | null>(null);
  const isOverRef = useRef(false);

  const controls = useControls("Icon Grid", {
    maxTilt: { value: 0.3, min: 0, max: 1.0, step: 0.01 },
    tiltScale: { value: 0.15, min: 0, max: 0.5, step: 0.01 },
    lerpSpeed: { value: 0.08, min: 0.01, max: 0.3, step: 0.01 },
    extrudeDepth: { value: 0.25, min: 0.01, max: 0.3, step: 0.01 },
    tileColor: "#1a1a1a",
    glowColor: "#36aed0",
    glowIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
    metalness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0.4, min: 0, max: 1, step: 0.01 },
    cameraZ: { value: 6, min: 2, max: 15, step: 0.1 },
    fov: { value: 62, min: 10, max: 90, step: 1 },
    ambientLight: { value: 1.0, min: 0, max: 3, step: 0.1 },
    dirLight: { value: 0.5, min: 0, max: 3, step: 0.1 },
    gridScale: { value: 0.01, min: 0.005, max: 0.02, step: 0.001 },
  });

  const tileControls: IconTileControls = controls;

  // Precompute grid positions
  const items = useMemo(
    () => computePositions(gridRows, rowOffsets, controls.gridScale),
    [gridRows, rowOffsets, controls.gridScale],
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

  const handlePointerEnter = useCallback(() => {
    isOverRef.current = true;
  }, []);

  const handlePointerLeave = useCallback(() => {
    isOverRef.current = false;
    cursorWorldRef.current = null;
    onHover(null);
  }, [onHover]);

  return (
    <div
      className="w-full h-full"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas gl={{ alpha: true }} style={{ overflow: "visible" }}>
        <CameraController
          target={center}
          cameraZ={controls.cameraZ}
          fov={controls.fov}
        />
        <CursorTracker cursorWorldRef={cursorWorldRef} isOverRef={isOverRef} />
        <ambientLight intensity={controls.ambientLight} />
        <directionalLight position={[0, 2, 10]} intensity={controls.dirLight} />
        <Suspense fallback={null}>
          {tiles.map(({ character, position }) => (
            <IconTile
              key={character.slug}
              character={character}
              position={position}
              cursorWorldRef={cursorWorldRef}
              controls={tileControls}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
