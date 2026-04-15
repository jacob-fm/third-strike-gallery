"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "@/types/character";

export interface IconTileControls {
  extrudeDepth: number;
  tileColor: string;
  glowColor: string;
  glowIntensity: number;
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
}

export default function IconTile({
  character,
  position,
  controls,
  onHover,
  onSelect,
}: IconTileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const isHoveredRef = useRef(false);
  const spinSpeedRef = useRef(0);
  const rotYRef = useRef(controls.baseRotationY);

  const {
    extrudeDepth,
    tileColor,
    glowColor,
    glowIntensity,
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
      0, 0, tileW / 2, tileH / 2, 0, Math.PI * 2, false, 0,
    );
    shape.setFromPoints(curve.getPoints(64));
    return new THREE.ExtrudeGeometry(shape, { depth: extrudeDepth, bevelEnabled: false });
  }, [tileW, tileH, extrudeDepth]);

  // Front face: flat oval with UVs mapped 0..1
  const frontGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const curve = new THREE.EllipseCurve(
      0, 0, tileW / 2, tileH / 2, 0, Math.PI * 2, false, 0,
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
      0, 0, tileW / 2, tileH / 2, 0, Math.PI * 2, false, 0,
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

  const glowColorObj = useMemo(() => new THREE.Color(glowColor), [glowColor]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const targetSpeed = isHoveredRef.current ? 1.5 : 0;
    spinSpeedRef.current = THREE.MathUtils.lerp(spinSpeedRef.current, targetSpeed, 0.06);

    if (isHoveredRef.current || Math.abs(spinSpeedRef.current) > 0.01) {
      rotYRef.current += spinSpeedRef.current * delta;
      groupRef.current.rotation.y = rotYRef.current;
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        baseRotationY,
        0.08,
      );
      rotYRef.current = groupRef.current.rotation.y;
    }

    if (baseMaterialRef.current) {
      baseMaterialRef.current.emissive.copy(glowColorObj);
      baseMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        baseMaterialRef.current.emissiveIntensity,
        isHoveredRef.current ? glowIntensity : 0,
        0.15,
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, baseRotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        isHoveredRef.current = true;
        onHover(character);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        isHoveredRef.current = false;
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(character);
      }}
    >
      {/* Oval body with metallic material */}
      <mesh geometry={ovalGeometry}>
        <meshStandardMaterial
          ref={baseMaterialRef}
          color={tileColor}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>

      {/* Front face icon */}
      <mesh geometry={frontGeometry} position={[0, 0, extrudeDepth + 0.001]}>
        <meshBasicMaterial map={texture} transparent />
      </mesh>

      {/* Back face icon (mirrored UVs) */}
      <mesh geometry={backGeometry} position={[0, 0, -0.001]}>
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
}
