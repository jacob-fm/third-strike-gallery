"use client";

import { Suspense, useCallback, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";

/** Shared ref for mouse position, written by the wrapper div, read by the mesh */
interface PointerTarget {
  x: number;
  y: number;
}

function CardMesh({
  imageSrc,
  alt,
  pointerRef,
}: {
  imageSrc: string;
  alt: string;
  pointerRef: React.RefObject<PointerTarget>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const {
    maxTilt,
    lerpSpeed,
    cardColor,
    cardWidth,
    cardHeight,
    cornerRadius,
    spriteScale,
  } = useControls("Card", {
    maxTilt: { value: 0.15, min: 0, max: 0.5, step: 0.01 },
    lerpSpeed: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
    cardColor: "#a0a0a0",
    cardWidth: { value: 2.5, min: 0.5, max: 10, step: 0.1 },
    cardHeight: { value: 3.0, min: 0.5, max: 10, step: 0.1 },
    cornerRadius: { value: 0.12, min: 0, max: 0.5, step: 0.01 },
    spriteScale: { value: 210, min: 50, max: 1200, step: 10 },
  });

  const { metalness, roughness, iridescence, iridescenceIOR } = useControls(
    "Foil",
    {
      metalness: { value: 0.67, min: 0, max: 1, step: 0.01 },
      roughness: { value: 0.35, min: 0, max: 1, step: 0.01 },
      iridescence: { value: 0.4, min: 0, max: 1, step: 0.01 },
      iridescenceIOR: { value: 1.63, min: 1, max: 2.33, step: 0.01 },
    },
  );

  const cardGeometry = useMemo(() => {
    const r = Math.min(cornerRadius, cardWidth / 2, cardHeight / 2);
    const shape = new THREE.Shape();
    const x = -cardWidth / 2,
      y = -cardHeight / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + cardWidth - r, y);
    shape.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + r);
    shape.lineTo(x + cardWidth, y + cardHeight - r);
    shape.quadraticCurveTo(
      x + cardWidth,
      y + cardHeight,
      x + cardWidth - r,
      y + cardHeight,
    );
    shape.lineTo(x + r, y + cardHeight);
    shape.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return new THREE.ShapeGeometry(shape, 8);
  }, [cardWidth, cardHeight, cornerRadius]);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = pointerRef.current;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      target.x * maxTilt,
      lerpSpeed,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      target.y * maxTilt,
      lerpSpeed,
    );
  });

  return (
    <group ref={groupRef}>
      {/* Card backing */}
      <mesh geometry={cardGeometry}>
        <meshPhysicalMaterial
          color={cardColor}
          metalness={metalness}
          roughness={roughness}
          iridescence={iridescence}
          iridescenceIOR={iridescenceIOR}
        />
      </mesh>

      {/* Animated GIF sprite on top */}
      <Html
        transform
        distanceFactor={4}
        position={[0, 0, 0.01]}
        style={{ pointerEvents: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={alt}
          style={{
            width: spriteScale,
            height: spriteScale,
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
      </Html>
    </group>
  );
}

interface TiltCardProps {
  imageSrc: string;
  alt: string;
  className?: string;
}

export default function TiltCard({ imageSrc, alt, className }: TiltCardProps) {
  const pointerRef = useRef<PointerTarget>({ x: 0, y: 0 });

  const { ambientIntensity, directionalIntensity, cameraZ, fov } = useControls(
    "Scene",
    {
      ambientIntensity: { value: 0.8, min: 0, max: 20, step: 0.1 },
      directionalIntensity: { value: 0.3, min: 0, max: 3, step: 0.1 },
      cameraZ: { value: 4, min: 1, max: 10, step: 0.1 },
      fov: { value: 45, min: 10, max: 120, step: 1 },
    },
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // Normalize to -1..1
      pointerRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      };
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    // Return to center — the lerp in useFrame will animate smoothly
    pointerRef.current = { x: 0, y: 0 };
  }, []);

  return (
    <div
      className={`${className} overflow-visible`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov }}
        gl={{ alpha: true }}
        style={{ overflow: "visible" }}
      >
        <ambientLight intensity={ambientIntensity} />
        <directionalLight
          position={[0, 0.5, 10]}
          intensity={directionalIntensity}
        />
        <Suspense fallback={null}>
          <CardMesh imageSrc={imageSrc} alt={alt} pointerRef={pointerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
