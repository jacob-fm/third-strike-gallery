"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "@/types/character";

interface CharacterName3DProps {
  character: Character | null;
}

const RESTING_X = -2.2;
const SLIDE_START_X = -7.0;

function CharacterNameMesh({ character }: CharacterName3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const prevSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const newSlug = character?.slug ?? null;
    if (newSlug === prevSlugRef.current) return;
    prevSlugRef.current = newSlug;

    if (newSlug !== null) {
      // Only snap back to start if near rest — mid-slide just swaps the text
      const currentX = groupRef.current.position.x;
      if (Math.abs(currentX - RESTING_X) < 0.3) {
        groupRef.current.position.x = SLIDE_START_X;
      }
    }
  }, [character]);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = character ? RESTING_X : SLIDE_START_X;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      target,
      0.12,
    );
  });

  return (
    <group ref={groupRef} position={[SLIDE_START_X, 0, 0]}>
      {character && (
        <Text3D
          font="/fonts/Orbitron_Regular.json"
          size={0.82}
          height={0.28}
          curveSegments={2}
          bevelEnabled={false}
          letterSpacing={0.05}
          rotation={[0, -0.38, 0]}
        >
          {character.name.toUpperCase()}
          <meshStandardMaterial
            color="#bababa"
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      )}
    </group>
  );
}

function CharacterNameInner({ character }: CharacterName3DProps) {
  return <CharacterNameMesh character={character} />;
}

export default function CharacterName3D({ character }: CharacterName3DProps) {
  const light = useRef<THREE.DirectionalLight>(null);

  return (
    <Canvas
      gl={{ alpha: true, toneMapping: THREE.NoToneMapping }}
      style={{ overflow: "visible" }}
      camera={{ position: [0, 0, 5], fov: 30 }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight ref={light} position={[-6, 1.0, 6]} intensity={5.0} />
      <Suspense fallback={null}>
        <CharacterNameInner character={character} />
      </Suspense>
    </Canvas>
  );
}
