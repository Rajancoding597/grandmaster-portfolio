import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MODEL_SCALE } from '../utils/chessModels';

// Smooth curved surfaces once per cached geometry, while keeping the crown,
// bishop notch and rook battlements sharp. No device-dependent substitutions.
const smoothGeometry = new WeakMap();

export default function ChessPieceModel({
  scene, position, color, isSelected, isLastMove, isHovered,
  onClick, onPointerOver, onPointerOut, disabled, prefersReducedMotion,
}) {
  const root = useRef();
  const lift = useRef();
  const ring = useRef();
  const initialPosition = useRef(position);
  const destination = useMemo(() => new THREE.Vector3(...position), [position]);

  const { model, materials } = useMemo(() => {
    const model = scene.clone(true);
    const copies = new Map();
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (!smoothGeometry.has(child.geometry)) {
        smoothGeometry.set(child.geometry, toCreasedNormals(child.geometry.clone(), Math.PI / 4));
      }
      child.geometry = smoothGeometry.get(child.geometry);
      const copyMaterial = (source) => {
        if (!copies.has(source)) {
          const material = source.clone();
          // Retain the source's restrained gold trim and the knight's eyes.
          if (source.name === 'ivory') {
            material.color.set(color === 'w' ? '#eee0bf' : '#292523');
            material.metalness = 0;
            material.roughness = color === 'w' ? 0.32 : 0.3;
          }
          material.envMapIntensity = 0.85;
          copies.set(source, material);
        }
        return copies.get(source);
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(copyMaterial) : copyMaterial(child.material);
    });
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    // Keep the sculpt's X/Z origin (knight muzzle is intentionally asymmetric).
    model.position.y -= bounds.min.y;
    return { model, materials: [...copies.values()] };
  }, [scene, color]);

  // Only instance-owned materials are disposed. Cached GLTF geometry stays shared.
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.1);
    if (prefersReducedMotion) root.current.position.copy(destination);
    else root.current.position.lerp(destination, 1 - Math.exp(-14 * step));
    const targetLift = !disabled && (isSelected || isHovered) ? 0.085 : 0;
    lift.current.position.y = prefersReducedMotion ? 0
      : THREE.MathUtils.damp(lift.current.position.y, targetLift, 14, step);
    ring.current.material.opacity = THREE.MathUtils.damp(
      ring.current.material.opacity, isSelected ? 0.9 : isLastMove ? 0.65 : isHovered && !disabled ? 0.4 : 0, 14, step
    );
  });

  return (
    <group ref={root} position={initialPosition.current}
      onClick={(event) => { event.stopPropagation(); if (!disabled) onClick(); }}
      onPointerOver={(event) => { event.stopPropagation(); if (!disabled) onPointerOver(); }}
      onPointerOut={(event) => { event.stopPropagation(); onPointerOut(); }}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} raycast={() => null}>
        <ringGeometry args={[0.39, 0.425, 64]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={lift} rotation={[0, color === 'w' ? Math.PI : 0, 0]}>
        <primitive object={model} scale={MODEL_SCALE} dispose={null} />
      </group>
    </group>
  );
}
