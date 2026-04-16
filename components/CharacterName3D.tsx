"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "@/types/character";

interface CharacterName3DProps {
  character: Character | null;
}

const RESTING_X = -1.0;
const SLIDE_START_X = -5.0;

function CharacterNameMesh({ character }: CharacterName3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const prevSlugRef = useRef<string | null>(null);
  const settledRef = useRef(false);

  useLayoutEffect(() => {
    if (!textRef.current) return;
    textRef.current.geometry.computeBoundingBox();
    const bbox = textRef.current.geometry.boundingBox;
    if (!bbox) return;
    textRef.current.position.x = -(bbox.max.x + bbox.min.x) / 2;
  }, [character?.name]);

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
    settledRef.current = false;
  }, [character]);

  useFrame(() => {
    if (!groupRef.current || settledRef.current) return;
    const target = character ? RESTING_X : SLIDE_START_X;
    const next = THREE.MathUtils.lerp(groupRef.current.position.x, target, 0.12);
    groupRef.current.position.x = next;
    if (Math.abs(next - target) < 0.001) {
      groupRef.current.position.x = target;
      settledRef.current = true;
    }
  });

  return (
    <group ref={groupRef} position={[SLIDE_START_X, 0, 0]}>
      {character && (
        <Text3D
          ref={textRef}
          font="/fonts/Orbitron_Regular.json"
          size={0.82}
          height={0.28}
          curveSegments={2}
          bevelEnabled={false}
          letterSpacing={0.05}
          rotation={[0, 0, 0]}
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
      camera={{ position: [1.6, 0.4, 3.5], fov: 33 }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight ref={light} position={[-6, 1.0, 6]} intensity={5.0} />
      <Suspense fallback={null}>
        <CharacterNameInner character={character} />
      </Suspense>
    </Canvas>
  );
}
