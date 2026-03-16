'use client'

import { Suspense, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'

/** Shared ref for mouse position, written by the wrapper div, read by the mesh */
interface PointerTarget {
  x: number
  y: number
}

function CardMesh({
  imageSrc,
  alt,
  pointerRef,
}: {
  imageSrc: string
  alt: string
  pointerRef: React.RefObject<PointerTarget>
}) {
  const groupRef = useRef<THREE.Group>(null)

  const { maxTilt, lerpSpeed, cardColor, cardWidth, cardHeight, spriteScale } = useControls('Card', {
    maxTilt: { value: 0.15, min: 0, max: 0.5, step: 0.01 },
    lerpSpeed: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
    cardColor: '#1a1a1a',
    cardWidth: { value: 4, min: 0.5, max: 10, step: 0.1 },
    cardHeight: { value: 5, min: 0.5, max: 10, step: 0.1 },
    spriteScale: { value: 500, min: 50, max: 1200, step: 10 },
  })

  useFrame(() => {
    if (!groupRef.current) return
    const target = pointerRef.current
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      target.x * maxTilt,
      lerpSpeed
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      target.y * maxTilt,
      lerpSpeed
    )
  })

  return (
    <group ref={groupRef}>
      {/* Card backing */}
      <mesh>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial color={cardColor} />
      </mesh>

      {/* Animated GIF sprite on top */}
      <Html
        transform
        distanceFactor={4}
        position={[0, 0, 0.01]}
        style={{ pointerEvents: 'none' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={alt}
          style={{
            width: spriteScale,
            height: spriteScale,
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
      </Html>
    </group>
  )
}

interface TiltCardProps {
  imageSrc: string
  alt: string
  className?: string
}

export default function TiltCard({ imageSrc, alt, className }: TiltCardProps) {
  const pointerRef = useRef<PointerTarget>({ x: 0, y: 0 })

  const { ambientIntensity, directionalIntensity, cameraZ, fov } = useControls('Scene', {
    ambientIntensity: { value: 1.2, min: 0, max: 3, step: 0.1 },
    directionalIntensity: { value: 0.5, min: 0, max: 3, step: 0.1 },
    cameraZ: { value: 4, min: 1, max: 10, step: 0.1 },
    fov: { value: 45, min: 10, max: 120, step: 1 },
  })

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Normalize to -1..1
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    // Return to center — the lerp in useFrame will animate smoothly
    pointerRef.current = { x: 0, y: 0 }
  }, [])

  return (
    <div
      className={`${className} overflow-visible`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov }}
        gl={{ alpha: true }}
        style={{ overflow: 'visible' }}
      >
        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[2, 2, 5]} intensity={directionalIntensity} />
        <Suspense fallback={null}>
          <CardMesh imageSrc={imageSrc} alt={alt} pointerRef={pointerRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}
