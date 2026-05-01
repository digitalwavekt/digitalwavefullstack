import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
  const ref = useRef()
  const count = 2000

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  )
}

function FloatingShapes() {
  const groupRef = useRef()

  const shapes = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.5 + 0.2,
      color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 4)]
    }))
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x += shapes[i].speed * 0.01
        child.rotation.y += shapes[i].speed * 0.015
        child.position.y += Math.sin(state.clock.elapsedTime * shapes[i].speed + i) * 0.002
      })
    }
  })

  return (
    <group ref={groupRef}>
      {shapes.map((shape) => (
        <mesh key={shape.id} position={shape.position} rotation={shape.rotation} scale={shape.scale}>
          {shape.id % 3 === 0 ? (
            <octahedronGeometry args={[1, 0]} />
          ) : shape.id % 3 === 1 ? (
            <torusGeometry args={[1, 0.3, 16, 32]} />
          ) : (
            <icosahedronGeometry args={[1, 0]} />
          )}
          <meshStandardMaterial
            color={shape.color}
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      ))}
    </group>
  )
}

function WaveGrid() {
  const meshRef = useRef()
  const geometryRef = useRef()

  useFrame((state) => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position
      const time = state.clock.elapsedTime

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = Math.sin(x * 0.5 + time) * 0.3 + Math.cos(y * 0.5 + time * 0.8) * 0.3
        positions.setZ(i, z)
      }
      positions.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry ref={geometryRef} args={[30, 30, 50, 50]} />
      <meshStandardMaterial
        color="#1e3a8a"
        transparent
        opacity={0.1}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
      <ParticleField />
      <FloatingShapes />
      <WaveGrid />
    </>
  )
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#0a0a0f', 10, 25]} />
        <Scene3D />
      </Canvas>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/50 via-transparent to-dark-900 pointer-events-none" />
    </div>
  )
}
