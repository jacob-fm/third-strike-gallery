"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "@/types/character";

export interface IconTileControls {
  extrudeDepth: number;
  tileColor: string;
  metalness: number;
  roughness: number;
  gridScale: number;
  baseRotationY: number;
}

/** Tile dimensions in screen pixels (before gridScale) */
const CARD_W_PX = 150;
const CARD_H_PX = 89;

export interface SharedTileGeometries {
  oval: THREE.BufferGeometry;
  front: THREE.BufferGeometry;
  back: THREE.BufferGeometry;
}

/** Build the three shared geometries once for a given set of tile dimensions. */
export function buildSharedTileGeometries(
  tileW: number,
  tileH: number,
  extrudeDepth: number,
): SharedTileGeometries {
  const bevelThickness = extrudeDepth * 0.1;

  const makeShape = (pts: number) => {
    const shape = new THREE.Shape();
    const curve = new THREE.EllipseCurve(0, 0, tileW / 2, tileH / 2, 0, Math.PI * 2, false, 0);
    shape.setFromPoints(curve.getPoints(pts));
    return shape;
  };

  const ovalGeo = new THREE.ExtrudeGeometry(makeShape(48), {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelThickness,
    bevelSize: extrudeDepth * 0.15,
    bevelSegments: 6,
  });
  ovalGeo.translate(0, 0, -extrudeDepth / 2);

  const makeFaceGeo = (mirrorU: boolean) => {
    const geo = new THREE.ShapeGeometry(makeShape(32));
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      const u = (uv.getX(i) + tileW / 2) / tileW;
      uv.setX(i, mirrorU ? 1 - u : u);
      uv.setY(i, (uv.getY(i) + tileH / 2) / tileH);
    }
    uv.needsUpdate = true;
    return geo;
  };

  return { oval: ovalGeo, front: makeFaceGeo(false), back: makeFaceGeo(true) };
}

interface IconTileProps {
  character: Character;
  position: [number, number, number];
  controls: IconTileControls;
  geometries: SharedTileGeometries;
  onHover: (c: Character | null) => void;
  onSelect: (c: Character) => void;
  onMeshHover: (mesh: THREE.Mesh | null) => void;
}

export default function IconTile({
  character,
  position,
  controls,
  geometries,
  onHover,
  onSelect,
  onMeshHover,
}: IconTileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ovalMeshRef = useRef<THREE.Mesh>(null);
  const isHoveredRef = useRef(false);
  const spinSpeedRef = useRef(0);
  const rotYRef = useRef(controls.baseRotationY);
  const settledRef = useRef(false);

  const { extrudeDepth, tileColor, metalness, roughness, gridScale, baseRotationY } = controls;
  const bevelThickness = extrudeDepth * 0.1;
  const { oval: ovalGeometry, front: frontGeometry, back: backGeometry } = geometries;

  const texture = useTexture(character.iconImage, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Skip entirely when tile is settled at rest and not being interacted with
    if (settledRef.current && !isHoveredRef.current) return;

    const targetSpeed = isHoveredRef.current ? 1.2 : 0;
    const speedLerp = isHoveredRef.current ? 0.06 : 0.18;
    spinSpeedRef.current = THREE.MathUtils.lerp(
      spinSpeedRef.current,
      targetSpeed,
      speedLerp,
    );

    if (isHoveredRef.current || Math.abs(spinSpeedRef.current) > 0.01) {
      settledRef.current = false;
      rotYRef.current += spinSpeedRef.current * delta;
      groupRef.current.rotation.y = rotYRef.current;
    } else {
      // Two valid rest orientations:
      //   front: baseRotationY + n*2π
      //   back:  (π + baseRotationY) + n*2π  ← same offset magnitude, UV flip handles the mirror
      const TWO_PI = Math.PI * 2;
      const backRestY = Math.PI + baseRotationY;
      const nFront = Math.round((rotYRef.current - baseRotationY) / TWO_PI);
      const nBack = Math.round((rotYRef.current - backRestY) / TWO_PI);
      const frontTarget = baseRotationY + nFront * TWO_PI;
      const backTarget = backRestY + nBack * TWO_PI;
      const snapTarget =
        Math.abs(rotYRef.current - frontTarget) <=
        Math.abs(rotYRef.current - backTarget)
          ? frontTarget
          : backTarget;
      const next = THREE.MathUtils.lerp(groupRef.current.rotation.y, snapTarget, 0.08);
      groupRef.current.rotation.y = next;
      rotYRef.current = next;
      if (Math.abs(next - snapTarget) < 0.0005) {
        groupRef.current.rotation.y = snapTarget;
        rotYRef.current = snapTarget;
        settledRef.current = true;
      }
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        isHoveredRef.current = true;
        settledRef.current = false;
        onHover(character);
        onMeshHover(ovalMeshRef.current);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        isHoveredRef.current = false;
        onHover(null);
        onMeshHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(character);
      }}
    >
      {/* Static invisible hit area — always at resting orientation so hover
          zone doesn't shrink when the icon is spinning edge-on */}
      <mesh geometry={frontGeometry} rotation={[0, baseRotationY, 0]}>
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Spinning visual group — all meshes opt out of raycasting */}
      <group ref={groupRef}>
        <mesh ref={ovalMeshRef} geometry={ovalGeometry} raycast={() => {}}>
          <meshStandardMaterial
            color={tileColor}
            metalness={metalness}
            roughness={roughness}
          />
        </mesh>

        <mesh
          geometry={frontGeometry}
          position={[0, 0, extrudeDepth / 2 + bevelThickness + 0.001]}
          raycast={() => {}}
        >
          <meshBasicMaterial map={texture} transparent />
        </mesh>

        <mesh
          geometry={backGeometry}
          position={[0, 0, -extrudeDepth / 2 - bevelThickness - 0.001]}
          raycast={() => {}}
        >
          <meshBasicMaterial map={texture} transparent side={THREE.BackSide} />
        </mesh>
      </group>
    </group>
  );
}
