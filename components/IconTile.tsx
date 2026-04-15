"use client";

import { useRef, useMemo } from "react";
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

interface IconTileProps {
  character: Character;
  position: [number, number, number];
  controls: IconTileControls;
  onHover: (c: Character | null) => void;
  onSelect: (c: Character) => void;
  onMeshHover: (mesh: THREE.Mesh | null) => void;
}

export default function IconTile({
  character,
  position,
  controls,
  onHover,
  onSelect,
  onMeshHover,
}: IconTileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ovalMeshRef = useRef<THREE.Mesh>(null);
  const isHoveredRef = useRef(false);
  const spinSpeedRef = useRef(0);
  const rotYRef = useRef(controls.baseRotationY);

  const {
    extrudeDepth,
    tileColor,
    metalness,
    roughness,
    gridScale,
    baseRotationY,
  } = controls;

  const tileW = CARD_W_PX * gridScale;
  const tileH = CARD_H_PX * gridScale;

  // Oval extruded body
  const ovalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const curve = new THREE.EllipseCurve(
      0,
      0,
      tileW / 2,
      tileH / 2,
      0,
      Math.PI * 2,
      false,
      0,
    );
    shape.setFromPoints(curve.getPoints(64));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: extrudeDepth,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -extrudeDepth / 2); // center pivot in Z
    return geo;
  }, [tileW, tileH, extrudeDepth]);

  // Front face: flat oval with UVs mapped 0..1
  const frontGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const curve = new THREE.EllipseCurve(
      0,
      0,
      tileW / 2,
      tileH / 2,
      0,
      Math.PI * 2,
      false,
      0,
    );
    shape.setFromPoints(curve.getPoints(64));
    const geo = new THREE.ShapeGeometry(shape);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setX(i, (uv.getX(i) + tileW / 2) / tileW);
      uv.setY(i, (uv.getY(i) + tileH / 2) / tileH);
    }
    uv.needsUpdate = true;
    return geo;
  }, [tileW, tileH]);

  // Back face: same oval with U mirrored so icon reads correctly when spinning
  const backGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const curve = new THREE.EllipseCurve(
      0,
      0,
      tileW / 2,
      tileH / 2,
      0,
      Math.PI * 2,
      false,
      0,
    );
    shape.setFromPoints(curve.getPoints(64));
    const geo = new THREE.ShapeGeometry(shape);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setX(i, 1 - (uv.getX(i) + tileW / 2) / tileW);
      uv.setY(i, (uv.getY(i) + tileH / 2) / tileH);
    }
    uv.needsUpdate = true;
    return geo;
  }, [tileW, tileH]);

  const texture = useTexture(character.iconImage, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const targetSpeed = isHoveredRef.current ? 0.2 : 0;
    const speedLerp = isHoveredRef.current ? 0.06 : 0.18;
    spinSpeedRef.current = THREE.MathUtils.lerp(
      spinSpeedRef.current,
      targetSpeed,
      speedLerp,
    );

    if (isHoveredRef.current || Math.abs(spinSpeedRef.current) > 0.01) {
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
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        snapTarget,
        0.08,
      );
      rotYRef.current = groupRef.current.rotation.y;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        isHoveredRef.current = true;
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
          position={[0, 0, extrudeDepth / 2 + 0.001]}
          raycast={() => {}}
        >
          <meshBasicMaterial map={texture} transparent />
        </mesh>

        <mesh
          geometry={backGeometry}
          position={[0, 0, -extrudeDepth / 2 - 0.001]}
          raycast={() => {}}
        >
          <meshBasicMaterial map={texture} transparent side={THREE.BackSide} />
        </mesh>
      </group>
    </group>
  );
}
