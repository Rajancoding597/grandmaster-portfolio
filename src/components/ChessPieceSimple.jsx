import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Simple LOW-quality chess piece using basic geometric primitives
 * Used for low-end devices or LOW performance settings
 */
export default function ChessPieceSimple({ position, type, color, onClick, isHovered, onPointerOver, onPointerOut, isSelected }) {
  const meshRef = useRef();
  const [floatOffset] = useState(Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (meshRef.current && !isHovered && !isSelected) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + floatOffset) * 0.02;
    } else if (meshRef.current) {
      meshRef.current.position.y = 0.2;
    }
  });

  const pieceColor = color === 'w' ? '#f0f0f0' : '#222222';
  const hoverColor = '#d4af37';
  const selectedColor = '#4ade80';

  // Simple geometry mapping
  const getPieceGeometry = () => {
    switch (type) {
      case 'p': return { geometry: 'sphere', args: [0.25, 8, 8], scale: [1, 1.3, 1] };
      case 'r': return { geometry: 'box', args: [0.35, 0.5, 0.35], scale: [1, 1, 1] };
      case 'n': return { geometry: 'cone', args: [0.25, 0.5, 6], scale: [1.2, 1, 1] };
      case 'b': return { geometry: 'cone', args: [0.25, 0.6, 8], scale: [1, 1.2, 1] };
      case 'q': return { geometry: 'sphere', args: [0.3, 8, 8], scale: [1, 1.5, 1] };
      case 'k': return { geometry: 'box', args: [0.3, 0.7, 0.3], scale: [1.2, 1, 1.2] };
      default: return { geometry: 'sphere', args: [0.25, 8, 8] };
    }
  };

  const { geometry, args, scale = [1, 1, 1] } = getPieceGeometry();

  return (
    <group position={position} rotation={color === 'b' ? [0, Math.PI, 0] : [0, 0, 0]}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        castShadow
        scale={scale}
      >
        {geometry === 'sphere' && <sphereGeometry args={args} />}
        {geometry === 'box' && <boxGeometry args={args} />}
        {geometry === 'cone' && <coneGeometry args={args} />}
        <meshStandardMaterial
          color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)}
          metalness={0.2}
          roughness={0.7}
          emissive={isSelected || isHovered ? (isSelected ? '#4ade80' : '#d4af37') : '#000000'}
          emissiveIntensity={isSelected || isHovered ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
}
