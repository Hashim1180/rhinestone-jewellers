'use client'

import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float, Html, useProgress } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url)
  return (
    <primitive object={gltf.scene} scale={1.2} position={[0, -0.5, 0]} />
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-gold text-sm tracking-wider">{progress.toFixed(0)}%</div>
    </Html>
  )
}

export function GLBModel({ url, autoRotate = true }: { url: string; autoRotate?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#fff7e0" />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#c8a554" />
      <Suspense fallback={<Loader />}>
        <Float speed={1.2} rotationIntensity={autoRotate ? 0.3 : 0} floatIntensity={0.4}>
          <Model url={url} />
        </Float>
        <Environment preset="studio" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2} far={4} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enableDamping
      />
    </Canvas>
  )
}
