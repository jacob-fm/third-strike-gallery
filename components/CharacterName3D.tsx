"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "@/types/character";

interface CharacterName3DProps {
  character: Character | null;
}

const RESTING_X = -1.5;
const SLIDE_START_X = -3.5;

function CharacterNameMesh({ character }: { character: Character }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.x = SLIDE_START_X;
    }
  }, [character.slug]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      RESTING_X,
      0.12,
    );
  });

  return (
    <group ref={groupRef} position={[SLIDE_START_X, 0, 0]}>
      <Text3D
        font="/fonts/Orbitron_Regular.json"
        size={0.45}
        height={0.16}
        curveSegments={8}
        bevelEnabled={false}
        letterSpacing={0.05}
        rotation={[0, -0.08, 0]}
      >
        {character.name.toUpperCase()}
        <meshStandardMaterial color="#bababa" metalness={0.5} roughness={0.2} />
      </Text3D>
    </group>
  );
}

function CharacterNameInner({ character }: CharacterName3DProps) {
  if (!character) return null;
  return <CharacterNameMesh character={character} />;
}

export default function CharacterName3D({ character }: CharacterName3DProps) {
  const light = useRef<THREE.DirectionalLight>(null);

  return (
    <Canvas
      gl={{ alpha: true, toneMapping: THREE.NoToneMapping }}
      style={{ overflow: "visible" }}
      camera={{ position: [0, 0, 3], fov: 20 }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight ref={light} position={[-6, 1.0, 6]} intensity={5.0} />
      <Suspense fallback={null}>
        <CharacterNameInner character={character} />
      </Suspense>
    </Canvas>
  );
}
