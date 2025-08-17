'use client';
import { useLoader } from '@react-three/fiber';
import { RGBELoader } from 'three-stdlib';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function EnvHDR() {
  const texture = useLoader(RGBELoader, '/hdr/potsdamer_platz_1k.hdr');
  
  useMemo(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
  }, [texture]);

  // You can use this texture as environment in your scene
  return null;
}
