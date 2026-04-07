"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "@/types/character";
import { ICON_CONTOUR, ICON_W, ICON_H } from "@/data/iconShapeContour";

export interface IconTileControls {
  maxTilt: number;
  tiltScale: number;
  lerpSpeed: number;
  extrudeDepth: number;
  tileColor: string;
  glowColor: string;
  glowIntensity: number;
  metalness: number;
  roughness: number;
  gridScale: number;
}

/** Tile dimensions in screen pixels (before PX_TO_WORLD scaling) */
const CARD_W_PX = 150;
const CARD_H_PX = 89;

/** Build a THREE.Shape from the traced contour, scaled and centered */
function buildContourShape(tileW: number, tileH: number): THREE.Shape {
  const sx = tileW / ICON_W;
  const sy = tileH / ICON_H;
  const ox = tileW / 2;
  const oy = tileH / 2;

  const shape = new THREE.Shape();
  const [fx, fy] = ICON_CONTOUR[0];
  shape.moveTo(fx * sx - ox, -(fy * sy - oy));
  for (let i = 1; i < ICON_CONTOUR.length; i++) {
    const [px, py] = ICON_CONTOUR[i];
    shape.lineTo(px * sx - ox, -(py * sy - oy));
  }
  shape.closePath();
  return shape;
}

interface IconTileProps {
  character: Character;
  position: [number, number, number];
  cursorWorldRef: React.RefObject<THREE.Vector3 | null>;
  controls: IconTileControls;
  onHover: (c: Character | null) => void;
  onSelect: (c: Character) => void;
}

export default function IconTile({
  character,
  position,
  cursorWorldRef,
  controls,
  onHover,
  onSelect,
}: IconTileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const isHoveredRef = useRef(false);

  const {
    maxTilt,
    tiltScale,
    lerpSpeed,
    extrudeDepth,
    tileColor,
    glowColor,
    glowIntensity,
    metalness,
    roughness,
    gridScale,
  } = controls;

  const tileW = CARD_W_PX * gridScale;
  const tileH = CARD_H_PX * gridScale;

  // Extruded contour geometry for the tile base
  const tileGeometry = useMemo(() => {
    const shape = buildContourShape(tileW, tileH);
    return new THREE.ExtrudeGeometry(shape, {
      depth: extrudeDepth,
      bevelEnabled: false,
    });
  }, [tileW, tileH, extrudeDepth]);

  // Front face: flat ShapeGeometry with UVs mapped to the full texture
  const frontGeometry = useMemo(() => {
    const shape = buildContourShape(tileW, tileH);
    const geo = new THREE.ShapeGeometry(shape);

    // Remap UVs: shape coords are centered (−tileW/2..+tileW/2, etc.)
    // Map to 0..1 for the texture
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setX(i, (uv.getX(i) + tileW / 2) / tileW);
      // Flip Y: shape has +Y up but texture has +Y down
      uv.setY(i, (uv.getY(i) + tileH / 2) / tileH);
    }
    uv.needsUpdate = true;
    return geo;
  }, [tileW, tileH]);

  // Load icon texture with pixelated filtering
  const texture = useTexture(character.iconImage, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
  });

  const glowColorObj = useMemo(() => new THREE.Color(glowColor), [glowColor]);

  // Per-frame: distance-based tilt + hover glow
  useFrame(() => {
    if (!groupRef.current) return;

    const cursor = cursorWorldRef.current;
    let targetRotX = 0;
    let targetRotY = 0;

    if (cursor) {
      const dx = cursor.x - position[0];
      const dy = cursor.y - position[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      const tiltAmount = Math.min(distance * tiltScale, maxTilt);

      if (distance > 0.001) {
        const norm = 1 / distance;
        targetRotX = -dy * norm * tiltAmount;
        targetRotY = dx * norm * tiltAmount;
      }
    }

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      lerpSpeed,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      lerpSpeed,
    );

    // Hover glow
    if (baseMaterialRef.current) {
      const targetEmissive = isHoveredRef.current ? glowIntensity : 0;
      baseMaterialRef.current.emissive.copy(glowColorObj);
      baseMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        baseMaterialRef.current.emissiveIntensity,
        targetEmissive,
        0.15,
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
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
      {/* Extruded tile base */}
      <mesh geometry={tileGeometry}>
        <meshStandardMaterial
          ref={baseMaterialRef}
          color={tileColor}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>

      {/* Icon texture on front face */}
      <mesh geometry={frontGeometry} position={[0, 0, extrudeDepth + 0.001]}>
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
}
