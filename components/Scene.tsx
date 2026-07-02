'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Mesh } from 'three'

function Box() {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.5
      ref.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Box />
      <OrbitControls />
    </Canvas>
  )
}
