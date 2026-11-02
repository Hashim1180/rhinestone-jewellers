'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

/** Procedural gold material — physically realistic look without external textures. */
function useGoldMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d4af37'),
      metalness: 1,
      roughness: 0.18,
      envMapIntensity: 1.2,
    })
    return m
  }, [])
}

/** Crystal-like diamond material. */
function useDiamondMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      metalness: 0.1,
      roughness: 0.02,
      transmission: 0.85,
      thickness: 0.6,
      ior: 2.4,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0,
    })
    return m
  }, [])
}

/* ────────────────────────────────────────────────────────────────────
 * Solitaire ring — round brilliant stone in 4-prong setting on a
 * half-round band. Generated procedurally with Three.js geometry.
 * ──────────────────────────────────────────────────────────────────── */
function SolitaireRing() {
  const gold = useGoldMaterial()
  const diamond = useDiamondMaterial()

  return (
    <group>
      {/* Band — half-round torus */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={gold}>
        <torusGeometry args={[1.1, 0.07, 24, 96, Math.PI * 1.85]} />
      </mesh>

      {/* Head — small gold cylinder */}
      <mesh position={[0, 0.18, 0]} material={gold}>
        <cylinderGeometry args={[0.13, 0.18, 0.18, 24]} />
      </mesh>

      {/* 4 prongs */}
      {[0, 1, 2, 3].map(i => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.13, 0.32, Math.sin(a) * 0.13]} material={gold}>
            <cylinderGeometry args={[0.018, 0.025, 0.18, 8]} />
          </mesh>
        )
      })}

      {/* Centre stone — round brilliant (approximated as a sphere with cut) */}
      <mesh position={[0, 0.42, 0]} material={diamond}>
        <icosahedronGeometry args={[0.32, 3]} />
      </mesh>
    </group>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Halo pendant — centre stone surrounded by ring of small diamonds,
 * suspended on a fine chain.
 * ──────────────────────────────────────────────────────────────────── */
function HaloPendant() {
  const gold = useGoldMaterial()
  const diamond = useDiamondMaterial()

  return (
    <group>
      {/* Chain — torus suggesting the loop */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.4, 0]} material={gold}>
        <torusGeometry args={[0.18, 0.012, 12, 48]} />
      </mesh>

      {/* Bail (top loop) */}
      <mesh position={[0, 1.1, 0]} material={gold}>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
      </mesh>

      {/* Halo ring — flat disc of small diamonds approximated as a torus */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} material={diamond}>
        <torusGeometry args={[0.45, 0.06, 16, 64]} />
      </mesh>

      {/* Halo outer gold frame */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} material={gold}>
        <torusGeometry args={[0.52, 0.025, 16, 64]} />
      </mesh>

      {/* Centre stone — cushion cut approximated as a rounded cube */}
      <mesh position={[0, 0.5, 0.05]} material={diamond}>
        <boxGeometry args={[0.45, 0.45, 0.3]} />
      </mesh>

      {/* Bail connector to halo */}
      <mesh position={[0, 0.8, 0]} material={gold}>
        <cylinderGeometry args={[0.025, 0.04, 0.4, 12]} />
      </mesh>
    </group>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Bangle — faceted torus with engraved surface pattern.
 * ──────────────────────────────────────────────────────────────────── */
function Bangle() {
  const gold = useGoldMaterial()

  return (
    <group rotation={[0.3, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={gold}>
        <torusGeometry args={[1.0, 0.18, 32, 96]} />
      </mesh>
      {/* Faceted detail — small spheres around the band */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0]}
            material={gold}
          >
            <sphereGeometry args={[0.05, 12, 12]} />
          </mesh>
        )
      })}
    </group>
  )
}

const MODELS: Record<string, React.FC> = {
  'solitaire-ring': SolitaireRing,
  'halo-pendant': HaloPendant,
  'bangle': Bangle,
}

export function ProceduralModel({ type, autoRotate = true }: { type: string; autoRotate?: boolean }) {
  const Model = MODELS[type] ?? SolitaireRing
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#fff7e0" />
      <directionalLight position={[-5, 3, -5]} intensity={0.7} color="#c8a554" />
      <Float speed={1.0} rotationIntensity={autoRotate ? 0.4 : 0} floatIntensity={0.3}>
        <Model />
      </Float>
      <Environment preset="studio" />
      <ContactShadows position={[0, -1.4, 0]} opacity={0.35} scale={10} blur={2.5} far={4} />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={7}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        enableDamping
      />
    </Canvas>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Scroll-driven variant — the model rotates based on the page scroll
 * position (one full rotation as you scroll past the scene).
 * Auto-rotation is disabled; scroll drives the rotation instead.
 * ──────────────────────────────────────────────────────────────────── */
function ScrollRotationGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)

  // Sync to page scroll position
  useFrame(() => {
    if (!groupRef.current) return
    // Compute scroll progress within the viewport-occupying part of the scene
    const el = document.querySelector('[data-scroll-3d]') as HTMLElement | null
    if (el) {
      const r = el.getBoundingClientRect()
      const viewportH = window.innerHeight
      // 0 when scene top hits bottom of viewport, 1 when scene bottom hits top
      const progress = Math.max(0, Math.min(1, (viewportH - r.top) / (viewportH + r.height)))
      // Rotate from -π/4 to 2π + π/4 over the progress
      groupRef.current.rotation.y = -Math.PI / 4 + progress * (Math.PI * 2.5)
    }
  })

  return <group ref={groupRef}>{children}</group>
}

export function ProceduralModelScrollDriven({ type }: { type: string }) {
  const Model = MODELS[type] ?? SolitaireRing
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#fff7e0" />
      <directionalLight position={[-5, 3, -5]} intensity={0.7} color="#c8a554" />
      <Float speed={1.0} rotationIntensity={0} floatIntensity={0.3}>
        <ScrollRotationGroup>
          <Model />
        </ScrollRotationGroup>
      </Float>
      <Environment preset="studio" />
      <ContactShadows position={[0, -1.4, 0]} opacity={0.35} scale={10} blur={2.5} far={4} />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={7}
        autoRotate={false}
        enableDamping
      />
    </Canvas>
  )
}
