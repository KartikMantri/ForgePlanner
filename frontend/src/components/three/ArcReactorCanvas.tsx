import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import type { Group, Mesh } from 'three';

const ARC_CYAN = '#00D4FF';

function Rings({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const p = progressRef.current;
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * (0.15 + p * 0.7);
      groupRef.current.rotation.x = p * 0.35;
    }
    if (coreRef.current) {
      const scale = 1 + p * 0.6;
      coreRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial emissive={ARC_CYAN} emissiveIntensity={2.2} color={ARC_CYAN} toneMapped={false} />
      </mesh>
      {[1.05, 1.45, 1.85].map((r, i) => (
        <mesh key={r} rotation={[i % 2 === 0 ? Math.PI / 2 : 0, i * 0.4, 0]}>
          <torusGeometry args={[r, 0.035, 16, 100]} />
          <meshStandardMaterial emissive={ARC_CYAN} emissiveIntensity={1.3} color={ARC_CYAN} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function ArcReactorCanvas({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.75]}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 3]} intensity={3} color={ARC_CYAN} />
      <Rings progressRef={progressRef} />
      <Sparkles count={70} scale={7} size={2} speed={0.3} color={ARC_CYAN} />
      <EffectComposer>
        <Bloom intensity={1.3} luminanceThreshold={0.15} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
