"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";

// Material options for the finish swap
const materials = [
  { name: "Hardwood", color: "#8B4513", price: "$12/sqft" },
  { name: "Tile", color: "#A9A9A9", price: "$8/sqft" },
  { name: "Concrete", color: "#708090", price: "$6/sqft" }
];

// Simple room geometry
function RoomModel({ material }: { material: { name: string; color: string } }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color={material.color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 1, -3]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      <mesh position={[-3, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </group>
  );
}

// Loading fallback
function RoomViewerFallback() {
  return (
    <div className="h-[400px] w-full bg-neutral-950 rounded-lg flex items-center justify-center">
      <div className="text-neutral-400 animate-pulse">Loading 3D Room...</div>
    </div>
  );
}

export default function RoomViewer() {
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Material Selector */}
      <div className="flex justify-center mb-4 space-x-4">
        {materials.map((material) => (
          <button
            key={material.name}
            onClick={() => setSelectedMaterial(material)}
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              selectedMaterial.name === material.name
                ? "border-sky-500 bg-sky-500/20 text-sky-300"
                : "border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:border-neutral-600"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: material.color }}
              />
              <span className="font-medium">{material.name}</span>
              <span className="text-sm opacity-75">{material.price}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <div className="relative h-[400px] w-full bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800">
        <Suspense fallback={<RoomViewerFallback />}>
          <Canvas
            camera={{ position: [4, 3, 4], fov: 60 }}
            onCreated={() => setIsLoading(false)}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <pointLight position={[-3, 3, -3]} intensity={0.8} color="#ffd700" />
            
            <RoomModel material={selectedMaterial} />
            <ContactShadows 
              opacity={0.4} 
              scale={10} 
              blur={1} 
              far={10} 
              resolution={256} 
              color="#000000" 
            />
            <Environment preset="apartment" />
            <OrbitControls 
              enablePan={false} 
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2}
              minDistance={3}
              maxDistance={8}
            />
          </Canvas>
        </Suspense>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
            <div className="text-neutral-400 animate-pulse">Loading 3D Room...</div>
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute top-4 left-4 text-neutral-400 text-sm">
          <div>Click and drag to rotate</div>
          <div>Scroll to zoom</div>
        </div>
      </div>

      {/* Finish Swap CTA */}
      <motion.div 
        className="text-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-2">
          Current Finish: {selectedMaterial.name}
        </h3>
        <p className="text-neutral-400 mb-4">
          Estimated cost: {selectedMaterial.price} • See it in your space
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-sky-500 to-green-500 text-white font-medium rounded-lg hover:from-sky-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl">
          Get Instant Estimate
        </button>
      </motion.div>
    </motion.div>
  );
}
