import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// Simple mini board: renders a static board base and a few squares for visual cue
export default function MiniBoard({ performance }) {
  const scale = performance === 'high' ? 0.6 : performance === 'medium' ? 0.5 : 0.4;

  // Generate simple squares (just a few for demo)
  const squares = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const isLight = (row + col) % 2 === 0;
      const x = col - 0.5;
      const z = row - 0.5;
      squares.push(
        <mesh key={`sq-${row}-${col}`} position={[x, -0.05, z]} receiveShadow>
          <boxGeometry args={[0.45, 0.1, 0.45]} />
          <meshStandardMaterial color={isLight ? '#E8E8E8' : '#3a3a3a'} metalness={0.2} roughness={0.7} />
        </mesh>
      );
    }
  }

  return (
    <div className="absolute bottom-4 right-4 w-[150px] h-[150px]">
      <Canvas shadows camera={{ position: [0, 3, 4], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} intensity={0.8} />
        <group scale={scale}>
          {/* Board base */}
          <mesh position={[0, -0.15, 0]} receiveShadow>
            <boxGeometry args={[2, 0.2, 2]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.6} />
          </mesh>
          {squares}
        </group>
        <OrbitControls enableZoom={false} enablePan={false} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
