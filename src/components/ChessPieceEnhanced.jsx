import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PIECE_PROFILES } from '../utils/chessPieceProfiles';

/**
 * HIGH-quality chess piece with enhanced materials and textures
 * Used for high-end devices or HIGH performance settings
 */
export default function ChessPieceEnhanced({ position, type, color, onClick, isHovered, onPointerOver, onPointerOut, isSelected }) {
  const meshRef = useRef();
  const [floatOffset] = useState(Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (meshRef.current && !isHovered && !isSelected) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + floatOffset) * 0.02;
    } else if (meshRef.current) {
      meshRef.current.position.y = 0.2;
    }
  });

  // Premium Materials
  // White: Light Wood (Boxwood/Maple)
  // Black: Dark Wood (Rosewood/Walnut)
  const pieceColor = color === 'w' ? '#e8c39e' : '#543d2c'; 
  const hoverColor = '#d4af37';
  const selectedColor = '#4ade80';

  // Material props based on color - POLISHED WOOD
  const materialProps = { 
    metalness: 0.0,      // Wood is non-metallic
    roughness: 0.35,     // Polished but organic
    envMapIntensity: 1.0 // Natural reflections
  };

  // Geometry generation (same as medium, but with more segments for smoothness)
  const { geometry, args, rotation } = useMemo(() => {
    let geoType = 'lathe';
    let geoArgs = [];
    let rot = [0, 0, 0];

    switch (type) {
      case 'p':
        geoArgs = [PIECE_PROFILES.pawn, 32]; // 32 segments for high smoothness
        break;
      case 'r':
        geoArgs = [PIECE_PROFILES.rook, 32];
        break;
      case 'b':
        geoArgs = [PIECE_PROFILES.bishop, 32];
        break;
      case 'q':
        geoArgs = [PIECE_PROFILES.queen, 32];
        break;
      case 'k':
        geoArgs = [PIECE_PROFILES.king, 32];
        break;
      case 'n':
        geoType = 'group';
        break;
      default:
        geoArgs = [PIECE_PROFILES.pawn, 32];
    }
    return { geometry: geoType, args: geoArgs, rotation: rot };
  }, [type]);

  // Knight Geometry (More detailed composition)
  const KnightMesh = () => (
    <group>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[PIECE_PROFILES.knightBase, 32]} />
        <meshStandardMaterial 
          color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)} 
          emissive={isSelected || isHovered ? (isSelected ? '#4ade80' : '#d4af37') : '#000000'}
          emissiveIntensity={isSelected || isHovered ? 0.2 : 0}
          {...materialProps}
        />
      </mesh>
      {/* Sculpted Head approximation - Lowered & Angled */}
      <mesh position={[0, 0.65, 0.15]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.15, 0.45, 4, 8]} />
        <meshStandardMaterial 
          color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)} 
          {...materialProps}
        />
      </mesh>
      {/* Snout - Lowered */}
      <mesh position={[0, 0.8, 0.35]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.2, 0.25]} />
        <meshStandardMaterial 
          color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)} 
          {...materialProps}
        />
      </mesh>
      {/* Mane detail - Lowered */}
      <mesh position={[0, 0.75, -0.1]} rotation={[-0.4, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.4, 0.15]} />
        <meshStandardMaterial 
          color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)} 
          {...materialProps}
        />
      </mesh>
    </group>
  );

  return (
    <group position={position} rotation={color === 'b' ? [0, Math.PI, 0] : [0, 0, 0]}>
      {geometry === 'lathe' ? (
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
          castShadow
          receiveShadow
        >
          <latheGeometry args={args} />
          <meshStandardMaterial
            color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)}
            emissive={isSelected || isHovered ? (isSelected ? '#4ade80' : '#d4af37') : '#000000'}
            emissiveIntensity={isSelected || isHovered ? 0.2 : 0}
            {...materialProps}
          />
        </mesh>
      ) : (
        <group
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        >
          <KnightMesh />
        </group>
      )}
    </group>
  );
}
