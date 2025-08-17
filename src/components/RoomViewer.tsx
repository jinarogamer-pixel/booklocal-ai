'use client'
import { Box, ContactShadows, Environment, MeshReflectorMaterial, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

export type FinishKey = 'oak' | 'tile' | 'concrete'

export const FINISHES: Record<
    FinishKey,
    { label: string; tint: string; material: { color: string; roughness: number; metalness: number } }
> = {
    oak: { label: 'Oak Plank', tint: '#D1A36C', material: { color: '#b98a52', roughness: 0.5, metalness: 0.05 } },
    tile: { label: 'Porcelain Tile', tint: '#9DB2BD', material: { color: '#d7d9df', roughness: 0.2, metalness: 0.15 } },
    concrete: { label: 'Polished Concrete', tint: '#9EA3A6', material: { color: '#9a9a9a', roughness: 0.9, metalness: 0.2 } },
}

function RoomScene({ finish }: { finish: FinishKey }) {
    const mat = FINISHES[finish].material

    return (
        <group>
            {/* Reflective floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <MeshReflectorMaterial
                    blur={[200, 30]}
                    resolution={2048}
                    mixBlur={1}
                    roughness={mat.roughness}
                    metalness={mat.metalness}
                    color={mat.color}
                    mirror={finish === 'tile' ? 0.3 : 0.02}
                />
            </mesh>

            {/* Hero objects */}
            <Box position={[-1.5, 0.6, -1]} args={[1.2, 1.2, 1.2]} castShadow>
                <meshStandardMaterial color="#92a7ff" roughness={0.35} metalness={0.1} />
            </Box>

            <Box position={[1, 0.4, 0.5]} args={[0.8, 0.8, 0.8]} castShadow>
                <meshStandardMaterial color="#ff9292" roughness={0.25} metalness={0.2} />
            </Box>

            <ContactShadows position={[0, 0, 0]} opacity={0.4} blur={2} far={12} />
        </group>
    )
}

function LoadingRoom() {
    return (
        <Box args={[1, 1, 1]}>
            <meshStandardMaterial color="#666666" />
        </Box>
    )
}

export default function RoomViewer({
    finish = 'oak',
    orbit = true,
}: {
    finish?: FinishKey
    orbit?: boolean
}) {
    return (
        <div className="card hover-rise" style={{ height: 420, overflow: 'hidden' }}>
            <Canvas camera={{ position: [4, 3, 6], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 8, 2]} intensity={1.2} castShadow />

                <Suspense fallback={<LoadingRoom />}>
                    <Environment preset="studio" background={false} />
                    <RoomScene finish={finish as FinishKey} />
                </Suspense>

                {orbit && <OrbitControls enablePan={false} minDistance={4} maxDistance={9} />}
            </Canvas>
        </div>
    )
}
