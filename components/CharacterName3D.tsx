"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "@/types/character";

interface CharacterName3DProps {
  character: Character | null;
}

function CharacterNameInner({ character }: CharacterName3DProps) {
  if (!character) return null;

  return (
    <Text3D
      font="/fonts/Orbitron_Regular.json"
      size={0.45}
      height={0.06}
      curveSegments={8}
      bevelEnabled={false}
      letterSpacing={0.05}
      position={[-1.5, 0, 0]}
    >
      {character.name.toUpperCase()}
      <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
    </Text3D>
  );
}

export default function CharacterName3D({ character }: CharacterName3DProps) {
  const light = useRef<THREE.DirectionalLight>(null);

  return (
    <Canvas
      gl={{ alpha: true, toneMapping: THREE.NoToneMapping }}
      style={{ overflow: "visible" }}
      camera={{ position: [0, 0, 3], fov: 20 }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight ref={light} position={[-2, 1.5, 15]} intensity={0.8} />
      <Suspense fallback={null}>
        <CharacterNameInner character={character} />
      </Suspense>
    </Canvas>
  );
}
