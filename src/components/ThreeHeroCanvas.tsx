"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, Suspense } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function ThreeHeroCanvas({ onStep }: { onStep?: (s: number) => void }) {
  return (
    <Canvas camera={{ position: [2.6, 1.4, 3.0], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <Environment files="/hdr/potsdamer_platz_1k.hdr" background={false} />
        <Room onStep={onStep} />
      </Suspense>
    </Canvas>
  );
}

function Room({ onStep }: { onStep?: (s: number) => void }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/room.glb", true);

  const mats = useMemo(() => {
    const found: Record<string, THREE.MeshStandardMaterial> = {};
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const m = mesh?.material as THREE.MeshStandardMaterial | undefined;
      if (!m) return;
      // Convert any material to standard for consistency
      if (!(m instanceof THREE.MeshStandardMaterial)) {
        const newMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        mesh.material = newMat;
        found.default = newMat;
        return;
      }
      if (/floor/i.test(m.name)) found.floor = m;
      if (/wall/i.test(m.name)) found.wall = m;
      if (/sofa|couch/i.test(m.name)) found.sofa = m;
      if (!found.floor && /ground/i.test(o.name)) found.floor = m;
      if (!found.wall && /ceiling/i.test(o.name)) found.wall = m;
      if (!found.sofa && /furniture/i.test(o.name)) found.sofa = m;
    });
    
    // If no materials found by name, use first few materials
    const allMats = Object.values(found);
    if (allMats.length === 0) {
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const m = mesh?.material as THREE.MeshStandardMaterial;
        if (m instanceof THREE.MeshStandardMaterial && !found.floor) found.floor = m;
        else if (m instanceof THREE.MeshStandardMaterial && !found.wall) found.wall = m;
        else if (m instanceof THREE.MeshStandardMaterial && !found.sofa) found.sofa = m;
      });
    }
    
    return found;
  }, [scene]);

  // ===== MATERIAL PRESETS =====
  const presets = [
    {
      name: "Dark Modern",
      floor: "#2D1B1B", // Dark mahogany
      wall: "#1F1F23",  // Charcoal
      sofa: "#0F0F0F",  // Deep black leather
      roughness: 0.3,
      metalness: 0.1,
    },
    {
      name: "Warm Minimal", 
      floor: "#D4A574", // Warm oak
      wall: "#F5F1EA",  // Cream
      sofa: "#8B6F47",  // Tan leather
      roughness: 0.4,
      metalness: 0.05,
    },
    {
      name: "Cool Studio",
      floor: "#A8B2B8", // Cool concrete
      wall: "#E8EAED",  // Light gray
      sofa: "#4A5568",  // Slate blue
      roughness: 0.6,
      metalness: 0.2,
    },
    {
      name: "Industrial Loft",
      floor: "#5D4E37", // Dark wood
      wall: "#2C2C2C",  // Exposed brick gray
      sofa: "#8B4513",  // Cognac leather
      roughness: 0.7,
      metalness: 0.3,
    },
    {
      name: "Luxury Gold",
      floor: "#CD7F32", // Bronze hardwood
      wall: "#F4F1DE",  // Champagne
      sofa: "#DAA520",  // Goldrod velvet
      roughness: 0.2,
      metalness: 0.4,
    },
    {
      name: "Ocean Breeze",
      floor: "#B0C4DE", // Light blue-gray
      wall: "#F0F8FF",  // Alice blue
      sofa: "#4682B4",  // Steel blue
      roughness: 0.5,
      metalness: 0.1,
    }
  ];

  function applyPreset(ix: number) {
    const p = presets[ix % presets.length];
    if (mats.floor) { 
      mats.floor.color = new THREE.Color(p.floor); 
      mats.floor.roughness = p.roughness; 
      mats.floor.metalness = p.metalness; 
      mats.floor.needsUpdate = true; 
    }
    if (mats.wall) { 
      mats.wall.color = new THREE.Color(p.wall); 
      mats.wall.roughness = p.roughness; 
      mats.wall.metalness = p.metalness; 
      mats.wall.needsUpdate = true; 
    }
    if (mats.sofa) { 
      mats.sofa.color = new THREE.Color(p.sofa); 
      mats.sofa.roughness = p.roughness; 
      mats.sofa.metalness = p.metalness; 
      mats.sofa.needsUpdate = true; 
    }
  }

  useEffect(() => {
    // Start on preset 0
    applyPreset(0);

    // Listen for Finish Swap button events
    const onHeroPreset = (e: Event) => {
      const detail = (e as CustomEvent).detail as { index: number };
      applyPreset(detail.index);
    };
    
    // Listen for demo mode step events
    const onDemoStep = (e: Event) => {
      const detail = (e as CustomEvent).detail as { step: number };
      // Auto-apply preset based on demo step
      const presetIndex = detail.step % presets.length;
      applyPreset(presetIndex);
    };
    
    window.addEventListener("heroPreset", onHeroPreset as EventListener);
    window.addEventListener("demoStep", onDemoStep as EventListener);

    return () => {
      window.removeEventListener("heroPreset", onHeroPreset as EventListener);
      window.removeEventListener("demoStep", onDemoStep as EventListener);
    };
  }, [presets, mats]);

  // ===== SCROLL SEQUENCE (broadcast step changes) =====
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: "#story-sections", start: "top top", end: "bottom bottom", scrub: 0.6 },
      defaults: { ease: "power2.out", duration: 1.2 },
    });

    if (group.current) {
      tl.to(group.current.rotation, { y: "+=0.6" }, 0.0)
        .to(group.current.position, { x: -0.2, y: 0, z: 0.1 }, 0.0);
    }

    // Broadcast steps 0..3 as you scroll
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

  useFrame(({ mouse }) => {
    if (!group.current) return;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, mouse.y * 0.15, 0.05);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, mouse.x * 0.15, 0.05);
  });

  return <primitive object={scene} ref={group} position={[0, -0.6, 0]} />;
}

// Create a fallback scene if no GLTF is available
function FallbackScene() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 1, 1.2]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[1.2, 0.8, 4]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.2} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Only preload if file exists, otherwise use fallback
try {
  useGLTF.preload("/models/room.glb");
} catch (e) {
  console.warn("No room.glb found, using fallback scene");
}
