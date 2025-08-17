'use client';
import { ContactShadows, Environment, OrbitControls, useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';

type Finish = 'oak' | 'tile' | 'concrete';

function Floor({ finish }: { finish: Finish }) {
    // Phase 1: Texture-based PBR materials
    const textures = {
        oak: {
            map: '/textures/floor/oak_diffuse.jpg',
            normalMap: '/textures/floor/oak_normal.jpg',
            roughnessMap: '/textures/floor/oak_roughness.jpg',
            aoMap: '/textures/floor/oak_ao.jpg',
        },
        tile: {
            map: '/textures/floor/tile_diffuse.jpg',
            normalMap: '/textures/floor/tile_normal.jpg',
            roughnessMap: '/textures/floor/tile_roughness.jpg',
            aoMap: '/textures/floor/tile_ao.jpg',
        },
        concrete: {
            map: '/textures/floor/concrete_diffuse.jpg',
            normalMap: '/textures/floor/concrete_normal.jpg',
            roughnessMap: '/textures/floor/concrete_roughness.jpg',
            aoMap: '/textures/floor/concrete_ao.jpg',
        }
    };

    // Load textures with error handling
    let maps;
    try {
        maps = useTexture(textures[finish]);
        // Configure texture properties
        Object.values(maps).forEach(texture => {
            if (texture instanceof THREE.Texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(4, 4); // Scale for room size
                texture.anisotropy = 16; // Sharp detail at angles
            }
        });
    } catch (error) {
        // Fallback to solid colors if textures fail to load
        const fallbackColors = {
            oak: '#B4864A',
            tile: '#A7B9C2',
            concrete: '#9AA0A3'
        };

        return (
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
                <planeGeometry args={[6, 6]} />
                <meshStandardMaterial
                    color={fallbackColors[finish]}
                    roughness={finish === 'tile' ? 0.2 : finish === 'oak' ? 0.8 : 0.6}
                    metalness={0.1}
                />
            </mesh>
        );
    }

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
            <planeGeometry args={[6, 6]} />
            <meshStandardMaterial
                map={maps.map}
                normalMap={maps.normalMap}
                roughnessMap={maps.roughnessMap}
                aoMap={maps.aoMap}
                normalScale={new THREE.Vector2(0.5, 0.5)}
                roughness={finish === 'tile' ? 0.3 : finish === 'oak' ? 0.7 : 0.5}
                metalness={finish === 'concrete' ? 0.2 : 0.0}
            />
        </mesh>
    );
}

function Room({ finish }: { finish: Finish }) {
    return (
        <group position={[0, 0, 0]}>
            <Floor finish={finish} />

            {/* Enhanced walls with subtle textures */}
            <mesh position={[0, 1.25, -3]} receiveShadow>
                <boxGeometry args={[6, 2.5, 0.1]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.9}
                    normalScale={new THREE.Vector2(0.2, 0.2)}
                />
            </mesh>

            <mesh position={[-3, 1.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <boxGeometry args={[6, 2.5, 0.1]} />
                <meshStandardMaterial
                    color="#151515"
                    roughness={0.9}
                    normalScale={new THREE.Vector2(0.2, 0.2)}
                />
            </mesh>

            {/* Realistic furniture for scale and context */}
            <mesh position={[-1.5, 0.4, -1.5]} castShadow>
                <boxGeometry args={[1.2, 0.8, 0.6]} />
                <meshStandardMaterial
                    color="#8B4513"
                    roughness={0.7}
                    metalness={0.0}
                />
            </mesh>

            {/* Additional room elements */}
            <mesh position={[1.8, 0.05, 1.2]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.1]} />
                <meshStandardMaterial
                    color="#2C2C2C"
                    roughness={0.4}
                    metalness={0.8}
                />
            </mesh>
        </group>
    );
}

export default function PremiumRoomViewer({
    finish = 'oak',
    compare = false
}: {
    finish?: Finish;
    compare?: boolean;
}) {
    if (compare) {
        // Split-screen comparison mode
        return (
            <div className="h-full w-full grid grid-cols-2 gap-1 bg-black">
                {/* Before */}
                <div className="relative">
                    <Canvas
                        shadows
                        camera={{ position: [3, 2, 3], fov: 60 }}
                        gl={{ antialias: true, alpha: false }}
                    >
                        <Suspense fallback={null}>
                            <Environment files="/hdr/studio_small_09_1k.hdr" />
                            <ambientLight intensity={0.3} />
                            <directionalLight
                                position={[2, 4, 2]}
                                intensity={1.2}
                                castShadow
                                shadow-mapSize={[2048, 2048]}
                                shadow-camera-far={10}
                                shadow-camera-left={-5}
                                shadow-camera-right={5}
                                shadow-camera-top={5}
                                shadow-camera-bottom={-5}
                            />
                            <Room finish="concrete" />
                            <ContactShadows
                                position={[0, -0.01, 0]}
                                opacity={0.3}
                                scale={8}
                                blur={2}
                                far={6}
                            />
                            <OrbitControls
                                enablePan={false}
                                enableZoom={true}
                                minDistance={2}
                                maxDistance={8}
                                minPolarAngle={0}
                                maxPolarAngle={Math.PI / 2.2}
                                autoRotate={false}
                            />
                        </Suspense>
                    </Canvas>
                    <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg px-3 py-2 text-sm font-semibold">
                        Before: Concrete
                    </div>
                </div>

                {/* After */}
                <div className="relative">
                    <Canvas
                        shadows
                        camera={{ position: [3, 2, 3], fov: 60 }}
                        gl={{ antialias: true, alpha: false }}
                    >
                        <Suspense fallback={null}>
                            <Environment files="/hdr/studio_small_09_1k.hdr" />
                            <ambientLight intensity={0.3} />
                            <directionalLight
                                position={[2, 4, 2]}
                                intensity={1.2}
                                castShadow
                                shadow-mapSize={[2048, 2048]}
                                shadow-camera-far={10}
                                shadow-camera-left={-5}
                                shadow-camera-right={5}
                                shadow-camera-top={5}
                                shadow-camera-bottom={-5}
                            />
                            <Room finish={finish} />
                            <ContactShadows
                                position={[0, -0.01, 0]}
                                opacity={0.3}
                                scale={8}
                                blur={2}
                                far={6}
                            />
                            <OrbitControls
                                enablePan={false}
                                enableZoom={true}
                                minDistance={2}
                                maxDistance={8}
                                minPolarAngle={0}
                                maxPolarAngle={Math.PI / 2.2}
                                autoRotate={false}
                            />
                        </Suspense>
                    </Canvas>
                    <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg px-3 py-2 text-sm font-semibold">
                        After: {finish.charAt(0).toUpperCase() + finish.slice(1)}
                    </div>
                </div>
            </div>
        );
    }

    // Single view mode
    return (
        <Canvas
            shadows
            camera={{ position: [3, 2, 3], fov: 60 }}
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance'
            }}
            className="h-full w-full bg-black"
        >
            <Suspense fallback={null}>
                <Environment
                    files="/hdr/studio_small_09_1k.hdr"
                    background={false}
                />
                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[2, 4, 2]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-far={10}
                    shadow-camera-left={-5}
                    shadow-camera-right={5}
                    shadow-camera-top={5}
                    shadow-camera-bottom={-5}
                />
                <Room finish={finish} />
                <ContactShadows
                    position={[0, -0.01, 0]}
                    opacity={0.3}
                    scale={8}
                    blur={2}
                    far={6}
                />
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={2}
                    maxDistance={8}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2.2}
                    autoRotate={false}
                />
            </Suspense>
        </Canvas>
    );
}
