"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, Text, Float, Sphere, Box, Cylinder, Torus } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function ThreeHeroCanvas({ onStep }: { onStep?: (s: number) => void }) {
  return (
    <Canvas 
      camera={{ position: [2.6, 1.4, 3.0], fov: 42 }} 
      dpr={[1, 1.8]} 
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 3]} intensity={1.5} castShadow />
      <pointLight position={[-3, 2, -2]} intensity={0.8} color="#4f46e5" />
      <pointLight position={[3, -1, 2]} intensity={0.6} color="#06b6d4" />
      <Environment preset="city" />
      <ProfessionalStudio onStep={onStep} />
    </Canvas>
  );
}

function ProfessionalStudio({ onStep }: { onStep?: (s: number) => void }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/room.glb", true);

  // Create sophisticated materials
  const materials = useMemo(() => ({
    glass: new THREE.MeshPhysicalMaterial({
      transmission: 0.9,
      opacity: 0.1,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      ior: 1.5,
      thickness: 0.01,
      transparent: true,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: "#2563eb",
      metalness: 0.9,
      roughness: 0.1,
    }),
    premium: new THREE.MeshStandardMaterial({
      color: "#8b5cf6",
      metalness: 0.7,
      roughness: 0.2,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: "#06b6d4",
      metalness: 0.8,
      roughness: 0.15,
    }),
    floor: new THREE.MeshStandardMaterial({
      color: "#1e293b",
      metalness: 0.3,
      roughness: 0.4,
    }),
  }), []);

  // Professional Service Icons in 3D
  function ServiceIcon({ position, material, geometry }: { position: [number, number, number], material: THREE.Material, geometry: THREE.BufferGeometry }) {
    const ref = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
      if (!ref.current) return;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.05;
    });

    return (
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={ref} position={position} material={material} geometry={geometry} castShadow />
      </Float>
    );
  }

  // Create professional environment instead of basic room
  function ProfessionalEnvironment() {
    return (
      <group>
        {/* Premium Floor */}
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <primitive object={materials.floor} />
        </mesh>

        {/* Glass Conference Table */}
        <mesh position={[0, -0.3, 0]} material={materials.glass} castShadow>
          <cylinderGeometry args={[2, 2, 0.1, 32]} />
        </mesh>

        {/* Service Pillars - Representing different services */}
        <ServiceIcon 
          position={[-2, 0.5, -1]} 
          material={materials.metal} 
          geometry={new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8)} 
        />
        <ServiceIcon 
          position={[2, 0.5, -1]} 
          material={materials.premium} 
          geometry={new THREE.BoxGeometry(0.6, 1.5, 0.6)} 
        />
        <ServiceIcon 
          position={[0, 0.5, -2.5]} 
          material={materials.accent} 
          geometry={new THREE.TorusGeometry(0.4, 0.15, 8, 16)} 
        />

        {/* Floating Data Orbs */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <mesh position={[-1.5, 1.5, 1]} material={materials.glass} castShadow>
            <sphereGeometry args={[0.2, 32, 32]} />
          </mesh>
        </Float>
        
        <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
          <mesh position={[1.5, 1.2, 0.5]} material={materials.accent} castShadow>
            <sphereGeometry args={[0.15, 32, 32]} />
          </mesh>
        </Float>

        <Float speed={2.2} rotationIntensity={0.4} floatIntensity={0.7}>
          <mesh position={[0.5, 1.8, -0.5]} material={materials.premium} castShadow>
            <sphereGeometry args={[0.18, 32, 32]} />
          </mesh>
        </Float>

        {/* Professional Service Labels */}
        <Text
          position={[-2, 1.8, -1]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          HOME SERVICES
        </Text>

        <Text
          position={[2, 1.8, -1]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          BUSINESS
        </Text>

        <Text
          position={[0, 1.8, -2.5]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ENTERPRISE
        </Text>

        {/* Holographic Display Panels */}
        <mesh position={[-3, 1, 0]} rotation={[0, Math.PI / 4, 0]} material={materials.glass}>
          <planeGeometry args={[1.5, 2]} />
        </mesh>
        
        <mesh position={[3, 1, 0]} rotation={[0, -Math.PI / 4, 0]} material={materials.glass}>
          <planeGeometry args={[1.5, 2]} />
        </mesh>

        {/* Premium Lighting Fixtures */}
        <mesh position={[0, 3, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
        </mesh>
        
        {/* Ambient Glow Effects */}
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  // ===== MATERIAL PRESETS FOR ROOM MODEL =====
  const presets = [
    {
      name: "Professional Blue",
      primary: "#1e40af",
      secondary: "#3b82f6", 
      accent: "#60a5fa",
      roughness: 0.2,
      metalness: 0.8,
    },
    {
      name: "Executive Purple", 
      primary: "#7c3aed",
      secondary: "#8b5cf6",
      accent: "#a78bfa",
      roughness: 0.3,
      metalness: 0.7,
    },
    {
      name: "Corporate Cyan",
      primary: "#0891b2",
      secondary: "#06b6d4",
      accent: "#22d3ee",
      roughness: 0.25,
      metalness: 0.75,
    },
    {
      name: "Premium Gold",
      primary: "#d97706",
      secondary: "#f59e0b",
      accent: "#fbbf24",
      roughness: 0.15,
      metalness: 0.9,
    },
  ];

  function applyPreset(ix: number) {
    const p = presets[ix % presets.length];
    
    // Apply to custom materials
    materials.metal.color = new THREE.Color(p.primary);
    materials.premium.color = new THREE.Color(p.secondary);
    materials.accent.color = new THREE.Color(p.accent);
    
    materials.metal.roughness = p.roughness;
    materials.premium.roughness = p.roughness;
    materials.accent.roughness = p.roughness;
    
    materials.metal.metalness = p.metalness;
    materials.premium.metalness = p.metalness;
    materials.accent.metalness = p.metalness;

    // Update materials
    Object.values(materials).forEach(mat => {
      mat.needsUpdate = true;
    });
  }

  useEffect(() => {
    // Start with professional blue theme
    applyPreset(0);

    // Listen for preset changes
    const onHeroPreset = (e: Event) => {
      const detail = (e as CustomEvent).detail as { index: number };
      applyPreset(detail.index);
    };
    
    const onDemoStep = (e: Event) => {
      const detail = (e as CustomEvent).detail as { step: number };
      const presetIndex = detail.step % presets.length;
      applyPreset(presetIndex);
    };
    
    window.addEventListener("heroPreset", onHeroPreset as EventListener);
    window.addEventListener("demoStep", onDemoStep as EventListener);

    return () => {
      window.removeEventListener("heroPreset", onHeroPreset as EventListener);
      window.removeEventListener("demoStep", onDemoStep as EventListener);
    };
  }, [materials, presets]);

  // ===== SCROLL SEQUENCE =====
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: { 
        trigger: "#story-sections", 
        start: "top top", 
        end: "bottom bottom", 
        scrub: 0.6 
      },
      defaults: { ease: "power2.out", duration: 1.2 },
    });

    if (group.current) {
      tl.to(group.current.rotation, { y: "+=1.2", x: "+=0.2" }, 0.0)
        .to(group.current.position, { x: -0.3, y: 0.2, z: 0.1 }, 0.0)
        .to(group.current.scale, { x: 1.1, y: 1.1, z: 1.1 }, 0.0);
    }

    // Broadcast steps with enhanced timing
    tl.to({}, { duration: 0.01, onComplete: () => broadcast(0) }, 0);
    tl.addLabel("step1", ">").to({}, { duration: 0.01, onComplete: () => broadcast(1) }, "step1");
    tl.addLabel("step2", ">").to({}, { duration: 0.01, onComplete: () => broadcast(2) }, "step2");
    tl.addLabel("step3", ">").to({}, { duration: 0.01, onComplete: () => broadcast(3) }, "step3");

    function broadcast(step: number) {
      onStep?.(step);
      window.dispatchEvent(new CustomEvent("heroStep", { detail: { step } }));
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [onStep]);

  // Enhanced mouse interaction
  useFrame(({ mouse, clock }) => {
    if (!group.current) return;
    
    const targetRotationX = mouse.y * 0.1;
    const targetRotationY = mouse.x * 0.15;
    
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x, 
      targetRotationX + Math.sin(clock.elapsedTime * 0.2) * 0.02, 
      0.02
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y, 
      targetRotationY + Math.sin(clock.elapsedTime * 0.15) * 0.03, 
      0.02
    );
  });

  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {/* Try to load the room model, fallback to professional environment */}
      {scene && scene.children.length > 0 ? (
        <primitive object={scene} />
      ) : (
        <ProfessionalEnvironment />
      )}
    </group>
  );
}

// Enhanced preloading with error handling
try {
  useGLTF.preload("/models/room.glb");
} catch (e) {
  console.log("Using professional 3D environment instead of room.glb");
}
